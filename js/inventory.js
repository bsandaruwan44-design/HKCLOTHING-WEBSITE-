
document.addEventListener('DOMContentLoaded', () => {
    const inventoryList = document.getElementById('inventory-list');
    const searchInput = document.getElementById('inventory-search');
    const productForm = document.getElementById('product-form');
    const productionForm = document.getElementById('production-form');
    const productModal = document.getElementById('product-modal');
    const productionModal = document.getElementById('production-modal');

    const prodSelect = document.getElementById('prod-select');
    const imageInput = document.getElementById('p-image');
    const imagePreview = document.getElementById('image-preview');
    let currentImageBase64 = null;

    async function loadInventory() {
        const query = searchInput.value.toLowerCase();
        let products = await db.products.where('isActive').equals(1).reverse().sortBy('id');

        if (query) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query)
            );
        }

        renderInventory(products);
        updateStats(products);
        updateProdSelect(products);
    }

    function renderInventory(products) {
        inventoryList.innerHTML = products.map(p => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-100">
                            ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<i data-lucide="package" class="w-5 h-5"></i>`}
                        </div>
                        <div>
                            <p class="font-bold text-sm">${p.name}</p>
                            <p class="text-xs text-slate-400 font-mono">${p.sku} | ${p.category}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 font-medium text-sm text-slate-600">Rs. ${p.wholesalePrice.toFixed(2)}</td>
                <td class="px-6 py-4 font-bold text-sm text-indigo-600">Rs. ${p.retailPrice.toFixed(2)}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${p.stock <= p.lowStockAlert ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}">
                        ${p.stock} in stock
                    </span>
                </td>
                <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                        <button onclick="editProduct(${p.id})" class="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors" title="Edit">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deleteProduct(${p.id})" class="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors" title="Delete">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    }

    async function updateStats(products) {
        const totalItems = products.length;
        const lowStock = products.filter(p => p.stock <= p.lowStockAlert).length;
        const totalValue = products.reduce((sum, p) => sum + (p.retailPrice * p.stock), 0);

        document.getElementById('stat-total-items').innerText = totalItems;
        document.getElementById('stat-low-stock').innerText = lowStock;
        document.getElementById('stat-stock-value').innerText = `Rs. ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }

    function updateProdSelect(products) {
        prodSelect.innerHTML = products.map(p => `<option value="${p.id}">${p.name} (${p.sku})</option>`).join('');
    }

    // Product Modal Handlers
    document.getElementById('add-product-btn').onclick = () => {
        document.getElementById('modal-title').innerText = 'Add New Product';
        productForm.reset();
        document.getElementById('product-id').value = '';
        currentImageBase64 = null;
        imagePreview.innerHTML = '<i data-lucide="image" class="w-8 h-8"></i>';
        lucide.createIcons();
        productModal.classList.remove('hidden');
    };

    window.editProduct = async (id) => {
        const p = await db.products.get(id);
        if (!p) return;

        document.getElementById('modal-title').innerText = 'Edit Product';
        document.getElementById('product-id').value = p.id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-sku').value = p.sku;
        document.getElementById('p-category').value = p.category;
        document.getElementById('p-wholesale').value = p.wholesalePrice;
        document.getElementById('p-retail').value = p.retailPrice;
        document.getElementById('p-stock').value = p.stock;
        document.getElementById('p-alert').value = p.lowStockAlert;

        currentImageBase64 = p.image || null;
        if (p.image) {
            imagePreview.innerHTML = `<img src="${p.image}" class="w-full h-full object-cover">`;
        } else {
            imagePreview.innerHTML = '<i data-lucide="image" class="w-8 h-8"></i>';
            lucide.createIcons();
        }

        productModal.classList.remove('hidden');
    };

    window.deleteProduct = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await db.products.update(id, { isActive: 0 });
            loadInventory();
        }
    };

    productForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const data = {
            name: document.getElementById('p-name').value,
            sku: document.getElementById('p-sku').value,
            category: document.getElementById('p-category').value,
            wholesalePrice: parseFloat(document.getElementById('p-wholesale').value),
            retailPrice: parseFloat(document.getElementById('p-retail').value),
            stock: parseInt(document.getElementById('p-stock').value),
            lowStockAlert: parseInt(document.getElementById('p-alert').value),
            image: currentImageBase64,
            isActive: 1
        };

        if (id) {
            await db.products.update(parseInt(id), data);
        } else {
            await db.products.add(data);
        }

        productModal.classList.add('hidden');
        loadInventory();
        alert('Product saved successfully!');
    };

    // Production Handlers
    document.getElementById('add-production-btn').onclick = () => {
        productionModal.classList.remove('hidden');
    };

    productionForm.onsubmit = async (e) => {
        e.preventDefault();
        const productId = parseInt(document.getElementById('prod-select').value);
        const qty = parseInt(document.getElementById('prod-qty').value);
        const cost = parseFloat(document.getElementById('prod-cost').value);

        try {
            await db.transaction('rw', db.products, db.productionLogs, async () => {
                const p = await db.products.get(productId);
                await db.products.update(productId, { stock: p.stock + qty });
                await db.productionLogs.add({
                    date: new Date(),
                    productId,
                    quantity: qty,
                    costPerUnit: cost,
                    notes: 'Self-manufactured'
                });
            });

            productionModal.classList.add('hidden');
            productionForm.reset();
            loadInventory();
            alert('Production record updated and stock increased!');
        } catch (err) {
            console.error(err);
            alert('Failed to update production record.');
        }
    };

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => {
            productModal.classList.add('hidden');
            productionModal.classList.add('hidden');
        };
    });

    searchInput.addEventListener('input', loadInventory);

    // Image upload handler
    imageInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentImageBase64 = event.target.result;
                imagePreview.innerHTML = `<img src="${currentImageBase64}" class="w-full h-full object-cover">`;
            };
            reader.readAsDataURL(file);
        }
    };

    // Initial Load
    loadInventory();
});
