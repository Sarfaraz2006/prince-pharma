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

export default function PrincePharmaApp() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<
    | 'billing'
    | 'inventory'
    | 'purchases'
    | 'pricing'
    | 'udhari'
    | 'expiry'
    | 'returns'
    | 'reports'
    | 'audit'
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

  // Modals State
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
  const [returnReasonInput, setReturnReasonInput] = useState<string>('Damaged / Patient returned');

  // Search input ref for quick keyboard focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load state from localStorage on initial client mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('pp_settings_v3');
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedProducts = localStorage.getItem('pp_products_v3');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedBatches = localStorage.getItem('pp_batches_v3');
      if (savedBatches) setBatches(JSON.parse(savedBatches));

      const savedInvoices = localStorage.getItem('pp_invoices_v3');
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

      const savedCustomers = localStorage.getItem('pp_customers_v3');
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

      const savedCustomerPrices = localStorage.getItem('pp_customer_prices_v3');
      if (savedCustomerPrices) setCustomerPrices(JSON.parse(savedCustomerPrices));

      const savedPurchases = localStorage.getItem('pp_purchases_v3');
      if (savedPurchases) setPurchases(JSON.parse(savedPurchases));

      const savedReturns = localStorage.getItem('pp_returns_v3');
      if (savedReturns) setSalesReturns(JSON.parse(savedReturns));

      const savedLogs = localStorage.getItem('pp_logs_v3');
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
    persist('pp_logs_v3', updated);
  };

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Keyboard Shortcuts (F1-F4, Enter, Esc)
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
      } else if (e.key === 'Escape') {
        setViewingInvoice(null);
        setShowAddProductModal(false);
        setShowAddBatchModal(false);
        setShowAddCustomerModal(false);
        setShowAddContractModal(false);
        setShowPaymentModal(null);
        setShowReturnModal(false);
        setMobileMenuOpen(false);
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

  // Overall Financial Totals
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
      persist('pp_customers_v3', updatedCustomers);
    }

    const updatedInvoices = [newInvoice, ...invoices];
    setBatches(updatedBatches);
    setInvoices(updatedInvoices);
    persist('pp_batches_v3', updatedBatches);
    persist('pp_invoices_v3', updatedInvoices);

    // Audit Log
    addAuditLog(
      'BILL_CREATED',
      newInvoice.invoiceNumber,
      `${saleType.toUpperCase()} sale of ₹${newInvoice.grandTotal.toFixed(2)} to ${newInvoice.customerName} via ${paymentMethod}. Batches depleted.`
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
    persist('pp_products_v3', updated);
    addAuditLog('PRODUCT_CREATE', created.name, `New medicine registered: ${created.name} (${created.packSize}${created.packUnit})`);
    setShowAddProductModal(false);
    notify(`Product "${created.name}" created successfully!`);
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

    // Update supplier outstanding
    const updatedSuppliers = suppliers.map((s) =>
      s.id === newBatchForm.supplierId ? { ...s, currentOutstanding: s.currentOutstanding + grandTotal } : s
    );

    const updatedBatches = [createdBatch, ...batches];
    const updatedPurchases = [newPurchase, ...purchases];

    setBatches(updatedBatches);
    setPurchases(updatedPurchases);
    setSuppliers(updatedSuppliers);
    persist('pp_batches_v3', updatedBatches);
    persist('pp_purchases_v3', updatedPurchases);
    persist('pp_suppliers_v3', updatedSuppliers);

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
    persist('pp_customers_v3', updated);
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
    persist('pp_customer_prices_v3', updated);
    const cust = customers.find((c) => c.id === newContractForm.customerId);
    const prod = products.find((p) => p.id === newContractForm.productId);
    addAuditLog('CONTRACT_RATE_SET', `${cust?.businessName} - ${prod?.name}`, `Contract price set to ₹${newContractForm.customRate}`);
    setShowAddContractModal(false);
    notify(`Special wholesale contract rate configured!`);
  };

  // Settle Udhari Payment Handler
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
    persist('pp_customers_v3', updated);

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

    // 1. Restore stock to batch
    const batchId = returnItem.allocations[0]?.batchId;
    const updatedBatches = batches.map((b) =>
      b.id === batchId ? { ...b, sellableStock: b.sellableStock + qtyToReturn } : b
    );

    // 2. Adjust customer balance if wholesale
    let updatedCustomers = [...customers];
    if (inv.customerId) {
      updatedCustomers = customers.map((c) =>
        c.id === inv.customerId
          ? { ...c, currentOutstanding: Math.max(0, c.currentOutstanding - refundAmount) }
          : c
      );
      setCustomers(updatedCustomers);
      persist('pp_customers_v3', updatedCustomers);
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
    persist('pp_batches_v3', updatedBatches);
    persist('pp_returns_v3', updatedReturns);

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
  const getWhatsAppShareUrl = (inv: Invoice) => {
    const text = `*PRINCE PHARMA - TAX INVOICE*\nInvoice: ${inv.invoiceNumber}\nDate: ${inv.date}\nBilled To: ${inv.customerName}\nTotal Amount: ₹${inv.grandTotal.toFixed(2)}\nPayment: ${inv.paymentMethod.toUpperCase()}\n\nThank you for choosing Prince Pharma! DL: ${settings.dlNumber20b}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
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

  return (
    <div className="flex flex-col min-h-screen bg-[#070b14] text-slate-200">
      {/* 1. TOP EXECUTIVE APP BAR (Stitch Style: Dense, Slate, Emerald Accents) */}
      <header className="sticky top-0 z-40 bg-[#0d1322] border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Store Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-white text-base shadow-sm shadow-emerald-950 shrink-0">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-white text-sm tracking-tight truncate max-w-[140px] sm:max-w-none">
                  {settings.name}
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Form 20B & 21B Active
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>GST: {settings.gstin}</span>
                <span>•</span>
                <span>DL 20B: {settings.dlNumber20b}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Ticker (Desktop) */}
          <div className="hidden xl:flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400 text-[11px]">Today:</span>
              <strong className="text-emerald-400 font-bold">₹{stats.todaySales.toLocaleString()}</strong>
              <span className="text-slate-500 text-[10px]">({stats.todayBillsCount})</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400 text-[11px]">Stock:</span>
              <strong className="text-white font-bold">{stats.totalStock}</strong>
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

          {/* Role Switcher & Mobile Menu Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Role dropdown on mobile, segmented tabs on desktop */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs">
              {(['Owner', 'Admin', 'Pharmacist', 'Cashier'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setUserRole(role);
                    notify(`Active role switched to ${role}`);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                    userRole === role ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <span className="sm:hidden text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-1 rounded">
              {userRole}
            </span>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Quick Stats Banner */}
        <div className="xl:hidden bg-[#0a0e1a] border-t border-slate-800/80 px-3 py-1.5 overflow-x-auto flex items-center gap-3 text-[11px] font-mono scrollbar-none">
          <div className="flex items-center gap-1 shrink-0 text-slate-300">
            <span>Today:</span>
            <strong className="text-emerald-400">₹{stats.todaySales.toLocaleString()}</strong>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 shrink-0 text-slate-300">
            <span>Stock:</span>
            <strong className="text-white">{stats.totalStock}</strong>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 shrink-0 text-amber-300">
            <span>Udhar:</span>
            <strong>₹{stats.totalUdhar.toLocaleString()}</strong>
          </div>
          {stats.nearExpiryCount > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1 shrink-0 text-rose-400 font-bold">
                <span>{stats.nearExpiryCount} Expiring</span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* 2. SUB-NAV TABS (Google Stitch Responsive Navigation) */}
      <nav className="bg-[#0b101c] border-b border-slate-800 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
          {[
            { id: 'billing', label: 'POS Billing', icon: ShoppingCart, hotkey: 'F1' },
            { id: 'inventory', label: 'FEFO Stock', icon: Boxes, hotkey: 'F2' },
            { id: 'purchases', label: 'Inward Purchases', icon: Truck },
            { id: 'pricing', label: 'Contract Matrix', icon: Users, hotkey: 'F3' },
            { id: 'udhari', label: 'Udhari Ledger', icon: CreditCard },
            { id: 'expiry', label: 'Expiry Watch', icon: Clock, hotkey: 'F4' },
            { id: 'returns', label: 'Returns', icon: RotateCcw },
            { id: 'reports', label: 'GST & Reports', icon: BarChart3 },
            { id: 'audit', label: 'Audit Trail', icon: FileText },
            { id: 'settings', label: 'Settings', icon: Settings },
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
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.hotkey && <span className="hidden sm:inline text-[9px] opacity-70 font-mono">({tab.hotkey})</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer (When hamburger menu is opened) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex">
          <div className="w-72 bg-[#0c1220] border-r border-slate-800 h-full p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                    P
                  </div>
                  <span className="font-bold text-white text-sm">{settings.name}</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono px-2">Navigation</span>
                {[
                  { id: 'billing', label: 'POS Billing Counter', icon: ShoppingCart },
                  { id: 'inventory', label: 'FEFO Physical Stock', icon: Boxes },
                  { id: 'purchases', label: 'Inward Purchases', icon: Truck },
                  { id: 'pricing', label: 'Wholesale Pricing Matrix', icon: Users },
                  { id: 'udhari', label: 'Udhari & Credit Ledger', icon: CreditCard },
                  { id: 'expiry', label: 'Expiry Watch & Quarantine', icon: Clock },
                  { id: 'returns', label: 'Sales & Purchase Returns', icon: RotateCcw },
                  { id: 'reports', label: 'GST Tax & Audit Reports', icon: BarChart3 },
                  { id: 'audit', label: 'System Audit Logs', icon: FileText },
                  { id: 'settings', label: 'Store Master Settings', icon: Settings },
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
                        activeTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role switch in mobile drawer */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Switch Role</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Owner', 'Admin', 'Pharmacist', 'Cashier'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      setMobileMenuOpen(false);
                      notify(`Role changed to ${role}`);
                    }}
                    className={`py-1.5 px-2 rounded text-xs font-medium cursor-pointer ${
                      userRole === role ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
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
                ? 'bg-emerald-950 text-emerald-200 border-emerald-700'
                : 'bg-rose-950 text-rose-200 border-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE VIEW */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-24 lg:pb-6">
        {/* ============================================================== */}
        {/* TAB 1: POS BILLING COUNTER (Split 2-Column Desktop + Mobile) */}
        {/* ============================================================== */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Fast Barcode Scanner, Channel Selector & Cart */}
            <div className="lg:col-span-7 space-y-4">
              {/* Channel Selector: Retail (Form 20B) vs Wholesale B2B (Form 21B) */}
              <div className="bg-[#0f172a] border border-slate-800 p-3 sm:p-4 rounded-xl shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mode:</span>
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

                  <span className="self-start sm:self-auto text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                    Single Inventory FEFO
                  </span>
                </div>

                {/* Customer Details Form */}
                {saleType === 'retail' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400">Patient / Customer Name:</label>
                      <input
                        type="text"
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                        placeholder="Walk-in Cash Patient"
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Mobile (For WhatsApp / SMS Memo):</label>
                      <input
                        type="tel"
                        value={walkinPhone}
                        onChange={(e) => setWalkinPhone(e.target.value)}
                        placeholder="e.g. 9820155555"
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-800 text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-[11px] text-slate-400 font-medium">
                        Select Institutional B2B Customer:
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Outstanding: <strong className="text-amber-400">₹{activeCustomer.currentOutstanding.toLocaleString()}</strong> / Limit: ₹{activeCustomer.creditLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-emerald-500"
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
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 text-xs font-bold transition cursor-pointer"
                        title="Add New Customer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono gap-1">
                      <span>DL: {activeCustomer.drugLicence}</span>
                      <span className="text-teal-400 font-semibold">Special Contract Rates Auto-Applied</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fast Medicine Search Bar with Barcode Scanner Emulation */}
              <div className="bg-[#0f172a] border border-slate-800 p-3 sm:p-4 rounded-xl shadow-xs space-y-3 relative">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={posSearchTerm}
                    onChange={(e) => setPosSearchTerm(e.target.value)}
                    placeholder="Scan Barcode or Type Medicine (e.g. Augmentin, Dolo, Pan 40)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-emerald-500 font-medium"
                  />
                </div>

                {/* Instant Search Dropdown */}
                {filteredProducts.length > 0 && (
                  <div className="absolute top-16 left-3 right-3 sm:left-4 sm:right-4 z-30 bg-[#090d16] border border-emerald-700/80 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                    {filteredProducts.map((p) => {
                      const rateInfo = getEffectiveRate(p);
                      const totalAvailable = batches
                        .filter((b) => b.productId === p.id && b.status === 'active' && new Date(b.expiryDate) > new Date())
                        .reduce((sum, b) => sum + b.sellableStock, 0);

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleAddToCart(p)}
                          className="p-3 hover:bg-slate-800/80 border-b border-slate-800/60 flex items-center justify-between cursor-pointer text-xs transition"
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

                {/* Quick Add Chips */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5">
                  <span className="text-[11px] text-slate-400 font-medium">Quick Add:</span>
                  {products.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAddToCart(p)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 text-[11px] font-mono transition cursor-pointer"
                    >
                      + {p.name.split(' ')[0]}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded border border-emerald-800 text-[11px] font-semibold transition cursor-pointer"
                  >
                    + New Product
                  </button>
                </div>
              </div>

              {/* Cart Table with Real-time FEFO Allocations */}
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
                        <th className="py-2 px-2 hidden sm:table-cell">FEFO Batch & Expiry</th>
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
                            {/* Mobile batch allocation display */}
                            <div className="sm:hidden mt-1 text-[10px] font-mono text-emerald-400">
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

                          {/* Qty +/- touch buttons */}
                          <td className="py-2.5 px-2 text-center">
                            <div className="inline-flex items-center border border-slate-700 rounded-lg bg-slate-900">
                              <button
                                onClick={() => handleQtyChange(idx, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono font-bold text-white text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQtyChange(idx, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Rate & Wholesale Contract indicator */}
                          <td className="py-2.5 px-2 text-right font-mono">
                            <div className="font-bold text-white">₹{item.unitRate.toFixed(2)}</div>
                            <div className="text-[10px] text-slate-500">MRP: ₹{item.product.mrp}</div>
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
                              className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1.5"
                              title="Delete Item"
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

                {/* Payment Selector and Finalize Action Bar */}
                <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <span className="text-xs text-slate-400 font-medium">Payment:</span>
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
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-950 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Complete & Print Invoice</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Real-Time Dynamic Tax Invoice Preview (Desktop: Visible / Mobile: Modal toggle) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-20 bg-white text-slate-900 rounded-xl p-5 shadow-2xl border border-slate-300 font-sans text-xs">
              {/* Formal Header */}
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
              <div className="py-1.5 text-center bg-slate-100 my-2 rounded font-bold text-xs uppercase tracking-wider text-slate-800 border border-slate-200">
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

              {/* Tax & Total Calculation Breakdown */}
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

              {/* Terms & Signatory */}
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

        {/* Mobile Sticky POS Bottom Floating Bar */}
        {activeTab === 'billing' && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0d1322] border-t border-slate-800 p-2.5 px-4 shadow-2xl flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-slate-400 font-mono">{cartItems.length} items selected</div>
              <div className="text-emerald-400 font-black font-mono text-base">₹{billSummary.total.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileInvoiceView(true)}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Invoice</span>
              </button>
              <button
                onClick={handleCompleteSale}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Bill & Print</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Tax Invoice Slide-up Modal */}
        {mobileInvoiceView && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-2">
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

              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-2">
                <h3 className="font-extrabold text-sm uppercase">{settings.name}</h3>
                <p className="text-[10px] text-slate-500">{settings.address}, {settings.city}</p>
                <div className="text-[9px] font-mono text-slate-700 font-bold">
                  GST: {settings.gstin} • DL 20B: {settings.dlNumber20b}
                </div>
              </div>

              {/* Items List */}
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-mono text-slate-500">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {cartAllocations.map((it, i) => (
                    <tr key={i}>
                      <td className="py-1 font-sans">{it.product.name}</td>
                      <td className="py-1 text-center font-bold">{it.quantity}</td>
                      <td className="py-1 text-right">₹{it.unitRate.toFixed(2)}</td>
                      <td className="py-1 text-right font-bold">₹{it.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Breakdown */}
              <div className="pt-2 border-t border-slate-200 space-y-1 text-right text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Taxable:</span>
                  <span>₹{billSummary.taxable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">GST (12%):</span>
                  <span>₹{(billSummary.cgst + billSummary.sgst).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300">
                  <span className="font-sans">Grand Total:</span>
                  <span className="text-emerald-700">₹{billSummary.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-2 bg-slate-50 rounded text-[10px] italic font-serif text-slate-700 border border-slate-200">
                Amount in words: {billSummary.amountInWords}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setMobileInvoiceView(false);
                    handleCompleteSale();
                  }}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Complete & Print Bill
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PHYSICAL INVENTORY & BATCH MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base">Physical Stock & FEFO Batch Ledger</h3>
                <p className="text-xs text-slate-400">
                  Single inventory pool for both retail and wholesale channels. Depletion occurs strictly by earliest expiry date.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowAddBatchModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inward Stock / Batch</span>
                </button>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Product</span>
                </button>
                <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-lg">
                  Total: <strong>{stats.totalStock} units</strong>
                </span>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
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
                              Rack: {prod?.rackLocation} • {prod?.packSize}{prod?.packUnit} • {prod?.schedule}
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
                                EXPIRED (LOCKED)
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
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: INWARD PURCHASES (Stock Inward Entry & Suppliers) */}
        {/* ============================================================== */}
        {activeTab === 'purchases' && (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base">Inward Purchases & Goods Receipt</h3>
                <p className="text-xs text-slate-400">
                  Stock received from authorized pharmaceutical distributors. Inward purchases auto-update batch inventory and supplier payables.
                </p>
              </div>
              <button
                onClick={() => setShowAddBatchModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record New Purchase</span>
              </button>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b101c] text-slate-400 text-[10px] uppercase font-mono tracking-wider border-b border-slate-800">
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
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                          {p.purchaseNumber}
                        </td>
                        <td className="py-2.5 px-2 font-medium text-white">{p.supplierName}</td>
                        <td className="py-2.5 px-2 font-mono text-slate-300">{p.supplierInvoiceNumber}</td>
                        <td className="py-2.5 px-2 font-mono text-slate-400">{p.date}</td>
                        <td className="py-2.5 px-2">
                          {p.items.map((it, idx) => (
                            <div key={idx} className="text-[11px] font-mono">
                              <span className="text-white font-sans">{it.productName}</span> • Batch: {it.batchNumber} • Qty: {it.quantity}
                            </div>
                          ))}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-400">
                          ₹{p.subtotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-white text-sm">
                          ₹{p.grandTotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-mono font-semibold uppercase">
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
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base">Wholesale Contract Pricing Matrix</h3>
                <p className="text-xs text-slate-400">
                  Institutional hospital, nursing home and clinic pricing rules. Automatically overrides standard wholesale catalog rates at POS.
                </p>
              </div>
              <button
                onClick={() => setShowAddContractModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
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
                        <span className="text-[11px] font-semibold text-slate-400">Negotiated Contract Rates:</span>
                        {contracts.length > 0 ? (
                          <div className="space-y-1.5 pt-1">
                            {contracts.map((cp, idx) => {
                              const prod = products.find((p) => p.id === cp.productId);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 text-xs font-mono"
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

        {/* ============================================================== */}
        {/* TAB 5: UDHARI / CUSTOMER CREDIT LEDGER */}
        {/* ============================================================== */}
        {activeTab === 'udhari' && (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base">Udhari / Customer Credit Accounts</h3>
                <p className="text-xs text-slate-400">
                  Reliable customer ledger: Opening Balance + Credit Sales - Payments - Returns = Current Outstanding.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-slate-400 text-xs">Total Store Outstanding:</span>
                <div className="text-lg font-bold text-amber-400">₹{stats.totalUdhar.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
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
                                setShowPaymentModal(c);
                                setPaymentAmountInput(String(c.currentOutstanding));
                              }}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                              Record Payment
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
        {/* TAB 6: EXPIRY WATCH & QUARANTINE */}
        {/* ============================================================== */}
        {activeTab === 'expiry' && (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base">Expiry Watch & Safe Disposal</h3>
                <p className="text-xs text-slate-400">
                  Batches nearing expiry (within {settings.nearExpiryDays} days) flagged for priority dispatch or supplier return. Expired medicines are permanently locked.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-1 rounded-lg">
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
                          {isExpired ? 'EXPIRED (BLOCKED)' : 'NEAR EXPIRY'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-mono space-y-1">
                        <div>Batch: <strong className="text-white">{b.batchNumber}</strong></div>
                        <div>Expiry: <strong className="text-white">{b.expiryDate}</strong></div>
                        <div>Current Stock: <strong className="text-white">{b.sellableStock} units</strong></div>
                        <div>Location: <span className="text-slate-400">{prod?.rackLocation}</span></div>
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
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base">Sales & Purchase Returns Management</h3>
                <p className="text-xs text-slate-400">
                  Process patient and wholesale medicine returns. Stock is atomically returned to the original batch and customer ledger/credit is refunded.
                </p>
              </div>
              <button
                onClick={() => setShowReturnModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Process Sales Return</span>
              </button>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b101c] text-slate-400 text-[10px] uppercase font-mono tracking-wider border-b border-slate-800">
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
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {salesReturns.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-400">{r.returnNumber}</td>
                        <td className="py-2.5 px-2 font-mono text-slate-300">{r.originalInvoiceNumber}</td>
                        <td className="py-2.5 px-2 font-mono text-slate-400">{r.date}</td>
                        <td className="py-2.5 px-2 font-medium text-white">{r.customerName}</td>
                        <td className="py-2.5 px-2 font-mono text-slate-300">
                          {r.items.map((it, idx) => (
                            <span key={idx}>
                              {it.productName} ({it.quantity} units) - {it.reason}
                            </span>
                          ))}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-rose-400 text-sm">
                          ₹{r.refundAmount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono font-semibold">
                            RESTOCKED
                          </span>
                        </td>
                      </tr>
                    ))}
                    {salesReturns.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500 font-mono text-xs">
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
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-base">Invoices & GST Sales Tax Register</h3>
                <p className="text-xs text-slate-400">
                  Permanent snapshots of all historical invoices. Retains GST rates, drug license numbers and batch allocations for tax audit.
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export GST CSV</span>
              </button>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
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
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 9: SYSTEM AUDIT LOG TRAIL */}
        {/* ============================================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs">
              <h3 className="font-bold text-white text-base">Immutable System Audit Trail</h3>
              <p className="text-xs text-slate-400">
                Audits sales, inward purchases, stock movements, price changes, and payments in compliance with pharmacy regulations.
              </p>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b101c] text-slate-400 text-[10px] uppercase font-mono tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-2">Action</th>
                      <th className="py-2.5 px-2">User (Role)</th>
                      <th className="py-2.5 px-2">Entity</th>
                      <th className="py-2.5 px-3">Activity Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-400">{log.timestamp}</td>
                        <td className="py-2.5 px-2">
                          <span className="text-emerald-400 font-bold">{log.action}</span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-300">
                          {log.user} ({log.role})
                        </td>
                        <td className="py-2.5 px-2 text-teal-300">{log.entity}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-300">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 10: SETTINGS & BACKUP */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-xl shadow-xs">
              <h3 className="font-bold text-white text-base">Store & Pharmacy Master Settings</h3>
              <p className="text-xs text-slate-400">
                Configure your retail and wholesale drug licenses, GSTIN, business address, and print defaults.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                persist('pp_settings_v3', settings);
                addAuditLog('SETTINGS_UPDATE', 'Pharmacy Profile', 'Store settings and license information updated.');
                notify('Settings saved successfully!');
              }}
              className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-medium">Pharmacy / Business Name:</label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Tagline / Subtitle:</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">GSTIN (27-Maharashtra):</label>
                  <input
                    type="text"
                    value={settings.gstin}
                    onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">PAN Number:</label>
                  <input
                    type="text"
                    value={settings.pan}
                    onChange={(e) => setSettings({ ...settings, pan: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Retail Drug License (Form 20B):</label>
                  <input
                    type="text"
                    value={settings.dlNumber20b}
                    onChange={(e) => setSettings({ ...settings, dlNumber20b: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Wholesale Drug License (Form 21B):</label>
                  <input
                    type="text"
                    value={settings.dlNumber21b}
                    onChange={(e) => setSettings({ ...settings, dlNumber21b: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-400 font-medium">Physical Shop Address:</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">City / Area:</label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">PIN Code:</label>
                  <input
                    type="text"
                    value={settings.pincode}
                    onChange={(e) => setSettings({ ...settings, pincode: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Near-Expiry Warning Threshold (Days):</label>
                  <input
                    type="number"
                    value={settings.nearExpiryDays}
                    onChange={(e) => setSettings({ ...settings, nearExpiryDays: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Default Print Format:</label>
                  <select
                    value={settings.defaultPrintFormat}
                    onChange={(e) => setSettings({ ...settings, defaultPrintFormat: e.target.value as any })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="A4">A4 Full Tax Invoice</option>
                    <option value="80mm">80mm Thermal Receipt</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Save Store Settings
                </button>
              </div>
            </form>

            {/* Backup & Factory Reset Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm">Data Backup & Factory Reset</h4>
              <p className="text-slate-400">
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
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold border border-slate-700 cursor-pointer"
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
                  className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-lg font-semibold border border-rose-800 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
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
                <a
                  href={getWhatsAppShareUrl(viewingInvoice)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
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

      {/* 4.2. MODAL: ADD NEW MEDICINE / PRODUCT */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 text-white rounded-2xl max-w-lg w-full p-5 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-400" />
                Register New Product in Master
              </h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-400">Medicine Trade Name:</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    placeholder="e.g. Calpol 500 Suspension"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Salt / Generic Composition:</label>
                  <input
                    type="text"
                    value={newProductForm.genericName}
                    onChange={(e) => setNewProductForm({ ...newProductForm, genericName: e.target.value })}
                    placeholder="e.g. Paracetamol 250mg/5ml"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Manufacturer / Brand:</label>
                  <input
                    type="text"
                    value={newProductForm.manufacturer}
                    onChange={(e) => setNewProductForm({ ...newProductForm, manufacturer: e.target.value })}
                    placeholder="e.g. GSK Pharma"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Dosage Form:</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value as any })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
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
                  <label className="text-slate-400">Pack Size & Unit:</label>
                  <div className="flex gap-1.5 mt-1">
                    <input
                      type="number"
                      value={newProductForm.packSize}
                      onChange={(e) => setNewProductForm({ ...newProductForm, packSize: Number(e.target.value) })}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                    <input
                      type="text"
                      value={newProductForm.packUnit}
                      onChange={(e) => setNewProductForm({ ...newProductForm, packUnit: e.target.value })}
                      placeholder="strip/bottle"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400">Retail MRP (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductForm.mrp}
                    onChange={(e) => setNewProductForm({ ...newProductForm, mrp: Number(e.target.value), defaultRetailPrice: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Default Wholesale Trade Price (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductForm.defaultWholesalePrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, defaultWholesalePrice: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Rack / Shelf Location:</label>
                  <input
                    type="text"
                    value={newProductForm.rackLocation}
                    onChange={(e) => setNewProductForm({ ...newProductForm, rackLocation: e.target.value })}
                    placeholder="Rack A-02"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Drug Schedule:</label>
                  <select
                    value={newProductForm.schedule}
                    onChange={(e) => setNewProductForm({ ...newProductForm, schedule: e.target.value as any })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  >
                    <option value="OTC">OTC (Over the Counter)</option>
                    <option value="H">Schedule H (Rx)</option>
                    <option value="H1">Schedule H1 (Controlled Antibiotic)</option>
                    <option value="X">Schedule X (Narcotic)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.3. MODAL: INWARD PURCHASE / ADD BATCH */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 text-white rounded-2xl max-w-lg w-full p-5 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                Record Stock Inward / Add Batch
              </h3>
              <button onClick={() => setShowAddBatchModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Supplier / Distributor:</label>
                  <select
                    value={newBatchForm.supplierId}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, supplierId: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400">Supplier Bill / Invoice #:</label>
                  <input
                    type="text"
                    value={newBatchForm.invoiceNumber}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, invoiceNumber: e.target.value })}
                    placeholder="e.g. INV-CIPLA-9021"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400">Select Medicine:</label>
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
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.manufacturer})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400">Batch Number:</label>
                  <input
                    type="text"
                    required
                    value={newBatchForm.batchNumber}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, batchNumber: e.target.value })}
                    placeholder="e.g. DL-26K04"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Expiry Date (YYYY-MM-DD):</label>
                  <input
                    type="date"
                    required
                    value={newBatchForm.expiryDate}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, expiryDate: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Quantity Received:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBatchForm.quantity}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, quantity: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Free Quantity (Bonus):</label>
                  <input
                    type="number"
                    min="0"
                    value={newBatchForm.freeQuantity}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, freeQuantity: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Purchase Rate / Cost (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newBatchForm.purchaseRate}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, purchaseRate: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Wholesale Selling Rate (₹):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newBatchForm.wholesalePrice}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, wholesalePrice: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Add to FEFO Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.4. MODAL: ADD NEW CUSTOMER */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 text-white rounded-2xl max-w-lg w-full p-5 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Register New Customer / Hospital
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-400">Business / Clinic / Hospital Name:</label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.businessName}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, businessName: e.target.value })}
                    placeholder="e.g. LifeCare Multi-Speciality Hospital"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Contact Person Name:</label>
                  <input
                    type="text"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    placeholder="Dr. R. K. Singhal"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Customer Type:</label>
                  <select
                    value={newCustomerForm.type}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, type: e.target.value as any })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic / Nursing Home</option>
                    <option value="wholesale">Wholesale Chemist</option>
                    <option value="retail">Retail Patient</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400">Phone Number:</label>
                  <input
                    type="tel"
                    required
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">GSTIN Number:</label>
                  <input
                    type="text"
                    value={newCustomerForm.gstin}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, gstin: e.target.value })}
                    placeholder="27AABCL9988P1Z5"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Drug License Number:</label>
                  <input
                    type="text"
                    value={newCustomerForm.drugLicence}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, drugLicence: e.target.value })}
                    placeholder="20B/MH-TZ-776655"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Credit Limit (₹):</label>
                  <input
                    type="number"
                    value={newCustomerForm.creditLimit}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, creditLimit: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400">Billing Address:</label>
                  <input
                    type="text"
                    value={newCustomerForm.billingAddress}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, billingAddress: e.target.value })}
                    placeholder="Shop/Floor, Complex, Road, City"
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.5. MODAL: CONFIGURE CONTRACT PRICING */}
      {showAddContractModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 text-white rounded-2xl max-w-md w-full p-5 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-400" />
                Configure Wholesale Contract Rate
              </h3>
              <button onClick={() => setShowAddContractModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Select Customer:</label>
                <select
                  value={newContractForm.customerId}
                  onChange={(e) => setNewContractForm({ ...newContractForm, customerId: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
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
                <label className="text-slate-400">Select Medicine:</label>
                <select
                  value={newContractForm.productId}
                  onChange={(e) => setNewContractForm({ ...newContractForm, productId: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Std Wholesale: ₹{p.defaultWholesalePrice})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400">Negotiated Custom Wholesale Rate (₹):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newContractForm.customRate}
                  onChange={(e) => setNewContractForm({ ...newContractForm, customRate: Number(e.target.value) })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400">Contract Note / Terms:</label>
                <input
                  type="text"
                  value={newContractForm.note}
                  onChange={(e) => setNewContractForm({ ...newContractForm, note: e.target.value })}
                  placeholder="e.g. ICU contract rate or 500+ packs"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContractModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.6. MODAL: RECORD UDHARI PAYMENT */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 text-white rounded-2xl max-w-md w-full p-5 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Record Udhari / Dues Payment
              </h3>
              <button onClick={() => setShowPaymentModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-white text-sm">{showPaymentModal.businessName}</div>
                <div className="text-slate-400">{showPaymentModal.name} • {showPaymentModal.phone}</div>
                <div className="text-amber-400 font-mono text-sm pt-1">
                  Current Due: <strong>₹{showPaymentModal.currentOutstanding.toLocaleString()}</strong>
                </div>
              </div>

              <div>
                <label className="text-slate-400">Payment Amount Received (₹):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-base font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="text-slate-400">Payment Mode:</label>
                <select
                  value={paymentModeInput}
                  onChange={(e) => setPaymentModeInput(e.target.value as any)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white uppercase font-mono"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="cheque">Bank Cheque</option>
                  <option value="neft">NEFT / RTGS</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400">Reference / Notes:</label>
                <input
                  type="text"
                  value={paymentNoteInput}
                  onChange={(e) => setPaymentNoteInput(e.target.value)}
                  placeholder="e.g. Cheque #440192 or UPI Ref"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Record Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.7. MODAL: PROCESS SALES RETURN */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-800 text-white rounded-2xl max-w-md w-full p-5 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                Process Medicine Return (Restock & Refund)
              </h3>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessReturn} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Original Invoice Number:</label>
                <input
                  type="text"
                  required
                  value={returnInvoiceNoInput}
                  onChange={(e) => setReturnInvoiceNoInput(e.target.value)}
                  placeholder="e.g. RET-2026-0001 or WS-2026-0001"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="text-slate-400">Quantity to Return:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={returnQtyInput}
                  onChange={(e) => setReturnQtyInput(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400">Return Reason:</label>
                <select
                  value={returnReasonInput}
                  onChange={(e) => setReturnReasonInput(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Patient unneeded / course changed">Patient unneeded / course changed</option>
                  <option value="Damaged strip / seal defect">Damaged strip / seal defect</option>
                  <option value="Near expiry / recall">Near expiry / recall</option>
                  <option value="Wrong medicine dispensed">Wrong medicine dispensed</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Restock & Issue Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. FOOTER */}
      <footer className="bg-[#0b101c] border-t border-slate-800 py-3 px-4 sm:px-6 text-xs text-slate-500 print-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
            <span className="font-semibold text-slate-300">Prince Pharma v2</span>
            <span>•</span>
            <span className="text-emerald-400">Single Physical Inventory Engine</span>
            <span>•</span>
            <span>FEFO Batch Dispatched</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono text-center sm:text-right">
            Form 20B (Retail) & Form 21B (Wholesale) • Production Ready
          </div>
        </div>
      </footer>
    </div>
  );
}
