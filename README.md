# Prince Pharma — Modern Single-Store Pharmacy & Wholesale OS

> Built from scratch with Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, and TypeScript. Designed following high-density Google Stitch POS design specifications.

---

## 🌟 Key Architecture & Highlights

1. **Unified Physical Inventory Model**:
   - Single inventory pool serving both Retail walk-in patients and Institutional B2B wholesale buyers.
   - Eliminates duplicate inventory tracking and sync errors.

2. **Strict FEFO (First-Expiry-First-Out) Auto-Allocation**:
   - Dispenses batches with earliest expiry dates first.
   - Real-time batch-level tracking with stock deduction and expiration warning tags.
   - Strict block on expired medicines (e.g. DL-21EXP).

3. **Dynamic Customer Wholesale Contract Pricing**:
   - Tiered/contract pricing per client (e.g., *Shree Krishna Multi-Speciality Hospital*, *Aayush Community Clinic*).
   - Retail cash sales default to MRP / Retail Rate.
   - Switching customer dynamically re-rates all cart items and recalculates wholesale tax brackets in real time.

4. **Split-Screen Real-Time Invoice Generation**:
   - Left side: Fast barcode scanner / quick search medicine selector with instant batch allocation.
   - Right side: High-fidelity live Tax Invoice preview updating on every keystroke.
   - Compliant with **Form 20B** (Retail Tax Invoice / Cash Memo) & **Form 21B** (Wholesale Drug Distribution Invoice).
   - Instant print view formatted for A4 Tax Invoices and 80mm thermal receipt printers.

5. **Financial & Compliance Ledgers**:
   - **Udhari Ledger**: Credit tracking with institutional credit limits, outstanding balances, and repayment logging.
   - **FEFO Batch Stock Ledger**: Centralized physical ledger showing batch numbers, expiries, purchase rates, retail MRPs, wholesale rates, and active stock counts.
   - **Wholesale Pricing Matrix**: Instant overview of base wholesale vs hospital contract pricing.
   - **Audit & GST Reports**: Single-click CSV export of GST sales register and batch audits.

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or configured port) in your browser.

---

## 🔒 Keyboard Shortcuts
- **F1**: POS Billing Counter
- **F2**: FEFO Physical Stock Ledger
- **F3**: Customer Ledger / Matrix
- **F4**: Expiry Watchlist
- **Ctrl + P**: Print & Finalize Invoice
