export interface Product {
  id: string;
  name: string;
  brand: string;
  genericName: string; // Salt composition
  manufacturer: string;
  category: 'tablet' | 'syrup' | 'injection' | 'capsule' | 'ointment' | 'drops';
  packSize: number;
  packUnit: string;
  barcode: string;
  hsnCode: string;
  gstRate: number; // e.g. 12
  mrp: number;
  defaultRetailPrice: number;
  defaultWholesalePrice: number;
  reorderLevel: number;
  rackLocation: string;
  schedule: 'OTC' | 'H' | 'H1' | 'X';
  prescriptionRequired: boolean;
  isActive: boolean;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  purchaseDate: string;
  purchaseRate: number;
  mrp: number;
  retailPrice: number;
  wholesalePrice: number;
  supplierId: string;
  sellableStock: number;
  damagedStock: number;
  initialStock: number;
  status: 'active' | 'quarantine' | 'expired';
}

export interface Customer {
  id: string;
  name: string;
  businessName: string;
  type: 'retail' | 'wholesale' | 'hospital' | 'clinic';
  phone: string;
  email?: string;
  billingAddress: string;
  gstin?: string;
  drugLicence?: string;
  creditLimit: number;
  openingBalance: number;
  currentOutstanding: number;
  isActive: boolean;
}

export interface CustomerProductPrice {
  customerId: string;
  productId: string;
  customRate: number;
  note?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  drugLicence: string;
  address: string;
  creditDays: number;
  openingBalance: number;
  currentOutstanding: number;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  freeQuantity: number;
  purchaseRate: number;
  mrp: number;
  wholesalePrice: number;
  gstRate: number;
  taxableAmount: number;
  totalAmount: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierInvoiceNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  subtotal: number;
  gstTotal: number;
  grandTotal: number;
  paymentStatus: 'paid' | 'credit';
  items: PurchaseItem[];
}

