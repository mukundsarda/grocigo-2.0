// storage.js - client-side data store and session handling using localStorage
// Initializes seed data on first load and provides helper APIs used by pages

(function () {
  const STORAGE_KEYS = {
    users: 'gg_users',
    categories: 'gg_categories',
    products: 'gg_products',
    nextIds: 'gg_next_ids',
    session: 'gg_session',
    transactions: 'gg_transactions',
    // carts are stored per user: gg_cart_<userId>
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function ensureSeeds() {
    // Seed users: admin 'mak' / 'mak123', a sample customer
    if (!read(STORAGE_KEYS.users)) {
      write(STORAGE_KEYS.users, [
        { cust_id: 'mak', cust_name: 'Admin', email_id: 'admin@grocigo.local', password: 'mak123' },
        { cust_id: 'alice', cust_name: 'Alice', email_id: 'alice@example.com', password: 'alice' },
      ]);
    }

    // Seed categories
    if (!read(STORAGE_KEYS.categories)) {
      write(STORAGE_KEYS.categories, [
        { category_id: '1', category_name: 'Fruits' },
        { category_id: '2', category_name: 'Vegetables' },
        { category_id: '3', category_name: 'Beverages' },
      ]);
    }

    // Seed products
    if (!read(STORAGE_KEYS.products)) {
      write(STORAGE_KEYS.products, [
        { product_id: '101', product_name: 'Apple', category_id: '1', price: 120, quantity: 50 },
        { product_id: '102', product_name: 'Banana', category_id: '1', price: 40, quantity: 100 },
        { product_id: '201', product_name: 'Tomato', category_id: '2', price: 30, quantity: 75 },
        { product_id: '301', product_name: 'Cola', category_id: '3', price: 60, quantity: 40 },
      ]);
    }

    if (!read(STORAGE_KEYS.transactions)) {
      write(STORAGE_KEYS.transactions, []);
    }

    if (!read(STORAGE_KEYS.nextIds)) {
      write(STORAGE_KEYS.nextIds, { product: 1000, transaction: 1, category: 100 });
    }

    if (!read(STORAGE_KEYS.session)) {
      write(STORAGE_KEYS.session, { loginUser: null });
    }
  }

  ensureSeeds();

  function getSession() {
    return read(STORAGE_KEYS.session, { loginUser: null });
  }

  function setSession(session) {
    write(STORAGE_KEYS.session, session);
  }

  function getCurrentUserId() {
    const s = getSession();
    return s && s.loginUser ? s.loginUser : null;
  }

  function getUsers() {
    return read(STORAGE_KEYS.users, []);
  }

  function setUsers(users) {
    write(STORAGE_KEYS.users, users);
  }

  function login(username, password) {
    const users = getUsers();
    const found = users.find(u => u.cust_id === username && u.password === password);
    if (!found) return { ok: false, message: 'User ID or Password is incorrect!' };
    setSession({ loginUser: found.cust_id });
    return { ok: true, user: found };
  }

  function logout() {
    setSession({ loginUser: null });
  }

  function createAccount({ userName, name, email, password, confirm }) {
    const users = getUsers();
    if (users.some(u => u.cust_id === userName)) {
      return { ok: false, message: 'User Name already taken!' };
    }
    if (password !== confirm) {
      return { ok: false, message: 'Passwords do not match!' };
    }
    users.push({ cust_id: userName, cust_name: name, email_id: email, password });
    setUsers(users);
    return { ok: true, userName };
  }

  function getCategories() {
    return read(STORAGE_KEYS.categories, []);
  }

  function setCategories(categories) {
    write(STORAGE_KEYS.categories, categories);
  }

  function getProducts() {
    return read(STORAGE_KEYS.products, []);
  }

  function setProducts(products) {
    write(STORAGE_KEYS.products, products);
  }

  function getNextIds() {
    return read(STORAGE_KEYS.nextIds, { product: 1000, transaction: 1, category: 100 });
  }

  function setNextIds(nextIds) {
    write(STORAGE_KEYS.nextIds, nextIds);
  }

  function addProduct({ productName, categoryId, price, quantity }) {
    const categories = getCategories();
    if (!categories.some(c => c.category_id === categoryId)) {
      return { ok: false, message: 'Specified Category does not exist!' };
    }
    const next = getNextIds();
    const newId = String(next.product++);
    setNextIds(next);

    const products = getProducts();
    products.push({
      product_id: newId,
      product_name: productName,
      category_id: categoryId,
      price: Number(price),
      quantity: Number(quantity),
    });
    setProducts(products);
    return { ok: true, product_id: newId };
  }

  function updateStock({ productId, addQuantity }) {
    const products = getProducts();
    const idx = products.findIndex(p => p.product_id === productId);
    if (idx === -1) return { ok: false, message: 'Invalid Product ID!' };
    products[idx].quantity = Number(products[idx].quantity) + Number(addQuantity);
    setProducts(products);
    return { ok: true };
  }

  function getProductsByCategory(categoryId) {
    return getProducts().filter(p => p.category_id === categoryId);
  }

  function getCartKey(userId) {
    return `gg_cart_${userId}`;
  }

  function getCart(userId) {
    return read(getCartKey(userId), []);
  }

  function setCart(userId, cartItems) {
    write(getCartKey(userId), cartItems);
  }

  function addToCart({ userId, productId, quantity }) {
    const products = getProducts();
    const product = products.find(p => p.product_id === productId);
    if (!product) {
      return { ok: false, message: 'Invalid Product' };
    }
    const q = Number(quantity);
    if (product.quantity < q) {
      return { ok: false, message: 'Quantity not available' };
    }

    // decrement stock
    product.quantity = Number(product.quantity) - q;
    setProducts(products);

    const cart = getCart(userId);
    const existing = cart.find(c => c.product_id === productId);
    if (existing) {
      existing.quantity = Number(existing.quantity) + q;
      existing.price = Number(product.price) * Number(existing.quantity);
    } else {
      cart.push({
        product_id: product.product_id,
        product_name: product.product_name,
        quantity: q,
        price: Number(product.price) * q,
      });
    }
    setCart(userId, cart);
    return { ok: true };
  }

  function removeFromCart({ userId, productId }) {
    const cart = getCart(userId);
    const item = cart.find(c => c.product_id === productId);
    if (!item) return { ok: true };

    // return quantity to stock
    const products = getProducts();
    const p = products.find(pr => pr.product_id === productId);
    if (p) {
      p.quantity = Number(p.quantity) + Number(item.quantity);
      setProducts(products);
    }

    const newCart = cart.filter(c => c.product_id !== productId);
    setCart(userId, newCart);
    return { ok: true };
  }

  function clearCart(userId) {
    setCart(userId, []);
  }

  function getTransactions() {
    return read(STORAGE_KEYS.transactions, []);
  }

  function setTransactions(arr) {
    write(STORAGE_KEYS.transactions, arr);
  }

  function placeOrder({ userId, totalAmount, phone, address, payment }) {
    const cart = getCart(userId);
    const total = Number(totalAmount);
    const next = getNextIds();
    const id = String(next.transaction++);
    setNextIds(next);

    const tx = getTransactions();
    tx.push({
      transaction_id: id,
      customer_id: userId,
      transaction_amount: total,
      payment,
      phone,
      address,
      date: new Date().toISOString().slice(0, 10),
    });
    setTransactions(tx);

    clearCart(userId);
    return { ok: true, transaction_id: id };
  }

  function getUserTransactions(userId) {
    return getTransactions().filter(t => t.customer_id === userId);
  }

  function getDepletedProducts() {
    return getProducts().filter(p => Number(p.quantity) <= 0);
  }

  function requireLogin() {
    const userId = getCurrentUserId();
    if (!userId) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  // Expose globally
  window.GrocigoStore = {
    read, write,
    getSession, setSession, getCurrentUserId, login, logout, createAccount,
    getUsers, getCategories, setCategories, getProducts, setProducts,
    addProduct, updateStock, getProductsByCategory,
    getCart, setCart, addToCart, removeFromCart, clearCart,
    getTransactions, placeOrder, getUserTransactions,
    getDepletedProducts, requireLogin,
  };
})();
