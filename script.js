const STORAGE_KEY = "sweetstock_inventory_v1";

const defaultInventory = [
  { id: 1, name: "Bread Flour", category: "Ingredient", stock: 24, unit: "kg", price: 4.8, minimum: 10 },
  { id: 2, name: "Unsalted Butter", category: "Ingredient", stock: 7, unit: "kg", price: 28.5, minimum: 8 },
  { id: 3, name: "Caster Sugar", category: "Ingredient", stock: 16, unit: "kg", price: 5.2, minimum: 6 },
  { id: 4, name: "Dark Chocolate", category: "Ingredient", stock: 5, unit: "pack", price: 17.9, minimum: 6 },
  { id: 5, name: "Sourdough Loaf", category: "Bread", stock: 18, unit: "pcs", price: 12, minimum: 8 },
  { id: 6, name: "Chocolate Croissant", category: "Pastry", stock: 13, unit: "pcs", price: 7.5, minimum: 10 },
  { id: 7, name: "Red Velvet Cupcake", category: "Cake", stock: 8, unit: "pcs", price: 6.9, minimum: 10 },
  { id: 8, name: "Vanilla Extract", category: "Ingredient", stock: 4, unit: "bottle", price: 13.5, minimum: 3 }
];

let inventory = loadInventory();

const elements = {
  tableBody: document.getElementById("inventoryTableBody"),
  totalProducts: document.getElementById("totalProducts"),
  lowStockCount: document.getElementById("lowStockCount"),
  inventoryValue: document.getElementById("inventoryValue"),
  lowStockList: document.getElementById("lowStockList"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  stockFilter: document.getElementById("stockFilter"),
  productModal: document.getElementById("productModal"),
  productForm: document.getElementById("productForm"),
  addProductBtn: document.getElementById("addProductBtn"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelBtn: document.getElementById("cancelBtn"),
  modalTitle: document.getElementById("modalTitle"),
  toast: document.getElementById("toast"),
  pageTitle: document.getElementById("pageTitle"),
  menuBtn: document.getElementById("menuBtn"),
  sidebar: document.getElementById("sidebar"),
  reportValue: document.getElementById("reportValue"),
  availablePercent: document.getElementById("availablePercent"),
  lowPercent: document.getElementById("lowPercent"),
  availableBar: document.getElementById("availableBar"),
  lowBar: document.getElementById("lowBar")
};

function loadInventory() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : defaultInventory;
}

function saveInventory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

function money(value) {
  return `RM ${Number(value).toFixed(2)}`;
}

function isLow(item) {
  return Number(item.stock) <= Number(item.minimum);
}

function renderAll() {
  renderInventory();
  renderStats();
  renderLowStock();
  renderReports();
}

function renderInventory() {
  const query = elements.searchInput.value.toLowerCase().trim();
  const category = elements.categoryFilter.value;
  const stock = elements.stockFilter.value;

  const filtered = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(query);
    const matchesCategory = category === "all" || item.category === category;
    const low = isLow(item);
    const matchesStock =
      stock === "all" ||
      (stock === "low" && low) ||
      (stock === "available" && !low);

    return matchesSearch && matchesCategory && matchesStock;
  });

  if (!filtered.length) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;color:#7f7168;padding:30px;">
          No inventory items found.
        </td>
      </tr>`;
    return;
  }

  elements.tableBody.innerHTML = filtered.map(item => `
    <tr>
      <td><span class="product-name">${escapeHtml(item.name)}</span></td>
      <td>${escapeHtml(item.category)}</td>
      <td>${item.stock}</td>
      <td>${escapeHtml(item.unit)}</td>
      <td>${money(item.price)}</td>
      <td>
        <span class="stock-status ${isLow(item) ? "low" : "available"}">
          ${isLow(item) ? "Low Stock" : "Available"}
        </span>
      </td>
      <td>
        <div class="action-group">
          <button class="icon-btn" onclick="editProduct(${item.id})" title="Edit">✏️</button>
          <button class="icon-btn" onclick="deleteProduct(${item.id})" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderStats() {
  const lowCount = inventory.filter(isLow).length;
  const totalValue = inventory.reduce((sum, item) => sum + Number(item.stock) * Number(item.price), 0);

  elements.totalProducts.textContent = inventory.length;
  elements.lowStockCount.textContent = lowCount;
  elements.inventoryValue.textContent = money(totalValue);
}