export interface SalesReturnItem {
  productId: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  rate: number;
  total: number;
  reason: string;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  originalInvoiceNumber: string;
  date: string;
  customerName: string;
  refundAmount: number;
  items: SalesReturnItem[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  details: string;
}

export interface InvoiceItemAllocation {
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  rate: number;
  mrp: number;
  amount: number;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  hsnCode: string;
  gstRate: number;
  quantity: number;
  freeQuantity: number;
  mrp: number;
  unitPrice: number;
  discountPercent: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  allocations: InvoiceItemAllocation[];
  isManualOverride?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'retail' | 'wholesale';
  date: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerGstin?: string;
  customerDl?: string;
  doctorName?: string;
  paymentMethod: 'cash' | 'upi' | 'card' | 'credit' | 'split';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  subtotal: number;
  discountTotal: number;
  taxableTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
  amountInWords: string;
  items: InvoiceItem[];
  notes?: string;
}

export interface PharmacySettings {
  name: string;
  tagline: string;
  dlNumber20b: string;
  dlNumber21b: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  retailPrefix: string;
  wholesalePrefix: string;
  nearExpiryDays: number;
  defaultPrintFormat: 'A4' | '80mm';
  theme: 'light' | 'dark';
}

export const INITIAL_SETTINGS: PharmacySettings = {
  name: 'Prince Pharma',
  tagline: 'Retail & Wholesale Chemists & Druggists (One Physical Store)',
  dlNumber20b: '20B/MH-TZ-289410',
  dlNumber21b: '21B/MH-TZ-289411',
  gstin: '27AABCP1234F1Z8',
  pan: 'AABCP1234F',
  address: 'Shop No. 2 & 3, Sai Arcade, Near Railway Station, Gokhale Road',
  city: 'Thane West',
  state: 'Maharashtra',
  pincode: '400602',
  phone: '+91 98201 54321',
  email: 'princepharma.thane@gmail.com',
  retailPrefix: 'RET-',
  wholesalePrefix: 'WS-',
  nearExpiryDays: 90,
  defaultPrintFormat: 'A4',
  theme: 'light',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Dolo 650 Tablet',
    brand: 'Dolo',
    genericName: 'Paracetamol IP 650mg',
    manufacturer: 'Micro Labs Ltd',
    category: 'tablet',
    packSize: 15,
    packUnit: 'strip',
    barcode: '8901117001015',
    hsnCode: '30049060',
    gstRate: 12,
    mrp: 33.60,
    defaultRetailPrice: 33.60,
    defaultWholesalePrice: 27.00,
    reorderLevel: 25,
    rackLocation: 'Rack A-01',
    schedule: 'OTC',
    prescriptionRequired: false,
    isActive: true,
  },
  {
    id: 'prod-1b',
    name: 'Crocin 650 Advance Tablet',
    brand: 'Crocin',
    genericName: 'Paracetamol IP 650mg',
    manufacturer: 'GlaxoSmithKline (GSK)',
    category: 'tablet',
    packSize: 15,
    packUnit: 'strip',
    barcode: '8901043001122',
    hsnCode: '30049060',
    gstRate: 12,
    mrp: 34.00,
    defaultRetailPrice: 34.00,
    defaultWholesalePrice: 27.50,
    reorderLevel: 20,
    rackLocation: 'Rack A-02',
    schedule: 'OTC',
    prescriptionRequired: false,
    isActive: true,
  },
  {
    id: 'prod-1c',
    name: 'Calpol 650 Tablet',
    brand: 'Calpol',
    genericName: 'Paracetamol IP 650mg',
    manufacturer: 'GSK Consumer Healthcare',
    category: 'tablet',
    packSize: 15,
    packUnit: 'strip',
    barcode: '8901043009988',
    hsnCode: '30049060',
    gstRate: 12,
    mrp: 33.50,
    defaultRetailPrice: 33.50,
    defaultWholesalePrice: 26.80,
    reorderLevel: 20,
    rackLocation: 'Rack A-03',
    schedule: 'OTC',
    prescriptionRequired: false,
    isActive: true,
  },
  {
    id: 'prod-2',
    name: 'Augmentin 625 Duo Tablet',
    brand: 'Augmentin',
    genericName: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    manufacturer: 'GlaxoSmithKline (GSK)',
    category: 'tablet',
    packSize: 10,
    packUnit: 'strip',
    barcode: '8901043003021',
    hsnCode: '30041090',
    gstRate: 12,
    mrp: 215.00,
    defaultRetailPrice: 215.00,
    defaultWholesalePrice: 178.00,
    reorderLevel: 20,
    rackLocation: 'Rack B-03 (Rx Antibiotics)',
    schedule: 'H1',
    prescriptionRequired: true,
    isActive: true,
  },
  {
    id: 'prod-2b',
    name: 'Moxikind-CV 625 Tablet',
    brand: 'Moxikind',
    genericName: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    manufacturer: 'Mankind Pharma Ltd',
    category: 'tablet',
    packSize: 10,
    packUnit: 'strip',
    barcode: '8902043004455',
    hsnCode: '30041090',
    gstRate: 12,
    mrp: 195.00,
    defaultRetailPrice: 195.00,
    defaultWholesalePrice: 160.00,
    reorderLevel: 15,
    rackLocation: 'Rack B-04',
    schedule: 'H1',
    prescriptionRequired: true,
    isActive: true,
  },
  {
    id: 'prod-3',
    name: 'Pan 40 Tablet',
    brand: 'Pan',
    genericName: 'Pantoprazole Sodium 40mg',
    manufacturer: 'Alkem Laboratories Ltd',
    category: 'tablet',
    packSize: 15,
    packUnit: 'strip',
    barcode: '8901234005032',
    hsnCode: '30049099',
    gstRate: 12,
    mrp: 155.00,
    defaultRetailPrice: 155.00,
    defaultWholesalePrice: 125.00,
    reorderLevel: 30,
    rackLocation: 'Rack C-02',
    schedule: 'H',
    prescriptionRequired: true,
    isActive: true,
  },
  {
    id: 'prod-3b',
    name: 'Pantocid 40 Tablet',
    brand: 'Pantocid',
    genericName: 'Pantoprazole Sodium 40mg',
    manufacturer: 'Sun Pharmaceutical Industries',
    category: 'tablet',
    packSize: 15,
    packUnit: 'strip',
    barcode: '8901111007788',
    hsnCode: '30049099',
    gstRate: 12,
    mrp: 162.00,
    defaultRetailPrice: 162.00,
    defaultWholesalePrice: 130.00,
    reorderLevel: 25,
    rackLocation: 'Rack C-03',
    schedule: 'H',
    prescriptionRequired: true,
    isActive: true,
  },
  {
    id: 'prod-4',
    name: 'Azithral 500 Tablet',
    brand: 'Azithral',
    genericName: 'Azithromycin 500mg',
    manufacturer: 'Alembic Pharmaceuticals Ltd',
    category: 'tablet',
    packSize: 5,
    packUnit: 'strip',
    barcode: '8901556007043',
    hsnCode: '30042099',
    gstRate: 12,
    mrp: 135.00,
    defaultRetailPrice: 135.00,
    defaultWholesalePrice: 108.00,
    reorderLevel: 15,
    rackLocation: 'Rack B-04',
    schedule: 'H',
    prescriptionRequired: true,
    isActive: true,
  },
  {
    id: 'prod-4b',
    name: 'Azee 500 Tablet',
    brand: 'Azee',
    genericName: 'Azithromycin 500mg',
    manufacturer: 'Cipla Ltd',
    category: 'tablet',
    packSize: 5,
    packUnit: 'strip',
    barcode: '8901115003322',
    hsnCode: '30042099',
    gstRate: 12,
    mrp: 132.00,
    defaultRetailPrice: 132.00,
    defaultWholesalePrice: 105.00,
    reorderLevel: 20,
    rackLocation: 'Rack B-05',
    schedule: 'H',
    prescriptionRequired: true,
    isActive: true,
  },
  {
    id: 'prod-5',
    name: 'Telma 40 Tablet',
    brand: 'Telma',
    genericName: 'Telmisartan 40mg',
    manufacturer: 'Glenmark Pharmaceuticals',
    category: 'tablet',
    packSize: 30,
    packUnit: 'strip',
    barcode: '8901889009054',
    hsnCode: '30049099',
    gstRate: 12,
    mrp: 280.00,
    defaultRetailPrice: 280.00,
    defaultWholesalePrice: 235.00,
    reorderLevel: 10,
    rackLocation: 'Rack D-01',
    schedule: 'H',
    prescriptionRequired: true,
    isActive: true,
  },
  {
    id: 'prod-6',
    name: 'Monocef 1g Injection',
    brand: 'Monocef',
    genericName: 'Ceftriaxone Sodium 1000mg',
    manufacturer: 'Aristo Pharmaceuticals',
    category: 'injection',
    packSize: 1,
    packUnit: 'vial',
    barcode: '8902001011065',
    hsnCode: '30049099',
    gstRate: 12,
    mrp: 68.50,
    defaultRetailPrice: 68.50,
    defaultWholesalePrice: 52.00,
    reorderLevel: 40,
    rackLocation: 'Cold Storage / Shelf CS-1',
    schedule: 'H1',
    prescriptionRequired: true,
    isActive: true,
  },
];

