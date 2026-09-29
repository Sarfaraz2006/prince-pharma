'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShoppingCart,
  Boxes,
  Truck,
  Users,
  CreditCard,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  UserCheck,
  Percent,
  Download,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  Product,
  Batch,
  Customer,
  CustomerProductPrice,
  Supplier,
  Invoice,
  InvoiceItem,
  PharmacySettings,
  INITIAL_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_BATCHES,
  INITIAL_CUSTOMERS,
  INITIAL_CUSTOMER_PRICES,
  INITIAL_SUPPLIERS,
  INITIAL_INVOICES,
  numberToWordsIndian,
} from '../data/pharmaData';

export default function PrincePharmaApp() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<
    'billing' | 'inventory' | 'purchases' | 'customers' | 'ledger' | 'expiry' | 'reports' | 'settings'
  >('billing');
  const [userRole, setUserRole] = useState<'Owner' | 'Admin' | 'Pharmacist' | 'Cashier'>('Admin');

  // Master State with LocalStorage Persistence
  const [settings, setSettings] = useState<PharmacySettings>(INITIAL_SETTINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [customerPrices, setCustomerPrices] = useState<CustomerProductPrice[]>(INITIAL_CUSTOMER_PRICES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  // POS Billing State
  const [saleType, setSaleType] = useState<'retail' | 'wholesale'>('retail');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-walkin');
  const [walkinName, setWalkinName] = useState<string>('Walk-in Patient');
  const [walkinPhone, setWalkinPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'credit'>('cash');
  const [upiRef, setUpiRef] = useState<string>('');
  const [posSearchTerm, setPosSearchTerm] = useState<string>('');
  const [cartItems, setCartItems] = useState<{
    product: Product;
    quantity: number;
    freeQuantity: number;
    customRate?: number;
    discountPercent: number;
  }[]>([
    {
      product: INITIAL_PRODUCTS[0], // Dolo 650
      quantity: 2,
      freeQuantity: 0,
      discountPercent: 0,
    },
  ]);

  // Modals & Print Preview State
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [printFormat, setPrintFormat] = useState<'A4' | '80mm'>('A4');
  const [priceOverrideModal, setPriceOverrideModal] = useState<{ index: number; currentRate: number } | null>(null);
  const [overrideRateInput, setOverrideRateInput] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('pp_settings_v2');
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedBatches = localStorage.getItem('pp_batches_v2');
      if (savedBatches) setBatches(JSON.parse(savedBatches));

      const savedInvoices = localStorage.getItem('pp_invoices_v2');
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

      const savedCustomers = localStorage.getItem('pp_customers_v2');
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    } catch (e) {
      console.warn('LocalStorage load failed', e);
    }
  }, []);

  // Save state updates to localStorage
  const saveState = (updatedBatches?: Batch[], updatedInvoices?: Invoice[], updatedCustomers?: Customer[]) => {
    try {
      if (updatedBatches) {
        setBatches(updatedBatches);
        localStorage.setItem('pp_batches_v2', JSON.stringify(updatedBatches));
      }
      if (updatedInvoices) {
        setInvoices(updatedInvoices);
        localStorage.setItem('pp_invoices_v2', JSON.stringify(updatedInvoices));
      }
      if (updatedCustomers) {
        setCustomers(updatedCustomers);
        localStorage.setItem('pp_customers_v2', JSON.stringify(updatedCustomers));
      }
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  };

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Keyboard Shortcuts (F1: POS, F2: Stock, F3: Wholesale, Enter: Add)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('billing');
        setSaleType('retail');
        searchInputRef.current?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('inventory');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('billing');
        setSaleType('wholesale');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('expiry');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Selected customer object
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  // Effective rate calculation for a product given the current customer & sale type
  const getEffectiveRate = (product: Product): { rate: number; isCustom: boolean; note?: string } => {
    if (saleType === 'retail') {
      return { rate: product.defaultRetailPrice, isCustom: false };
    }
    // Check wholesale contract price matrix
    const customPrice = customerPrices.find(
      (cp) => cp.customerId === selectedCustomerId && cp.productId === product.id
    );
    if (customPrice) {
      return { rate: customPrice.customRate, isCustom: true, note: customPrice.note };
    }
    return { rate: product.defaultWholesalePrice, isCustom: false };
  };

  // Deterministic FEFO Batch Allocation for current cart
  const cartAllocations = useMemo(() => {
    return cartItems.map((item) => {
      const now = new Date();
      // Find non-expired batches for this product, sorted ascending by expiry
      const eligibleBatches = batches
        .filter((b) => b.productId === item.product.id && b.status === 'active' && new Date(b.expiryDate) > now)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      let needed = item.quantity;
      const allocations: { batch: Batch; qty: number }[] = [];

      for (const batch of eligibleBatches) {
        if (needed <= 0) break;
        const take = Math.min(batch.sellableStock, needed);
        allocations.push({ batch, qty: take });
        needed -= take;
      }

      const totalAvailable = eligibleBatches.reduce((acc, b) => acc + b.sellableStock, 0);
      const isShortage = needed > 0;

      const rateInfo = getEffectiveRate(item.product);
      const unitRate = item.customRate !== undefined ? item.customRate : rateInfo.rate;
      const lineSubtotal = item.quantity * unitRate;
      const discount = (lineSubtotal * item.discountPercent) / 100;
      const lineTotal = lineSubtotal - discount;
      const taxable = lineTotal / (1 + item.product.gstRate / 100);
      const gstAmount = lineTotal - taxable;

      return {
        ...item,
        unitRate,
        rateInfo,
        allocations,
        totalAvailable,
        isShortage,
        shortageQty: needed,
        lineSubtotal,
        discount,
        lineTotal,
        taxable,
        gstAmount,
      };
    });
  }, [cartItems, batches, saleType, selectedCustomerId, customerPrices]);

  // Overall totals
  const billSummary = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    let taxable = 0;
    let gst = 0;
    let total = 0;

    for (const item of cartAllocations) {
      subtotal += item.lineSubtotal;
      discount += item.discount;
      taxable += item.taxable;
      gst += item.gstAmount;
      total += item.lineTotal;
    }

    const cgst = gst / 2;
    const sgst = gst / 2;

    return {
      subtotal,
      discount,
      taxable,
      cgst,
      sgst,
      total,
      amountInWords: numberToWordsIndian(total),
    };
  }, [cartAllocations]);

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          freeQuantity: 0,
          discountPercent: 0,
        },
      ];
    });
    setPosSearchTerm('');
  };

  // Remove from cart
  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Change quantity
  const handleQtyChange = (index: number, newQty: number) => {
    if (newQty <= 0) return handleRemoveItem(index);
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item))
    );
  };

  // Complete and commit sale
  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      return notify('Cannot create an empty bill. Add medicines first.', 'error');
    }

    // Check for shortages
    const shortageItem = cartAllocations.find((a) => a.isShortage);
    if (shortageItem) {
      return notify(
        `Insufficient stock for ${shortageItem.product.name}. Requested: ${shortageItem.quantity}, Available: ${shortageItem.totalAvailable}`,
        'error'
      );
    }

    // Check credit limit for wholesale credit sale
    if (saleType === 'wholesale' && paymentMethod === 'credit') {
      const newOutstanding = activeCustomer.currentOutstanding + billSummary.total;
      if (newOutstanding > activeCustomer.creditLimit) {
        return notify(
          `Credit limit exceeded for ${activeCustomer.businessName}! Limit: ₹${activeCustomer.creditLimit.toLocaleString()}, Resulting Balance: ₹${newOutstanding.toLocaleString()}`,
          'error'
        );
      }
    }

    // 1. Deplete batches based on FEFO allocations
    const updatedBatches = [...batches];
    for (const allocItem of cartAllocations) {
      for (const alloc of allocItem.allocations) {
        const batchIndex = updatedBatches.findIndex((b) => b.id === alloc.batch.id);
        if (batchIndex !== -1) {
          updatedBatches[batchIndex] = {
            ...updatedBatches[batchIndex],
            sellableStock: updatedBatches[batchIndex].sellableStock - alloc.qty,
          };
        }
      }
    }

    // 2. Generate sequential invoice
    const prefix = saleType === 'retail' ? settings.retailPrefix : settings.wholesalePrefix;
    const invCount = invoices.filter((inv) => inv.type === saleType).length + 1;
    const invoiceNum = `${prefix}2026-${String(invCount).padStart(4, '0')}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      type: saleType,
      date: new Date().toISOString().split('T')[0],
      customerId: saleType === 'wholesale' ? activeCustomer.id : undefined,
      customerName: saleType === 'wholesale' ? activeCustomer.businessName : walkinName,
      customerPhone: saleType === 'wholesale' ? activeCustomer.phone : walkinPhone,
      customerGstin: saleType === 'wholesale' ? activeCustomer.gstin : undefined,
      customerDl: saleType === 'wholesale' ? activeCustomer.drugLicence : undefined,
      paymentMethod,
      paymentStatus: paymentMethod === 'credit' ? 'unpaid' : 'paid',
      subtotal: billSummary.subtotal,
      discountTotal: billSummary.discount,
      taxableTotal: billSummary.taxable,
      cgstTotal: billSummary.cgst,
      sgstTotal: billSummary.sgst,
      igstTotal: 0,
      grandTotal: billSummary.total,
      amountInWords: billSummary.amountInWords,
      notes: paymentMethod === 'upi' ? `UPI Ref: ${upiRef || 'Direct QR'}` : undefined,
      items: cartAllocations.map((a, i) => ({
        id: `item-${Date.now()}-${i}`,
        productId: a.product.id,
        productName: a.product.name,
        hsnCode: a.product.hsnCode,
        gstRate: a.product.gstRate,
        quantity: a.quantity,
        freeQuantity: a.freeQuantity,
        mrp: a.product.mrp,
        unitPrice: a.unitRate,
        discountPercent: a.discountPercent,
        taxableAmount: a.taxable,
        cgstAmount: a.gstAmount / 2,
        sgstAmount: a.gstAmount / 2,
        igstAmount: 0,
        totalAmount: a.lineTotal,
        allocations: a.allocations.map((al) => ({
          batchId: al.batch.id,
          batchNumber: al.batch.batchNumber,
          expiryDate: al.batch.expiryDate,
          quantity: al.qty,
          rate: a.unitRate,
          mrp: al.batch.mrp,
          amount: al.qty * a.unitRate,
        })),
        isManualOverride: a.customRate !== undefined,
      })),
    };

    // 3. Update customer outstanding if credit
    let updatedCustomers = [...customers];
    if (saleType === 'wholesale' && paymentMethod === 'credit') {
      updatedCustomers = customers.map((c) =>
        c.id === activeCustomer.id
          ? { ...c, currentOutstanding: c.currentOutstanding + billSummary.total }
          : c
      );
    }

    const updatedInvoices = [newInvoice, ...invoices];
    saveState(updatedBatches, updatedInvoices, updatedCustomers);

    // Reset cart and open print modal
    setCartItems([]);
    setViewingInvoice(newInvoice);
    notify(`Invoice ${newInvoice.invoiceNumber} generated successfully! Stock depleted via FEFO.`, 'success');
  };

  // Filtered products for search
  const filteredProducts = useMemo(() => {
    if (!posSearchTerm.trim()) return [];
    const term = posSearchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.genericName.toLowerCase().includes(term) ||
        p.barcode.includes(term)
    );
  }, [products, posSearchTerm]);

  // Statistics calculation for the Top Bar
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBills = invoices.filter((i) => i.date === todayStr);
    const todaySales = todayBills.reduce((acc, i) => acc + i.grandTotal, 0);

    const totalStock = batches.reduce((acc, b) => acc + (b.status === 'active' ? b.sellableStock : 0), 0);
    const lowStockCount = products.filter((p) => {
      const stock = batches
        .filter((b) => b.productId === p.id && b.status === 'active')
        .reduce((sum, b) => sum + b.sellableStock, 0);
      return stock <= p.reorderLevel;
    }).length;

    const now = new Date();
    const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const nearExpiryCount = batches.filter(
      (b) => b.status === 'active' && new Date(b.expiryDate) <= in90 && new Date(b.expiryDate) > now
    ).length;

    const totalUdhar = customers.reduce((acc, c) => acc + c.currentOutstanding, 0);

    return {
      todaySales,
      todayBillsCount: todayBills.length,
      totalStock,
      lowStockCount,
      nearExpiryCount,
      totalUdhar,
    };
  }, [invoices, batches, products, customers]);

  return (
    <div className="flex flex-col min-h-screen bg-[#070b14] text-slate-200">
      {/* 1. TOP EXECUTIVE APP BAR (Stitch Style: Dense, Dark Slate, Emerald Accents) */}
      <header className="sticky top-0 z-40 bg-[#0d1322] border-b border-slate-800/90 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo & Store Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-white text-base shadow-sm shadow-emerald-950">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-tight">{settings.name}</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.5 rounded font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Form 20B & 21B Active
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>GST: {settings.gstin}</span>
                <span>•</span>
                <span>DL: {settings.dlNumber20b}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Ticker */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-lg">
              <span className="text-slate-400 text-[11px]">Today:</span>
              <strong className="text-emerald-400 font-bold">₹{stats.todaySales.toLocaleString()}</strong>
              <span className="text-slate-400 text-[10px]">({stats.todayBillsCount} bills)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-lg">
              <span className="text-slate-400 text-[11px]">Stock:</span>
              <strong className="text-white font-bold">{stats.totalStock}</strong>
              <span className="text-slate-400 text-[10px]">units</span>
            </div>
            {stats.nearExpiryCount > 0 && (
              <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/60 text-rose-400 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-bold text-[11px]">{stats.nearExpiryCount} Near Expiry</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-amber-950/30 border border-amber-800/50 text-amber-300 px-2.5 py-1 rounded-lg">
              <CreditCard className="w-3.5 h-3.5" />
              <span className="text-[11px]">Udhar: ₹{stats.totalUdhar.toLocaleString()}</span>
            </div>
          </div>

          {/* Role Switcher & Keyboard Shortcut Help */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5 text-xs">
              {(['Owner', 'Admin', 'Pharmacist', 'Cashier'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRole(role)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    userRole === role ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 2. SUB-NAV TABS (Google Stitch Navigation Standard) */}
      <nav className="bg-[#0b101c] border-b border-slate-800 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>POS Billing Counter</span>
            <span className="text-[10px] opacity-75 font-mono">(F1)</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>FEFO Physical Stock</span>
            <span className="text-[10px] opacity-75 font-mono">(F2)</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Wholesale Pricing Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Udhari Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('expiry')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'expiry'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Expiry Watch</span>
            <span className="text-[10px] opacity-75 font-mono">(F4)</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>GST & Audit Reports</span>
          </button>
        </div>
      </nav>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold border ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700'
                : 'bg-rose-950/90 text-rose-200 border-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE VIEW */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* TAB 1: POS BILLING COUNTER (Split 2-Column Workflow) */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Fast Input & Cart Lines (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Channel Selector: Retail vs Wholesale Institutional */}
              <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sale Mode:</span>
                    <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                      <button
                        onClick={() => {
                          setSaleType('retail');
                          setSelectedCustomerId('cust-walkin');
                        }}
                        className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                          saleType === 'retail'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Retail POS (Form 20B)
                      </button>
                      <button
                        onClick={() => {
                          setSaleType('wholesale');
                          if (selectedCustomerId === 'cust-walkin') setSelectedCustomerId('cust-krishna');
                        }}
                        className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                          saleType === 'wholesale'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Wholesale B2B (Form 21B)
                      </button>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Single Inventory FEFO
                  </span>
                </div>

                {/* Customer Details Form */}
                {saleType === 'retail' ? (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400">Patient / Customer Name:</label>
                      <input
                        type="text"
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                        placeholder="Walk-in Cash Patient"
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Mobile (Optional for SMS Invoice):</label>
                      <input
                        type="text"
                        value={walkinPhone}
                        onChange={(e) => setWalkinPhone(e.target.value)}
                        placeholder="e.g. 9820155555"
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-400 font-medium">
                        Select Institutional B2B Customer:
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Outstanding: <strong className="text-amber-400">₹{activeCustomer.currentOutstanding.toLocaleString()}</strong> / Limit: ₹{activeCustomer.creditLimit.toLocaleString()}
                      </span>
                    </div>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-emerald-500"
                    >
                      {customers
                        .filter((c) => c.type !== 'retail')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.businessName} ({c.type.toUpperCase()}) — GSTIN: {c.gstin}
                          </option>
                        ))}
                    </select>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 font-mono">
                      <span>DL: {activeCustomer.drugLicence}</span>
                      <span className="text-teal-400 font-semibold">Special Contract Rates Auto-Applied</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Medicine Barcode & Name Search Input */}
              <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs space-y-3 relative">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={posSearchTerm}
                      onChange={(e) => setPosSearchTerm(e.target.value)}
                      placeholder="Scan Barcode or Search Medicine (e.g. Augmentin, Dolo, Pan 40)..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-emerald-500 font-medium"
                    />
                  </div>
                </div>

                {/* Instant Search Results Dropdown */}
                {filteredProducts.length > 0 && (
                  <div className="absolute top-16 left-4 right-4 z-30 bg-[#090d16] border border-emerald-700/80 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                    {filteredProducts.map((p) => {
                      const rateInfo = getEffectiveRate(p);
                      const totalAvailable = batches
                        .filter((b) => b.productId === p.id && b.status === 'active' && new Date(b.expiryDate) > new Date())
                        .reduce((sum, b) => sum + b.sellableStock, 0);

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleAddToCart(p)}
                          className="p-2.5 hover:bg-slate-800/80 border-b border-slate-800/60 flex items-center justify-between cursor-pointer text-xs"
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{p.name}</span>
                              <span className="text-[10px] px-1 bg-slate-800 text-slate-300 rounded font-mono">
                                {p.packSize}{p.packUnit}
                              </span>
                              <span className="text-[10px] px-1 bg-amber-950 text-amber-300 rounded font-mono">
                                {p.schedule}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {p.genericName} • {p.manufacturer} • Rack: {p.rackLocation}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-emerald-400 font-mono text-sm">
                              ₹{rateInfo.rate.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Stock: <strong className={totalAvailable > 0 ? 'text-white' : 'text-rose-400'}>{totalAvailable}</strong>
                              {rateInfo.isCustom && <span className="ml-1 text-teal-300">(Contract)</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Add Buttons for Top Counter Medicines */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Quick Add:</span>
                  {products.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAddToCart(p)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 text-[11px] font-mono transition cursor-pointer"
                    >
                      + {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart Table with Real-time FEFO Batch Allocations */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                    Bill Items ({cartItems.length})
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Earliest Expiry First (FEFO)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b101c] text-slate-400 text-[10px] uppercase font-mono tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-2">FEFO Batch & Expiry</th>
                        <th className="py-2 px-2 text-center">Qty</th>
                        <th className="py-2 px-2 text-right">Rate (₹)</th>
                        <th className="py-2 px-2 text-right">Total (₹)</th>
                        <th className="py-2 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {cartAllocations.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-white">{item.product.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              HSN: {item.product.hsnCode} • GST: {item.product.gstRate}%
                            </div>
                          </td>

                          {/* FEFO Batch Allocation Display */}
                          <td className="py-2.5 px-2">
                            {item.allocations.length > 0 ? (
                              <div className="space-y-1">
                                {item.allocations.map((al, aIdx) => (
                                  <div
                                    key={aIdx}
                                    className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/80"
                                  >
                                    <span className="text-emerald-400 font-bold">{al.batch.batchNumber}</span>
                                    <span className="text-slate-400">(Exp: {al.batch.expiryDate.slice(0, 7)})</span>
                                    <span className="text-slate-300">[{al.qty} units]</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-rose-400 font-mono">No active batch available</span>
                            )}
                            {item.isShortage && (
                              <div className="text-[10px] text-rose-400 font-semibold mt-0.5">
                                Shortage: {item.shortageQty} units!
                              </div>
                            )}
                          </td>

                          {/* Qty Counter */}
                          <td className="py-2.5 px-2 text-center">
                            <div className="inline-flex items-center border border-slate-700 rounded bg-slate-900">
                              <button
                                onClick={() => handleQtyChange(idx, item.quantity - 1)}
                                className="px-1.5 py-0.5 text-slate-400 hover:text-white cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2 font-mono font-bold text-white text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQtyChange(idx, item.quantity + 1)}
                                className="px-1.5 py-0.5 text-slate-400 hover:text-white cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Rate & Manual Override */}
                          <td className="py-2.5 px-2 text-right font-mono">
                            <div className="font-bold text-white">₹{item.unitRate.toFixed(2)}</div>
                            <div className="text-[10px] text-slate-400">MRP: ₹{item.product.mrp}</div>
                            {item.rateInfo.isCustom && (
                              <span className="text-[9px] bg-teal-950 text-teal-300 border border-teal-800 px-1 rounded">
                                Contract
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-400">
                            ₹{item.lineTotal.toFixed(2)}
                          </td>

                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {cartItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 text-xs font-mono">
                            Cart is empty. Scan barcode or use search input above to add items.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Payment Selector and Submit Button */}
                <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <span className="text-xs text-slate-400 font-medium">Payment Mode:</span>
                      <div className="flex bg-slate-950 border border-slate-700 rounded-lg p-0.5 text-xs font-semibold">
                        {(['cash', 'upi', 'card', 'credit'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setPaymentMethod(mode)}
                            className={`px-2.5 py-1 rounded capitalize transition cursor-pointer ${
                              paymentMethod === mode
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {mode === 'credit' ? 'Udhari' : mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleCompleteSale}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-950 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Complete & Print Invoice (Ctrl+P)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Real-Time Dynamic Tax Invoice Preview (5 Cols) */}
            <div className="lg:col-span-5 sticky top-20 bg-white text-slate-900 rounded-xl p-5 shadow-2xl border border-slate-300 font-sans text-xs">
              {/* Invoice Formal Header */}
              <div className="border-b-2 border-slate-800 pb-3 text-center space-y-1">
                <h2 className="font-extrabold text-base tracking-tight uppercase text-slate-900">
                  {settings.name}
                </h2>
                <p className="text-[10px] text-slate-600 font-medium">{settings.tagline}</p>
                <p className="text-[10px] text-slate-600">
                  {settings.address}, {settings.city} - {settings.pincode}
                </p>
                <div className="pt-1 flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-slate-700 font-semibold">
                  <span>GSTIN: <strong>{settings.gstin}</strong></span>
                  <span>•</span>
                  <span>DL 20B: {settings.dlNumber20b}</span>
                  <span>•</span>
                  <span>DL 21B: {settings.dlNumber21b}</span>
                </div>
              </div>

              {/* Title Badge */}
              <div className="py-2 text-center bg-slate-100 my-2 rounded font-bold text-xs uppercase tracking-wider text-slate-800 border border-slate-200">
                {saleType === 'retail' ? 'RETAIL TAX INVOICE / CASH MEMO (FORM 20B)' : 'WHOLESALE TAX INVOICE (FORM 21B)'}
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-200">
                <div>
                  <div className="text-slate-500">Billed To:</div>
                  <div className="font-bold text-slate-900">
                    {saleType === 'retail' ? walkinName : activeCustomer.businessName}
                  </div>
                  {saleType === 'wholesale' && (
                    <div className="text-[10px] font-mono text-slate-600">
                      GSTIN: {activeCustomer.gstin} • DL: {activeCustomer.drugLicence}
                    </div>
                  )}
                </div>
                <div className="text-right font-mono">
                  <div>Inv No: <strong className="text-emerald-700">{saleType === 'retail' ? 'RET-PREVIEW' : 'WS-PREVIEW'}</strong></div>
                  <div>Date: {new Date().toISOString().split('T')[0]}</div>
                  <div>Mode: <span className="uppercase font-bold">{paymentMethod}</span></div>
                </div>
              </div>

              {/* Real-time Line Items */}
              <div className="py-2 border-b border-slate-200">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-[10px] uppercase font-mono text-slate-600">
                      <th className="py-1">Description</th>
                      <th className="py-1">Batch</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Rate</th>
                      <th className="py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {cartAllocations.map((it, i) => (
                      <tr key={i}>
                        <td className="py-1.5 font-sans font-medium text-slate-900">
                          {it.product.name}
                        </td>
                        <td className="py-1.5 text-[10px] text-slate-600">
                          {it.allocations[0]?.batch.batchNumber || 'FEFO'}
                        </td>
                        <td className="py-1.5 text-center font-bold">{it.quantity}</td>
                        <td className="py-1.5 text-right">₹{it.unitRate.toFixed(2)}</td>
                        <td className="py-1.5 text-right font-bold">₹{it.lineTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="pt-2 space-y-1 text-right text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Subtotal:</span>
                  <span>₹{billSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Taxable Value:</span>
                  <span>₹{billSummary.taxable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">CGST (6%):</span>
                  <span>₹{billSummary.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">SGST (6%):</span>
                  <span>₹{billSummary.sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-800">
                  <span className="font-sans font-black">Grand Total:</span>
                  <span className="text-emerald-700">₹{billSummary.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Amount in words */}
              <div className="mt-2 p-1.5 bg-slate-50 rounded border border-slate-200 text-[10px] italic font-serif text-slate-700">
                Amount in words: <strong>{billSummary.amountInWords}</strong>
              </div>

              {/* Terms & Footer */}
              <div className="mt-3 pt-2 border-t border-slate-200 text-[9px] text-slate-500 flex justify-between items-end">
                <div>
                  <p>• Goods once sold will not be returned without original batch verification.</p>
                  <p>• Cold chain medicines stored at 2°C - 8°C.</p>
                  <p>• Subject to Thane jurisdiction.</p>
                </div>
                <div className="text-right">
                  <div className="h-6"></div>
                  <p className="font-bold text-slate-800">For PRINCE PHARMA</p>
                  <p className="text-[8px]">Auth Signatory / Pharmacist</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PHYSICAL INVENTORY & BATCH MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base">Physical Stock & FEFO Batch Ledger</h3>
                <p className="text-xs text-slate-400">
                  Single inventory pool for both retail and wholesale channels. Depletion occurs strictly by earliest expiry date.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-lg">
                  Total Sellable: <strong>{stats.totalStock} packs</strong>
                </span>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b101c] text-slate-400 text-[10px] uppercase font-mono tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-2">Batch No</th>
                    <th className="py-2.5 px-2">Expiry Date</th>
                    <th className="py-2.5 px-2 text-right">Cost Rate</th>
                    <th className="py-2.5 px-2 text-right">Retail MRP</th>
                    <th className="py-2.5 px-2 text-right">Wholesale Rate</th>
                    <th className="py-2.5 px-2 text-center">Sellable Stock</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {batches.map((b) => {
                    const prod = products.find((p) => p.id === b.productId);
                    const isExpired = new Date(b.expiryDate) < new Date();
                    return (
                      <tr key={b.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white">{prod?.name || 'Unknown'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Rack: {prod?.rackLocation} • Unit: {prod?.packSize}{prod?.packUnit}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono font-bold text-emerald-400">
                          {b.batchNumber}
                        </td>
                        <td className="py-2.5 px-2 font-mono">
                          <span className={isExpired ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                            {b.expiryDate}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                          ₹{Number(b.purchaseRate).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-semibold text-white">
                          ₹{b.mrp.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-teal-400">
                          ₹{b.wholesalePrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono">
                          <strong className={b.sellableStock > 0 ? 'text-white text-sm' : 'text-slate-500'}>
                            {b.sellableStock}
                          </strong>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {isExpired ? (
                            <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono font-bold">
                              EXPIRED (BLOCKED)
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
                              ACTIVE FEFO
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMERS & WHOLESALE PRICING MATRIX */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs">
              <h3 className="font-bold text-white text-base">Wholesale Contract Pricing Matrix</h3>
              <p className="text-xs text-slate-400">
                Institutional hospital and clinic pricing rules. When an account is selected at POS, these rates override the default trade rates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers
                .filter((c) => c.type !== 'retail')
                .map((cust) => {
                  const contracts = customerPrices.filter((cp) => cp.customerId === cust.id);
                  return (
                    <div
                      key={cust.id}
                      className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                        <div>
                          <h4 className="font-bold text-white text-sm">{cust.businessName}</h4>
                          <p className="text-[11px] text-slate-400">{cust.name} • {cust.phone}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            GSTIN: {cust.gstin} | DL: {cust.drugLicence}
                          </p>
                        </div>
                        <span className="text-xs font-mono bg-teal-950 text-teal-400 border border-teal-800 px-2 py-0.5 rounded uppercase">
                          {cust.type}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400">Configured Contract Rates:</span>
                        {contracts.length > 0 ? (
                          <div className="space-y-1.5 pt-1">
                            {contracts.map((cp, idx) => {
                              const prod = products.find((p) => p.id === cp.productId);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800 text-xs font-mono"
                                >
                                  <div>
                                    <span className="font-bold text-white font-sans">{prod?.name}</span>
                                    <span className="text-[10px] text-slate-400 ml-2">({cp.note})</span>
                                  </div>
                                  <div className="text-right">
                                    <strong className="text-emerald-400 text-sm">₹{cp.customRate.toFixed(2)}</strong>
                                    <span className="text-slate-500 text-[10px] line-through ml-2">
                                      ₹{prod?.defaultWholesalePrice.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">Uses standard wholesale trade catalog rates.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 4: UDHARI / CREDIT LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base">Udhari / Customer Credit Accounts</h3>
                <p className="text-xs text-slate-400">
                  Running balance equation: Opening Balance + Invoiced Sales - Cash/UPI Payments - Returns = Current Outstanding.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-slate-400 text-xs">Total Store Outstanding:</span>
                <div className="text-lg font-bold text-amber-400">₹{stats.totalUdhar.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b101c] text-slate-400 text-[10px] uppercase font-mono tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Party / Clinic Name</th>
                    <th className="py-2.5 px-2">Type</th>
                    <th className="py-2.5 px-2">Contact</th>
                    <th className="py-2.5 px-2 text-right">Credit Limit</th>
                    <th className="py-2.5 px-2 text-right">Outstanding Due</th>
                    <th className="py-2.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {customers
                    .filter((c) => c.type !== 'retail')
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white">{c.businessName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.name}</div>
                        </td>
                        <td className="py-2.5 px-2 uppercase font-mono text-[10px] text-teal-400">
                          {c.type}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-slate-300">{c.phone}</td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                          ₹{c.creditLimit.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono">
                          <strong className="text-amber-400 text-sm">₹{c.currentOutstanding.toLocaleString()}</strong>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => {
                              const payAmount = prompt(`Enter payment amount received from ${c.businessName}:`);
                              if (payAmount && !isNaN(Number(payAmount))) {
                                const amount = Number(payAmount);
                                const updated = customers.map((cust) =>
                                  cust.id === c.id
                                    ? { ...cust, currentOutstanding: Math.max(0, cust.currentOutstanding - amount) }
                                    : cust
                                );
                                saveState(undefined, undefined, updated);
                                notify(`Payment of ₹${amount.toLocaleString()} recorded for ${c.businessName}! Outstanding balance updated.`);
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-semibold transition cursor-pointer"
                          >
                            Record Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: EXPIRY WATCH */}
        {activeTab === 'expiry' && (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs">
              <h3 className="font-bold text-white text-base">Expiry Watch & Safe Disposal</h3>
              <p className="text-xs text-slate-400">
                Medicines expiring within 90 days are flagged for priority return to supplier or fast liquidation. Expired batches cannot be billed under any circumstances.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {batches
                .filter((b) => {
                  const exp = new Date(b.expiryDate);
                  const now = new Date();
                  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
                  return exp <= in90;
                })
                .map((b) => {
                  const prod = products.find((p) => p.id === b.productId);
                  const isExpired = new Date(b.expiryDate) < new Date();
                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-xl border ${
                        isExpired
                          ? 'bg-rose-950/20 border-rose-800/80 text-rose-200'
                          : 'bg-amber-950/20 border-amber-800/80 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{prod?.name}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            isExpired ? 'bg-rose-900 text-rose-300' : 'bg-amber-900 text-amber-300'
                          }`}
                        >
                          {isExpired ? 'EXPIRED' : 'NEAR EXPIRY'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-mono space-y-1">
                        <div>Batch: <strong className="text-white">{b.batchNumber}</strong></div>
                        <div>Expiry: <strong className="text-white">{b.expiryDate}</strong></div>
                        <div>Current Stock: <strong className="text-white">{b.sellableStock} units</strong></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS & AUDITS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Invoices & Financial Audit Trail</h3>
                <p className="text-xs text-slate-400">
                  Every historical invoice retains permanent immutable snapshots of rates, customer tax data, and drug licenses.
                </p>
              </div>
              <button
                onClick={() => {
                  const csv = [
                    'Invoice No,Type,Date,Customer,Subtotal,Taxable,CGST,SGST,Grand Total,Payment Method',
                    ...invoices.map(
                      (i) =>
                        `${i.invoiceNumber},${i.type},${i.date},"${i.customerName}",${i.subtotal},${i.taxableTotal},${i.cgstTotal},${i.sgstTotal},${i.grandTotal},${i.paymentMethod}`
                    ),
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Prince_Pharma_Invoices_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  notify('Invoices exported to CSV successfully!');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b101c] text-slate-400 text-[10px] uppercase font-mono tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Invoice Number</th>
                    <th className="py-2.5 px-2">Type</th>
                    <th className="py-2.5 px-2">Date</th>
                    <th className="py-2.5 px-2">Customer / Patient</th>
                    <th className="py-2.5 px-2 text-right">Taxable</th>
                    <th className="py-2.5 px-2 text-right">GST</th>
                    <th className="py-2.5 px-2 text-right">Grand Total</th>
                    <th className="py-2.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-2 uppercase font-mono text-[10px] text-slate-400">
                        {inv.type}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-400">{inv.date}</td>
                      <td className="py-2.5 px-2 font-medium text-white">{inv.customerName}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-300">
                        ₹{inv.taxableTotal.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                        ₹{(inv.cgstTotal + inv.sgstTotal).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-400 text-sm">
                        ₹{inv.grandTotal.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          View / Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* 4. MODAL: PRINTABLE A4 & 80MM PHARMACY TAX INVOICE */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 print-visible">
            {/* Modal Controls Header (Hidden in Print) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print-hidden">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">Print Layout:</span>
                <div className="flex bg-slate-100 p-0.5 rounded border border-slate-300 text-xs">
                  <button
                    onClick={() => setPrintFormat('A4')}
                    className={`px-3 py-0.5 rounded font-semibold cursor-pointer ${
                      printFormat === 'A4' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                    }`}
                  >
                    A4 Formal
                  </button>
                  <button
                    onClick={() => setPrintFormat('80mm')}
                    className={`px-3 py-0.5 rounded font-semibold cursor-pointer ${
                      printFormat === '80mm' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                    }`}
                  >
                    80mm Thermal
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Actual Printable Invoice Container */}
            <div className={`p-4 border border-slate-200 rounded-xl space-y-3 ${printFormat === '80mm' ? 'max-w-sm mx-auto text-[10px]' : 'text-xs'}`}>
              <div className="text-center border-b-2 border-slate-800 pb-2">
                <h1 className="font-black text-lg tracking-tight uppercase text-slate-900">{settings.name}</h1>
                <p className="text-[10px] text-slate-600 font-medium">{settings.tagline}</p>
                <p className="text-[10px] text-slate-600">{settings.address}, {settings.city} - {settings.pincode}</p>
                <div className="pt-1 flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-slate-800 font-bold">
                  <span>GSTIN: {settings.gstin}</span>
                  <span>•</span>
                  <span>DL 20B: {settings.dlNumber20b}</span>
                  <span>•</span>
                  <span>DL 21B: {settings.dlNumber21b}</span>
                </div>
              </div>

              <div className="text-center py-1 bg-slate-100 font-bold uppercase tracking-wider text-[11px] border border-slate-200 rounded">
                {viewingInvoice.type === 'retail' ? 'TAX INVOICE / CASH MEMO (FORM 20B)' : 'WHOLESALE TAX INVOICE (FORM 21B)'}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-200">
                <div>
                  <div className="text-slate-500">Customer Name:</div>
                  <div className="font-bold text-slate-900">{viewingInvoice.customerName}</div>
                  {viewingInvoice.customerGstin && (
                    <div className="text-[10px] font-mono text-slate-700">
                      GSTIN: {viewingInvoice.customerGstin} | DL: {viewingInvoice.customerDl}
                    </div>
                  )}
                </div>
                <div className="text-right font-mono">
                  <div>Invoice No: <strong className="text-emerald-800">{viewingInvoice.invoiceNumber}</strong></div>
                  <div>Date: {viewingInvoice.date}</div>
                  <div>Mode: <span className="uppercase font-bold">{viewingInvoice.paymentMethod}</span></div>
                </div>
              </div>

              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-[10px] uppercase font-mono text-slate-600">
                    <th className="py-1">Description</th>
                    <th className="py-1">Batch</th>
                    <th className="py-1">Exp</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {viewingInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1 font-sans font-medium">{it.productName}</td>
                      <td className="py-1 text-[10px]">{it.allocations[0]?.batchNumber || '-'}</td>
                      <td className="py-1 text-[10px]">{it.allocations[0]?.expiryDate.slice(0, 7) || '-'}</td>
                      <td className="py-1 text-center font-bold">{it.quantity}</td>
                      <td className="py-1 text-right">₹{it.unitPrice.toFixed(2)}</td>
                      <td className="py-1 text-right font-bold">₹{it.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-2 border-t border-slate-200 space-y-1 text-right text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Taxable Value:</span>
                  <span>₹{viewingInvoice.taxableTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">CGST (6%):</span>
                  <span>₹{viewingInvoice.cgstTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">SGST (6%):</span>
                  <span>₹{viewingInvoice.sgstTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-800">
                  <span className="font-sans font-black">Grand Total:</span>
                  <span className="text-emerald-800">₹{viewingInvoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-2 bg-slate-50 rounded text-[10px] italic font-serif text-slate-800 border border-slate-200">
                Amount in words: <strong>{viewingInvoice.amountInWords}</strong>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[9px] text-slate-500 flex justify-between items-end">
                <div>
                  <p>• Goods once sold will not be returned without valid batch verification.</p>
                  <p>• Subject to Thane jurisdiction.</p>
                </div>
                <div className="text-right">
                  <div className="h-6"></div>
                  <p className="font-bold text-slate-800">For PRINCE PHARMA</p>
                  <p className="text-[8px]">Auth Signatory / Pharmacist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FOOTER */}
      <footer className="bg-[#0b101c] border-t border-slate-800 py-3 px-6 text-xs text-slate-500 print-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Prince Pharma v2</span>
            <span>•</span>
            <span className="text-emerald-400">Single Physical Inventory Engine</span>
            <span>•</span>
            <span>FEFO Batch Dispatched</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Form 20B (Retail) & Form 21B (Wholesale) • Live Next.js Architecture
          </div>
        </div>
      </footer>
    </div>
  );
}
