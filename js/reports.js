
document.addEventListener('DOMContentLoaded', async () => {
    const salesHistory = document.getElementById('sales-history');
    const topSellersList = document.getElementById('top-sellers');

    async function loadReports() {
        const sales = await db.sales.toArray();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let todayRevenue = 0;
        let todayProfit = 0;
        let monthRevenue = 0;
        let totalTx = sales.length;

        const productSalesCount = {}; // For top sellers

        sales.forEach(sale => {
            const saleDate = new Date(sale.date);

            // Stats calculation
            if (saleDate >= today) {
                todayRevenue += sale.total;
                sale.items.forEach(item => {
                    const price = item.price;
                    const cost = item.wholesalePrice || 0;
                    todayProfit += (price - cost) * item.quantity;
                });
            }

            if (saleDate >= thisMonth) {
                monthRevenue += sale.total;
            }

            // Top sellers calculation
            sale.items.forEach(item => {
                if (!productSalesCount[item.name]) {
                    productSalesCount[item.name] = { qty: 0, revenue: 0 };
                }
                productSalesCount[item.name].qty += item.quantity;
                productSalesCount[item.name].revenue += (item.price * item.quantity);
            });
        });

        // Update Stats UI
        document.getElementById('report-today-revenue').innerText = `Rs. ${todayRevenue.toFixed(2)}`;
        document.getElementById('report-today-profit').innerText = `Rs. ${todayProfit.toFixed(2)}`;
        document.getElementById('report-month-revenue').innerText = `Rs. ${monthRevenue.toFixed(2)}`;
        document.getElementById('report-total-tx').innerText = totalTx;

        // Render History
        renderSalesHistory(sales.reverse().slice(0, 50)); // Last 50 sales

        // Render Top Sellers
        renderTopSellers(productSalesCount);
    }

    function renderSalesHistory(sales) {
        if (sales.length === 0) {
            salesHistory.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-slate-400">No sales recorded yet.</td></tr>`;
            return;
        }

        salesHistory.innerHTML = sales.map(s => `
            <tr>
                <td class="px-6 py-4">
                    <p class="font-bold text-sm">#TX-${s.id}</p>
                    <p class="text-[10px] text-slate-400">${new Date(s.date).toLocaleString()}</p>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase ${s.customerType === 'retail' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}">
                        ${s.customerType}
                    </span>
                </td>
                <td class="px-6 py-4 text-xs text-slate-600">
                    ${s.items.map(i => i.name + ' (x' + i.quantity + ')').join(', ')}
                </td>
                <td class="px-6 py-4 font-bold text-sm">Rs. ${s.total.toFixed(2)}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-2 text-xs text-slate-500">
                        <i data-lucide="${s.paymentMethod === 'Cash' ? 'banknote' : 'credit-card'}" class="w-4 h-4"></i>
                        ${s.paymentMethod}
                    </div>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    }

    function renderTopSellers(countMap) {
        const sorted = Object.entries(countMap)
            .sort((a, b) => b[1].qty - a[1].qty)
            .slice(0, 5);

        if (sorted.length === 0) {
            topSellersList.innerHTML = `<p class="text-sm text-slate-400 italic">No data yet.</p>`;
            return;
        }

        topSellersList.innerHTML = sorted.map(([name, data]) => `
            <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                <div class="flex-1">
                    <p class="text-sm font-bold">${name}</p>
                    <p class="text-xs text-slate-500">${data.qty} units sold</p>
                </div>
                <p class="text-sm font-black text-indigo-600">Rs. ${data.revenue.toFixed(2)}</p>
            </div>
        `).join('');
    }

    // Export to CSV
    document.getElementById('export-btn').onclick = async () => {
        const sales = await db.sales.toArray();
        if (sales.length === 0) return alert('No data to export');

        let csv = 'ID,Date,Type,Total,Method,Items\n';
        sales.forEach(s => {
            const items = s.items.map(i => `${i.name}(${i.quantity})`).join(';');
            csv += `${s.id},${new Date(s.date).toLocaleString()},${s.customerType},${s.total},${s.paymentMethod},"${items}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
        a.click();
    };

    // Initial Load
    loadReports();
});
