'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PharmacySettings, Invoice, INITIAL_SETTINGS, INITIAL_INVOICES } from '@/data/pharmaData';
import { SatyamPharmaGstInvoice } from '@/app/components/SatyamPharmaGstInvoice';
import { Download, Printer, Share2, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';

function BillViewContent() {
  const searchParams = useSearchParams();
  const invId = searchParams.get('id') || searchParams.get('invoice') || 'RET-2026-001';
  const encodedData = searchParams.get('data');

  const [settings, setSettings] = useState<PharmacySettings>(INITIAL_SETTINGS);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Try to load custom settings from localStorage if available
    try {
      const savedSettings = localStorage.getItem('pp_settings_v4');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (e) {
      console.warn('Could not read settings from localStorage');
    }

    // 2. Try to decode invoice data from query param
    if (encodedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(encodedData)));
        setInvoice(decoded);
        return;
      } catch (e) {
        console.warn('Failed to parse encoded invoice data:', e);
      }
    }

    // 3. Try to find in localStorage invoices
    try {
      const savedInvoices = localStorage.getItem('pp_invoices_v4');
      if (savedInvoices) {
        const parsed: Invoice[] = JSON.parse(savedInvoices);
        const match = parsed.find(
          (i) => i.invoiceNumber === invId || i.id === invId
        );
        if (match) {
          setInvoice(match);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read invoices from localStorage');
    }

    // 4. Fallback to sample invoice or build a clean mock for this ID
    const sample = INITIAL_INVOICES.find((i) => i.invoiceNumber === invId) || INITIAL_INVOICES[0];
    setInvoice({
      ...sample,
      invoiceNumber: invId,
      date: searchParams.get('date') || sample.date,
      customerName: searchParams.get('customer') || sample.customerName,
      grandTotal: searchParams.get('total') ? parseFloat(searchParams.get('total')!) : sample.grandTotal,
    });
  }, [invId, encodedData, searchParams]);

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    setIsGeneratingPdf(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const el = printRef.current;
      if (!el) throw new Error('Invoice print element not found');

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const canvasAspect = canvas.height / canvas.width;
      const imgH = pageW * canvasAspect;
      const finalH = Math.min(imgH, pageH);

      pdf.addImage(imgData, 'PNG', 0, 0, pageW, finalH);
      pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. You can use the Print button to save as PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const text = `*${settings.name} — TAX INVOICE #${invoice?.invoiceNumber}*\nGrand Total: ₹${invoice?.grandTotal.toFixed(2)}\n\nView & Download Official PDF:\n${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: `Invoice ${invoice?.invoiceNumber}`, text, url: shareUrl }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-md text-center max-w-sm">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading Official GST Tax Invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Top Action Bar (Hidden in Print) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Back to POS"
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 font-mono">#{invoice.invoiceNumber}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified GST Invoice</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{invoice.customerName} • ₹{invoice.grandTotal.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition border border-slate-200 cursor-pointer"
              title="Share Bill"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-50 border-t border-emerald-200 px-4 py-2 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Official Invoice PDF downloaded successfully to your device!</span>
          </div>
        )}
      </header>

      {/* Invoice Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 print:p-0 print:max-w-none">
        <div
          ref={printRef}
          id="invoice-print-area"
          className="bg-white rounded-xl shadow-md border border-slate-300 p-2 sm:p-4 print:shadow-none print:border-none print:p-0"
        >
          <SatyamPharmaGstInvoice
            settings={settings}
            invoice={invoice}
            customerName={invoice.customerName}
            customerPhone={invoice.customerPhone}
            doctorName={invoice.doctorName}
            paymentMethod={invoice.paymentMethod}
            saleType={(invoice as any).saleType || 'retail'}
          />
        </div>
      </main>
    </div>
  );
}

export default function BillPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <p className="text-sm font-semibold text-slate-600">Loading Invoice...</p>
        </div>
      }
    >
      <BillViewContent />
    </Suspense>
  );
}
