import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Hardcode DB configuration here if you prefer code-based settings instead of env vars
// Replace REPLACE_WITH_YOUR_PASSWORD with your actual MySQL password
process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASS = process.env.DB_PASS || 'root';
process.env.DB_NAME = process.env.DB_NAME || 'wholesale';
process.env.DB_PORT = process.env.DB_PORT || '3306';

// Configure DB from env or defaults
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'wholesale',
  port: Number(process.env.DB_PORT || 3306),
};

const pool = await mysql.createPool({
  ...DB_CONFIG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Session via signed cookie (simple)
const SESSION_COOKIE = 'gg_session';
const COOKIE_OPTS = { httpOnly: true, sameSite: 'lax' };

function requireAuth(req, res, next) {
  const uid = req.signedCookies?.[SESSION_COOKIE] || req.cookies?.[SESSION_COOKIE];
  if (!uid) return res.status(401).json({ error: 'Not authenticated' });
  req.userId = uid;
  next();
}

function requireAdmin(req, res, next) {
  if (req.userId !== 'mak') return res.status(403).json({ error: 'Forbidden' });
  next();
}

// Auth
app.post('/api/login', async (req, res) => {
  const { user, pass } = req.body || {};
  if (!user || !pass) return res.status(400).json({ error: 'Missing credentials' });
  const [rows] = await pool.query('SELECT * FROM customer WHERE cust_id=? AND password=?', [user, pass]);
  if (!rows.length) {
    if (user === 'mak' && pass === 'mak123') {
      res.cookie(SESSION_COOKIE, 'mak', COOKIE_OPTS);
      return res.json({ ok: true, user: { cust_id: 'mak' } });
    }
    return res.status(401).json({ error: 'User ID or Password is incorrect!' });
  }
  res.cookie(SESSION_COOKIE, user, COOKIE_OPTS);
  return res.json({ ok: true, user: rows[0] });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, COOKIE_OPTS);
  res.json({ ok: true });
});

app.get('/api/session', (req, res) => {
  const uid = req.cookies?.[SESSION_COOKIE];
  res.json({ loginUser: uid || null });
});

app.post('/api/create-account', async (req, res) => {
  const { newUserName, newName, newEmail, newPass, newConfirmPass } = req.body || {};
  if (!newUserName || !newName || !newEmail || !newPass || !newConfirmPass) return res.status(400).json({ error: 'Missing fields' });
  const [exists] = await pool.query('SELECT cust_id FROM customer WHERE cust_id=?', [newUserName]);
  if (exists.length) return res.status(400).json({ error: 'User Name already taken!' });
  if (newPass !== newConfirmPass) return res.status(400).json({ error: 'Passwords do not match!' });
  await pool.query('INSERT INTO customer(cust_id,cust_name,email_id,password) VALUES(?,?,?,?)', [newUserName, newName, newEmail, newPass]);
  res.json({ ok: true, userName: newUserName });
});

// Catalog
app.get('/api/categories', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories');
  res.json(rows);
});

app.get('/api/products', requireAuth, async (req, res) => {
  const { category_id } = req.query;
  if (category_id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE category_id=?', [category_id]);
    return res.json(rows);
  }
  const [rows] = await pool.query('SELECT * FROM products');
  res.json(rows);
});

app.post('/api/products', requireAuth, async (req, res) => {
  const { product_name, category_id, price, quantity } = req.body || {};
  const [cat] = await pool.query('SELECT category_id FROM categories WHERE category_id=?', [category_id]);
  if (!cat.length) return res.status(400).json({ error: 'Specified Category does not exist!' });
  await pool.query('INSERT INTO products(product_name,category_id,price,quantity) VALUES(?,?,?,?)', [product_name, category_id, price, quantity]);
  res.json({ ok: true });
});

