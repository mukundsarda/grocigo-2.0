// common.js - shared UI helpers for pages
(function(){
  function setUsernameDisplay() {
    const el = document.querySelector('.userNameDisplay');
    if (!el) return;
    const uid = (window.GrocigoStore && GrocigoStore.getCurrentUserId && GrocigoStore.getCurrentUserId()) || '';
    el.textContent = uid || '';
  }

  function requireLoginAndSetUser() {
    if (!window.GrocigoStore) return;
    if (!GrocigoStore.requireLogin()) return false;
    setUsernameDisplay();
    return true;
  }

  function renderCategoriesTable(tbodySelectorOrTable, categories) {
    const table = typeof tbodySelectorOrTable === 'string' ? document.querySelector(tbodySelectorOrTable) : tbodySelectorOrTable;
    if (!table) return;
    const tbody = table.tBodies && table.tBodies[0] ? table.tBodies[0] : table.querySelector('tbody') || table;
    tbody.innerHTML = '';
    categories.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.category_id}</td><td>${c.category_name}</td>`;
      tbody.appendChild(tr);
    });
  }

  function renderProductsTable(table, products) {
    const tbody = table.tBodies && table.tBodies[0] ? table.tBodies[0] : table.querySelector('tbody') || table;
    tbody.innerHTML = '';
    products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${p.product_id}</td><td>${p.product_name}</td><td>${p.price}</td><td>${p.quantity}</td>`;
      tbody.appendChild(tr);
    });
  }

  function sumCart(cart) {
    return cart.reduce((acc, i) => acc + Number(i.price), 0);
  }

  window.GrocigoCommon = {
    setUsernameDisplay,
    requireLoginAndSetUser,
    renderCategoriesTable,
    renderProductsTable,
    sumCart,
  };
})();
