'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { VisaData, VisaPdfDocument } from './components/VisaPdf';
import { LayoutDashboard, FileText, Download, Loader2 } from 'lucide-react';

// Import PDF Generator secara lazy load (agar aman di browser)
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading PDF...</span> }
);

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState<VisaData>({
    customerName: '',
    visaType: 'Umrah Reguler',
    duration: '90',
    price: '',
    currency: 'IDR',
    notes: 'Harga belum termasuk tiket pesawat.'
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200">
          <div className="p-3 bg-yellow-600 rounded-lg text-white">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Travel Rehla System</h1>
            <p className="text-slate-500">Dashboard Generator Quotation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORM INPUT (KIRI) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <FileText size={20} className="text-yellow-600" />
              Input Data Visa
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Nama Jemaah / Group</label>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Contoh: Bpk. Fulan / PT. Maju Jaya" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Jenis Visa</label>
                <select name="visaType" value={formData.visaType} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none">
                  <option>Umrah Reguler</option>
                  <option>Umrah Plus</option>
                  <option>Visa Turis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Harga</label>
                <div className="flex gap-2">
                  <select name="currency" value={formData.currency} onChange={handleChange} className="w-20 p-2.5 border border-slate-300 rounded-lg bg-slate-50">
                    <option>IDR</option>
                    <option>USD</option>
                  </select>
                  <input type="text" name="price" value={formData.price} onChange={handleChange}
                    className="flex-1 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="1.xxx.xxx" />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Catatan</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none h-24"></textarea>
              </div>
            </div>
          </div>

          {/* PREVIEW & ACTION (KANAN) */}
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-xl">
              <h3 className="font-bold text-yellow-800 mb-4">Live Summary</h3>
              <div className="space-y-2 text-sm text-yellow-900">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-semibold">{formData.customerName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visa:</span>
                  <span className="font-semibold">{formData.visaType}</span>
                </div>
                <div className="flex justify-between border-t border-yellow-200 pt-2 mt-2">
                  <span>Total:</span>
                  <span className="font-bold text-lg">{formData.currency} {formData.price || '0'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-semibold mb-4">Actions</h3>
              {isClient && (
                <PDFDownloadLink
                  document={<VisaPdfDocument data={formData} />}
                  fileName={`Visa_${formData.customerName || 'Quotation'}.pdf`}
                  className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-lg shadow-yellow-200"
                >
                  {({ loading }) => 
                    loading ? 'Generating...' : <><Download size={18}/> Download PDF</>
                  }
                </PDFDownloadLink>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
