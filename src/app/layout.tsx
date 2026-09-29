import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prince Pharma — Next-Gen Pharmacy POS & Wholesale System',
  description: 'Single-source physical inventory, deterministic FEFO dispatch, B2B wholesale pricing matrices, and Form 20B/21B GST compliance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#090d16] text-slate-100">
        {children}
      </body>
    </html>
  );
}