function renderLowStock() {
  const lowItems = inventory.filter(isLow).slice(0, 5);

  if (!lowItems.length) {
    elements.lowStockList.innerHTML = `
      <div class="stock-alert">
        <div>
          <strong>Everything is well stocked 🎉</strong>
          <span>No items are below the minimum stock level.</span>
        </div>
      </div>`;
    return;
  }

  elements.lowStockList.innerHTML = lowItems.map(item => `
    <div class="stock-alert">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <span>Minimum: ${item.minimum} ${escapeHtml(item.unit)}</span>
      </div>
      <div class="stock-qty">${item.stock} ${escapeHtml(item.unit)}</div>
    </div>
  `).join("");
}

function renderReports() {
  const total = inventory.length || 1;
  const low = inventory.filter(isLow).length;
  const available = inventory.length - low;
  const availablePercent = Math.round((available / total) * 100);
  const lowPercent = Math.round((low / total) * 100);
  const totalValue = inventory.reduce((sum, item) => sum + Number(item.stock) * Number(item.price), 0);

  elements.availablePercent.textContent = `${availablePercent}%`;
  elements.lowPercent.textContent = `${lowPercent}%`;
  elements.availableBar.style.width = `${availablePercent}%`;
  elements.lowBar.style.width = `${lowPercent}%`;
  elements.reportValue.textContent = money(totalValue);
}

function openModal(item = null) {
  elements.productForm.reset();
  document.getElementById("productId").value = "";

  if (item) {
    elements.modalTitle.textContent = "Edit Product";
    document.getElementById("productId").value = item.id;
    document.getElementById("productName").value = item.name;
    document.getElementById("productCategory").value = item.category;
    document.getElementById("productStock").value = item.stock;
    document.getElementById("productUnit").value = item.unit;
    document.getElementById("productPrice").value = item.price;
    document.getElementById("productMinimum").value = item.minimum;
  } else {
    elements.modalTitle.textContent = "Add New Product";
  }

  elements.productModal.classList.add("show");
}

function closeModal() {
  elements.productModal.classList.remove("show");
}

function editProduct(id) {
  const item = inventory.find(product => product.id === id);
  if (item) openModal(item);
}

function deleteProduct(id) {
  const item = inventory.find(product => product.id === id);
  if (!item) return;

  if (confirm(`Delete "${item.name}" from inventory?`)) {
    inventory = inventory.filter(product => product.id !== id);
    saveInventory();
    renderAll();
    showToast("Product deleted.");
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

elements.productForm.addEventListener("submit", event => {
  event.preventDefault();

  const id = Number(document.getElementById("productId").value);
  const product = {
    id: id || Date.now(),
    name: document.getElementById("productName").value.trim(),
    category: document.getElementById("productCategory").value,
    stock: Number(document.getElementById("productStock").value),
    unit: document.getElementById("productUnit").value,
    price: Number(document.getElementById("productPrice").value),
    minimum: Number(document.getElementById("productMinimum").value)
  };

  if (id) {
    inventory = inventory.map(item => item.id === id ? product : item);
    showToast("Product updated successfully.");
  } else {
    inventory.unshift(product);
    showToast("Product added successfully.");
  }

  saveInventory();
  renderAll();
  closeModal();
});

elements.addProductBtn.addEventListener("click", () => openModal());
elements.closeModalBtn.addEventListener("click", closeModal);
elements.cancelBtn.addEventListener("click", closeModal);

elements.productModal.addEventListener("click", event => {
  if (event.target === elements.productModal) closeModal();
});

[elements.searchInput, elements.categoryFilter, elements.stockFilter].forEach(el => {
  el.addEventListener("input", renderInventory);
  el.addEventListener("change", renderInventory);
});

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => {
    const section = button.dataset.section;

    document.querySelectorAll(".nav-link").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(`${section}Section`).classList.add("active");

    elements.pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
    elements.sidebar.classList.remove("open");
  });
});

document.querySelectorAll("[data-goto]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(`.nav-link[data-section="${button.dataset.goto}"]`).click();
  });
});

elements.menuBtn.addEventListener("click", () => {
  elements.sidebar.classList.toggle("open");
});

document.getElementById("todayDate").textContent = new Intl.DateTimeFormat("en-MY", {
  day: "2-digit",
  month: "short",
  year: "numeric"
}).format(new Date());

renderAll();

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
