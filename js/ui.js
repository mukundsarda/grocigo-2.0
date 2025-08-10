// ui.js - UI helpers built on top of GrocigoAPI
(function(){
  async function getSessionUser() {
    try {
      const s = await GrocigoAPI.getSession();
      return s && s.loginUser ? s.loginUser : null;
    } catch {
      return null;
    }
  }

  async function requireLoginAndSetUser() {
    const uid = await getSessionUser();
    if (!uid) {
      window.location.href = 'login.html';
      return null;
    }
    const el = document.querySelector('.userNameDisplay');
    if (el) el.textContent = uid;
    return uid;
  }

  function ensureAdminOrRedirect(userId) {
    if (userId !== 'mak') {
      window.location.href = 'customerHome.html';
      return false;
    }
    return true;
  }

  function renderCategoriesTable(target, categories) {
    const table = typeof target === 'string' ? document.querySelector(target) : target;
    if (!table) return;
    const tbody = table.tBodies && table.tBodies[0] ? table.tBodies[0] : table.querySelector('tbody') || table;
    tbody.innerHTML = '';
    categories.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.category_id}</td><td>${c.category_name ?? ''}</td>`;
      tbody.appendChild(tr);
    });
  }

  function renderProductsTable(table, products) {
    const tbody = table.tBodies && table.tBodies[0] ? table.tBodies[0] : table.querySelector('tbody') || table;
    tbody.innerHTML = '';
    products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.product_id}</td><td>${p.product_name ?? ''}</td><td>${p.price}</td><td>${p.quantity}</td>`;
      tbody.appendChild(tr);
    });
  }

  function sumCart(cart) {
    return cart.reduce((acc, i) => acc + Number(i.price || 0), 0);
  }

  window.GrocigoUI = {
    getSessionUser,
    requireLoginAndSetUser,
    ensureAdminOrRedirect,
    renderCategoriesTable,
    renderProductsTable,
    sumCart,
  };
})();


