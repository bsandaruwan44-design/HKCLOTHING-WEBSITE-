# Project: Newborn Baby Wear POS & Inventory System

## 1. Project Overview
A lightweight, offline-first Point of Sale (POS) and Inventory Management system specifically designed for a baby clothing business. The system handles retail/wholesale sales, vendor purchases, and self-manufactured stock.

---

## 2. Business Requirements

### A. Inventory Management
- **Product Categorization:** Ability to add items (e.g., Onesies, Frocks, Napkins).
- **Dual Pricing:** Maintain two price points for every item: **Wholesale Price** and **Retail Price**.
- **Stock Tracking:** - Track stock coming from **Vendors** (Purchased).
    - Track stock added from **In-house Production** (Self-manufactured).
- **Low Stock Alerts:** Highlight items that are running low.

### B. Sales Management (Billing)
- **Customer Types:** Toggle between "Retail" and "Wholesale" during checkout.
- **Discounting:** Apply flat or percentage discounts on the total bill.
- **Invoicing:** Generate a clean, printable receipt/invoice format.
- **Cart System:** Add multiple items to a cart before finalizing the sale.

### C. Vendor & Supply Management
- **Vendor Registry:** Save vendor names and contact details.
- **Purchase History:** Record how much stock was bought from which vendor and at what cost.

### D. Manufacturing (Self-Production)
- **Manual Stock Update:** A simple way to add stock when a batch of clothes is finished sewing at home.
- **Cost Tracking:** Record the production cost per unit to calculate profit accurately.

### E. Reporting & Dashboard
- **Daily Sales:** Total revenue and profit for the day.
- **Monthly Summary:** Sales trends and top-selling items.
- **Stock Valuation:** Total value of current stock at cost price vs. selling price.

---

## 3. Technical Requirements

### A. Frontend Stack
- **HTML5:** Semantic structure for the UI.
- **Tailwind CSS:** For modern, responsive styling (CDN or CLI).
- **JavaScript (ES6+):** For core business logic and DOM manipulation.

### B. Database (Storage)
- **Dexie.js:** A wrapper for IndexedDB to store all data locally in the browser. No internet required for daily operations.
- **Data Persistence:** Ensure data stays saved even if the browser is closed.

### C. System Architecture (Suggested Folder Structure)
```text
/baby-pos
│
├── index.html          # Main Dashboard & POS Interface
├── inventory.html      # Stock Management Page
├── reports.html        # Sales & Analytics Page
├── /css
│   └── style.css       # Custom styles (if any)
└── /js
    ├── db.js           # Dexie database initialization
    ├── pos.js          # Logic for billing and cart
    └── inventory.js    # Logic for adding/updating products