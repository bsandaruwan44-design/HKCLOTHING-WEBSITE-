
// Initialize Dexie
const db = new Dexie('BabyPosDB');

// Define Schema
db.version(1).stores({
    products: '++id, name, sku, category, wholesalePrice, retailPrice, stock, vendorId, isSelfManufactured, lowStockAlert, isActive', // inventory
    vendors: '++id, name, contact, phone, email, isActive', // suppliers
    sales: '++id, date, customerType, items, discounts, subtotal, tax, total, paymentMethod', // sales history
    productionLogs: '++id, date, productId, quantity, costPerUnit, notes', // tracking self-manufacturing
    purchaseLogs: '++id, date, vendorId, productId, quantity, purchaseCost, notes', // tracking purchases
    settings: 'key, value', // generic settings store
    cart: '++id, productId, quantity, price, customerType', // temporary cart storage
    users: '++id, username, password, role' // admin users
});

// Default settings function
const initSettings = async () => {
    const storeName = await db.settings.get('shopName');
    if (!storeName) {
        await db.settings.bulkAdd([
            { key: 'shopName', value: 'HK CLOTHING DENIYAYA' },
            { key: 'shopAddress', value: 'Deniyaya' },
            { key: 'shopPhone', value: '0727244022' },
            { key: 'whatsappNumber', value: '94727244022' },
            { key: 'currency', value: 'Rs.' }
        ]);
    }

    // Initialize Default Admin
    const adminUser = await db.users.where('username').equals('admin').first();
    if (!adminUser) {
        await db.users.add({
            username: 'admin',
            password: '123',
            role: 'admin'
        });
    }
};

db.on('ready', initSettings);

// Helper function to handle errors
const handleError = (err) => {
    console.error('Database Error:', err);
    alert('Database Error: ' + err.message);
};

// Seeding initial data (optional)
db.on('populate', () => {
    db.vendors.add({ name: 'Self-Manufactured', contact: 'In-House', phone: 'N/A', email: '', isActive: 1 });
    db.products.bulkAdd([
        {
            name: 'Cotton Onesie (NB)',
            sku: 'ONESIE-001',
            category: 'Onesies',
            wholesalePrice: 450,
            retailPrice: 650,
            stock: 50,
            vendorId: 1,
            isSelfManufactured: 1,
            lowStockAlert: 10,
            isActive: 1
        },
        {
            name: 'Printed Frock (6-12M)',
            sku: 'FROCK-102',
            category: 'Frocks',
            wholesalePrice: 850,
            retailPrice: 1250,
            stock: 30,
            vendorId: 1,
            isSelfManufactured: 1,
            lowStockAlert: 5,
            isActive: 1
        },
        {
            name: 'Soft Cotton Napkin (6pk)',
            sku: 'NAP-05',
            category: 'Napkins',
            wholesalePrice: 300,
            retailPrice: 550,
            stock: 100,
            vendorId: 1,
            isSelfManufactured: 0,
            lowStockAlert: 20,
            isActive: 1
        },
        {
            name: 'Baby Sleep Suit (Blue)',
            sku: 'SUIT-301',
            category: 'Baby Suits',
            wholesalePrice: 1200,
            retailPrice: 1850,
            stock: 15,
            vendorId: 1,
            isSelfManufactured: 1,
            lowStockAlert: 5,
            isActive: 1
        },
        {
            name: 'Mittens & Booties Set',
            sku: 'ACC-01',
            category: 'Accessories',
            wholesalePrice: 150,
            retailPrice: 350,
            stock: 60,
            vendorId: 1,
            isSelfManufactured: 0,
            lowStockAlert: 10,
            isActive: 1
        }
    ]);
});

db.open().catch(handleError);