export const INITIAL_BATCHES: Batch[] = [
  // Product 1: Dolo 650 (2 batches for FEFO)
  {
    id: 'bat-101',
    productId: 'prod-1',
    batchNumber: 'DL-24A01',
    expiryDate: '2026-12-31',
    purchaseDate: '2025-01-10',
    purchaseRate: 21.00,
    mrp: 33.60,
    retailPrice: 33.60,
    wholesalePrice: 27.00,
    supplierId: 'sup-1',
    sellableStock: 80,
    damagedStock: 0,
    initialStock: 150,
    status: 'active',
  },
  {
    id: 'bat-102',
    productId: 'prod-1',
    batchNumber: 'DL-25C09',
    expiryDate: '2027-08-31',
    purchaseDate: '2025-08-15',
    purchaseRate: 21.50,
    mrp: 33.60,
    retailPrice: 33.60,
    wholesalePrice: 27.00,
    supplierId: 'sup-1',
    sellableStock: 200,
    damagedStock: 0,
    initialStock: 200,
    status: 'active',
  },
  // Product 1b: Crocin 650
  {
    id: 'bat-crocin-01',
    productId: 'prod-1b',
    batchNumber: 'CRC-9901',
    expiryDate: '2027-04-30',
    purchaseDate: '2025-05-10',
    purchaseRate: 22.00,
    mrp: 34.00,
    retailPrice: 34.00,
    wholesalePrice: 27.50,
    supplierId: 'sup-2',
    sellableStock: 120,
    damagedStock: 0,
    initialStock: 150,
    status: 'active',
  },
  // Product 2: Augmentin 625 Duo
  {
    id: 'bat-201',
    productId: 'prod-2',
    batchNumber: 'AUG-8820',
    expiryDate: '2027-03-31',
    purchaseDate: '2025-04-12',
    purchaseRate: 152.00,
    mrp: 215.00,
    retailPrice: 215.00,
    wholesalePrice: 178.00,
    supplierId: 'sup-2',
    sellableStock: 65,
    damagedStock: 0,
    initialStock: 100,
    status: 'active',
  },
  // Product 2b: Moxikind-CV 625
  {
    id: 'bat-mox-01',
    productId: 'prod-2b',
    batchNumber: 'MOX-4412',
    expiryDate: '2027-05-31',
    purchaseDate: '2025-06-01',
    purchaseRate: 135.00,
    mrp: 195.00,
    retailPrice: 195.00,
    wholesalePrice: 160.00,
    supplierId: 'sup-3',
    sellableStock: 75,
    damagedStock: 0,
    initialStock: 100,
    status: 'active',
  },
  // Product 3: Pan 40
  {
    id: 'bat-301',
    productId: 'prod-3',
    batchNumber: 'PAN-7742',
    expiryDate: '2026-11-30',
    purchaseDate: '2024-12-05',
    purchaseRate: 98.00,
    mrp: 155.00,
    retailPrice: 155.00,
    wholesalePrice: 125.00,
    supplierId: 'sup-3',
    sellableStock: 45,
    damagedStock: 0,
    initialStock: 120,
    status: 'active',
  },
  // Product 3b: Pantocid 40
  {
    id: 'bat-pnt-01',
    productId: 'prod-3b',
    batchNumber: 'PNT-3310',
    expiryDate: '2027-07-31',
    purchaseDate: '2025-07-15',
    purchaseRate: 102.00,
    mrp: 162.00,
    retailPrice: 162.00,
    wholesalePrice: 130.00,
    supplierId: 'sup-1',
    sellableStock: 90,
    damagedStock: 0,
    initialStock: 100,
    status: 'active',
  },
  // Product 4: Azithral 500
  {
    id: 'bat-401',
    productId: 'prod-4',
    batchNumber: 'AZI-5011',
    expiryDate: '2027-06-30',
    purchaseDate: '2025-07-02',
    purchaseRate: 92.00,
    mrp: 135.00,
    retailPrice: 135.00,
    wholesalePrice: 108.00,
    supplierId: 'sup-2',
    sellableStock: 90,
    damagedStock: 0,
    initialStock: 100,
    status: 'active',
  },
  // Product 5: Telma 40
  {
    id: 'bat-501',
    productId: 'prod-5',
    batchNumber: 'TLM-9104',
    expiryDate: '2027-09-30',
    purchaseDate: '2025-09-18',
    purchaseRate: 185.00,
    mrp: 280.00,
    retailPrice: 280.00,
    wholesalePrice: 235.00,
    supplierId: 'sup-1',
    sellableStock: 50,
    damagedStock: 0,
    initialStock: 60,
    status: 'active',
  },
  // Expired Batch (Strictly blocked from normal sales)
  {
    id: 'bat-exp-01',
    productId: 'prod-1',
    batchNumber: 'DL-21EXP',
    expiryDate: '2023-05-31',
    purchaseDate: '2021-06-01',
    purchaseRate: 18.00,
    mrp: 29.50,
    retailPrice: 29.50,
    wholesalePrice: 24.00,
    supplierId: 'sup-1',
    sellableStock: 15,
    damagedStock: 15,
    initialStock: 100,
    status: 'expired',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-walkin',
    name: 'Walk-in Cash Patient',
    businessName: 'Walk-in Retail',
    type: 'retail',
    phone: '9999999999',
    billingAddress: 'Local Thane Patient',
    creditLimit: 0,
    openingBalance: 0,
    currentOutstanding: 0,
    isActive: true,
  },
  {
    id: 'cust-krishna',
    name: 'Dr. A. K. Joshi (Medical Director)',
    businessName: 'Shree Krishna Multi-Speciality Hospital',
    type: 'hospital',
    phone: '+91 98200 88776',
    email: 'purchase@krishnahospital.org',
    billingAddress: 'Near Talao Pali, Charai, Thane West - 400601',
    gstin: '27AABCK8899E1Z2',
    drugLicence: '20B/MH-TZ-554433',
    creditLimit: 150000,
    openingBalance: 12500,
    currentOutstanding: 34500,
    isActive: true,
  },
  {
    id: 'cust-aayush',
    name: 'Dr. Priya Desai',
    businessName: 'Aayush Daycare Clinic & Nursing Home',
    type: 'clinic',
    phone: '+91 98199 44332',
    email: 'aayushclinic.thane@gmail.com',
    billingAddress: '1st Floor, City Center, Ghodbunder Road, Thane West - 400607',
    gstin: '27AAACA1122K1Z7',
    drugLicence: '20B/MH-TZ-665544',
    creditLimit: 75000,
    openingBalance: 5000,
    currentOutstanding: 14200,
    isActive: true,
  },
  {
    id: 'cust-city',
    name: 'Ramesh Shah (Partner)',
    businessName: 'City Medicos & Chemist',
    type: 'wholesale',
    phone: '+91 98211 77665',
    email: 'citymedicos.wholesales@gmail.com',
    billingAddress: 'Shop 14, Station Road, Mulund West - 400080',
    gstin: '27AACCC9911L1Z0',
    drugLicence: '21B/MH-TZ-889900',
    creditLimit: 200000,
    openingBalance: 0,
    currentOutstanding: 58000,
    isActive: true,
  },
];

