"use client";

import React, { useEffect, useState } from 'react';
import { getPaymentForKwitansi } from '@/app/actions/admin';
import { Printer, Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function KwitansiPage({ params }: { params: { id: string } }) {
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPaymentForKwitansi(params.id).then((data) => {
      if (!data) notFound();
      setPayment(data);
      setLoading(false);
      // Auto trigger print after render
      setTimeout(() => window.print(), 500);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Menyiapkan Kwitansi...</p>
      </div>
    );
  }

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const shortId = payment.id.split('-')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0 text-black">
      <div className="max-w-3xl mx-auto bg-white shadow-lg print:shadow-none p-10 relative">
        {/* Print Button (Hidden in Print) */}
        <button 
          onClick={() => window.print()}
          className="absolute top-4 right-4 bg-[#3a0519] text-white p-3 rounded-full hover:bg-[#5a0826] transition print:hidden shadow-lg"
          title="Cetak Kwitansi"
        >
          <Printer size={20} />
        </button>

        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-[#3a0519] pb-6 mb-8">
          <div className="flex items-center gap-4">
            <img src="/rehlasticky.png" alt="Rehla" className="w-20 h-20 rounded-xl" onError={(e) => e.currentTarget.style.display = 'none'} />
            <div>
              <h1 className="text-3xl font-bold text-[#3a0519] tracking-wider">REHLA INDONESIA</h1>
              <p className="text-sm text-gray-500 font-medium">Izin Resmi Umrah | Sahabat Perjalanan Anda</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-[#a77a0b] tracking-widest uppercase mb-1">KWITANSI</h2>
            <p className="text-sm text-gray-500 font-medium">OFFICIAL RECEIPT</p>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="flex justify-between mb-8 text-sm">
          <div>
            <p className="text-gray-500 mb-1">No. Kwitansi:</p>
            <p className="font-bold font-mono text-lg text-gray-800">KW-{shortId}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 mb-1">Tanggal Bayar:</p>
            <p className="font-bold text-gray-800">{fmtDate(payment.paidAt || payment.createdAt)}</p>
          </div>
        </div>

        {/* Main Info */}
        <div className="space-y-6">
          <div className="flex border-b border-gray-200 pb-2">
            <div className="w-1/3 text-gray-500 font-semibold uppercase text-xs tracking-wider pt-1">Sudah Terima Dari<br/><span className="text-[10px] italic font-normal text-gray-400">Received From</span></div>
            <div className="w-2/3 text-xl font-bold text-gray-800">: {payment.booking?.customer?.fullName || '-'}</div>
          </div>

          <div className="flex border-b border-gray-200 pb-2">
            <div className="w-1/3 text-gray-500 font-semibold uppercase text-xs tracking-wider pt-1">Sejumlah Uang<br/><span className="text-[10px] italic font-normal text-gray-400">The Sum of</span></div>
            <div className="w-2/3">
              <span className="text-2xl font-bold text-green-700 bg-green-50 px-4 py-1 rounded-lg border border-green-200 inline-block">
                : {fmt(payment.amount)}
              </span>
            </div>
          </div>

          <div className="flex border-b border-gray-200 pb-2">
            <div className="w-1/3 text-gray-500 font-semibold uppercase text-xs tracking-wider pt-1">Untuk Pembayaran<br/><span className="text-[10px] italic font-normal text-gray-400">In Payment For</span></div>
            <div className="w-2/3 text-base text-gray-800">
              : Paket Umrah {payment.booking?.package?.name || '-'} <br/>
              <span className="pl-2.5 text-sm text-gray-500 font-mono"> (Booking Code: {payment.booking?.bookingCode})</span>
            </div>
          </div>

          <div className="flex border-b border-gray-200 pb-2">
            <div className="w-1/3 text-gray-500 font-semibold uppercase text-xs tracking-wider pt-1">Metode Pembayaran<br/><span className="text-[10px] italic font-normal text-gray-400">Payment Method</span></div>
            <div className="w-2/3 text-base text-gray-800">
              : {payment.method || '-'} {payment.bankName ? `(${payment.bankName})` : ''} 
              {payment.referenceNumber && <span className="text-gray-500 text-sm ml-2 font-mono">Ref: #{payment.referenceNumber}</span>}
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="mt-16 flex justify-between items-end">
          <div className="border-4 border-green-600 text-green-600 font-bold text-xl uppercase tracking-widest px-6 py-2 rounded-xl rotate-[-5deg] opacity-70">
            LUNAS / VERIFIED
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-16">Penerima / Admin</p>
            <div className="border-b border-gray-400 w-48 mx-auto mb-2"></div>
            <p className="text-xs font-bold text-gray-800">Rehla Indonesia</p>
          </div>
        </div>
        
        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body { background: white; }
            @page { margin: 0; size: auto; }
          }
        `}} />
      </div>
    </div>
  );
}
