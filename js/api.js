// api.js - wrappers around REST API
(function(){
  const API_BASE = '';

  async function http(method, path, data) {
    const opt = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    };
    if (data !== undefined) opt.body = JSON.stringify(data);
    const res = await fetch(API_BASE + path, opt);
    const text = await res.text();
    let json;
    try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
    if (!res.ok) {
      const msg = json && (json.error || json.message) ? (json.error || json.message) : `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return json;
  }

  function get(path) { return http('GET', path); }
  function post(path, data) { return http('POST', path, data); }

  // Auth
  const getSession = () => get('/api/session');
  const login = (user, pass) => post('/api/login', { user, pass });
  const logout = () => post('/api/logout', {});
  const createAccount = (payload) => post('/api/create-account', payload);

  // Catalog / Admin
  const getCategories = () => get('/api/categories');
  const getProducts = (categoryId) => get(`/api/products${categoryId ? ('?category_id=' + encodeURIComponent(categoryId)) : ''}`);
  const addProduct = (payload) => post('/api/products', payload);
  const updateStock = (payload) => post('/api/stock/update', payload);

  // Cart
  const getCart = () => get('/api/cart');
  const addToCart = (payload) => post('/api/cart/add', payload);
  const removeFromCart = (payload) => post('/api/cart/remove', payload);

  // Transactions
  const getTransactions = (all) => get(`/api/transactions${all ? '?all=1' : ''}`);
  const placeOrder = (payload) => post('/api/order', payload);

  // Admin extras
  const getCustomers = () => get('/api/customers');
  const getDepleted = () => get('/api/depleted');

  window.GrocigoAPI = {
    getSession, login, logout, createAccount,
    getCategories, getProducts, addProduct, updateStock,
    getCart, addToCart, removeFromCart,
    getTransactions, placeOrder,
    getCustomers, getDepleted,
  };
})();


