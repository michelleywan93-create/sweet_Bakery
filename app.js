// ===== Semak Log Masuk =====
const currentUser = JSON.parse(localStorage.getItem('sweetstock_currentUser'));
if (!currentUser && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
  window.location.href = 'login.html';
}

// ===== Papar Nama & Ikon Pengguna =====
if (currentUser) {
  document.getElementById('userName').textContent = currentUser.fullName;
  const names = currentUser.fullName.trim().split(' ');
  const initials = (names[0][0] + (names[1] ? names[1][0] : '')).toUpperCase();
  document.getElementById('userAvatar').textContent = initials;
}

// ===== Log Keluar =====
document.getElementById('logoutLink')?.addEventListener('click', e => {
  e.preventDefault();
  localStorage.removeItem('sweetstock_currentUser');
  window.location.href = 'login.html';
});

// ===== Tarikh Hari Ini =====
const today = new Date();
document.getElementById('todayDate').textContent = today.toLocaleDateString('ms-MY', {
  day: 'numeric', month: 'long', year: 'numeric'
});

// ===== Simpan & Ambil Data Inventori =====
function getInventory() {
  const key = 'sweetstock_inventory_' + (currentUser?.username || 'guest');
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function saveInventory(data) {
  const key = 'sweetstock_inventory_' + (currentUser?.username || 'guest');
  localStorage.setItem(key, JSON.stringify(data));
}

let inventory = getInventory();
let editId = null;

// ===== Navigasi Menu =====
document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const section = btn.dataset.section;
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}Section`).classList.add('active');
    document.getElementById('pageTitle').textContent = section.charAt(0).toUpperCase() + section.slice(1);
  });
});

document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', () => {
    const sec = btn.dataset.goto;
    document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.section === sec));
    document.querySelectorAll('.content-section').forEach(s => s.classList.toggle('active', s.id === `${sec}Section`));
  });
});

// ===== Modal =====
const modal = document.getElementById('productModal');
document.getElementById('addProductBtn').addEventListener('click', () => {
  editId = null;
  document.getElementById('modalTitle').textContent = 'Add New Product ✨';
  document.getElementById('productForm').reset();
  modal.classList.add('show');
});
document.getElementById('closeModalBtn').addEventListener('click', () => modal.classList.remove('show'));
document.getElementById('cancelBtn').addEventListener('click', () => modal.classList.remove('show'));
modal.addEventListener('click', e => {
  if (e.target === modal) modal.classList.remove('show');
});

// ===== Simpan Produk =====
document.getElementById('productForm').addEventListener('submit', e => {
  e.preventDefault();
  const product = {
    id: editId || Date.now(),
    name: document.getElementById('productName').value,
    category: document.getElementById('productCategory').value,
    stock: parseFloat(document.getElementById('productStock').value),
    unit: document.getElementById('productUnit').value,
    price: parseFloat(document.getElementById('productPrice').value),
    minimum: parseFloat(document.getElementById('productMinimum').value)
  };

  if (editId) {
    inventory = inventory.map(p => p.id === editId ? product : p);
  } else {
    inventory.push(product);
  }

  saveInventory(inventory);
  modal.classList.remove('show');
  renderAll();
  showToast(editId ? 'Product updated! ✅' : 'Product added! 🎉');
  editId = null;
});

// ===== Cari & Tapis =====
function filterProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const stockFilter = document.getElementById('stockFilter').value;
  return inventory.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(q);
    const matchCat = cat === 'all' || p.category === cat;
    const matchStock = stockFilter === 'all' ||
      (stockFilter === 'low' && p.stock < p.minimum) ||
      (stockFilter === 'available' && p.stock >= p.minimum);
    return matchSearch && matchCat && matchStock;
  });
}

['searchInput', 'categoryFilter', 'stockFilter'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderTable);
});

// ===== Papar Jadual =====
function renderTable() {
  const tbody = document.getElementById('inventoryTableBody');
  const filtered = filterProducts();
  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><span class="product-name">${p.name}</span></td>
      <td>${p.category}</td>
      <td>${p.stock}</td>
      <td>${p.unit}</td>
      <td>RM ${p.price.toFixed(2)}</td>
      <td><span class="stock-status ${p.stock < p.minimum ? 'low' : 'available'}">
        ${p.stock < p.minimum ? '⚠️ Low' : '✅ Available'}
      </span></td>
      <td>
        <div class="action-group">
          <button class="icon-btn" data-edit="${p.id}" title="Edit">✏️</button>
          <button class="icon-btn" data-delete="${p.id}" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Edit
  tbody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prod = inventory.find(p => p.id === parseInt(btn.dataset.edit));
      editId = prod.id;
      document.getElementById('modalTitle').textContent = 'Edit Product ✏️';
      document.getElementById('productName').value = prod.name;
      document.getElementById('productCategory').value = prod.category;
      document.getElementById('productStock').value = prod.stock;
      document.getElementById('productUnit').value = prod.unit;
      document.getElementById('productPrice').value = prod.price;
      document.getElementById('productMinimum').value = prod.minimum;
      modal.classList.add('show');
    });
  });

  // Padam
  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Padam produk ini?')) {
        inventory = inventory.filter(p => p.id !== parseInt(btn.dataset.delete));
        saveInventory(inventory);
        renderAll();
        showToast('Product deleted 🗑️');
      }
    });
  });
}

// ===== Papar Semua Statistik =====
function renderAll() {
  inventory = getInventory();
  renderTable();

  const total = inventory.length;
  const lowItems = inventory.filter(p => p.stock < p.minimum);
  const value = inventory.reduce((sum, p) => sum + p.stock * p.price, 0);
  const avail = total - lowItems.length;
  const availPct = total ? Math.round((avail / total) * 100) : 0;
  const lowPct = total ? Math.round((lowItems.length / total) * 100) : 0;

  document.getElementById('totalProducts').textContent = total;
  document.getElementById('lowStockCount').textContent = lowItems.length;
  document.getElementById('inventoryValue').textContent = `RM ${value.toFixed(2)}`;
  document.getElementById('reportValue').textContent = `RM ${value.toFixed(2)}`;
  document.getElementById('availablePercent').textContent = `${availPct}%`;
  document.getElementById('lowPercent').textContent = `${lowPct}%`;
  document.getElementById('availableBar').style.width = `${availPct}%`;
  document.getElementById('lowBar').style.width = `${lowPct}%`;

  // Senarai Stok Rendah
  const list = document.getElementById('lowStockList');
  list.innerHTML = lowItems.length === 0
    ? '<p style="color:var(--muted);text-align:center;padding:10px;">🎉 Semua stok mencukupi!</p>'
    : lowItems.map(p => `
      <div class="stock-alert">
        <div><strong>${p.name}</strong><span>${p.category} · Min: ${p.minimum} ${p.unit}</span></div>
        <span class="stock-qty">${p.stock} ${p.unit}</span>
      </div>
    `).join('');
}

// ===== Notifikasi =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ===== Menu Telefon =====
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ===== Mula =====
renderAll();
