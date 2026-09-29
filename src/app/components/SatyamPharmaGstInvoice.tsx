'use strict';
import React from 'react';
import { PharmacySettings, Invoice } from '@/data/pharmaData';

export interface SatyamPharmaGstInvoiceProps {
  settings: PharmacySettings;
  invoice?: Invoice | null;
  isLivePreview?: boolean;
  saleType?: 'retail' | 'wholesale';
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerGstin?: string;
  customerDl?: string;
  doctorName?: string;
  paymentMethod?: string;
  items?: {
    productName: string;
    packUnit?: string;
    packSize?: number;
    quantity: number;
    freeQuantity?: number;
    unitRate: number;
    mrp: number;
    batchNumber: string;
    expiryDate: string;
    discountPercent: number;
    hsnCode: string;
    gstRate: number;
    lineTotal: number;
  }[];
  subtotal?: number;
  discountTotal?: number;
  taxableTotal?: number;
  cgstTotal?: number;
  sgstTotal?: number;
  grandTotal?: number;
  amountInWords?: string;
  invoiceNumber?: string;
  date?: string;
  compactThermal?: boolean;
}

export const SatyamPharmaGstInvoice: React.FC<SatyamPharmaGstInvoiceProps> = ({
  settings,
  invoice,
  isLivePreview = false,
  saleType = 'retail',
  customerName = 'Walk-in Patient',
  customerPhone = '',
  customerAddress = '',
  customerCity = '',
  customerGstin = '',
  customerDl = '',
  doctorName = '',
  paymentMethod = 'cash',
  items = [],
  subtotal = 0,
  discountTotal = 0,
  taxableTotal = 0,
  cgstTotal = 0,
  sgstTotal = 0,
  grandTotal = 0,
  amountInWords = '',
  invoiceNumber = '',
  date = '',
  compactThermal = false,
}) => {
  // If a finalized invoice is provided, use its values
  const isFinal = !!invoice && !isLivePreview;

  const activeCustomerName = isFinal ? invoice.customerName : customerName || 'Walk-in Retail Patient';
  const activeCustomerPhone = isFinal ? invoice.customerPhone || '' : customerPhone || '';
  const activeCustomerAddress = isFinal ? '' : customerAddress || '';
  const activeCustomerCity = isFinal ? '' : customerCity || settings.city;
  const activeCustomerGstin = isFinal ? invoice.customerGstin || '' : customerGstin || '';
  const activeCustomerDl = isFinal ? invoice.customerDl || '' : customerDl || '';
  const activeDoctorName = isFinal ? invoice.doctorName || '' : doctorName || '';
  const activePaymentMethod = isFinal ? invoice.paymentMethod : paymentMethod || 'cash';
  const activeInvoiceNumber = isFinal ? invoice.invoiceNumber : invoiceNumber || (saleType === 'retail' ? 'RET-PREVIEW' : 'WS-PREVIEW');
  const activeDate = isFinal ? invoice.date : date || new Date().toISOString().split('T')[0];

  // Format date as DD-MM-YYYY
  const formattedDate = (() => {
    try {
      const parts = activeDate.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    } catch {}
    return activeDate;
  })();

  // Items extraction
  const displayItems = isFinal
    ? invoice.items.map((it) => {
        const batch = it.allocations?.[0]?.batchNumber || '-';
        const expRaw = it.allocations?.[0]?.expiryDate || '';
        let expFormatted = '-';
        if (expRaw) {
          const p = expRaw.split('-');
          if (p.length >= 2) expFormatted = `${parseInt(p[1])}/${p[0].slice(2)}`;
        }
        const gross = it.quantity * it.unitPrice;
        const disc = gross * ((it.discountPercent || 0) / 100);
        const taxable = gross - disc;
        const total = it.totalAmount;
        const netRate = it.quantity > 0 ? total / it.quantity : it.unitPrice;

        return {
          productName: it.productName,
          pack: it.pack || '1*10',
          qty: it.quantity,
          free: it.freeQuantity > 0 ? `${it.quantity}+${it.freeQuantity}` : '-',
          rate: it.unitPrice,
          mrp: it.mrp,
          batch,
          exp: expFormatted,
          disPercent: it.discountPercent || 0,
          hsn: it.hsnCode,
          sgstRate: (it.gstRate / 2).toFixed(2),
          cgstRate: (it.gstRate / 2).toFixed(2),
          amount: it.totalAmount,
          netRate,
        };
      })
    : items.map((it) => {
        let expFormatted = '-';
        if (it.expiryDate) {
          const p = it.expiryDate.split('-');
          if (p.length >= 2) expFormatted = `${parseInt(p[1])}/${p[0].slice(2)}`;
        }
        const packStr = it.packUnit ? `${it.packSize ? it.packSize : ''}${it.packUnit.toUpperCase()}` : '1*10';
        const netRate = it.quantity > 0 ? it.lineTotal / it.quantity : it.unitRate;
        return {
          productName: it.productName,
          pack: packStr,
          qty: it.quantity,
          free: it.freeQuantity && it.freeQuantity > 0 ? `${it.quantity}+${it.freeQuantity}` : '-',
          rate: it.unitRate,
          mrp: it.mrp,
          batch: it.batchNumber || 'FEFO',
          exp: expFormatted,
          disPercent: it.discountPercent || 0,
          hsn: it.hsnCode,
          sgstRate: (it.gstRate / 2).toFixed(2),
          cgstRate: (it.gstRate / 2).toFixed(2),
          amount: it.lineTotal,
          netRate,
        };
      });

  const actSubtotal = isFinal ? invoice.subtotal : subtotal;
  const actDiscount = isFinal ? invoice.discountTotal : discountTotal;
  const actTaxable = isFinal ? invoice.taxableTotal : taxableTotal;
  const actCgst = isFinal ? invoice.cgstTotal : cgstTotal;
  const actSgst = isFinal ? invoice.sgstTotal : sgstTotal;
  const actTotalTax = actCgst + actSgst;
  const actNetTotal = actTaxable + actTotalTax;
  const actGrandTotal = isFinal ? invoice.grandTotal : grandTotal;
  const actPartyTotal = Math.round(actGrandTotal);
  const actWords = isFinal ? invoice.amountInWords : amountInWords || 'Zero Rupees Only';

  if (compactThermal) {
    return (
      <div className="bg-white text-black p-3 font-mono text-[11px] leading-tight max-w-[80mm] mx-auto border border-black space-y-2">
        <div className="text-center border-b border-black pb-1.5">
          <div className="font-bold text-sm uppercase">{settings.name}</div>
          <div className="text-[10px]">{settings.address}, {settings.city}</div>
          <div className="text-[9px]">GSTIN: {settings.gstin} | DL: {settings.dlNumber20b}</div>
          <div className="text-[9px]">FOOD LIC: {settings.foodLicence || '22718282000369'}</div>
        </div>
        <div className="text-[10px] border-b border-black pb-1">
          <div>Inv: <strong>{activeInvoiceNumber}</strong> | Dt: {formattedDate}</div>
          <div>Party: <strong>{activeCustomerName}</strong></div>
          {activeDoctorName && <div>Doc: {activeDoctorName}</div>}
          <div>Mode: <strong className="uppercase">{activePaymentMethod}</strong></div>
        </div>
        <table className="w-full text-left text-[10px]">
          <thead>
            <tr className="border-b border-black">
              <th>Item</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Amt</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((it, idx) => (
              <tr key={idx} className="border-b border-dotted border-gray-400">
                <td className="py-0.5">
                  <div className="font-semibold">{it.productName}</div>
                  <div className="text-[8px] text-gray-700">{it.batch} | Exp: {it.exp}</div>
                </td>
                <td className="text-center align-top">{it.qty}</td>
                <td className="text-right align-top">₹{it.rate.toFixed(2)}</td>
                <td className="text-right align-top font-bold">₹{it.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-black pt-1 text-right text-[10px] space-y-0.5">
          <div className="flex justify-between"><span>Sub Total:</span><span>₹{actSubtotal.toFixed(2)}</span></div>
          {actDiscount > 0 && <div className="flex justify-between"><span>Discount:</span><span>-₹{actDiscount.toFixed(2)}</span></div>}
          <div className="flex justify-between"><span>CGST + SGST:</span><span>₹{actTotalTax.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
            <span>Grand Total:</span>
            <span>₹{actPartyTotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-[9px] text-center pt-2 border-t border-black">
          <div>Goods once sold will not be returned without batch check.</div>
          <div className="font-bold pt-1">Thank You! Visit Again</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black font-sans text-xs border-2 border-black w-full shadow-md select-text print:border-black print:m-0 print:p-0">
      {/* 1. TOP HEADER BOX: QR Code (Left), Store Name (Center), Invoice Type (Right) */}
      <div className="flex flex-row items-stretch border-b-2 border-black">
        {/* 1.1 Left: QR Code + Food Lic No */}
        <div className="w-[18%] p-2 flex flex-col items-center justify-between border-r-2 border-black bg-white">
          <div className="w-16 h-16 border border-black p-1 flex items-center justify-center bg-white">
            {/* SVG Crisp QR Code Representation */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-black" fill="currentColor">
              {/* Corner 1 */}
              <rect x="5" y="5" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="13" y="13" width="14" height="14" />
              {/* Corner 2 */}
              <rect x="65" y="5" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="73" y="13" width="14" height="14" />
              {/* Corner 3 */}
              <rect x="5" y="65" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="13" y="73" width="14" height="14" />
              {/* Random Data Matrix Blocks */}
              <rect x="42" y="10" width="8" height="8" />
              <rect x="42" y="24" width="8" height="14" />
              <rect x="10" y="42" width="12" height="8" />
              <rect x="28" y="42" width="8" height="8" />
              <rect x="42" y="42" width="16" height="16" />
              <rect x="65" y="42" width="10" height="10" />
              <rect x="80" y="42" width="12" height="8" />
              <rect x="42" y="65" width="8" height="14" />
              <rect x="56" y="65" width="14" height="8" />
              <rect x="76" y="60" width="16" height="8" />
              <rect x="56" y="80" width="8" height="14" />
              <rect x="70" y="76" width="12" height="16" />
              <rect x="88" y="88" width="6" height="6" />
            </svg>
          </div>
          <div className="text-[8.5px] font-mono font-bold text-center leading-tight mt-1 text-black">
            FOOD LIC NO : {settings.foodLicence || '22718282000369'}
          </div>
        </div>

        {/* 1.2 Center: Store Name, Address, GSTIN, DL, Contacts */}
        <div className="w-[62%] p-2 text-center flex flex-col justify-center space-y-0.5">
          <h1 className="font-serif font-black text-xl sm:text-2xl uppercase tracking-wider text-black">
            {settings.name}
          </h1>
          <p className="text-[11px] font-bold uppercase text-black leading-tight">
            {settings.address}
          </p>
          <p className="text-[10px] font-bold uppercase text-black leading-tight">
            {settings.city}, {settings.state} - {settings.pincode}
          </p>
          <div className="pt-0.5 text-[9.5px] font-mono font-bold text-black flex flex-wrap items-center justify-center gap-x-2 leading-tight">
            <span>GSTIN : {settings.gstin}</span>
            <span>D.L.NO. {settings.dlNumber20b}, {settings.dlNumber21b}</span>
          </div>
          <div className="text-[9px] font-mono text-black">
            Phone : {settings.phone} {settings.phone2 ? `, ${settings.phone2}` : ''} • E-Mail : {settings.email}
          </div>
        </div>

        {/* 1.3 Right: "GST" INVOICE, Original for Buyer, Payment Mode */}
        <div className="w-[20%] p-2 border-l-2 border-black flex flex-col justify-between text-right bg-white">
          <div>
            <div className="font-mono font-bold text-xs uppercase text-black tracking-tight">
              &quot;GST&quot; INVOICE
            </div>
            <div className="text-[9.5px] text-gray-700 italic">
              Original for Buyer
            </div>
          </div>
          <div className="pt-2">
            <div className="font-mono font-black text-sm uppercase text-black tracking-wide">
              {activePaymentMethod.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* 2. BUYER & BILL METADATA ROW */}
      <div className="flex flex-row items-stretch border-b-2 border-black text-[10.5px]">
        {/* 2.1 Buyer / Patient Details */}
        <div className="w-[45%] p-2 space-y-0.5">
          <div className="font-bold text-black text-xs">
            M/s {activeCustomerName}
          </div>
          <div className="text-[10px] text-gray-800">
            {activeCustomerAddress || 'COUNTER PATIENT CASH SALE'}
          </div>
          <div className="text-[10px] text-gray-800">
            {activeCustomerCity}
          </div>
          {activeDoctorName && (
            <div className="text-[10px] text-black font-semibold pt-0.5">
              Prescribed Doctor: <strong>{activeDoctorName}</strong>
            </div>
          )}
        </div>

        {/* 2.2 Buyer Phone, GST, DL */}
        <div className="w-[30%] p-2 border-l-2 border-r-2 border-black font-mono space-y-0.5 text-[10px]">
          <div>Ph.No. : {activeCustomerPhone || '-'}</div>
          <div>GST : {activeCustomerGstin || '-'}</div>
          <div>DLN : {activeCustomerDl || '-'}</div>
        </div>

        {/* 2.3 Invoice Number, Date, IRN */}
        <div className="w-[25%] p-2 font-mono text-right space-y-0.5 text-[10px]">
          <div>2M BILL</div>
          <div>Invoice No. : <strong className="font-bold text-black">{activeInvoiceNumber}</strong></div>
          <div>Date : <strong className="font-bold text-black">{formattedDate}</strong></div>
          <div className="text-[8.5px] text-gray-600 truncate">IRN : 7b84f29a00e12</div>
        </div>
      </div>

      {/* 3. MEDICINES ITEMS TABLE (Matching Satyam Photo Columns) */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-[10.5px] border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-[9.5px] uppercase font-mono font-bold bg-slate-100/70 text-black">
              <th className="py-1 px-1.5 text-center border-r border-black w-8">SR.</th>
              <th className="py-1 px-2 border-r border-black">DESCRIPTION</th>
              <th className="py-1 px-1.5 text-center border-r border-black w-14">Pack</th>
              <th className="py-1 px-1 text-center border-r border-black w-10">Qty.</th>
              <th className="py-1 px-1 text-center border-r border-black w-10">free</th>
              <th className="py-1 px-1.5 text-right border-r border-black w-14">Rate</th>
              <th className="py-1 px-1.5 text-right border-r border-black w-14">Mrp.</th>
              <th className="py-1 px-1.5 text-center border-r border-black w-20">Batch</th>
              <th className="py-1 px-1 text-center border-r border-black w-12">Exp.</th>
              <th className="py-1 px-1 text-right border-r border-black w-10">Dis%</th>
              <th className="py-1 px-1.5 text-center border-r border-black w-16">Hsn.</th>
              <th className="py-1 px-1 text-right border-r border-black w-10">SGST</th>
              <th className="py-1 px-1 text-right border-r border-black w-10">CGST</th>
              <th className="py-1 px-1.5 text-right border-r border-black w-16 font-black">AMOUNT</th>
              <th className="py-1 px-1.5 text-right w-14">N.RATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 font-mono text-[10px]">
            {displayItems.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-6 text-center text-gray-500 italic font-sans text-xs">
                  No medicines added to bill yet. Scan barcode or search medicines on the left.
                </td>
              </tr>
            ) : (
              displayItems.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-1 px-1.5 text-center border-r border-black">{idx + 1}</td>
                  <td className="py-1 px-2 border-r border-black font-sans font-bold text-black uppercase">
                    {it.productName}
                  </td>
                  <td className="py-1 px-1.5 text-center border-r border-black">{it.pack}</td>
                  <td className="py-1 px-1 text-center border-r border-black font-bold text-black">{it.qty}</td>
                  <td className="py-1 px-1 text-center border-r border-black text-gray-700">{it.free}</td>
                  <td className="py-1 px-1.5 text-right border-r border-black">{it.rate.toFixed(2)}</td>
                  <td className="py-1 px-1.5 text-right border-r border-black">{it.mrp.toFixed(2)}</td>
                  <td className="py-1 px-1.5 text-center border-r border-black font-bold">{it.batch}</td>
                  <td className="py-1 px-1 text-center border-r border-black">{it.exp}</td>
                  <td className="py-1 px-1 text-right border-r border-black">{it.disPercent.toFixed(2)}</td>
                  <td className="py-1 px-1.5 text-center border-r border-black">{it.hsn}</td>
                  <td className="py-1 px-1 text-right border-r border-black">{it.sgstRate}</td>
                  <td className="py-1 px-1 text-right border-r border-black">{it.cgstRate}</td>
                  <td className="py-1 px-1.5 text-right border-r border-black font-bold text-black">
                    {it.amount.toFixed(2)}
                  </td>
                  <td className="py-1 px-1.5 text-right font-medium text-gray-900">
                    {it.netRate.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4. CALCULATION SUMMARY TABLE (Exact Match to Satyam Bill Footer) */}
      <div className="border-t-2 border-b-2 border-black bg-slate-100/60 font-mono text-[9.5px]">
        <div className="grid grid-cols-9 text-center border-b border-black font-bold uppercase py-0.5">
          <div className="border-r border-black">CLASS</div>
          <div className="border-r border-black">SUB TOTAL</div>
          <div className="border-r border-black">SCHEME</div>
          <div className="border-r border-black">DISC.</div>
          <div className="border-r border-black">SGST</div>
          <div className="border-r border-black">CGST</div>
          <div className="border-r border-black">TOTAL</div>
          <div className="border-r border-black">NET TOTAL</div>
          <div>PARTY TOTAL</div>
        </div>
        <div className="grid grid-cols-9 text-center py-1 font-bold text-[10px]">
          <div className="border-r border-black uppercase">TOTAL</div>
          <div className="border-r border-black">{actSubtotal.toFixed(2)}</div>
          <div className="border-r border-black">0.00</div>
          <div className="border-r border-black">{actDiscount.toFixed(2)}</div>
          <div className="border-r border-black">{actSgst.toFixed(2)}</div>
          <div className="border-r border-black">{actCgst.toFixed(2)}</div>
          <div className="border-r border-black">{actTotalTax.toFixed(2)}</div>
          <div className="border-r border-black">{actNetTotal.toFixed(2)}</div>
          <div className="font-black text-black">{actPartyTotal.toFixed(2)}</div>
        </div>
      </div>

      {/* 5. BOTTOM SECTION: Words, Terms & Authorised Signatory */}
      <div className="flex flex-row items-stretch justify-between p-2 text-[10px]">
        {/* 5.1 Left: Amount in words & Legal Disclaimers */}
        <div className="w-[60%] space-y-1 pr-2">
          <div className="font-serif italic font-bold text-[10.5px] text-black">
            Rs. {actWords}
          </div>
          <div className="text-[9px] text-gray-700 leading-tight">
            <p>Goods once sold will not be taken back or exchanged.</p>
            <p>Bills not paid due date will attract 24% interest.</p>
          </div>
        </div>

        {/* 5.2 Right: Grand Total & Authorised Signatory */}
        <div className="w-[40%] flex flex-col justify-between items-end pl-2">
          <div className="text-right w-full">
            <div className="text-[10px] font-bold uppercase text-black">
              For {settings.name}
            </div>
            <div className="mt-1 flex items-baseline justify-end gap-2">
              <span className="font-bold uppercase text-[11px] text-gray-700">Grand Total</span>
              <span className="font-mono font-black text-lg sm:text-xl text-black">
                {actPartyTotal.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-6 pt-1 text-center border-t border-dotted border-black w-36 text-[9.5px] text-black font-semibold">
            Authorised signatory
          </div>
        </div>
      </div>
    </div>
  );
};
export default SatyamPharmaGstInvoice;
