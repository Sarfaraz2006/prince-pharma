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
  Menu,
  X,
  ArrowLeftRight,
  ChevronRight,
  FileText,
  Share2,
  Phone,
  RotateCcw,
  Filter,
  Eye,
  Sun,
  Moon,
  Stethoscope,
  Pill,
  Layers,
  Send,
  HelpCircle,
  BookOpen,
  Info,
  FileCheck,
} from 'lucide-react';
import {
  Product,
  Batch,
  Customer,
  CustomerProductPrice,
  Supplier,
  Invoice,
  InvoiceItem,
  Purchase,
  SalesReturn,
  AuditLog,
  PharmacySettings,
  INITIAL_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_BATCHES,
  INITIAL_CUSTOMERS,
  INITIAL_CUSTOMER_PRICES,
  INITIAL_SUPPLIERS,
  INITIAL_INVOICES,
  INITIAL_PURCHASES,
  INITIAL_AUDIT_LOGS,
  numberToWordsIndian,
} from '../data/pharmaData';
import { SatyamPharmaGstInvoice } from './components/SatyamPharmaGstInvoice';

export default function PrincePharmaApp() {
  // Theme Mode (Marg Books Light by Default)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<
    | 'billing'
    | 'substitute'
    | 'inventory'
    | 'purchases'
    | 'pricing'
    | 'udhari'
    | 'expiry'
    | 'returns'
    | 'reports'
    | 'audit'
    | 'analytics'
    | 'settings'
  >('billing');
  const [userRole, setUserRole] = useState<'Owner' | 'Admin' | 'Pharmacist' | 'Cashier'>('Admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileInvoiceView, setMobileInvoiceView] = useState(false);

  // Master State with LocalStorage Persistence
  const [settings, setSettings] = useState<PharmacySettings>(INITIAL_SETTINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [customerPrices, setCustomerPrices] = useState<CustomerProductPrice[]>(INITIAL_CUSTOMER_PRICES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [purchases, setPurchases] = useState<Purchase[]>(INITIAL_PURCHASES);
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // POS Billing State
  const [saleType, setSaleType] = useState<'retail' | 'wholesale'>('retail');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-walkin');
  const [walkinName, setWalkinName] = useState<string>('Walk-in Patient');
  const [walkinPhone, setWalkinPhone] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('Dr. Ramesh Gupta (MBBS)');
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

  // Substitute Finder State (Marg Books Signature Feature)
  const [substituteSearch, setSubstituteSearch] = useState<string>('Paracetamol IP 650mg');
  const [selectedProductForSubstitute, setSelectedProductForSubstitute] = useState<Product | null>(null);

  // Modals & Notifications State
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [printFormat, setPrintFormat] = useState<'A4' | '80mm'>('A4');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals for CRUD operations
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<Customer | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [showGuideBanner, setShowGuideBanner] = useState(true);
  const [showSystemGuideModal, setShowSystemGuideModal] = useState(false);

  // Form states for modals
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    brand: '',
    genericName: '',
    manufacturer: '',
    category: 'tablet' as Product['category'],
    packSize: 10,
    packUnit: 'strip',
    barcode: '',
    hsnCode: '30049099',
    gstRate: 12,
    mrp: 100,
    defaultRetailPrice: 100,
    defaultWholesalePrice: 80,
    reorderLevel: 20,
    rackLocation: 'Rack A-01',
    schedule: 'OTC' as Product['schedule'],
    prescriptionRequired: false,
  });

  const [newBatchForm, setNewBatchForm] = useState({
    supplierId: 'sup-1',
    invoiceNumber: '',
    productId: 'prod-1',
    batchNumber: '',
    expiryDate: '',
    quantity: 100,
    freeQuantity: 0,
    purchaseRate: 20,
    mrp: 35,
    wholesalePrice: 28,
  });

  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    businessName: '',
    type: 'hospital' as Customer['type'],
    phone: '',
    email: '',
    billingAddress: '',
    gstin: '',
    drugLicence: '',
    creditLimit: 100000,
    openingBalance: 0,
  });

  const [newContractForm, setNewContractForm] = useState({
    customerId: 'cust-krishna',
    productId: 'prod-1',
    customRate: 25,
    note: 'Special negotiated rate',
  });

  const [paymentAmountInput, setPaymentAmountInput] = useState<string>('');
  const [paymentModeInput, setPaymentModeInput] = useState<'cash' | 'upi' | 'cheque' | 'neft'>('cash');
  const [paymentNoteInput, setPaymentNoteInput] = useState<string>('');

  const [returnInvoiceNoInput, setReturnInvoiceNoInput] = useState<string>('');
  const [returnQtyInput, setReturnQtyInput] = useState<number>(1);
  const [returnReasonInput, setReturnReasonInput] = useState<string>('Patient unneeded / course changed');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const invoicePrintRef = useRef<HTMLDivElement>(null);

  // Load state from localStorage on initial client mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('pp_theme_v4');
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);

      const savedSettings = localStorage.getItem('pp_settings_v4');
      if (savedSettings) {
        setSettings({ ...INITIAL_SETTINGS, ...JSON.parse(savedSettings) });
      }

      const savedProducts = localStorage.getItem('pp_products_v4');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        const existingIds = new Set(parsed.map((p: any) => p.id));
        const merged = [...parsed, ...INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id))];
        setProducts(merged);
      }

      const savedBatches = localStorage.getItem('pp_batches_v4');
      if (savedBatches) {
        const parsed = JSON.parse(savedBatches);
        const existingIds = new Set(parsed.map((b: any) => b.id));
        const merged = [...parsed, ...INITIAL_BATCHES.filter((b) => !existingIds.has(b.id))];
        setBatches(merged);
      }

      const savedInvoices = localStorage.getItem('pp_invoices_v4');
      if (savedInvoices) {
        const parsed = JSON.parse(savedInvoices);
        const existingIds = new Set(parsed.map((inv: any) => inv.id));
        const merged = [...parsed, ...INITIAL_INVOICES.filter((inv) => !existingIds.has(inv.id))];
        setInvoices(merged);
      }

      const savedCustomers = localStorage.getItem('pp_customers_v4');
      if (savedCustomers) {
        const parsed = JSON.parse(savedCustomers);
        const existingIds = new Set(parsed.map((c: any) => c.id));
        const merged = [...parsed, ...INITIAL_CUSTOMERS.filter((c) => !existingIds.has(c.id))];
        setCustomers(merged);
      }

      const savedSuppliers = localStorage.getItem('pp_suppliers_v4');
      if (savedSuppliers) {
        const parsed = JSON.parse(savedSuppliers);
        const existingIds = new Set(parsed.map((s: any) => s.id));
        const merged = [...parsed, ...INITIAL_SUPPLIERS.filter((s) => !existingIds.has(s.id))];
        setSuppliers(merged);
      }

      const savedCustomerPrices = localStorage.getItem('pp_customer_prices_v4');
      if (savedCustomerPrices) setCustomerPrices(JSON.parse(savedCustomerPrices));

      const savedPurchases = localStorage.getItem('pp_purchases_v4');
      if (savedPurchases) setPurchases(JSON.parse(savedPurchases));

      const savedReturns = localStorage.getItem('pp_returns_v4');
      if (savedReturns) setSalesReturns(JSON.parse(savedReturns));

      const savedLogs = localStorage.getItem('pp_logs_v4');
      if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
    } catch (e) {
      console.warn('LocalStorage load failed', e);
    }
  }, []);

  // Save helper to persist changes
  const persist = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('pp_theme_v4', nextTheme);
    notify(`Switched to ${nextTheme === 'light' ? 'Marg Books Light' : 'Slate Dark'} Theme`);
  };

  const addAuditLog = (action: string, entity: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'Sarfaraz Ahmad',
      role: userRole,
      action,
      entity,
      details,
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    persist('pp_logs_v4', updated);
  };

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Keyboard Shortcuts (F1: POS, F2: Stock, F3: Contracts, F4: Expiry, F7: Substitute, Esc)
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
        setActiveTab('pricing');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('expiry');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setShowSubstituteModal(true);
      } else if (e.key === 'Escape') {
        setViewingInvoice(null);
        setShowAddProductModal(false);
        setShowAddBatchModal(false);
        setShowAddCustomerModal(false);
        setShowAddContractModal(false);
        setShowPaymentModal(null);
        setShowReturnModal(false);
        setShowSubstituteModal(false);
        setMobileMenuOpen(false);
        setMobileInvoiceView(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active Selected Customer
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  // Rate calculator taking custom wholesale contracts into account
  const getEffectiveRate = (product: Product): { rate: number; isCustom: boolean; note?: string } => {
    if (saleType === 'retail') {
      return { rate: product.defaultRetailPrice, isCustom: false };
    }
    const customPrice = customerPrices.find(
      (cp) => cp.customerId === selectedCustomerId && cp.productId === product.id
    );
    if (customPrice) {
      return { rate: customPrice.customRate, isCustom: true, note: customPrice.note };
    }
    return { rate: product.defaultWholesalePrice, isCustom: false };
  };

  // Deterministic FEFO (First-Expiry-First-Out) multi-batch allocation
  const cartAllocations = useMemo(() => {
    return cartItems.map((item) => {
      const now = new Date();
      // Only active batches that have not expired yet, sorted ascending by expiryDate
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

      // Estimate Chemist Profit / Margin on this line
      const estPurchaseRate = eligibleBatches[0]?.purchaseRate || (unitRate * 0.75);
      const estProfit = lineTotal - (estPurchaseRate * item.quantity);
      const estMarginPct = lineTotal > 0 ? (estProfit / lineTotal) * 100 : 0;

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
        estProfit,
        estMarginPct,
      };
    });
  }, [cartItems, batches, saleType, selectedCustomerId, customerPrices]);

  // Overall Financial Totals
  const billSummary = useMemo(() => {
    let subtotal = 0;
    let discount = 0;
    let taxable = 0;
    let gst = 0;
    let total = 0;
    let totalProfit = 0;

    for (const item of cartAllocations) {
      subtotal += item.lineSubtotal;
      discount += item.discount;
      taxable += item.taxable;
      gst += item.gstAmount;
      total += item.lineTotal;
      totalProfit += item.estProfit;
    }

    const cgst = gst / 2;
    const sgst = gst / 2;
    const overallMarginPct = total > 0 ? (totalProfit / total) * 100 : 0;

    return {
      subtotal,
      discount,
      taxable,
      cgst,
      sgst,
      total,
      totalProfit,
      overallMarginPct,
      amountInWords: numberToWordsIndian(total),
    };
  }, [cartAllocations]);

  // Cart operations
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
    notify(`Added ${product.name} to bill`);
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQtyChange = (index: number, newQty: number) => {
    if (newQty <= 0) return handleRemoveItem(index);
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item))
    );
  };

  // Substitute Medicine Finder (Matches by active generic/salt composition)
  const substituteMatches = useMemo(() => {
    if (!substituteSearch.trim()) return [];
    const term = substituteSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.genericName.toLowerCase().includes(term) ||
        p.name.toLowerCase().includes(term)
    );
  }, [products, substituteSearch]);

  // Complete and commit sale
  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      return notify('Cart is empty. Scan or add medicines first.', 'error');
    }

    const shortageItem = cartAllocations.find((a) => a.isShortage);
    if (shortageItem) {
      return notify(
        `Insufficient stock for ${shortageItem.product.name}. Requested: ${shortageItem.quantity}, Available: ${shortageItem.totalAvailable}`,
        'error'
      );
    }

    // Check credit limit for B2B wholesale udhari sale
    if (saleType === 'wholesale' && paymentMethod === 'credit') {
      const newOutstanding = activeCustomer.currentOutstanding + billSummary.total;
      if (newOutstanding > activeCustomer.creditLimit) {
        return notify(
          `Credit limit exceeded for ${activeCustomer.businessName}! Limit: ₹${activeCustomer.creditLimit.toLocaleString()}, New Balance: ₹${newOutstanding.toLocaleString()}`,
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

    // 2. Generate sequential invoice number
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
      doctorName,
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

    // 3. Update customer outstanding if credit sale
    let updatedCustomers = [...customers];
    if (saleType === 'wholesale' && paymentMethod === 'credit') {
      updatedCustomers = customers.map((c) =>
        c.id === activeCustomer.id
          ? { ...c, currentOutstanding: c.currentOutstanding + billSummary.total }
          : c
      );
      setCustomers(updatedCustomers);
      persist('pp_customers_v4', updatedCustomers);
    }

    const updatedInvoices = [newInvoice, ...invoices];
    setBatches(updatedBatches);
    setInvoices(updatedInvoices);
    persist('pp_batches_v4', updatedBatches);
    persist('pp_invoices_v4', updatedInvoices);

    // Audit Log
    addAuditLog(
      'BILL_CREATED',
      newInvoice.invoiceNumber,
      `${saleType.toUpperCase()} sale of ₹${newInvoice.grandTotal.toFixed(2)} to ${newInvoice.customerName} via ${paymentMethod}. Prescribed by: ${doctorName}.`
    );

    // Reset cart and open print modal
    setCartItems([]);
    setViewingInvoice(newInvoice);
    setMobileInvoiceView(false);
    notify(`Invoice ${newInvoice.invoiceNumber} created! Stock updated via FEFO.`);
  };

  // Add Product Handler
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name) return notify('Product name is required', 'error');

    const created: Product = {
      id: `prod-${Date.now()}`,
      ...newProductForm,
      isActive: true,
    };
    const updated = [created, ...products];
    setProducts(updated);
    persist('pp_products_v4', updated);
    addAuditLog('PRODUCT_CREATE', created.name, `New medicine registered: ${created.name} (${created.packSize}${created.packUnit})`);
    setShowAddProductModal(false);
    notify(`Product "${created.name}" registered in master!`);
  };

  // Add Inward Purchase / New Batch Handler
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchForm.batchNumber || !newBatchForm.expiryDate) {
      return notify('Batch Number & Expiry Date are required', 'error');
    }

    const prod = products.find((p) => p.id === newBatchForm.productId);
    const supp = suppliers.find((s) => s.id === newBatchForm.supplierId);

    const createdBatch: Batch = {
      id: `bat-${Date.now()}`,
      productId: newBatchForm.productId,
      batchNumber: newBatchForm.batchNumber.toUpperCase(),
      expiryDate: newBatchForm.expiryDate,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseRate: Number(newBatchForm.purchaseRate),
      mrp: Number(newBatchForm.mrp),
      retailPrice: Number(newBatchForm.mrp),
      wholesalePrice: Number(newBatchForm.wholesalePrice),
      supplierId: newBatchForm.supplierId,
      sellableStock: Number(newBatchForm.quantity),
      damagedStock: 0,
      initialStock: Number(newBatchForm.quantity),
      status: 'active',
    };

    const taxableAmount = createdBatch.purchaseRate * createdBatch.sellableStock;
    const gstTotal = (taxableAmount * (prod?.gstRate || 12)) / 100;
    const grandTotal = taxableAmount + gstTotal;

    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseNumber: `PUR-2026-${String(purchases.length + 1).padStart(3, '0')}`,
      supplierInvoiceNumber: newBatchForm.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      supplierId: newBatchForm.supplierId,
      supplierName: supp?.name || 'Authorized Supplier',
      date: new Date().toISOString().split('T')[0],
      subtotal: taxableAmount,
      gstTotal,
      grandTotal,
      paymentStatus: 'credit',
      items: [
        {
          productId: createdBatch.productId,
          productName: prod?.name || 'Medicine',
          batchNumber: createdBatch.batchNumber,
          expiryDate: createdBatch.expiryDate,
          quantity: createdBatch.sellableStock,
          freeQuantity: Number(newBatchForm.freeQuantity),
          purchaseRate: createdBatch.purchaseRate,
          mrp: createdBatch.mrp,
          wholesalePrice: createdBatch.wholesalePrice,
          gstRate: prod?.gstRate || 12,
          taxableAmount,
          totalAmount: grandTotal,
        },
      ],
    };

    const updatedSuppliers = suppliers.map((s) =>
      s.id === newBatchForm.supplierId ? { ...s, currentOutstanding: s.currentOutstanding + grandTotal } : s
    );

    const updatedBatches = [createdBatch, ...batches];
    const updatedPurchases = [newPurchase, ...purchases];

    setBatches(updatedBatches);
    setPurchases(updatedPurchases);
    setSuppliers(updatedSuppliers);
    persist('pp_batches_v4', updatedBatches);
    persist('pp_purchases_v4', updatedPurchases);
    persist('pp_suppliers_v4', updatedSuppliers);

    addAuditLog(
      'STOCK_INWARD',
      createdBatch.batchNumber,
      `Inward purchase recorded: ${createdBatch.sellableStock} units of ${prod?.name} (Batch: ${createdBatch.batchNumber}) from ${supp?.name}. Total: ₹${grandTotal.toFixed(2)}.`
    );

    setShowAddBatchModal(false);
    notify(`Stock inward recorded! Batch ${createdBatch.batchNumber} added to FEFO inventory.`);
  };

  // Add Customer Handler
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.businessName || !newCustomerForm.phone) {
      return notify('Business Name and Phone are required', 'error');
    }

    const created: Customer = {
      id: `cust-${Date.now()}`,
      ...newCustomerForm,
      currentOutstanding: Number(newCustomerForm.openingBalance),
      isActive: true,
    };
    const updated = [...customers, created];
    setCustomers(updated);
    persist('pp_customers_v4', updated);
    addAuditLog('CUSTOMER_CREATE', created.businessName, `New ${created.type} customer created. Credit limit: ₹${created.creditLimit.toLocaleString()}`);
    setShowAddCustomerModal(false);
    notify(`Customer "${created.businessName}" added successfully!`);
  };

  // Add Contract Pricing Handler
  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const existingIdx = customerPrices.findIndex(
      (cp) => cp.customerId === newContractForm.customerId && cp.productId === newContractForm.productId
    );
    let updated: CustomerProductPrice[];
    if (existingIdx !== -1) {
      updated = [...customerPrices];
      updated[existingIdx] = { ...newContractForm, customRate: Number(newContractForm.customRate) };
    } else {
      updated = [...customerPrices, { ...newContractForm, customRate: Number(newContractForm.customRate) }];
    }
    setCustomerPrices(updated);
    persist('pp_customer_prices_v4', updated);
    const cust = customers.find((c) => c.id === newContractForm.customerId);
    const prod = products.find((p) => p.id === newContractForm.productId);
    addAuditLog('CONTRACT_RATE_SET', `${cust?.businessName} - ${prod?.name}`, `Contract price set to ₹${newContractForm.customRate}`);
    setShowAddContractModal(false);
    notify(`Wholesale contract rate saved!`);
  };

  // Settle Customer Credit / Receivable Payment Handler
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal || !paymentAmountInput || isNaN(Number(paymentAmountInput))) {
      return notify('Please enter a valid payment amount', 'error');
    }

    const payAmount = Number(paymentAmountInput);
    const updated = customers.map((c) =>
      c.id === showPaymentModal.id
        ? { ...c, currentOutstanding: Math.max(0, c.currentOutstanding - payAmount) }
        : c
    );
    setCustomers(updated);
    persist('pp_customers_v4', updated);

    addAuditLog(
      'PAYMENT_RECEIPT',
      showPaymentModal.businessName,
      `Payment of ₹${payAmount.toLocaleString()} received via ${paymentModeInput.toUpperCase()}. Note: ${paymentNoteInput || 'Direct payment'}. New balance: ₹${Math.max(0, showPaymentModal.currentOutstanding - payAmount).toLocaleString()}.`
    );

    notify(`Payment of ₹${payAmount.toLocaleString()} received from ${showPaymentModal.businessName}! Outstanding updated.`);
    setShowPaymentModal(null);
    setPaymentAmountInput('');
    setPaymentNoteInput('');
  };

  // Process Sales Return Handler
  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find((i) => i.invoiceNumber.trim() === returnInvoiceNoInput.trim());
    if (!inv) return notify('Invoice not found! Check invoice number.', 'error');

    if (inv.items.length === 0) return notify('Invoice has no items to return.', 'error');
    const returnItem = inv.items[0];
    const qtyToReturn = Math.min(returnQtyInput, returnItem.quantity);
    const refundAmount = qtyToReturn * returnItem.unitPrice;

    // Restore stock to batch
    const batchId = returnItem.allocations[0]?.batchId;
    const updatedBatches = batches.map((b) =>
      b.id === batchId ? { ...b, sellableStock: b.sellableStock + qtyToReturn } : b
    );

    // Adjust customer balance if wholesale
    let updatedCustomers = [...customers];
    if (inv.customerId) {
      updatedCustomers = customers.map((c) =>
        c.id === inv.customerId
          ? { ...c, currentOutstanding: Math.max(0, c.currentOutstanding - refundAmount) }
          : c
      );
      setCustomers(updatedCustomers);
      persist('pp_customers_v4', updatedCustomers);
    }

    const newReturn: SalesReturn = {
      id: `ret-${Date.now()}`,
      returnNumber: `SR-2026-${String(salesReturns.length + 1).padStart(3, '0')}`,
      originalInvoiceNumber: inv.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      customerName: inv.customerName,
      refundAmount,
      items: [
        {
          productId: returnItem.productId,
          productName: returnItem.productName,
          batchNumber: returnItem.allocations[0]?.batchNumber || 'UNKNOWN',
          quantity: qtyToReturn,
          rate: returnItem.unitPrice,
          total: refundAmount,
          reason: returnReasonInput,
        },
      ],
    };

    const updatedReturns = [newReturn, ...salesReturns];
    setBatches(updatedBatches);
    setSalesReturns(updatedReturns);
    persist('pp_batches_v4', updatedBatches);
    persist('pp_returns_v4', updatedReturns);

    addAuditLog(
      'SALES_RETURN',
      inv.invoiceNumber,
      `Return processed for ${qtyToReturn} units of ${returnItem.productName}. Restored to batch. Refund: ₹${refundAmount.toFixed(2)}.`
    );

    setShowReturnModal(false);
    setReturnInvoiceNoInput('');
    notify(`Sales return ${newReturn.returnNumber} recorded! Stock restored to batch.`);
  };

  // WhatsApp share link generator
  const handleWhatsAppWithPdf = async (inv: Invoice) => {
    try {
      notify('Generating bill PDF...');
      // Dynamic imports
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const el = document.getElementById('invoice-print-area');
      if (!el) {
        // Fallback: just open WhatsApp with text
        const text = `*${settings.name} — INVOICE ${inv.invoiceNumber}*\nDate: ${inv.date}\nBilled To: ${inv.customerName}\nDoctor: ${inv.doctorName || 'N/A'}\n\n*ITEMS:*\n${inv.items.map(item => `• ${item.productName} × ${item.quantity} = ₹${(item.quantity * item.unitPrice).toFixed(2)}`).join('\n')}\n\n*GRAND TOTAL: ₹${inv.grandTotal.toFixed(2)}*\nPayment: ${inv.paymentMethod.toUpperCase()}\n\nThank you! DL: ${settings.dlNumber20b}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        return;
      }
      
      const canvas = await html2canvas(el, { 
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const canvasAspect = canvas.height / canvas.width;
      const imgH = pageW * canvasAspect;
      const finalH = Math.min(imgH, pageH);
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, finalH);
      
      // Download PDF
      pdf.save(`Invoice_${inv.invoiceNumber}.pdf`);
      
      // Then open WhatsApp with professional summary text
      const phone = inv.customerPhone?.replace(/[^0-9]/g, '') || '';
      const text = `*${settings.name}*\n📄 Invoice *#${inv.invoiceNumber}* has been sent to you.\nDate: ${inv.date} | Amount: *₹${inv.grandTotal.toFixed(2)}*\nPayment: ${inv.paymentMethod.toUpperCase()}\n\n_Please find the attached PDF invoice. For queries, call ${settings.phone}_`;
      const waUrl = phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
      setTimeout(() => window.open(waUrl, '_blank'), 500);
      notify('PDF downloaded! Opening WhatsApp...');
    } catch (err) {
      console.error('PDF generation failed:', err);
      // Fallback to text
      const text = `*${settings.name} — INVOICE ${inv.invoiceNumber}*\nDate: ${inv.date}\nBilled To: ${inv.customerName}\nTotal: ₹${inv.grandTotal.toFixed(2)}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  // WhatsApp payment reminder link generator
  const getWhatsAppPaymentReminderUrl = (cust: Customer) => {
    const text = `*PRINCE PHARMA - PAYMENT REMINDER*\nDear ${cust.businessName},\nThis is a friendly reminder that your outstanding ledger balance is *₹${cust.currentOutstanding.toLocaleString()}*.\nKindly process the settlement at your earliest convenience.\n\nBank / UPI Details available on request.\nContact: ${settings.phone}`;
    return `https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  // Instant Search filter
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

  // Statistics calculation
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
    const thresholdMs = settings.nearExpiryDays * 24 * 60 * 60 * 1000;
    const inNear = new Date(now.getTime() + thresholdMs);
    const nearExpiryCount = batches.filter(
      (b) => b.status === 'active' && new Date(b.expiryDate) <= inNear && new Date(b.expiryDate) > now
    ).length;

    const expiredCount = batches.filter((b) => new Date(b.expiryDate) <= now).length;
    const totalUdhar = customers.reduce((acc, c) => acc + c.currentOutstanding, 0);
    const totalSupplierDue = suppliers.reduce((acc, s) => acc + s.currentOutstanding, 0);

    return {
      todaySales,
      todayBillsCount: todayBills.length,
      totalStock,
      lowStockCount,
      nearExpiryCount,
      expiredCount,
      totalUdhar,
      totalSupplierDue,
    };
  }, [invoices, batches, products, customers, suppliers, settings.nearExpiryDays]);

  // Dynamic Theme Colors (Marg Books Light vs Slate Dark)
  const isLight = theme === 'light';
  const themeClasses = {
    bg: isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#070b14] text-slate-100',
    header: isLight ? 'bg-white border-b border-slate-200 shadow-xs' : 'bg-[#0d1322] border-b border-slate-800 shadow-md',
    nav: isLight ? 'bg-slate-50 border-b border-slate-200' : 'bg-[#0b101c] border-b border-slate-800',
    card: isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-[#0f172a] border border-slate-800 shadow-xs',
    tableHeader: isLight ? 'bg-slate-100 text-slate-600 border-b border-slate-200' : 'bg-[#0b101c] text-slate-400 border-b border-slate-800',
    tableRowHover: isLight ? 'hover:bg-slate-50 border-b border-slate-100' : 'hover:bg-slate-800/40 border-b border-slate-800/60',
    input: isLight ? 'bg-white border border-slate-300 text-slate-900 focus:outline-emerald-600' : 'bg-slate-900 border border-slate-700 text-white focus:outline-emerald-500',
    secondaryText: isLight ? 'text-slate-600' : 'text-slate-400',
    subtleBorder: isLight ? 'border-slate-200' : 'border-slate-800',
  };

  return (
    <div className={`flex flex-col min-h-screen ${themeClasses.bg} transition-colors duration-200`}>
      {/* 1. MARG BOOKS STYLE TOP EXECUTIVE APP BAR */}
      <header className={`sticky top-0 z-40 ${themeClasses.header}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Store Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-black text-white text-base shadow-sm shrink-0">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight truncate max-w-[140px] sm:max-w-none">
                  {settings.name}
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Form 20B & 21B Active
                </span>
              </div>
              <div className={`hidden lg:flex items-center gap-2 text-[10px] ${themeClasses.secondaryText} font-mono`}>
                <span>GST: {settings.gstin}</span>
                <span>•</span>
                <span>DL 20B: {settings.dlNumber20b}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Ticker (Desktop) */}
          <div className="hidden xl:flex items-center gap-2.5 text-xs font-mono">
            <div className={`flex items-center gap-1.5 ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-900 border border-slate-800'} px-2.5 py-1 rounded-lg`}>
              <span className={themeClasses.secondaryText}>Today:</span>
              <strong className="text-emerald-600 font-bold">₹{stats.todaySales.toLocaleString()}</strong>
              <span className="text-slate-400 text-[10px]">({stats.todayBillsCount})</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-900 border border-slate-800'} px-2.5 py-1 rounded-lg`}>
              <span className={themeClasses.secondaryText}>Stock:</span>
              <strong className="font-bold">{stats.totalStock}</strong>
            </div>
            {stats.nearExpiryCount > 0 && (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-2 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-bold text-[11px]">{stats.nearExpiryCount} Near Expiry</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 rounded-lg">
              <CreditCard className="w-3.5 h-3.5" />
              <span className="text-[11px]">Receivables: ₹{stats.totalUdhar.toLocaleString()}</span>
            </div>
          </div>

          {/* Controls: Theme Switcher, Role, Menu */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button (Marg Books Light <-> Slate Dark) */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg border cursor-pointer transition flex items-center gap-1 text-xs font-semibold ${
                isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="Toggle Light / Dark Theme"
            >
              {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden sm:inline text-[11px]">{isLight ? 'Dark' : 'Light'}</span>
            </button>

            {/* Quick System Clarity Guide Button */}
            <button
              onClick={() => setShowSystemGuideModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-700'
              }`}
              title="System Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">System Guide</span>
              <span className="sm:hidden">Guide</span>
            </button>

            {/* Role dropdown on desktop */}
            <div className={`hidden sm:flex items-center gap-0.5 ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-900 border border-slate-700'} rounded-lg p-0.5 text-xs`}>
              {(['Owner', 'Admin', 'Pharmacist', 'Cashier'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setUserRole(role);
                    notify(`Role: ${role}`);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    userRole === role
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <span className="sm:hidden text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-1 rounded">
              {userRole}
            </span>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'} cursor-pointer`}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Quick Stats Banner */}
        <div className={`xl:hidden ${isLight ? 'bg-slate-100 border-t border-slate-200 text-slate-700' : 'bg-[#0a0e1a] border-t border-slate-800/80 text-slate-300'} px-3 py-1.5 overflow-x-auto flex items-center gap-3 text-[11px] font-mono scrollbar-none`}>
          <div className="flex items-center gap-1 shrink-0">
            <span>Today:</span>
            <strong className="text-emerald-600">₹{stats.todaySales.toLocaleString()}</strong>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 shrink-0">
            <span>Stock:</span>
            <strong>{stats.totalStock}</strong>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 shrink-0 text-amber-700 font-bold">
            <span>Receivables:</span>
            <strong>₹{stats.totalUdhar.toLocaleString()}</strong>
          </div>
          {stats.nearExpiryCount > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1 shrink-0 text-rose-600 font-bold">
                <span>{stats.nearExpiryCount} Expiring</span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* 2. SUB-NAV TABS (Clearly Numbered & Descriptive) */}
      <nav className={`${themeClasses.nav} text-xs font-semibold`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-none">
          {[
            { id: 'billing', label: 'Point of Sale', hint: 'Counter Billing (F1)', icon: ShoppingCart, hotkey: 'F1' },
            { id: 'inventory', label: 'Stock & Batches', hint: 'FEFO Inventory (F2)', icon: Boxes, hotkey: 'F2' },
            { id: 'purchases', label: 'Purchase Entry', hint: 'Inward Stock', icon: Truck },
            { id: 'udhari', label: 'Credit Ledger', hint: 'Receivables', icon: CreditCard },
            { id: 'expiry', label: 'Expiry Watch', hint: 'Alerts', icon: Clock, hotkey: 'F4' },
            { id: 'returns', label: 'Returns', hint: 'Sales Returns', icon: RotateCcw },
            { id: 'substitute', label: 'Drug Finder', hint: 'Salt Match (F7)', icon: Layers, hotkey: 'F7' },
            { id: 'pricing', label: 'Price Contracts', hint: 'Wholesale Rates', icon: Users, hotkey: 'F3' },
            { id: 'reports', label: 'Reports & GST', hint: 'Tax Breakdown', icon: BarChart3 },
            { id: 'analytics', label: 'Analytics', hint: 'Business Insights', icon: BarChart3 },
            { id: 'settings', label: 'Settings', hint: 'Store Setup', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer text-xs ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : isLight
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.hotkey && <span className="hidden sm:inline text-[9px] opacity-75 font-mono">({tab.hotkey})</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex">
          <div className={`w-72 ${isLight ? 'bg-white text-slate-800' : 'bg-[#0c1220] text-white'} border-r ${themeClasses.subtleBorder} h-full p-4 flex flex-col justify-between shadow-2xl`}>
            <div className="space-y-4">
              <div className={`flex items-center justify-between pb-3 border-b ${themeClasses.subtleBorder}`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                    P
                  </div>
                  <span className="font-bold text-sm">{settings.name}</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Guide Button in Mobile Drawer */}
              <button
                onClick={() => {
                  setShowSystemGuideModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>System Guide</span>
              </button>

              <div className="space-y-1">
                <span className={`text-[10px] ${themeClasses.secondaryText} uppercase tracking-wider font-mono px-2`}>
                  Modules
                </span>
                {[
                  { id: 'billing', label: '1. Point of Sale', icon: ShoppingCart },
                  { id: 'inventory', label: '2. Stock & Batches', icon: Boxes },
                  { id: 'purchases', label: '3. Purchase Entry', icon: Truck },
                  { id: 'udhari', label: '4. Credit Ledger', icon: CreditCard },
                  { id: 'expiry', label: '5. Expiry Watch', icon: Clock },
                  { id: 'returns', label: '6. Returns', icon: RotateCcw },
                  { id: 'substitute', label: '7. Drug Finder (F7)', icon: Layers },
                  { id: 'pricing', label: '8. Price Contracts', icon: Users },
                  { id: 'reports', label: '9. Reports & GST', icon: BarChart3 },
                  { id: 'analytics', label: '10. Analytics', icon: BarChart3 },
                  { id: 'settings', label: '11. Settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                        activeTab === item.id
                          ? 'bg-emerald-600 text-white font-bold'
                          : isLight
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role switch in drawer */}
            <div className={`pt-3 border-t ${themeClasses.subtleBorder} space-y-2`}>
              <span className={`text-[10px] ${themeClasses.secondaryText} uppercase font-mono`}>Active Role</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Owner', 'Admin', 'Pharmacist', 'Cashier'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      setMobileMenuOpen(false);
                      notify(`Role: ${role}`);
                    }}
                    className={`py-1.5 px-2 rounded text-xs font-medium cursor-pointer ${
                      userRole === role
                        ? 'bg-emerald-600 text-white font-bold'
                        : isLight
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 animate-bounce max-w-sm">
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl shadow-2xl text-xs font-semibold border ${
              notification.type === 'success'
                ? isLight
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-emerald-950 text-emerald-200 border-emerald-700'
                : isLight
                ? 'bg-rose-50 text-rose-900 border-rose-300'
                : 'bg-rose-950 text-rose-200 border-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE VIEW */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24 lg:pb-6">
        {/* ============================================================== */}
        {/* ============================================================== */}
        {/* TAB 1: POS BILLING COUNTER (Marg Books Clean Split View) */}
        {/* ============================================================== */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Fast Barcode Scanner, Channel Selector & Cart */}
            <div className="lg:col-span-7 space-y-4">
              {/* Channel Selector: Retail (Form 20B) vs Wholesale B2B (Form 21B) */}
              <div className={`${themeClasses.card} p-3.5 sm:p-4 rounded-xl space-y-3`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">1</span>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                      STEP 1: CUSTOMER & SALE MODE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                    Single Inventory Active
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`flex ${isLight ? 'bg-slate-100 border border-slate-300' : 'bg-slate-900 border border-slate-700'} rounded-lg p-0.5`}>
                      <button
                        onClick={() => {
                          setSaleType('retail');
                          setSelectedCustomerId('cust-walkin');
                        }}
                        className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                          saleType === 'retail'
                            ? 'bg-emerald-600 text-white shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Retail POS (Form 20B) — Outpatient
                      </button>
                      <button
                        onClick={() => {
                          setSaleType('wholesale');
                          if (selectedCustomerId === 'cust-walkin') setSelectedCustomerId('cust-prince-party');
                        }}
                        className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                          saleType === 'wholesale'
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Wholesale B2B (Form 21B) — Institutional
                      </button>
                    </div>
                  </div>
                </div>

                {/* Patient, Doctor & Customer Fields */}
                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t ${themeClasses.subtleBorder} text-xs`}>
                  {saleType === 'retail' ? (
                    <>
                      <div>
                        <label className={`text-[11px] ${themeClasses.secondaryText} font-medium`}>Patient / Customer Name:</label>
                        <input
                          type="text"
                          value={walkinName}
                          onChange={(e) => setWalkinName(e.target.value)}
                          placeholder="Walk-in Cash Patient"
                          className={`w-full mt-1 ${themeClasses.input} rounded-lg px-2.5 py-1.5 text-xs font-medium`}
                        />
                      </div>
                      <div>
                        <label className={`text-[11px] ${themeClasses.secondaryText} font-medium`}>Mobile Number:</label>
                        <input
                          type="tel"
                          value={walkinPhone}
                          onChange={(e) => setWalkinPhone(e.target.value)}
                          placeholder="e.g. 9820155555"
                          className={`w-full mt-1 ${themeClasses.input} rounded-lg px-2.5 py-1.5 text-xs font-mono`}
                        />
                      </div>
                      <div>
                        <label className={`text-[11px] ${themeClasses.secondaryText} font-medium flex items-center gap-1`}>
                          <Stethoscope className="w-3 h-3 text-emerald-600" />
                          <span>Prescribing Doctor:</span>
                        </label>
                        <input
                          type="text"
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                          placeholder="Dr. Ramesh Gupta (MBBS)"
                          className={`w-full mt-1 ${themeClasses.input} rounded-lg px-2.5 py-1.5 text-xs font-medium`}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-3 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className={`text-[11px] ${themeClasses.secondaryText} font-medium`}>
                          Select Institutional B2B Customer:
                        </label>
                        <span className="text-[11px] font-mono">
                          Outstanding Due: <strong className="text-amber-600">₹{activeCustomer.currentOutstanding.toLocaleString()}</strong> / Limit: ₹{activeCustomer.creditLimit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={selectedCustomerId}
                          onChange={(e) => setSelectedCustomerId(e.target.value)}
                          className={`flex-1 ${themeClasses.input} rounded-lg px-2.5 py-1.5 text-xs font-medium`}
                        >
                          {customers
                            .filter((c) => c.type !== 'retail')
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.businessName} ({c.type.toUpperCase()}) — GSTIN: {c.gstin}
                              </option>
                            ))}
                        </select>
                        <button
                          onClick={() => setShowAddCustomerModal(true)}
                          className={`px-3 py-1.5 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-emerald-700' : 'bg-slate-800 text-emerald-400'} rounded-lg border ${themeClasses.subtleBorder} text-xs font-bold transition cursor-pointer`}
                          title="Add New Customer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className={`text-[11px] flex flex-col sm:flex-row sm:items-center justify-between ${isLight ? 'bg-slate-50' : 'bg-slate-950'} p-2 rounded-lg border ${themeClasses.subtleBorder} font-mono gap-1`}>
                        <span>DL: {activeCustomer.drugLicence}</span>
                        <span className="text-teal-600 font-bold">Special Wholesale Contract Rates Auto-Applied</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fast Medicine Barcode Search with Salt Substitute Trigger */}
              <div className={`${themeClasses.card} p-3.5 sm:p-4 rounded-xl space-y-3 relative`}>
                <div className="flex items-center justify-between border-b pb-1.5 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">2</span>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                      STEP 2: MEDICINE SEARCH
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Name, Generic Salt or Barcode
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={posSearchTerm}
                      onChange={(e) => setPosSearchTerm(e.target.value)}
                      placeholder="Scan Barcode or Search Medicine by Trade / Generic Name (e.g. Dolo, Zedex, Calpol, Corex, Omee, Pan 40)..."
                      className={`w-full pl-9 pr-3 py-2 ${themeClasses.input} rounded-lg text-xs font-medium placeholder-slate-400`}
                    />
                  </div>
                  <button
                    onClick={() => setShowSubstituteModal(true)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                    title="Same chemical formulation substitute brands (F7)"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Substitute (F7)</span>
                  </button>
                </div>

                {/* Instant Search Dropdown */}
                {filteredProducts.length > 0 && (
                  <div className={`absolute top-24 left-3 right-3 sm:left-4 sm:right-4 z-30 ${isLight ? 'bg-white border-slate-300' : 'bg-[#090d16] border-emerald-700/80'} border rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto`}>
                    {filteredProducts.map((p) => {
                      const rateInfo = getEffectiveRate(p);
                      const totalAvailable = batches
                        .filter((b) => b.productId === p.id && b.status === 'active' && new Date(b.expiryDate) > new Date())
                        .reduce((sum, b) => sum + b.sellableStock, 0);

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleAddToCart(p)}
                          className={`p-3 ${themeClasses.tableRowHover} flex items-center justify-between cursor-pointer text-xs transition`}
                        >
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              <span>{p.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'} rounded font-mono`}>
                                {p.packSize}{p.packUnit}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-mono font-bold">
                                {p.schedule}
                              </span>
                            </div>
                            <div className={`text-[11px] ${themeClasses.secondaryText} mt-0.5`}>
                              <span className="font-semibold text-teal-600">{p.genericName}</span> • {p.manufacturer} • Rack: {p.rackLocation}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-extrabold text-emerald-600 font-mono text-sm">
                              ₹{rateInfo.rate.toFixed(2)}
                            </div>
                            <div className={`text-[10px] ${themeClasses.secondaryText} font-mono`}>
                              Stock: <strong className={totalAvailable > 0 ? 'text-slate-900 font-bold' : 'text-rose-600'}>{totalAvailable}</strong>
                              {rateInfo.isCustom && <span className="ml-1 text-teal-600 font-bold">(Contract)</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Add Chips (Including medicines from Satyam Bill) */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5">
                  <span className={`text-[11px] ${themeClasses.secondaryText} font-medium`}>Quick Add:</span>
                  {[
                    'Dolo 650 Tablet',
                    'Zedex Syp 100ml',
                    'Calpol Drop',
                    'Corex DX Syp',
                    'Omee 20 Cap',
                    'Augmentin 625 Duo Tablet',
                    'Pan 40 Tablet',
                    'Zenflox E/E Drops',
                    'Dynapar Inj',
                    'Wysolone 5 mg',
                  ].map((medName) => {
                    const found = products.find((p) => p.name.toLowerCase().includes(medName.toLowerCase().slice(0, 7)));
                    if (!found) return null;
                    return (
                      <button
                        key={found.id}
                        onClick={() => handleAddToCart(found)}
                        className={`px-2 py-1 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'} rounded-lg border text-[11px] font-mono transition cursor-pointer`}
                      >
                        + {found.name.split(' ')[0]} {found.name.split(' ')[1] || ''}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition cursor-pointer"
                  >
                    + + New Medicine
                  </button>
                </div>
              </div>

              {/* Cart Table with Real-time FEFO Allocations & Margins */}
              <div className={`${themeClasses.card} rounded-xl overflow-hidden`}>
                <div className={`p-3 ${isLight ? 'bg-slate-50' : 'bg-slate-900'} border-b ${themeClasses.subtleBorder} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[11px]">3</span>
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-900 dark:text-white">
                      <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                      STEP 3: CART ITEMS ({cartItems.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="hidden sm:inline text-slate-500">FEFO Auto-Allocated</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Est. Margin: ~{billSummary.overallMarginPct.toFixed(1)}% (₹{billSummary.totalProfit.toFixed(1)})
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className={`${themeClasses.tableHeader} text-[10px] uppercase font-mono tracking-wider`}>
                      <tr>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-2 hidden sm:table-cell">FEFO Batch & Expiry</th>
                        <th className="py-2.5 px-2 text-center">Qty</th>
                        <th className="py-2.5 px-2 text-right">Rate (₹)</th>
                        <th className="py-2.5 px-2 text-right">Total (₹)</th>
                        <th className="py-2.5 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-sans">
                      {cartAllocations.map((item, idx) => (
                        <tr key={idx} className={themeClasses.tableRowHover}>
                          <td className="py-2.5 px-3">
                            <div className="font-bold">{item.product.name}</div>
                            <div className={`text-[10px] ${themeClasses.secondaryText} font-mono`}>
                              HSN: {item.product.hsnCode} • GST: {item.product.gstRate}%
                            </div>
                            {/* Mobile batch allocation display */}
                            <div className="sm:hidden mt-1 text-[10px] font-mono text-emerald-600 font-semibold">
                              {item.allocations[0] ? `${item.allocations[0].batch.batchNumber} (Exp: ${item.allocations[0].batch.expiryDate.slice(0, 7)})` : 'No active batch'}
                            </div>
                          </td>

                          {/* Desktop FEFO allocation badge */}
                          <td className="py-2.5 px-2 hidden sm:table-cell">
                            {item.allocations.length > 0 ? (
                              <div className="space-y-1">
                                {item.allocations.map((al, aIdx) => (
                                  <div
                                    key={aIdx}
                                    className={`flex items-center gap-1.5 text-[10px] font-mono ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700/80'} px-2 py-0.5 rounded border`}
                                  >
                                    <span className="text-emerald-700 font-bold">{al.batch.batchNumber}</span>
                                    <span className={themeClasses.secondaryText}>(Exp: {al.batch.expiryDate.slice(0, 7)})</span>
                                    <span className="font-semibold">[{al.qty} units]</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-rose-600 font-mono font-bold">No active batch available</span>
                            )}
                            {item.isShortage && (
                              <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                                Shortage: {item.shortageQty} units!
                              </div>
                            )}
                          </td>

                          {/* Qty +/- touch buttons */}
                          <td className="py-2.5 px-2 text-center">
                            <div className={`inline-flex items-center border ${themeClasses.subtleBorder} rounded-lg ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}>
                              <button
                                onClick={() => handleQtyChange(idx, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono font-bold text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQtyChange(idx, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Rate & Wholesale Contract indicator */}
                          <td className="py-2.5 px-2 text-right font-mono">
                            <div className="font-bold">₹{item.unitRate.toFixed(2)}</div>
                            <div className={`text-[10px] ${themeClasses.secondaryText}`}>MRP: ₹{item.product.mrp}</div>
                            {item.rateInfo.isCustom && (
                              <span className="text-[9px] bg-teal-50 text-teal-700 border border-teal-200 px-1 rounded font-bold">
                                Contract
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-2 text-right font-mono font-extrabold text-emerald-600">
                            ₹{item.lineTotal.toFixed(2)}
                          </td>

                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-1.5"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {cartItems.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-mono">
                            Cart is empty. Scan barcode or search above to add medicines.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Payment Selector and Finalize Action Bar */}
                <div className={`p-3.5 sm:p-4 ${isLight ? 'bg-slate-50' : 'bg-slate-900/90'} border-t ${themeClasses.subtleBorder} space-y-3`}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <span className={`text-xs ${themeClasses.secondaryText} font-medium`}>Payment Mode:</span>
                      <div className={`flex ${isLight ? 'bg-white border border-slate-300' : 'bg-slate-950 border border-slate-700'} rounded-lg p-0.5 text-xs font-semibold`}>
                        {(['cash', 'upi', 'card', 'credit'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setPaymentMethod(mode)}
                            className={`px-3 py-1 rounded uppercase font-semibold transition cursor-pointer ${
                              paymentMethod === mode
                                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleCompleteSale}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Complete & Print Invoice (Ctrl+P)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Real-Time Dynamic Tax Invoice Preview (Exact Satyam Photo Format) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-20 space-y-2">
              <div className="flex items-center justify-between bg-slate-900 text-white px-3.5 py-2 rounded-t-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold uppercase tracking-wider text-[11px]">
                    STEP 4: GST BILL PREVIEW
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Certified Format
                </span>
              </div>
              <div className="bg-white rounded-b-xl shadow-xl overflow-hidden border border-slate-300">
                <SatyamPharmaGstInvoice
                  settings={settings}
                  isLivePreview={true}
                  saleType={saleType}
                  customerName={saleType === 'retail' ? walkinName : activeCustomer.businessName}
                  customerPhone={saleType === 'retail' ? walkinPhone : activeCustomer.phone}
                  customerAddress={saleType === 'retail' ? 'Counter Cash Sale' : activeCustomer.billingAddress}
                  customerCity={saleType === 'retail' ? settings.city : activeCustomer.billingAddress}
                  customerGstin={saleType === 'wholesale' ? activeCustomer.gstin : undefined}
                  customerDl={saleType === 'wholesale' ? activeCustomer.drugLicence : undefined}
                  doctorName={doctorName}
                  paymentMethod={paymentMethod}
                  items={cartAllocations.map((a) => ({
                    productName: a.product.name,
                    packUnit: a.product.packUnit,
                    packSize: a.product.packSize,
                    quantity: a.quantity,
                    freeQuantity: a.freeQuantity,
                    unitRate: a.unitRate,
                    mrp: a.product.mrp,
                    batchNumber: a.allocations[0]?.batch.batchNumber || 'FEFO',
                    expiryDate: a.allocations[0]?.batch.expiryDate || '',
                    discountPercent: a.discountPercent || 0,
                    hsnCode: a.product.hsnCode,
                    gstRate: a.product.gstRate,
                    lineTotal: a.lineTotal,
                  }))}
                  subtotal={billSummary.subtotal}
                  discountTotal={billSummary.discount}
                  taxableTotal={billSummary.taxable}
                  cgstTotal={billSummary.cgst}
                  sgstTotal={billSummary.sgst}
                  grandTotal={billSummary.total}
                  amountInWords={billSummary.amountInWords}
                  invoiceNumber={saleType === 'retail' ? 'RET-PREVIEW' : 'WS-PREVIEW'}
                />
              </div>
              <p className="text-[10px] text-center text-slate-500 font-sans italic">
                💡 Note: Real-time dynamic preview. The finalized invoice prints identical to this certified layout.
              </p>
            </div>
          </div>
        )}

        {/* Mobile Sticky POS Bottom Floating Bar */}
        {activeTab === 'billing' && (
          <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 ${isLight ? 'bg-white border-t border-slate-200' : 'bg-[#0d1322] border-t border-slate-800'} p-2.5 px-4 shadow-2xl flex items-center justify-between gap-2`}>
            <div>
              <div className={`text-[10px] ${themeClasses.secondaryText} font-mono`}>{cartItems.length} items</div>
              <div className="text-emerald-600 font-black font-mono text-base">₹{billSummary.total.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileInvoiceView(true)}
                className={`flex items-center gap-1 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-200 border-slate-700'} px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Invoice</span>
              </button>
              <button
                onClick={handleCompleteSale}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Bill & Print</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Tax Invoice Slide-up Modal */}
        {mobileInvoiceView && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-2">
            <div className="bg-white text-slate-900 rounded-t-2xl sm:rounded-2xl w-full max-h-[90vh] overflow-y-auto p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">Form 20B/21B Tax Invoice Preview</span>
                <button
                  onClick={() => setMobileInvoiceView(false)}
                  className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <SatyamPharmaGstInvoice
                  settings={settings}
                  isLivePreview={true}
                  saleType={saleType}
                  customerName={saleType === 'retail' ? walkinName : activeCustomer.businessName}
                  customerPhone={saleType === 'retail' ? walkinPhone : activeCustomer.phone}
                  customerAddress={saleType === 'retail' ? 'Counter Cash Sale' : activeCustomer.billingAddress}
                  customerCity={saleType === 'retail' ? settings.city : activeCustomer.billingAddress}
                  customerGstin={saleType === 'wholesale' ? activeCustomer.gstin : undefined}
                  customerDl={saleType === 'wholesale' ? activeCustomer.drugLicence : undefined}
                  doctorName={doctorName}
                  paymentMethod={paymentMethod}
                  items={cartAllocations.map((a) => ({
                    productName: a.product.name,
                    packUnit: a.product.packUnit,
                    packSize: a.product.packSize,
                    quantity: a.quantity,
                    freeQuantity: a.freeQuantity,
                    unitRate: a.unitRate,
                    mrp: a.product.mrp,
                    batchNumber: a.allocations[0]?.batch.batchNumber || 'FEFO',
                    expiryDate: a.allocations[0]?.batch.expiryDate || '',
                    discountPercent: a.discountPercent || 0,
                    hsnCode: a.product.hsnCode,
                    gstRate: a.product.gstRate,
                    lineTotal: a.lineTotal,
                  }))}
                  subtotal={billSummary.subtotal}
                  discountTotal={billSummary.discount}
                  taxableTotal={billSummary.taxable}
                  cgstTotal={billSummary.cgst}
                  sgstTotal={billSummary.sgst}
                  grandTotal={billSummary.total}
                  amountInWords={billSummary.amountInWords}
                  invoiceNumber={saleType === 'retail' ? 'RET-PREVIEW' : 'WS-PREVIEW'}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setMobileInvoiceView(false);
                    handleCompleteSale();
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Complete &amp; Print Bill (Satyam Certified)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1B: SALT SUBSTITUTE MEDICINE FINDER (Marg Books Special) */}
        {/* ============================================================== */}
        {activeTab === 'substitute' && (
          <div className="space-y-4">
            <div className={`${themeClasses.card} p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Generic Salt & Molecule Substitute Finder</span>
                </h3>
                <p className={`text-xs ${themeClasses.secondaryText}`}>
                  Search any medicine or chemical formula to discover in-stock generic and brand substitutes with identical strength and therapeutic value.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSubstituteSearch('Paracetamol IP 650mg')}
                  className={`px-2.5 py-1 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'} rounded-lg text-xs font-mono transition cursor-pointer`}
                >
                  Paracetamol 650
                </button>
                <button
                  onClick={() => setSubstituteSearch('Amoxicillin 500mg + Clavulanic Acid 125mg')}
                  className={`px-2.5 py-1 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'} rounded-lg text-xs font-mono transition cursor-pointer`}
                >
                  Amox-Clav 625
                </button>
                <button
                  onClick={() => setSubstituteSearch('Pantoprazole Sodium 40mg')}
                  className={`px-2.5 py-1 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'} rounded-lg text-xs font-mono transition cursor-pointer`}
                >
                  Pantoprazole 40
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className={`${themeClasses.card} p-3.5 rounded-xl`}>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={substituteSearch}
                  onChange={(e) => setSubstituteSearch(e.target.value)}
                  placeholder="Type Salt Formula or Brand (e.g. Paracetamol, Pantoprazole, Azithromycin)..."
                  className={`w-full pl-9 pr-3 py-2 ${themeClasses.input} rounded-lg text-xs font-medium`}
                />
              </div>
            </div>

            {/* Substitute Results Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {substituteMatches.map((prod) => {
                const totalStock = batches
                  .filter((b) => b.productId === prod.id && b.status === 'active' && new Date(b.expiryDate) > new Date())
                  .reduce((sum, b) => sum + b.sellableStock, 0);

                return (
                  <div key={prod.id} className={`${themeClasses.card} p-4 rounded-xl space-y-3`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm">{prod.name}</h4>
                        <p className="text-[11px] text-teal-600 font-semibold">{prod.genericName}</p>
                        <p className={`text-[10px] ${themeClasses.secondaryText}`}>{prod.manufacturer} • {prod.packSize}{prod.packUnit}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {prod.schedule}
                      </span>
                    </div>

                    <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-slate-900'} text-xs font-mono flex items-center justify-between`}>
                      <div>
                        <div className={themeClasses.secondaryText}>Retail MRP: <strong className="text-slate-900">₹{prod.mrp.toFixed(2)}</strong></div>
                        <div className={themeClasses.secondaryText}>Wholesale: <strong className="text-teal-600">₹{prod.defaultWholesalePrice.toFixed(2)}</strong></div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-black ${totalStock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {totalStock} in stock
                        </div>
                        <div className={`text-[10px] ${themeClasses.secondaryText}`}>{prod.rackLocation}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleAddToCart(prod);
                        setActiveTab('billing');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Select for Bill</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PHYSICAL INVENTORY & BATCH MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className={`${themeClasses.card} p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div>
                <h3 className="font-bold text-base">Physical Stock & FEFO Batch Ledger</h3>
                <p className={`text-xs ${themeClasses.secondaryText}`}>
                  Single inventory pool for both retail and wholesale channels. Depletion occurs strictly by earliest expiry date.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowAddBatchModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inward Stock / Batch</span>
                </button>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-200'} rounded-lg text-xs font-semibold border ${themeClasses.subtleBorder} transition cursor-pointer`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Product</span>
                </button>
                <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg font-bold">
                  Total: {stats.totalStock} units
                </span>
              </div>
            </div>

            {/* Stock Table */}
            <div className={`${themeClasses.card} rounded-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`${themeClasses.tableHeader} text-[10px] uppercase font-mono tracking-wider`}>
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
                  <tbody className="divide-y font-sans">
                    {batches.map((b) => {
                      const prod = products.find((p) => p.id === b.productId);
                      const isExpired = new Date(b.expiryDate) < new Date();
                      return (
                        <tr key={b.id} className={themeClasses.tableRowHover}>
                          <td className="py-2.5 px-3">
                            <div className="font-bold">{prod?.name || 'Unknown'}</div>
                            <div className={`text-[10px] ${themeClasses.secondaryText} font-mono`}>
                              Rack: {prod?.rackLocation} • {prod?.packSize}{prod?.packUnit} • {prod?.schedule}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 font-mono font-bold text-emerald-600">
                            {b.batchNumber}
                          </td>
                          <td className="py-2.5 px-2 font-mono">
                            <span className={isExpired ? 'text-rose-600 font-bold' : ''}>
                              {b.expiryDate}
                            </span>
                          </td>
                          <td className={`py-2.5 px-2 text-right font-mono ${themeClasses.secondaryText}`}>
                            ₹{Number(b.purchaseRate).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-semibold">
                            ₹{b.mrp.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-teal-600 font-bold">
                            ₹{b.wholesalePrice.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono">
                            <strong className={b.sellableStock > 0 ? 'text-sm' : 'text-slate-400'}>
                              {b.sellableStock}
                            </strong>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {isExpired ? (
                              <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-300 px-2 py-0.5 rounded font-mono font-bold">
                                EXPIRED (LOCKED)
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded font-mono font-semibold">
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
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: INWARD PURCHASES (Stock Inward Entry & Suppliers) */}
        {/* ============================================================== */}
        {activeTab === 'purchases' && (
          <div className="space-y-4">
            <div className={`${themeClasses.card} p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div>
                <h3 className="font-bold text-base">Inward Purchases & Goods Receipt</h3>
                <p className={`text-xs ${themeClasses.secondaryText}`}>
                  Stock received from authorized pharmaceutical distributors. Inward purchases auto-update batch inventory and supplier payables.
                </p>
              </div>
              <button
                onClick={() => setShowAddBatchModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record New Purchase</span>
              </button>
            </div>

            <div className={`${themeClasses.card} rounded-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`${themeClasses.tableHeader} text-[10px] uppercase font-mono tracking-wider`}>
                    <tr>
                      <th className="py-2.5 px-3">Purchase #</th>
                      <th className="py-2.5 px-2">Distributor / Supplier</th>
                      <th className="py-2.5 px-2">Supplier Bill No</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Item Details</th>
                      <th className="py-2.5 px-2 text-right">Taxable</th>
                      <th className="py-2.5 px-2 text-right">Grand Total</th>
                      <th className="py-2.5 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-sans">
                    {purchases.map((p) => (
                      <tr key={p.id} className={themeClasses.tableRowHover}>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                          {p.purchaseNumber}
                        </td>
                        <td className="py-2.5 px-2 font-medium">{p.supplierName}</td>
                        <td className="py-2.5 px-2 font-mono">{p.supplierInvoiceNumber}</td>
                        <td className={`py-2.5 px-2 font-mono ${themeClasses.secondaryText}`}>{p.date}</td>
                        <td className="py-2.5 px-2">
                          {p.items.map((it, idx) => (
                            <div key={idx} className="text-[11px] font-mono">
                              <span className="font-semibold">{it.productName}</span> • Batch: {it.batchNumber} • Qty: {it.quantity}
                            </div>
                          ))}
                        </td>
                        <td className={`py-2.5 px-2 text-right font-mono ${themeClasses.secondaryText}`}>
                          ₹{p.subtotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-sm">
                          ₹{p.grandTotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
                            {p.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: WHOLESALE CONTRACT PRICING MATRIX */}
        {/* ============================================================== */}
        {activeTab === 'pricing' && (
          <div className="space-y-4">
            <div className={`${themeClasses.card} p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div>
                <h3 className="font-bold text-base">Wholesale Contract Pricing Matrix</h3>
                <p className={`text-xs ${themeClasses.secondaryText}`}>
                  Institutional hospital, nursing home and clinic pricing rules. Automatically overrides standard wholesale catalog rates at POS.
                </p>
              </div>
              <button
                onClick={() => setShowAddContractModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Configure Contract Rate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers
                .filter((c) => c.type !== 'retail')
                .map((cust) => {
                  const contracts = customerPrices.filter((cp) => cp.customerId === cust.id);
                  return (
                    <div
                      key={cust.id}
                      className={`${themeClasses.card} rounded-xl p-4 space-y-3`}
                    >
                      <div className={`flex items-start justify-between border-b ${themeClasses.subtleBorder} pb-2`}>
                        <div>
                          <h4 className="font-bold text-sm">{cust.businessName}</h4>
                          <p className={`text-[11px] ${themeClasses.secondaryText}`}>{cust.name} • {cust.phone}</p>
                          <p className={`text-[10px] ${themeClasses.secondaryText} font-mono`}>
                            GSTIN: {cust.gstin} | DL: {cust.drugLicence}
                          </p>
                        </div>
                        <span className="text-xs font-mono bg-teal-50 text-teal-800 border border-teal-300 px-2 py-0.5 rounded font-bold uppercase">
                          {cust.type}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <span className={`text-[11px] font-semibold ${themeClasses.secondaryText}`}>Negotiated Contract Rates:</span>
                        {contracts.length > 0 ? (
                          <div className="space-y-1.5 pt-1">
                            {contracts.map((cp, idx) => {
                              const prod = products.find((p) => p.id === cp.productId);
                              return (
                                <div
                                  key={idx}
                                  className={`flex items-center justify-between ${isLight ? 'bg-slate-50' : 'bg-slate-900'} p-2 rounded-lg border ${themeClasses.subtleBorder} text-xs font-mono`}
                                >
                                  <div>
                                    <span className="font-bold font-sans">{prod?.name}</span>
                                    <span className={`text-[10px] ${themeClasses.secondaryText} ml-2`}>({cp.note})</span>
                                  </div>
                                  <div className="text-right">
                                    <strong className="text-emerald-600 text-sm">₹{cp.customRate.toFixed(2)}</strong>
                                    <span className="text-slate-400 text-[10px] line-through ml-2">
                                      ₹{prod?.defaultWholesalePrice.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className={`text-[11px] ${themeClasses.secondaryText} italic`}>Uses standard wholesale trade catalog rates.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: RECEIVABLES / CUSTOMER CREDIT LEDGER */}
        {/* ============================================================== */}
        {activeTab === 'udhari' && (
          <div className="space-y-4">
            <div className={`${themeClasses.card} p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div>
                <h3 className="font-bold text-base">Receivables & Customer Credit Ledger</h3>
                <p className={`text-xs ${themeClasses.secondaryText}`}>
                  Accurate double-entry customer ledger: Opening Balance + Credit Sales - Payments - Returns = Current Outstanding.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className={`text-xs ${themeClasses.secondaryText}`}>Total Store Outstanding:</span>
                <div className="text-lg font-black text-amber-600">₹{stats.totalUdhar.toLocaleString()}</div>
              </div>
            </div>

            <div className={`${themeClasses.card} rounded-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`${themeClasses.tableHeader} text-[10px] uppercase font-mono tracking-wider`}>
                    <tr>
                      <th className="py-2.5 px-3">Party / Clinic Name</th>
                      <th className="py-2.5 px-2">Type</th>
                      <th className="py-2.5 px-2">Contact</th>
                      <th className="py-2.5 px-2 text-right">Credit Limit</th>
                      <th className="py-2.5 px-2 text-right">Outstanding Due</th>
                      <th className="py-2.5 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-sans">
                    {customers
                      .filter((c) => c.type !== 'retail')
                      .map((c) => (
                        <tr key={c.id} className={themeClasses.tableRowHover}>
                          <td className="py-2.5 px-3">
                            <div className="font-bold">{c.businessName}</div>
                            <div className={`text-[10px] ${themeClasses.secondaryText} font-mono`}>{c.name}</div>
                          </td>
                          <td className="py-2.5 px-2 uppercase font-mono text-[10px] text-teal-600 font-bold">
                            {c.type}
                          </td>
                          <td className="py-2.5 px-2 font-mono">{c.phone}</td>
                          <td className={`py-2.5 px-2 text-right font-mono ${themeClasses.secondaryText}`}>
                            ₹{c.creditLimit.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono">
                            <strong className="text-amber-600 text-sm">₹{c.currentOutstanding.toLocaleString()}</strong>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <a
                                href={getWhatsAppPaymentReminderUrl(c)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-300 transition cursor-pointer"
                                title="Send WhatsApp Payment Reminder"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => {
                                  setShowPaymentModal(c);
                                  setPaymentAmountInput(String(c.currentOutstanding));
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                              >
                                Record Payment
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: EXPIRY WATCH & QUARANTINE */}
        {/* ============================================================== */}
        {activeTab === 'expiry' && (
          <div className="space-y-4">
            <div className={`${themeClasses.card} p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div>
                <h3 className="font-bold text-base">Expiry Watch & Safe Disposal</h3>
                <p className={`text-xs ${themeClasses.secondaryText}`}>
                  Batches nearing expiry (within {settings.nearExpiryDays} days) flagged for priority dispatch or supplier return. Expired medicines are permanently locked.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-rose-50 text-rose-700 border border-rose-300 px-2.5 py-1 rounded-lg font-bold">
                  {stats.expiredCount} Expired Batches (Locked)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {batches
                .filter((b) => {
                  const exp = new Date(b.expiryDate);
                  const now = new Date();
                  const thresholdMs = settings.nearExpiryDays * 24 * 60 * 60 * 1000;
                  const inNear = new Date(now.getTime() + thresholdMs);
                  return exp <= inNear;
                })
                .map((b) => {
                  const prod = products.find((p) => p.id === b.productId);
                  const isExpired = new Date(b.expiryDate) < new Date();
                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-xl border ${
                        isExpired
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{prod?.name}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            isExpired ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                          }`}
                        >
                          {isExpired ? 'EXPIRED (BLOCKED)' : 'NEAR EXPIRY'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-mono space-y-1">
                        <div>Batch: <strong>{b.batchNumber}</strong></div>
                        <div>Expiry: <strong>{b.expiryDate}</strong></div>
                        <div>Current Stock: <strong>{b.sellableStock} units</strong></div>
                        <div>Location: <span className="opacity-75">{prod?.rackLocation}</span></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: RETURNS (Sales & Purchase Returns) */}
        {/* ============================================================== */}
        {activeTab === 'returns' && (
          <div className="space-y-4">
            <div className={`${themeClasses.card} p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div>
                <h3 className="font-bold text-base">Sales & Purchase Returns Management</h3>
                <p className={`text-xs ${themeClasses.secondaryText}`}>
                  Process patient and wholesale medicine returns. Stock is atomically returned to the original batch and customer ledger/credit is refunded.
                </p>
              </div>
              <button
                onClick={() => setShowReturnModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Process Sales Return</span>
              </button>
            </div>

            <div className={`${themeClasses.card} rounded-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`${themeClasses.tableHeader} text-[10px] uppercase font-mono tracking-wider`}>
                    <tr>
                      <th className="py-2.5 px-3">Return #</th>
                      <th className="py-2.5 px-2">Original Invoice</th>
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Customer / Patient</th>
                      <th className="py-2.5 px-2">Returned Medicine</th>
                      <th className="py-2.5 px-2 text-right">Refund Amount</th>
                      <th className="py-2.5 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-sans">
                    {salesReturns.map((r) => (
                      <tr key={r.id} className={themeClasses.tableRowHover}>
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{r.returnNumber}</td>
                        <td className="py-2.5 px-2 font-mono">{r.originalInvoiceNumber}</td>
                        <td className={`py-2.5 px-2 font-mono ${themeClasses.secondaryText}`}>{r.date}</td>
                        <td className="py-2.5 px-2 font-medium">{r.customerName}</td>
                        <td className="py-2.5 px-2 font-mono">
                          {r.items.map((it, idx) => (
                            <span key={idx}>
                              {it.productName} ({it.quantity} units) - {it.reason}
                            </span>
                          ))}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-rose-600 text-sm">
                          ₹{r.refundAmount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-300 px-2 py-0.5 rounded font-mono font-semibold">
                            RESTOCKED
                          </span>
                        </td>
                      </tr>
                    ))}
                    {salesReturns.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 font-mono text-xs">
                          No returns recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: GST & FINANCIAL AUDIT REPORTS */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className={`${themeClasses.card} p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div>
                <h3 className="font-bold text-base">Invoices & GST Sales Tax Register</h3>
                <p className={`text-xs ${themeClasses.secondaryText}`}>
                  Permanent snapshots of all historical invoices. Retains GST rates, drug license numbers and batch allocations for tax audit.
                </p>
              </div>
              <button
                onClick={() => {
                  const csv = [
                    'Invoice No,Type,Date,Customer,Doctor,Subtotal,Taxable,CGST,SGST,Grand Total,Payment Method',
                    ...invoices.map(
                      (i) =>
                        `${i.invoiceNumber},${i.type},${i.date},"${i.customerName}","${i.doctorName || ''}",${i.subtotal},${i.taxableTotal},${i.cgstTotal},${i.sgstTotal},${i.grandTotal},${i.paymentMethod}`
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-200'} rounded-lg text-xs font-semibold border ${themeClasses.subtleBorder} transition cursor-pointer`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export GST CSV</span>
              </button>
            </div>

            <div className={`${themeClasses.card} rounded-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`${themeClasses.tableHeader} text-[10px] uppercase font-mono tracking-wider`}>
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
                  <tbody className="divide-y font-sans">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className={themeClasses.tableRowHover}>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                          {inv.invoiceNumber}
                        </td>
                        <td className={`py-2.5 px-2 uppercase font-mono text-[10px] ${themeClasses.secondaryText}`}>
                          {inv.type}
                        </td>
                        <td className={`py-2.5 px-2 font-mono ${themeClasses.secondaryText}`}>{inv.date}</td>
                        <td className="py-2.5 px-2 font-medium">{inv.customerName}</td>
                        <td className="py-2.5 px-2 text-right font-mono">
                          ₹{inv.taxableTotal.toFixed(2)}
                        </td>
                        <td className={`py-2.5 px-2 text-right font-mono ${themeClasses.secondaryText}`}>
                          ₹{(inv.cgstTotal + inv.sgstTotal).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-600 text-sm">
                          ₹{inv.grandTotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className={`px-2.5 py-1 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-200'} rounded text-[11px] font-medium transition cursor-pointer border ${themeClasses.subtleBorder}`}
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
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 9: SYSTEM AUDIT LOG TRAIL */}
        {/* ============================================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className={`${themeClasses.card} p-4 rounded-xl`}>
              <h3 className="font-bold text-base">Immutable System Audit Trail</h3>
              <p className={`text-xs ${themeClasses.secondaryText}`}>
                Audits sales, inward purchases, stock movements, price changes, and payments in compliance with pharmacy regulations.
              </p>
            </div>

            <div className={`${themeClasses.card} rounded-xl overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`${themeClasses.tableHeader} text-[10px] uppercase font-mono tracking-wider`}>
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-2">Action</th>
                      <th className="py-2.5 px-2">User (Role)</th>
                      <th className="py-2.5 px-2">Entity</th>
                      <th className="py-2.5 px-3">Activity Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className={themeClasses.tableRowHover}>
                        <td className={`py-2.5 px-3 ${themeClasses.secondaryText}`}>{log.timestamp}</td>
                        <td className="py-2.5 px-2">
                          <span className="text-emerald-600 font-bold">{log.action}</span>
                        </td>
                        <td className="py-2.5 px-2">
                          {log.user} ({log.role})
                        </td>
                        <td className="py-2.5 px-2 text-teal-600 font-semibold">{log.entity}</td>
                        <td className={`py-2.5 px-3 font-sans ${themeClasses.secondaryText}`}>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}

        {/* ============================================================== */}
        {/* TAB: ANALYTICS DASHBOARD */}
        {/* ============================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Header */}
            <div className={`${themeClasses.card} p-4 rounded-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Business Analytics Dashboard</h3>
                  <p className={`text-xs mt-1 ${themeClasses.secondaryText}`}>Real-time snapshot of store performance, stock health, and financial exposure.</p>
                </div>
                <div className={`text-xs font-mono ${themeClasses.secondaryText}`}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Today's Revenue", value: `₹${stats.todaySales.toLocaleString()}`, sub: `${stats.todayBillsCount} invoice${stats.todayBillsCount !== 1 ? 's' : ''}`, color: 'emerald', icon: ShoppingCart },
                { label: 'Total Stock Units', value: stats.totalStock.toLocaleString(), sub: `${stats.lowStockCount} items low stock`, color: 'blue', icon: Boxes },
                { label: 'Receivables (Udhar)', value: `₹${stats.totalUdhar.toLocaleString()}`, sub: `${customers.filter(c => c.currentOutstanding > 0).length} parties pending`, color: 'amber', icon: CreditCard },
                { label: 'Near Expiry Batches', value: stats.nearExpiryCount.toString(), sub: `${stats.expiredCount} already expired`, color: 'rose', icon: Clock },
              ].map(({ label, value, sub, color, icon: Icon }) => (
                <div key={label} className={`${themeClasses.card} rounded-xl p-4 space-y-2`}>
                  <div className={`text-${color}-600 flex items-center gap-1.5 text-xs font-semibold`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </div>
                  <div className="text-2xl font-black font-mono">{value}</div>
                  <div className={`text-[11px] ${themeClasses.secondaryText}`}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Revenue by Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${themeClasses.card} rounded-xl p-4`}>
                <h4 className="font-bold text-sm mb-4">Revenue by Payment Method</h4>
                {(() => {
                  const methods = ['cash', 'upi', 'card', 'credit'] as const;
                  const totals = methods.map(m => ({
                    method: m.toUpperCase(),
                    total: invoices.filter(i => i.paymentMethod === m).reduce((s, i) => s + i.grandTotal, 0),
                    count: invoices.filter(i => i.paymentMethod === m).length,
                  })).sort((a, b) => b.total - a.total);
                  const maxVal = Math.max(...totals.map(t => t.total), 1);
                  return (
                    <div className="space-y-3">
                      {totals.map(({ method, total, count }) => (
                        <div key={method} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold">{method}</span>
                            <span className="font-mono">₹{total.toLocaleString()} <span className={`${themeClasses.secondaryText} font-normal`}>({count})</span></span>
                          </div>
                          <div className={`h-2 rounded-full ${isLight ? 'bg-slate-100' : 'bg-slate-800'} overflow-hidden`}>
                            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(total / maxVal) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Top 10 Selling Products */}
              <div className={`${themeClasses.card} rounded-xl p-4`}>
                <h4 className="font-bold text-sm mb-4">Top 5 Products by Revenue</h4>
                {(() => {
                  const prodRevenue: Record<string, { name: string; revenue: number; qty: number }> = {};
                  invoices.forEach(inv => {
                    inv.items.forEach(item => {
                      if (!prodRevenue[item.productId]) prodRevenue[item.productId] = { name: item.productName, revenue: 0, qty: 0 };
                      prodRevenue[item.productId].revenue += item.quantity * item.unitPrice;
                      prodRevenue[item.productId].qty += item.quantity;
                    });
                  });
                  const top5 = Object.values(prodRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
                  const maxRev = Math.max(...top5.map(p => p.revenue), 1);
                  return (
                    <div className="space-y-3">
                      {top5.map((p, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold truncate max-w-[60%]">{p.name}</span>
                            <span className="font-mono">₹{p.revenue.toFixed(0)} <span className={`${themeClasses.secondaryText} font-normal`}>({p.qty} units)</span></span>
                          </div>
                          <div className={`h-2 rounded-full ${isLight ? 'bg-slate-100' : 'bg-slate-800'} overflow-hidden`}>
                            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                      {top5.length === 0 && <p className={`text-xs ${themeClasses.secondaryText} text-center py-4`}>No sales data yet.</p>}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* GST Summary + Supplier Dues */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${themeClasses.card} rounded-xl p-4 space-y-3`}>
                <h4 className="font-bold text-sm">GST Tax Collected</h4>
                {[5, 12, 18].map(rate => {
                  const invItems = invoices.flatMap(inv => inv.items);
                  const items5 = invItems.filter(item => {
                    const prod = products.find(p => p.id === item.productId);
                    return prod && prod.gstRate === rate;
                  });
                  const taxableAmt = items5.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
                  const gstAmt = taxableAmt * (rate / 100);
                  return (
                    <div key={rate} className="flex items-center justify-between text-xs">
                      <span className={`${themeClasses.secondaryText}`}>{rate}% GST Slab</span>
                      <div className="text-right">
                        <div className="font-mono font-bold">₹{gstAmt.toFixed(2)}</div>
                        <div className={`text-[10px] ${themeClasses.secondaryText}`}>on ₹{taxableAmt.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
                <div className={`pt-2 border-t ${themeClasses.subtleBorder} flex items-center justify-between text-xs`}>
                  <span className="font-bold">Total GST Collected</span>
                  <span className="font-mono font-black text-emerald-600">₹{invoices.reduce((s, i) => s + i.cgstTotal + i.sgstTotal, 0).toFixed(2)}</span>
                </div>
              </div>

              <div className={`${themeClasses.card} rounded-xl p-4 space-y-3`}>
                <h4 className="font-bold text-sm">Supplier Dues (Payable)</h4>
                {suppliers.filter(s => s.currentOutstanding > 0).slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center justify-between text-xs">
                    <span className={`${themeClasses.secondaryText} truncate max-w-[55%]`}>{s.name}</span>
                    <span className="font-mono font-bold text-rose-600">₹{s.currentOutstanding.toLocaleString()}</span>
                  </div>
                ))}
                {suppliers.filter(s => s.currentOutstanding > 0).length === 0 && <p className={`text-xs ${themeClasses.secondaryText} text-center py-4`}>No pending supplier dues.</p>}
                <div className={`pt-2 border-t ${themeClasses.subtleBorder} flex items-center justify-between text-xs`}>
                  <span className="font-bold">Total Payable</span>
                  <span className="font-mono font-black text-rose-600">₹{stats.totalSupplierDue.toLocaleString()}</span>
                </div>
              </div>

              <div className={`${themeClasses.card} rounded-xl p-4 space-y-3`}>
                <h4 className="font-bold text-sm">Inventory Health</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Total Active Batches', value: batches.filter(b => b.status === 'active').length, color: 'emerald' },
                    { label: 'Low Stock Products', value: stats.lowStockCount, color: 'amber' },
                    { label: 'Near Expiry (alerts)', value: stats.nearExpiryCount, color: 'orange' },
                    { label: 'Expired Batches', value: stats.expiredCount, color: 'rose' },
                    { label: 'Total Products', value: products.length, color: 'blue' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className={themeClasses.secondaryText}>{label}</span>
                      <span className={`font-mono font-bold text-${color}-600`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Invoices Mini-Table */}
            <div className={`${themeClasses.card} rounded-xl overflow-hidden`}>
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h4 className="font-bold text-sm">Recent Transactions</h4>
                <button onClick={() => setActiveTab('reports')} className={`text-xs font-semibold text-emerald-600 hover:underline cursor-pointer`}>View All →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className={`${themeClasses.tableHeader} text-[10px] uppercase font-mono tracking-wider`}>
                    <tr>
                      <th className="py-2 px-3">Invoice #</th>
                      <th className="py-2 px-2">Date</th>
                      <th className="py-2 px-2">Customer</th>
                      <th className="py-2 px-2 text-right">Amount</th>
                      <th className="py-2 px-2">Mode</th>
                      <th className="py-2 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 8).map(inv => (
                      <tr key={inv.id} className={themeClasses.tableRowHover}>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-600">{inv.invoiceNumber}</td>
                        <td className={`py-2 px-2 font-mono ${themeClasses.secondaryText}`}>{inv.date}</td>
                        <td className="py-2 px-2 font-medium truncate max-w-[120px]">{inv.customerName}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold">₹{inv.grandTotal.toFixed(2)}</td>
                        <td className={`py-2 px-2 uppercase text-[10px] font-mono ${themeClasses.secondaryText}`}>{inv.paymentMethod}</td>
                        <td className="py-2 px-2 text-center">
                          <button onClick={() => setViewingInvoice(inv)} className={`px-2 py-0.5 ${isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-800 hover:bg-slate-700'} rounded text-[11px] border ${themeClasses.subtleBorder} cursor-pointer`}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SETTINGS & BACKUP */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl">
            <div className={`${themeClasses.card} p-4 rounded-xl`}>
              <h3 className="font-bold text-base">Store & Pharmacy Master Settings</h3>
              <p className={`text-xs ${themeClasses.secondaryText}`}>
                Configure your retail and wholesale drug licenses, GSTIN, business address, and print defaults.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                persist('pp_settings_v4', settings);
                addAuditLog('SETTINGS_UPDATE', 'Pharmacy Profile', 'Store settings and license information updated.');
                notify('Settings saved successfully!');
              }}
              className={`${themeClasses.card} rounded-xl p-5 space-y-4 text-xs`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`font-medium ${themeClasses.secondaryText}`}>Pharmacy / Business Name:</label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-medium`}
                  />
                </div>
                <div>
                  <label className={`font-medium ${themeClasses.secondaryText}`}>Tagline / Subtitle:</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                  />
                </div>
                <div>
                  <label className={`font-medium ${themeClasses.secondaryText}`}>GSTIN (27-Maharashtra):</label>
                  <input
                    type="text"
                    value={settings.gstin}
                    onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={`font-medium ${themeClasses.secondaryText}`}>PAN Number:</label>
                  <input
                    type="text"
                    value={settings.pan}
                    onChange={(e) => setSettings({ ...settings, pan: e.target.value })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={`font-medium ${themeClasses.secondaryText}`}>Retail Drug License (Form 20B):</label>
                  <input
                    type="text"
                    value={settings.dlNumber20b}
                    onChange={(e) => setSettings({ ...settings, dlNumber20b: e.target.value })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={`font-medium ${themeClasses.secondaryText}`}>Wholesale Drug License (Form 21B):</label>
                  <input
                    type="text"
                    value={settings.dlNumber21b}
                    onChange={(e) => setSettings({ ...settings, dlNumber21b: e.target.value })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={`font-medium ${themeClasses.secondaryText}`}>Physical Shop Address:</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                  />
                </div>
                <div>
                  <label className={`font-medium ${themeClasses.secondaryText}`}>City / Area:</label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                  />
                </div>
                <div>
                  <label className={`font-medium ${themeClasses.secondaryText}`}>PIN Code:</label>
                  <input
                    type="text"
                    value={settings.pincode}
                    onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={`font-medium ${themeClasses.secondaryText}`}>Near-Expiry Threshold (Days):</label>
                  <input
                    type="number"
                    value={settings.nearExpiryDays}
                    onChange={(e) => setSettings({ ...settings, nearExpiryDays: Number(e.target.value) })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={`font-medium ${themeClasses.secondaryText}`}>Default Print Format:</label>
                  <select
                    value={settings.defaultPrintFormat}
                    onChange={(e) => setSettings({ ...settings, defaultPrintFormat: e.target.value as any })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                  >
                    <option value="A4">A4 Full Tax Invoice</option>
                    <option value="80mm">80mm Thermal Receipt</option>
                  </select>
                </div>
              </div>

              <div className={`pt-3 border-t ${themeClasses.subtleBorder} flex justify-end`}>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Save Store Settings
                </button>
              </div>
            </form>

            {/* Backup & Factory Reset Card */}
            <div className={`${themeClasses.card} rounded-xl p-5 space-y-3 text-xs`}>
              <h4 className="font-bold text-sm">Data Backup & Factory Reset</h4>
              <p className={themeClasses.secondaryText}>
                Export all store master databases to a single offline JSON file, or restore default demonstration records.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => {
                    const fullData = {
                      settings,
                      products,
                      batches,
                      customers,
                      customerPrices,
                      suppliers,
                      invoices,
                      purchases,
                      salesReturns,
                      auditLogs,
                    };
                    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Prince_Pharma_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    notify('Complete database backup exported successfully!');
                  }}
                  className={`px-4 py-2 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-200'} rounded-lg font-semibold border ${themeClasses.subtleBorder} cursor-pointer`}
                >
                  Download Full JSON Backup
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all data to default demo state?')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-semibold border border-rose-300 cursor-pointer"
                >
                  Reset to Factory Demo State
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. MODALS CONTAINER */}

      {/* 4.1. MODAL: PRINTABLE A4 & 80MM PHARMACY TAX INVOICE */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-8 print-visible">
            {/* Modal Controls Header (Hidden in Print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 print-hidden gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-xs sm:text-sm">Print Layout:</span>
                <div className="flex bg-slate-100 p-0.5 rounded border border-slate-300 text-xs">
                  <button
                    onClick={() => setPrintFormat('A4')}
                    className={`px-3 py-1 rounded font-semibold cursor-pointer ${
                      printFormat === 'A4' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                    }`}
                  >
                    A4 Formal
                  </button>
                  <button
                    onClick={() => setPrintFormat('80mm')}
                    className={`px-3 py-1 rounded font-semibold cursor-pointer ${
                      printFormat === '80mm' ? 'bg-emerald-700 text-white' : 'text-slate-600'
                    }`}
                  >
                    80mm Thermal
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleWhatsAppWithPdf(viewingInvoice)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp PDF</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
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
            <div className="overflow-x-auto">
              <div id="invoice-print-area">
                <SatyamPharmaGstInvoice
                  settings={settings}
                  invoice={viewingInvoice}
                  compactThermal={printFormat === '80mm'}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.2. MODAL: SUBSTITUTE MEDICINE FINDER (F7) */}
      {showSubstituteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className={`${isLight ? 'bg-white text-slate-900' : 'bg-[#0f172a] text-white'} border ${themeClasses.subtleBorder} rounded-2xl max-w-lg w-full p-5 space-y-4 my-8 shadow-2xl`}>
            <div className={`flex items-center justify-between pb-3 border-b ${themeClasses.subtleBorder}`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Substitute Medicine Finder (Generic Salt Match)</span>
              </h3>
              <button onClick={() => setShowSubstituteModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className={`font-semibold ${themeClasses.secondaryText}`}>Search Salt / Generic Formula:</label>
                <input
                  type="text"
                  value={substituteSearch}
                  onChange={(e) => setSubstituteSearch(e.target.value)}
                  placeholder="e.g. Paracetamol IP 650mg, Amoxicillin, Pantoprazole..."
                  className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-medium`}
                />
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {substituteMatches.map((m) => {
                  const stock = batches
                    .filter((b) => b.productId === m.id && b.status === 'active' && new Date(b.expiryDate) > new Date())
                    .reduce((sum, b) => sum + b.sellableStock, 0);

                  return (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-lg border ${themeClasses.subtleBorder} flex items-center justify-between ${isLight ? 'bg-slate-50' : 'bg-slate-900'}`}
                    >
                      <div>
                        <div className="font-bold">{m.name}</div>
                        <div className="text-[10px] text-teal-600 font-semibold">{m.genericName}</div>
                        <div className={`text-[10px] ${themeClasses.secondaryText}`}>{m.manufacturer} • MRP: ₹{m.mrp.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-mono font-bold text-xs ${stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {stock} in stock
                        </div>
                        <button
                          onClick={() => {
                            handleAddToCart(m);
                            setShowSubstituteModal(false);
                          }}
                          className="mt-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`pt-2 border-t ${themeClasses.subtleBorder} flex justify-end`}>
                <button
                  type="button"
                  onClick={() => setShowSubstituteModal(false)}
                  className={`px-4 py-1.5 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'} rounded-lg font-medium cursor-pointer`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4.2.1. MODAL: SYSTEM GUIDE & WORKFLOW (KAHAN SE KYA HOTA HAI) */}
      {showSystemGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className={`${isLight ? 'bg-white text-slate-900' : 'bg-[#0f172a] text-white'} border ${themeClasses.subtleBorder} rounded-2xl max-w-4xl w-full p-5 md:p-6 space-y-5 my-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className={`flex items-start justify-between pb-4 border-b ${themeClasses.subtleBorder}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base md:text-lg flex items-center gap-2">
                    System Architecture & Operating Manual
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Enterprise SOP
                    </span>
                  </h3>
                  <p className={`text-xs ${themeClasses.secondaryText}`}>
                    End-to-end pharmacy operational workflow and standard operating procedures (SOP)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSystemGuideModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4-Step Main Flow */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Core Pharmacy Daily Operating Cycle
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className={`p-3.5 rounded-xl border ${themeClasses.subtleBorder} ${isLight ? 'bg-emerald-50/40' : 'bg-emerald-950/20'} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      1. Inward Purchase Entry
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('purchases');
                        setShowSystemGuideModal(false);
                      }}
                      className="text-[10px] font-bold text-emerald-700 underline cursor-pointer"
                    >
                      Open Module &rarr;
                    </button>
                  </div>
                  <p className={themeClasses.secondaryText}>
                    Record distributor & wholesaler bills (e.g. Satyam Pharmaceuticals) with invoice numbers, batch allocations, expiry dates, purchase rates, and scheme bonus units. Inventory increments instantly.
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${themeClasses.subtleBorder} ${isLight ? 'bg-blue-50/40' : 'bg-blue-950/20'} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-blue-600" />
                      2. Stock & FEFO Batch Engine
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('inventory');
                        setShowSystemGuideModal(false);
                      }}
                      className="text-[10px] font-bold text-blue-700 underline cursor-pointer"
                    >
                      Open Module &rarr;
                    </button>
                  </div>
                  <p className={themeClasses.secondaryText}>
                    Live godown & shelf stock management. Deterministic FEFO (First Expire, First Out) rules ensure that earliest expiring batches are automatically queued for billing first, eliminating shelf expiry losses.
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${themeClasses.subtleBorder} ${isLight ? 'bg-amber-50/40' : 'bg-amber-950/20'} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-700 flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-amber-600" />
                      3. Point of Sale (POS Billing)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('billing');
                        setShowSystemGuideModal(false);
                      }}
                      className="text-[10px] font-bold text-amber-700 underline cursor-pointer"
                    >
                      Open Module &rarr;
                    </button>
                  </div>
                  <p className={themeClasses.secondaryText}>
                    Rapid prescription entry for walk-in patients or institutional hospital accounts. Real-time generation of authentic Marg/Satyam style GST Tax Invoices in A4 and 80mm thermal formats.
                  </p>
                </div>

                <div className={`p-3.5 rounded-xl border ${themeClasses.subtleBorder} ${isLight ? 'bg-purple-50/40' : 'bg-purple-950/20'} space-y-1.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-700 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-600" />
                      4. Credit Ledger & Receivables
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('udhari');
                        setShowSystemGuideModal(false);
                      }}
                      className="text-[10px] font-bold text-purple-700 underline cursor-pointer"
                    >
                      Open Module &rarr;
                    </button>
                  </div>
                  <p className={themeClasses.secondaryText}>
                    Track customer and institutional receivables with running balances and credit limits. Includes 1-click WhatsApp payment reminders with official payment receipt settlement.
                  </p>
                </div>
              </div>
            </div>

            {/* Satyam Authentic Invoice Highlight Box */}
            <div className={`p-4 rounded-xl border-2 border-emerald-500/30 ${isLight ? 'bg-emerald-50/30' : 'bg-emerald-950/15'} flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs`}>
              <div className="space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Authentic Satyam Pharmaceuticals GST Tax Invoice (#A012147)
                </span>
                <p className={themeClasses.secondaryText}>
                  Layout conforms strictly to authentic pharmaceutical distribution tax invoices with verified QR code, FSSAI Food Lic (22718282000369), DL numbers (UP5520B000622 / UP5521B000622), batch & expiry dates, HSN, SGST/CGST, and grand totals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const sampleInv = invoices.find((i) => i.id === 'INV-A012147') || invoices[0];
                  if (sampleInv) {
                    setViewingInvoice(sampleInv);
                    setShowSystemGuideModal(false);
                  }
                }}
                className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Preview Sample Invoice
              </button>
            </div>

            {/* Other Key Pharmacy Features */}
            <div className="space-y-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Essential Pharmacy Operational Modules
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className={`p-2.5 rounded-lg border ${themeClasses.subtleBorder} ${isLight ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
                  <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    Expiry Watch & Vendor Returns
                  </p>
                  <p className={`text-[11px] mt-1 ${themeClasses.secondaryText}`}>
                    Automated 30/60/90-day expiry threshold alerts with debit note generation for prompt supplier returns.
                  </p>
                </div>

                <div className={`p-2.5 rounded-lg border ${themeClasses.subtleBorder} ${isLight ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
                  <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-indigo-500" />
                    Generic Salt Substitution (F7)
                  </p>
                  <p className={`text-[11px] mt-1 ${themeClasses.secondaryText}`}>
                    Intelligent active pharmaceutical ingredient (API) matching to suggest therapeutic in-stock alternatives.
                  </p>
                </div>

                <div className={`p-2.5 rounded-lg border ${themeClasses.subtleBorder} ${isLight ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
                  <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-teal-500" />
                    GST Tax Audit & Reporting
                  </p>
                  <p className={`text-[11px] mt-1 ${themeClasses.secondaryText}`}>
                    Multi-slab GST breakdowns (5%, 12%, 18%) with 1-click CSV export ready for chartered accountant filing.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Shortcuts */}
            <div className={`p-3 rounded-lg border ${themeClasses.subtleBorder} ${isLight ? 'bg-slate-100/70' : 'bg-slate-800/40'} flex flex-wrap items-center justify-between gap-2 text-xs`}>
              <span className="font-bold text-slate-600 dark:text-slate-300">
                POS Keyboard Shortcuts:
              </span>
              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-300 font-mono font-bold">F1</kbd> Point of Sale</span>
                <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-300 font-mono font-bold">F2</kbd> Stock Inventory</span>
                <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-300 font-mono font-bold">F7</kbd> Generic Salt Finder</span>
                <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-300 font-mono font-bold">F9</kbd> Finalize Bill</span>
                <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-300 font-mono font-bold">Esc</kbd> Close Dialog</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`pt-3 border-t ${themeClasses.subtleBorder} flex items-center justify-end`}>
              <button
                type="button"
                onClick={() => setShowSystemGuideModal(false)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md"
              >
                Acknowledge & Close &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.3. MODAL: ADD NEW MEDICINE / PRODUCT */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className={`${isLight ? 'bg-white text-slate-900' : 'bg-[#0f172a] text-white'} border ${themeClasses.subtleBorder} rounded-2xl max-w-lg w-full p-5 space-y-4 my-8 shadow-2xl`}>
            <div className={`flex items-center justify-between pb-3 border-b ${themeClasses.subtleBorder}`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                Register New Product in Master
              </h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={themeClasses.secondaryText}>Medicine Trade Name:</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    placeholder="e.g. Calpol 500 Suspension"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-medium`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Salt / Generic Composition:</label>
                  <input
                    type="text"
                    value={newProductForm.genericName}
                    onChange={(e) => setNewProductForm({ ...newProductForm, genericName: e.target.value })}
                    placeholder="e.g. Paracetamol 250mg/5ml"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-medium`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Manufacturer / Brand:</label>
                  <input
                    type="text"
                    value={newProductForm.manufacturer}
                    onChange={(e) => setNewProductForm({ ...newProductForm, manufacturer: e.target.value })}
                    placeholder="e.g. GSK Pharma"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Dosage Form:</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value as any })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                  >
                    <option value="tablet">Tablet</option>
                    <option value="syrup">Syrup</option>
                    <option value="capsule">Capsule</option>
                    <option value="injection">Injection</option>
                    <option value="ointment">Ointment</option>
                    <option value="drops">Drops</option>
                  </select>
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Pack Size & Unit:</label>
                  <div className="flex gap-1.5 mt-1">
                    <input
                      type="number"
                      value={newProductForm.packSize}
                      onChange={(e) => setNewProductForm({ ...newProductForm, packSize: Number(e.target.value) })}
                      className={`w-16 ${themeClasses.input} rounded-lg p-2 font-mono`}
                    />
                    <input
                      type="text"
                      value={newProductForm.packUnit}
                      onChange={(e) => setNewProductForm({ ...newProductForm, packUnit: e.target.value })}
                      placeholder="strip/bottle"
                      className={`flex-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                    />
                  </div>
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Retail MRP (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductForm.mrp}
                    onChange={(e) => setNewProductForm({ ...newProductForm, mrp: Number(e.target.value), defaultRetailPrice: Number(e.target.value) })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Wholesale Trade Price (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductForm.defaultWholesalePrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, defaultWholesalePrice: Number(e.target.value) })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Rack / Shelf Location:</label>
                  <input
                    type="text"
                    value={newProductForm.rackLocation}
                    onChange={(e) => setNewProductForm({ ...newProductForm, rackLocation: e.target.value })}
                    placeholder="Rack A-02"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Drug Schedule:</label>
                  <select
                    value={newProductForm.schedule}
                    onChange={(e) => setNewProductForm({ ...newProductForm, schedule: e.target.value as any })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  >
                    <option value="OTC">OTC (Over the Counter)</option>
                    <option value="H">Schedule H (Rx)</option>
                    <option value="H1">Schedule H1 (Controlled Antibiotic)</option>
                    <option value="X">Schedule X (Narcotic)</option>
                  </select>
                </div>
              </div>

              <div className={`pt-3 border-t ${themeClasses.subtleBorder} flex justify-end gap-2`}>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className={`px-3 py-1.5 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'} rounded-lg cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.4. MODAL: INWARD PURCHASE / ADD BATCH */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className={`${isLight ? 'bg-white text-slate-900' : 'bg-[#0f172a] text-white'} border ${themeClasses.subtleBorder} rounded-2xl max-w-lg w-full p-5 space-y-4 my-8 shadow-2xl`}>
            <div className={`flex items-center justify-between pb-3 border-b ${themeClasses.subtleBorder}`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                Record Stock Inward / Add Batch
              </h3>
              <button onClick={() => setShowAddBatchModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={themeClasses.secondaryText}>Supplier / Distributor:</label>
                  <select
                    value={newBatchForm.supplierId}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, supplierId: e.target.value })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Supplier Bill / Invoice #:</label>
                  <input
                    type="text"
                    value={newBatchForm.invoiceNumber}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, invoiceNumber: e.target.value })}
                    placeholder="e.g. INV-CIPLA-9021"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div className="col-span-2">
                  <label className={themeClasses.secondaryText}>Select Medicine:</label>
                  <select
                    value={newBatchForm.productId}
                    onChange={(e) => {
                      const prod = products.find((p) => p.id === e.target.value);
                      setNewBatchForm({
                        ...newBatchForm,
                        productId: e.target.value,
                        mrp: prod?.mrp || 100,
                        wholesalePrice: prod?.defaultWholesalePrice || 80,
                      });
                    }}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-medium`}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.manufacturer})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Batch Number:</label>
                  <input
                    type="text"
                    required
                    value={newBatchForm.batchNumber}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, batchNumber: e.target.value })}
                    placeholder="e.g. DL-26K04"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono uppercase`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Expiry Date (YYYY-MM-DD):</label>
                  <input
                    type="date"
                    required
                    value={newBatchForm.expiryDate}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, expiryDate: e.target.value })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Quantity Received:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBatchForm.quantity}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, quantity: Number(e.target.value) })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Free Quantity (Bonus):</label>
                  <input
                    type="number"
                    min="0"
                    value={newBatchForm.freeQuantity}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, freeQuantity: Number(e.target.value) })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Purchase Cost Rate (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newBatchForm.purchaseRate}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, purchaseRate: Number(e.target.value) })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Wholesale Selling Rate (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newBatchForm.wholesalePrice}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, wholesalePrice: Number(e.target.value) })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
              </div>

              <div className={`pt-3 border-t ${themeClasses.subtleBorder} flex justify-end gap-2`}>
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className={`px-3 py-1.5 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'} rounded-lg cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Add to FEFO Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.5. MODAL: ADD NEW CUSTOMER */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className={`${isLight ? 'bg-white text-slate-900' : 'bg-[#0f172a] text-white'} border ${themeClasses.subtleBorder} rounded-2xl max-w-lg w-full p-5 space-y-4 my-8 shadow-2xl`}>
            <div className={`flex items-center justify-between pb-3 border-b ${themeClasses.subtleBorder}`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Register New Customer / Hospital
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={themeClasses.secondaryText}>Business / Clinic / Hospital Name:</label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.businessName}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, businessName: e.target.value })}
                    placeholder="e.g. LifeCare Multi-Speciality Hospital"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-medium`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Contact Person Name:</label>
                  <input
                    type="text"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    placeholder="Dr. R. K. Singhal"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Customer Type:</label>
                  <select
                    value={newCustomerForm.type}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, type: e.target.value as any })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                  >
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic / Nursing Home</option>
                    <option value="wholesale">Wholesale Chemist</option>
                    <option value="retail">Retail Patient</option>
                  </select>
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Phone Number:</label>
                  <input
                    type="tel"
                    required
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>GSTIN Number:</label>
                  <input
                    type="text"
                    value={newCustomerForm.gstin}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, gstin: e.target.value })}
                    placeholder="27AABCL9988P1Z5"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Drug License Number:</label>
                  <input
                    type="text"
                    value={newCustomerForm.drugLicence}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, drugLicence: e.target.value })}
                    placeholder="20B/MH-TZ-776655"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div>
                  <label className={themeClasses.secondaryText}>Credit Limit (₹):</label>
                  <input
                    type="number"
                    value={newCustomerForm.creditLimit}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, creditLimit: Number(e.target.value) })}
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                  />
                </div>
                <div className="col-span-2">
                  <label className={themeClasses.secondaryText}>Billing Address:</label>
                  <input
                    type="text"
                    value={newCustomerForm.billingAddress}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, billingAddress: e.target.value })}
                    placeholder="Shop/Floor, Complex, Road, City"
                    className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                  />
                </div>
              </div>

              <div className={`pt-3 border-t ${themeClasses.subtleBorder} flex justify-end gap-2`}>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className={`px-3 py-1.5 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'} rounded-lg cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.6. MODAL: CONFIGURE CONTRACT PRICING */}
      {showAddContractModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className={`${isLight ? 'bg-white text-slate-900' : 'bg-[#0f172a] text-white'} border ${themeClasses.subtleBorder} rounded-2xl max-w-md w-full p-5 space-y-4 my-8 shadow-2xl`}>
            <div className={`flex items-center justify-between pb-3 border-b ${themeClasses.subtleBorder}`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Configure Wholesale Contract Rate
              </h3>
              <button onClick={() => setShowAddContractModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3 text-xs">
              <div>
                <label className={themeClasses.secondaryText}>Select Customer:</label>
                <select
                  value={newContractForm.customerId}
                  onChange={(e) => setNewContractForm({ ...newContractForm, customerId: e.target.value })}
                  className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-medium`}
                >
                  {customers
                    .filter((c) => c.type !== 'retail')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.type})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className={themeClasses.secondaryText}>Select Medicine:</label>
                <select
                  value={newContractForm.productId}
                  onChange={(e) => setNewContractForm({ ...newContractForm, productId: e.target.value })}
                  className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-medium`}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Std Wholesale: ₹{p.defaultWholesalePrice})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={themeClasses.secondaryText}>Negotiated Wholesale Contract Rate (₹):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newContractForm.customRate}
                  onChange={(e) => setNewContractForm({ ...newContractForm, customRate: Number(e.target.value) })}
                  className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono font-bold text-emerald-600`}
                />
              </div>
              <div>
                <label className={themeClasses.secondaryText}>Contract Note / Terms:</label>
                <input
                  type="text"
                  value={newContractForm.note}
                  onChange={(e) => setNewContractForm({ ...newContractForm, note: e.target.value })}
                  placeholder="e.g. ICU contract rate or 500+ packs"
                  className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                />
              </div>

              <div className={`pt-3 border-t ${themeClasses.subtleBorder} flex justify-end gap-2`}>
                <button
                  type="button"
                  onClick={() => setShowAddContractModal(false)}
                  className={`px-3 py-1.5 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'} rounded-lg cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.7. MODAL: RECORD CREDIT PAYMENT */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className={`${isLight ? 'bg-white text-slate-900' : 'bg-[#0f172a] text-white'} border ${themeClasses.subtleBorder} rounded-2xl max-w-md w-full p-5 space-y-4 my-8 shadow-2xl`}>
            <div className={`flex items-center justify-between pb-3 border-b ${themeClasses.subtleBorder}`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Record Credit Settlement Payment
              </h3>
              <button onClick={() => setShowPaymentModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div className={`p-3 ${isLight ? 'bg-slate-50' : 'bg-slate-900'} rounded-lg border ${themeClasses.subtleBorder} space-y-1`}>
                <div className="font-bold text-sm">{showPaymentModal.businessName}</div>
                <div className={themeClasses.secondaryText}>{showPaymentModal.name} • {showPaymentModal.phone}</div>
                <div className="text-amber-600 font-mono text-sm pt-1 font-bold">
                  Current Due: ₹{showPaymentModal.currentOutstanding.toLocaleString()}
                </div>
              </div>

              <div>
                <label className={themeClasses.secondaryText}>Payment Amount Received (₹):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono text-base font-black text-emerald-600`}
                />
              </div>

              <div>
                <label className={themeClasses.secondaryText}>Payment Mode:</label>
                <select
                  value={paymentModeInput}
                  onChange={(e) => setPaymentModeInput(e.target.value as any)}
                  className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 uppercase font-mono font-semibold`}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="cheque">Bank Cheque</option>
                  <option value="neft">NEFT / RTGS</option>
                </select>
              </div>

              <div>
                <label className={themeClasses.secondaryText}>Reference / Notes:</label>
                <input
                  type="text"
                  value={paymentNoteInput}
                  onChange={(e) => setPaymentNoteInput(e.target.value)}
                  placeholder="e.g. Cheque #440192 or UPI Ref"
                  className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                />
              </div>

              <div className={`pt-3 border-t ${themeClasses.subtleBorder} flex justify-end gap-2`}>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(null)}
                  className={`px-3 py-1.5 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'} rounded-lg cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Record Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.8. MODAL: PROCESS SALES RETURN */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className={`${isLight ? 'bg-white text-slate-900' : 'bg-[#0f172a] text-white'} border ${themeClasses.subtleBorder} rounded-2xl max-w-md w-full p-5 space-y-4 my-8 shadow-2xl`}>
            <div className={`flex items-center justify-between pb-3 border-b ${themeClasses.subtleBorder}`}>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                Process Medicine Return (Restock & Refund)
              </h3>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessReturn} className="space-y-3 text-xs">
              <div>
                <label className={themeClasses.secondaryText}>Original Invoice Number:</label>
                <input
                  type="text"
                  required
                  value={returnInvoiceNoInput}
                  onChange={(e) => setReturnInvoiceNoInput(e.target.value)}
                  placeholder="e.g. RET-2026-0001 or WS-2026-0001"
                  className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono uppercase`}
                />
              </div>

              <div>
                <label className={themeClasses.secondaryText}>Quantity to Return:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={returnQtyInput}
                  onChange={(e) => setReturnQtyInput(Number(e.target.value))}
                  className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2 font-mono`}
                />
              </div>

              <div>
                <label className={themeClasses.secondaryText}>Return Reason:</label>
                <select
                  value={returnReasonInput}
                  onChange={(e) => setReturnReasonInput(e.target.value)}
                  className={`w-full mt-1 ${themeClasses.input} rounded-lg p-2`}
                >
                  <option value="Patient unneeded / course changed">Patient unneeded / course changed</option>
                  <option value="Damaged strip / seal defect">Damaged strip / seal defect</option>
                  <option value="Near expiry / recall">Near expiry / recall</option>
                  <option value="Wrong medicine dispensed">Wrong medicine dispensed</option>
                </select>
              </div>

              <div className={`pt-3 border-t ${themeClasses.subtleBorder} flex justify-end gap-2`}>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className={`px-3 py-1.5 ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'} rounded-lg cursor-pointer`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Restock & Issue Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MARG BOOKS STYLE FOOTER */}
      <footer className={`${isLight ? 'bg-white border-t border-slate-200 text-slate-500' : 'bg-[#0b101c] border-t border-slate-800 text-slate-500'} py-3 px-4 sm:px-6 text-xs print-hidden`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
            <span className="font-bold text-slate-800">Prince Pharma v2</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Marg Books Inspired Light UI</span>
            <span>•</span>
            <span>FEFO Batch Dispatched</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">Generic Salt Matching (F7)</span>
          </div>
          <div className="text-[11px] font-mono text-center sm:text-right">
            Form 20B (Retail) & Form 21B (Wholesale) • Production Ready
          </div>
        </div>
      </footer>
    </div>
  );
}
