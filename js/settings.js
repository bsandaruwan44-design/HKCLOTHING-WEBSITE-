
document.addEventListener('DOMContentLoaded', async () => {
    const shopNameInp = document.getElementById('set-shop-name');
    const shopPhoneInp = document.getElementById('set-shop-phone');
    const shopAddressInp = document.getElementById('set-shop-address');
    const whatsappInp = document.getElementById('set-whatsapp');
    const currencyInp = document.getElementById('set-currency');
    const saveBtn = document.getElementById('save-settings');
    const resetBtn = document.getElementById('reset-db');

    const exportBtn = document.getElementById('export-db');
    const importBtn = document.getElementById('import-db-btn');
    const importFile = document.getElementById('import-db-file');

    async function loadSettings() {
        const settings = await db.settings.toArray();
        settings.forEach(s => {
            if (s.key === 'shopName') shopNameInp.value = s.value;
            if (s.key === 'shopPhone') shopPhoneInp.value = s.value;
            if (s.key === 'shopAddress') shopAddressInp.value = s.value;
            if (s.key === 'whatsappNumber') whatsappInp.value = s.value;
            if (s.key === 'currency') currencyInp.value = s.value;
        });
    }

    saveBtn.onclick = async () => {
        await db.settings.put({ key: 'shopName', value: shopNameInp.value });
        await db.settings.put({ key: 'shopPhone', value: shopPhoneInp.value });
        await db.settings.put({ key: 'shopAddress', value: shopAddressInp.value });
        await db.settings.put({ key: 'whatsappNumber', value: whatsappInp.value });
        await db.settings.put({ key: 'currency', value: currencyInp.value });

        alert('Settings saved successfully!');
    };

    resetBtn.onclick = async () => {
        if (confirm('CRITICAL: Are you sure you want to delete EVERY PIECE OF DATA in this system? This cannot be undone.')) {
            await db.delete();
            location.reload();
        }
    };

    // --- Data Export & Import (Manual Sync Tool) ---

    exportBtn.onclick = async () => {
        try {
            const data = {};
            const tables = ['products', 'vendors', 'sales', 'productionLogs', 'purchaseLogs', 'settings', 'users'];

            for (const table of tables) {
                data[table] = await db[table].toArray();
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HK_POS_Backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Export failed.');
        }
    };

    importBtn.onclick = () => importFile.click();

    importFile.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm('Warning: Importing data will replace all current data. Do you want to continue?')) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);

                // Clear and Restore
                await db.transaction('rw', db.products, db.vendors, db.sales, db.productionLogs, db.purchaseLogs, db.settings, db.users, async () => {
                    for (const table in data) {
                        await db[table].clear();
                        await db[table].bulkAdd(data[table]);
                    }
                });

                alert('Data imported successfully! The page will now reload.');
                location.reload();
            } catch (err) {
                console.error(err);
                alert('Import failed. Invalid backup file.');
            }
        };
        reader.readAsText(file);
    };

    if (db.isOpen()) loadSettings();
    else db.on('ready', loadSettings);
});
