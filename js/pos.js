
// POS Logic
document.addEventListener('DOMContentLoaded', () => {
    let currentCart = [];
    let customerType = 'retail'; // default
    let selectedCategory = 'all';
    let paymentMethod = 'Cash';

    const productGrid = document.getElementById('product-grid');
    const cartList = document.getElementById('cart-list');
    const searchInput = document.getElementById('product-search');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const discountValEl = document.getElementById('discount-val');
    const discountTypeEl = document.getElementById('discount-type');
    const checkoutBtn = document.getElementById('checkout-btn');

    // UI Toggles
    const btnRetail = document.getElementById('btn-retail');
    const btnWholesale = document.getElementById('btn-wholesale');

    btnRetail.onclick = () => setCustomerType('retail');
    btnWholesale.onclick = () => setCustomerType('wholesale');

    function setCustomerType(type) {
        customerType = type;
        if (type === 'retail') {
            btnRetail.classList.add('bg-white', 'shadow-sm', 'text-indigo-600');
            btnWholesale.classList.remove('bg-white', 'shadow-sm', 'text-indigo-600');
            btnWholesale.classList.add('text-slate-600');
        } else {
            btnWholesale.classList.add('bg-white', 'shadow-sm', 'text-indigo-600');
            btnRetail.classList.remove('bg-white', 'shadow-sm', 'text-indigo-600');
            btnRetail.classList.add('text-slate-600');
        }
        updateCartUI();
    }

    // Load Products
    async function loadProducts() {
        const query = searchInput.value.toLowerCase();
        let products = await db.products.where('isActive').equals(1).toArray();

        if (selectedCategory !== 'all') {
            products = products.filter(p => p.category === selectedCategory);
        }

        if (query) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query)
            );
        }

        renderProducts(products);
    }

    function renderProducts(products) {
        productGrid.innerHTML = products.map(p => `
            <div class="pos-card bg-white p-4 rounded-2xl border border-slate-100 flex flex-col cursor-pointer hover:border-indigo-300" onclick="addToCart(${p.id})">
                <div class="h-32 bg-slate-50 rounded-xl mb-3 flex items-center justify-center text-slate-300 overflow-hidden border border-slate-100">
                    ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<i data-lucide="image" class="w-8 h-8"></i>`}
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-sm mb-1">${p.name}</h4>
                    <p class="text-[10px] text-slate-400 font-mono mb-2">${p.sku}</p>
                    <div class="flex justify-between items-end">
                        <div class="text-xs">
                            <span class="text-slate-400 block">Retail</span>
                            <span class="font-bold text-indigo-600">Rs. ${p.retailPrice.toFixed(2)}</span>
                        </div>
                        <div class="text-xs text-right">
                            <span class="text-slate-400 block">Stock</span>
                            <span class="${p.stock <= p.lowStockAlert ? 'text-rose-500' : 'text-slate-600'} font-bold">${p.stock}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    }

    // Global scope for onclick
    window.addToCart = async (id) => {
        const product = await db.products.get(id);
        if (!product || product.stock <= 0) {
            alert('Out of stock!');
            return;
        }

        const existingItem = currentCart.find(item => item.id === id);
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
            } else {
                alert('Maximum stock reached');
            }
        } else {
            currentCart.push({
                ...product,
                quantity: 1
            });
        }
        updateCartUI();
    };

    window.updateQty = (id, delta) => {
        const item = currentCart.find(i => i.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                currentCart = currentCart.filter(i => i.id !== id);
            } else if (item.quantity > item.stock) {
                item.quantity = item.stock;
                alert('Maximum stock reached');
            }
        }
        updateCartUI();
    };

    function updateCartUI() {
        const badge = document.getElementById('mobile-cart-badge');
        const itemCount = currentCart.reduce((acc, item) => acc + item.quantity, 0);

        if (itemCount > 0) {
            badge.innerText = itemCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        if (currentCart.length === 0) {
            cartList.innerHTML = `
                <div class="text-center py-10 text-slate-400">
                    <i data-lucide="package-open" class="w-12 h-12 mx-auto mb-2 opacity-20"></i>
                    <p>Cart is empty</p>
                </div>
            `;
            subtotalEl.innerText = 'Rs. 0.00';
            totalEl.innerText = 'Rs. 0.00';
            checkoutBtn.disabled = true;
            lucide.createIcons();
            return;
        }

        cartList.innerHTML = currentCart.map(item => {
            const price = customerType === 'retail' ? item.retailPrice : item.wholesalePrice;
            return `
                <div class="cart-item flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div class="w-12 h-12 rounded-lg bg-slate-50 flex-shrink-0 flex items-center justify-center text-slate-300 overflow-hidden border border-slate-100">
                        ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover">` : `<i data-lucide="package" class="w-4 h-4"></i>`}
                    </div>
                    <div class="flex-1">
                        <h5 class="font-bold text-sm">${item.name}</h5>
                        <p class="text-xs text-slate-500">Rs. ${price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="updateQty(${item.id}, -1)" class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200">-</button>
                        <span class="w-6 text-center font-bold text-sm">${item.quantity}</span>
                        <button onclick="updateQty(${item.id}, 1)" class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200">+</button>
                    </div>
                </div>
            `;
        }).join('');

        calculateTotals();
        checkoutBtn.disabled = false;
        lucide.createIcons();
    }

    function calculateTotals() {
        let subtotal = 0;
        currentCart.forEach(item => {
            const price = customerType === 'retail' ? item.retailPrice : item.wholesalePrice;
            subtotal += price * item.quantity;
        });

        const discVal = parseFloat(discountValEl.value) || 0;
        const discType = discountTypeEl.value;
        let discount = 0;

        if (discType === 'fixed') {
            discount = discVal;
        } else {
            discount = (subtotal * discVal) / 100;
        }

        const total = Math.max(0, subtotal - discount);

        subtotalEl.innerText = `Rs. ${subtotal.toFixed(2)}`;
        totalEl.innerText = `Rs. ${total.toFixed(2)}`;
    }

    // Category filtering
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('bg-indigo-600', 'text-white'));
            document.querySelectorAll('.category-btn').forEach(b => b.classList.add('bg-white', 'text-slate-600'));

            btn.classList.remove('bg-white', 'text-slate-600');
            btn.classList.add('bg-indigo-600', 'text-white');

            selectedCategory = btn.dataset.category;
            loadProducts();
        };
    });

    searchInput.addEventListener('input', loadProducts);
    discountValEl.addEventListener('input', calculateTotals);
    discountTypeEl.addEventListener('change', calculateTotals);

    // Checkout Handling
    const checkoutModal = document.getElementById('checkout-modal');
    const modalTotalAmt = document.getElementById('modal-total-amt');
    const cashReceived = document.getElementById('cash-received');
    const balanceAmount = document.getElementById('balance-amount');

    checkoutBtn.onclick = () => {
        modalTotalAmt.innerText = totalEl.innerText;
        checkoutModal.classList.remove('hidden');
        cashReceived.focus();
    };

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => checkoutModal.classList.add('hidden');
    });

    cashReceived.oninput = () => {
        const total = parseFloat(totalEl.innerText.replace('Rs. ', ''));
        const received = parseFloat(cashReceived.value) || 0;
        const balance = Math.max(0, received - total);
        balanceAmount.innerText = `Rs. ${balance.toFixed(2)}`;
    };

    const paymentBtns = document.querySelectorAll('.payment-method-btn');
    paymentBtns.forEach(btn => {
        btn.onclick = () => {
            paymentBtns.forEach(b => {
                b.classList.remove('active', 'border-indigo-500', 'bg-indigo-50');
                b.classList.add('border-slate-100');
                b.querySelector('i').classList.replace('text-indigo-600', 'text-slate-500');
            });
            btn.classList.add('active', 'border-indigo-500', 'bg-indigo-50');
            btn.querySelector('i').classList.replace('text-slate-500', 'text-indigo-600');
            paymentMethod = btn.dataset.method;
        };
    });

    // Confirm Sale
    document.getElementById('confirm-sale-btn').onclick = async () => {
        const subtotal = parseFloat(subtotalEl.innerText.replace('Rs. ', ''));
        const total = parseFloat(totalEl.innerText.replace('Rs. ', ''));
        const discVal = parseFloat(discountValEl.value) || 0;
        const discType = discountTypeEl.value;

        const saleData = {
            date: new Date(),
            customerType: customerType,
            items: currentCart.map(item => ({
                id: item.id,
                name: item.name,
                price: customerType === 'retail' ? item.retailPrice : item.wholesalePrice,
                wholesalePrice: item.wholesalePrice, // Capture this for profit calculation
                quantity: item.quantity
            })),
            subtotal,
            discounts: { value: discVal, type: discType },
            total,
            paymentMethod
        };

        try {
            // Transaction to ensure atomicity
            await db.transaction('rw', db.products, db.sales, async () => {
                // Update products stock
                for (let item of currentCart) {
                    const p = await db.products.get(item.id);
                    await db.products.update(item.id, { stock: p.stock - item.quantity });
                }
                // Add Sale
                await db.sales.add(saleData);
            });

            // Print Receipt
            printReceipt(saleData);

            // Reset
            currentCart = [];
            updateCartUI();
            checkoutModal.classList.add('hidden');
            loadProducts();
            alert('Sale completed successfully!');

        } catch (err) {
            console.error(err);
            alert('Failed to process sale.');
        }
    };

    // Mobile Sidebar Logic
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    document.getElementById('menu-toggle').onclick = () => {
        sidebar.classList.add('open');
        sidebar.classList.remove('hidden');
        overlay.classList.add('active');
    };
    document.getElementById('close-sidebar').onclick = overlay.onclick = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        setTimeout(() => sidebar.classList.add('hidden'), 300);
    };

    // Mobile Cart Drawer Logic
    const cartSection = document.getElementById('cart-section');
    document.getElementById('mobile-cart-toggle').onclick = () => {
        cartSection.classList.add('open');
        overlay.classList.add('active');
    };
    document.getElementById('close-mobile-cart').onclick = () => {
        cartSection.classList.remove('open');
        overlay.classList.remove('active');
    };

    async function printReceipt(sale) {
        // Load Settings
        const shopName = (await db.settings.get('shopName'))?.value || 'HK CLOTHING';
        const shopAddress = (await db.settings.get('shopAddress'))?.value || 'Deniyaya';
        const shopPhone = (await db.settings.get('shopPhone'))?.value || '0741440232';

        document.getElementById('receipt-shop-name').innerText = shopName;
        document.getElementById('receipt-address').innerText = shopAddress;
        document.getElementById('receipt-phone').innerText = shopPhone;

        const itemsHtml = sale.items.map(item => `
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span>${item.name} x ${item.quantity}</span>
                <span>Rs. ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        document.getElementById('receipt-items').innerHTML = itemsHtml;
        document.getElementById('receipt-subtotal').innerText = `Rs. ${sale.subtotal.toFixed(2)}`;
        document.getElementById('receipt-discount').innerText = sale.discounts.type === 'fixed' ?
            `Rs. ${sale.discounts.value.toFixed(2)}` : `${sale.discounts.value}%`;
        document.getElementById('receipt-total').innerText = `Rs. ${sale.total.toFixed(2)}`;
        document.getElementById('receipt-date').innerText = sale.date.toLocaleString();

        window.print();
    }

    // WhatsApp Sharing
    document.getElementById('whatsapp-share-btn').onclick = async () => {
        const subtotal = parseFloat(subtotalEl.innerText.replace('Rs. ', ''));
        const total = parseFloat(totalEl.innerText.replace('Rs. ', ''));
        const discVal = parseFloat(discountValEl.value) || 0;
        const discType = discountTypeEl.value;
        const custPhone = document.getElementById('cust-phone-whatsapp').value;
        const shopName = (await db.settings.get('shopName'))?.value || 'HK CLOTHING';

        let message = `*${shopName} Bill Receipt*\n--------------------------\n`;
        currentCart.forEach(item => {
            const price = customerType === 'retail' ? item.retailPrice : item.wholesalePrice;
            message += `${item.name} x${item.quantity} = Rs. ${(price * item.quantity).toFixed(2)}\n`;
        });
        message += `--------------------------\n`;
        message += `Subtotal: Rs. ${subtotal.toFixed(2)}\n`;
        message += `Discount: ${discType === 'fixed' ? 'Rs. ' : ''}${discVal}${discType === 'percent' ? '%' : ''}\n`;
        message += `*TOTAL: Rs. ${total.toFixed(2)}*\n`;
        message += `--------------------------\nThank you for shopping!`;

        const encodedMsg = encodeURIComponent(message);
        const url = `https://wa.me/${custPhone || ''}?text=${encodedMsg}`;
        window.open(url, '_blank');
    };

    document.getElementById('clear-cart').onclick = () => {
        if (confirm('Clear all items from cart?')) {
            currentCart = [];
            updateCartUI();
        }
    };

    // Initial Load
    loadProducts();
});