app.post('/api/stock/update', requireAuth, async (req, res) => {
  const { product_id, add_quantity } = req.body || {};
  const [prod] = await pool.query('SELECT * FROM products WHERE product_id=?', [product_id]);
  if (!prod.length) return res.status(400).json({ error: 'Invalid Product ID!' });
  const newQuantity = Number(prod[0].quantity) + Number(add_quantity || 0);
  await pool.query('UPDATE products SET quantity=? WHERE product_id=?', [newQuantity, product_id]);
  res.json({ ok: true });
});

// Cart
app.get('/api/cart', requireAuth, async (req, res) => {
  const uid = req.userId;
  const [rows] = await pool.query('SELECT * FROM cart WHERE customer_id=?', [uid]);
  res.json(rows);
});

app.post('/api/cart/add', requireAuth, async (req, res) => {
  const uid = req.userId;
  const { product_id, quantity } = req.body || {};
  const q = Number(quantity || 0);
  const [prodRows] = await pool.query('SELECT * FROM products WHERE product_id=?', [product_id]);
  if (!prodRows.length) return res.status(400).json({ error: 'Invalid Product' });
  const prod = prodRows[0];
  if (prod.quantity < q) return res.status(400).json({ error: 'Quantity not available' });

  // decrement stock
  await pool.query('UPDATE products SET quantity=quantity-? WHERE product_id=?', [q, product_id]);

  const [existing] = await pool.query('SELECT * FROM cart WHERE product_id=? AND customer_id=?', [product_id, uid]);
  if (existing.length) {
    const newQuantity = Number(existing[0].quantity) + q;
    const newPrice = Number(prod.price) * newQuantity;
    await pool.query('UPDATE cart SET price=?, quantity=? WHERE product_id=? AND customer_id=?', [newPrice, newQuantity, product_id, uid]);
  } else {
    const price = Number(prod.price) * q;
    await pool.query('INSERT INTO cart(product_id,product_name,quantity,price,customer_id) VALUES(?,?,?,?,?)', [product_id, prod.product_name, q, price, uid]);
  }
  res.json({ ok: true });
});

app.post('/api/cart/remove', requireAuth, async (req, res) => {
  const uid = req.userId;
  const { product_id } = req.body || {};
  const [row] = await pool.query('SELECT * FROM cart WHERE product_id=? AND customer_id=?', [product_id, uid]);
  if (row.length) {
    const item = row[0];
    await pool.query('UPDATE products SET quantity=quantity+? WHERE product_id=?', [item.quantity, product_id]);
    await pool.query('DELETE FROM cart WHERE product_id=? AND customer_id=?', [product_id, uid]);
  }
  res.json({ ok: true });
});

// Transactions
app.get('/api/transactions', requireAuth, async (req, res) => {
  const uid = req.query.all === '1' ? null : req.userId;
  if (uid) {
    const [rows] = await pool.query('SELECT * FROM transaction WHERE customer_id=?', [uid]);
    return res.json(rows);
  }
  const [rows] = await pool.query('SELECT * FROM transaction');
  res.json(rows);
});

app.post('/api/order', requireAuth, async (req, res) => {
  const uid = req.userId;
  const { address, phone, payment } = req.body || {};
  const [cart] = await pool.query('SELECT * FROM cart WHERE customer_id=?', [uid]);
  const total = cart.reduce((s, c) => s + Number(c.price || 0), 0);
  if (total <= 0) return res.status(400).json({ error: 'Cart is empty!' });
  await pool.query('INSERT INTO transaction(transaction_amount,customer_id,phone,address,payment,date) VALUES(?,?,?,?,?,CURRENT_DATE())', [total, uid, phone, address, payment]);
  await pool.query('DELETE FROM cart WHERE customer_id=?', [uid]);
  res.json({ ok: true, amount: total });
});

// Customers (admin only)
app.get('/api/customers', requireAuth, requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM customer');
  res.json(rows);
});

// Depleted products table
app.get('/api/depleted', requireAuth, requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM depleted_products');
  res.json(rows);
});

const PORT = Number(process.env.PORT || 8080);
// Serve static files from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => console.log(`API and static server listening on http://localhost:${PORT}`));


