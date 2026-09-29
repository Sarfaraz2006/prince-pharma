export interface Product {
  id: string;
  name: string;
  brand: string;
  genericName: string;
  manufacturer: string;
  category: 'tablet' | 'syrup' | 'injection' | 'capsule' | 'ointment';
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
  // Product 1: Dolo 650 (2 active batches with differing expiry dates for FEFO demonstration)
  {
    id: 'bat-101',
    productId: 'prod-1',
    batchNumber: 'DL-24A01',
    expiryDate: '2026-12-31', // Expiring earlier -> Must be consumed first
    purchaseDate: '2025-01-10',
    purchaseRate: '21.00' as any as number,
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
    expiryDate: '2027-08-31', // Expiring later -> Consumed second
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
  // Product 3: Pan 40
  {
    id: 'bat-301',
    productId: 'prod-3',
    batchNumber: 'PAN-7742',
    expiryDate: '2026-11-30', // Near expiry (within 90 days)
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
    expiryDate: '2023-05-31', // Expired
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

// Customer-specific wholesale contract pricing matrix
export const INITIAL_CUSTOMER_PRICES: CustomerProductPrice[] = [
  // Shree Krishna Hospital gets special volume pricing
  {
    customerId: 'cust-krishna',
    productId: 'prod-1', // Dolo 650
    customRate: 26.00, // Standard wholesale is 27.00
    note: 'Contract rate: 1000+ strips/month',
  },
  {
    customerId: 'cust-krishna',
    productId: 'prod-2', // Augmentin 625
    customRate: 172.00, // Standard wholesale is 178.00
    note: 'ICU contract pricing',
  },
  // Aayush Clinic gets negotiated pricing
  {
    customerId: 'cust-aayush',
    productId: 'prod-1',
    customRate: 26.50,
    note: 'OPD clinic contract',
  },
  {
    customerId: 'cust-aayush',
    productId: 'prod-3', // Pan 40
    customRate: 120.00, // Standard wholesale is 125.00
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

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'RET-2026-0001',
    type: 'retail',
    date: '2026-09-29',
    customerName: 'Suresh Verma (Cash Walk-in)',
    customerPhone: '9820155555',
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
        quantity: 100, // Consumes 80 from DL-24A01 (earlier exp) and 20 from DL-25C09
        freeQuantity: 0,
        mrp: 33.60,
        unitPrice: 26.00, // Contract pricing applied!
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

// Helper: Convert number to Indian currency words
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
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }

  const rounded = Math.round(num);
  if (rounded === 0) return 'Zero Rupees Only';
  return inWords(rounded).trim() + ' Rupees Only';
}