export const INITIAL_CUSTOMER_PRICES: CustomerProductPrice[] = [
  {
    customerId: 'cust-krishna',
    productId: 'prod-1',
    customRate: 26.00,
    note: 'Contract rate: 1000+ strips/month',
  },
  {
    customerId: 'cust-krishna',
    productId: 'prod-2',
    customRate: 172.00,
    note: 'ICU contract pricing',
  },
  {
    customerId: 'cust-aayush',
    productId: 'prod-1',
    customRate: 26.50,
    note: 'OPD clinic contract',
  },
  {
    customerId: 'cust-aayush',
    productId: 'prod-3',
    customRate: 120.00,
    note: 'Endoscopy unit contract',
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Cipla Distribution Agency',
    contactPerson: 'Rajesh Mehta',
    phone: '+91 98210 11223',
    email: 'orders@ciplaagency.com',
    gstin: '27AAACC4455B1Z1',
    drugLicence: '20B/MH-TZ-100223',
    address: 'Plot 45, Wagle Industrial Estate, Thane West - 400604',
    creditDays: 30,
    openingBalance: 0,
    currentOutstanding: 45000,
  },
  {
    id: 'sup-2',
    name: 'Micro Labs Wholesale Depot',
    contactPerson: 'Suresh Patil',
    phone: '+91 98330 33445',
    email: 'depot.thane@microlabs.in',
    gstin: '27AABCM7788P1Z9',
    drugLicence: '21B/MH-TZ-100456',
    address: 'Gala 12, Bhiwandi Logistics Park, Bhiwandi - 421302',
    creditDays: 21,
    openingBalance: 0,
    currentOutstanding: 28500,
  },
  {
    id: 'sup-3',
    name: 'Alkem Healthcare Distributors',
    contactPerson: 'Vikas Sharma',
    phone: '+91 98190 55667',
    email: 'sales@alkemdistributors.com',
    gstin: '27AAACA9900D1Z4',
    drugLicence: '20B/MH-TZ-100889',
    address: 'Shop 7, Navjivan Complex, Kalyan Road, Thane - 400601',
    creditDays: 30,
    openingBalance: 0,
    currentOutstanding: 16800,
  },
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'pur-101',
    purchaseNumber: 'PUR-2026-001',
    supplierInvoiceNumber: 'INV-CIPLA-8891',
    supplierId: 'sup-1',
    supplierName: 'Cipla Distribution Agency',
    date: '2026-09-20',
    subtotal: 4200.00,
    gstTotal: 504.00,
    grandTotal: 4704.00,
    paymentStatus: 'credit',
    items: [
      {
        productId: 'prod-1',
        productName: 'Dolo 650 Tablet',
        batchNumber: 'DL-25C09',
        expiryDate: '2027-08-31',
        quantity: 200,
        freeQuantity: 10,
        purchaseRate: 21.00,
        mrp: 33.60,
        wholesalePrice: 27.00,
        gstRate: 12,
        taxableAmount: 4200.00,
        totalAmount: 4704.00,
      },
    ],
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'RET-2026-0001',
    type: 'retail',
    date: '2026-09-29',
    customerName: 'Suresh Verma (Cash Walk-in)',
    customerPhone: '9820155555',
    doctorName: 'Dr. Ramesh Gupta (MBBS)',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    subtotal: 215.00,
    discountTotal: 0,
    taxableTotal: 191.96,
    cgstTotal: 11.52,
    sgstTotal: 11.52,
    igstTotal: 0,
    grandTotal: 215.00,
    amountInWords: 'Two Hundred Fifteen Rupees Only',
    items: [
      {
        id: 'item-1',
        productId: 'prod-2',
        productName: 'Augmentin 625 Duo Tablet',
        hsnCode: '30041090',
        gstRate: 12,
        quantity: 1,
        freeQuantity: 0,
        mrp: 215.00,
        unitPrice: 215.00,
        discountPercent: 0,
        taxableAmount: 191.96,
        cgstAmount: 11.52,
        sgstAmount: 11.52,
        igstAmount: 0,
        totalAmount: 215.00,
        allocations: [
          {
            batchId: 'bat-201',
            batchNumber: 'AUG-8820',
            expiryDate: '2027-03-31',
            quantity: 1,
            rate: 215.00,
            mrp: 215.00,
            amount: 215.00,
          },
        ],
      },
    ],
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'WS-2026-0001',
    type: 'wholesale',
    date: '2026-09-29',
    customerId: 'cust-krishna',
    customerName: 'Shree Krishna Multi-Speciality Hospital',
    customerPhone: '+91 98200 88776',
    customerGstin: '27AABCK8899E1Z2',
    customerDl: '20B/MH-TZ-554433',
    doctorName: 'Hospital Pharmacy Dept',
    paymentMethod: 'credit',
    paymentStatus: 'unpaid',
    subtotal: 2600.00,
    discountTotal: 0,
    taxableTotal: 2321.43,
    cgstTotal: 139.29,
    sgstTotal: 139.29,
    igstTotal: 0,
    grandTotal: 2600.00,
    amountInWords: 'Two Thousand Six Hundred Rupees Only',
    items: [
      {
        id: 'item-2',
        productId: 'prod-1',
        productName: 'Dolo 650 Tablet',
        hsnCode: '30049060',
        gstRate: 12,
        quantity: 100,
        freeQuantity: 0,
        mrp: 33.60,
        unitPrice: 26.00,
        discountPercent: 0,
        taxableAmount: 2321.43,
        cgstAmount: 139.29,
        sgstAmount: 139.29,
        igstAmount: 0,
        totalAmount: 2600.00,
        allocations: [
          {
            batchId: 'bat-101',
            batchNumber: 'DL-24A01 (Exp 2026-12)',
            expiryDate: '2026-12-31',
            quantity: 80,
            rate: 26.00,
            mrp: 33.60,
            amount: 2080.00,
          },
          {
            batchId: 'bat-102',
            batchNumber: 'DL-25C09 (Exp 2027-08)',
            expiryDate: '2027-08-31',
            quantity: 20,
            rate: 26.00,
            mrp: 33.60,
            amount: 520.00,
          },
        ],
      },
    ],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-29 09:30:15',
    user: 'Sarfaraz Ahmad',
    role: 'Admin',
    action: 'SYSTEM_BOOT',
    entity: 'System',
    details: 'Prince Pharma v2 initialized with Marg Books design standards, Single Physical Inventory and FEFO Engine.',
  },
  {
    id: 'log-2',
    timestamp: '2026-09-29 10:15:00',
    user: 'Sarfaraz Ahmad',
    role: 'Admin',
    action: 'INVOICE_CREATE',
    entity: 'Invoice RET-2026-0001',
    details: 'Walk-in cash bill created for Augmentin 625 (₹215.00). Batch AUG-8820 depleted by 1 unit.',
  },
  {
    id: 'log-3',
    timestamp: '2026-09-29 10:45:22',
    user: 'Sarfaraz Ahmad',
    role: 'Admin',
    action: 'CONTRACT_SALE',
    entity: 'Invoice WS-2026-0001',
    details: 'Wholesale B2B credit sale to Shree Krishna Hospital (₹2600.00). FEFO split: 80 units DL-24A01 + 20 units DL-25C09.',
  },
];

export function numberToWordsIndian(num: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10] + ' ';
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + ' Crore ' + inWords(n % 10000000);
  }

  const rounded = Math.round(num);
  if (rounded === 0) return 'Zero Rupees Only';
  return inWords(rounded).trim() + ' Rupees Only';
}
