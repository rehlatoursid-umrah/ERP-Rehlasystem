'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { VisaData, VisaPdfDocument } from './components/VisaPdf'; // Pastikan path ini benar
import { LayoutDashboard, Users, FileText, Banknote, Download, Loader2 } from 'lucide-react';

// Import PDF Generator secara lazy load agar aman di browser
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading PDF...</span> }
);

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  
  // State Data Form
  const [formData, setFormData] = useState<VisaData>({
    refNumber: `Q-VIS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`,
    customerName: '',
    passportNo: '',
    visaType: 'Umrah Reguler',
    provider: '',           // Field Provider
    entryType: 'Single Entry',
    processingTime: '3-5 Hari Kerja',
    validity: '90',
    pax: 1,
    price: 0,
    currency: 'IDR',
    requirements: '1. Paspor Asli (Min 2 kata nama, berlaku 7 bulan).\n2. Pasfoto 4x6 Background Putih (2 Lembar).\n3. Buku Vaksin Meningitis (Kartu Kuning).',
    notes: 'Harga belum termasuk tiket pesawat dan akomodasi hotel. Pembayaran DP minimal 50% saat pengajuan dokumen.'
  });

  useEffect(() => { setIsClient(true); }, []);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Jika input angka (pax/price), ubah ke number. Jika text biasa, biarkan string.
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'pax' || name === 'price') ? (parseFloat(value) || 0) : value
    }));
  };

  const totalEstimate = formData.pax * formData.price;

  // Helper format uang untuk preview
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER DASHBOARD */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-600 rounded-lg text-white shadow-lg shadow-yellow-200">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Travel Rehla System</h1>
              <p className="text-slate-500 text-sm">Visa Quotation Generator Module</p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border text-sm font-mono text-slate-500 hidden md:block">
            REF: {formData.refNumber}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* --- AREA INPUT FORM (KIRI) --- */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* CARD 1: INFORMASI PELANGGAN */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-6 py-3 border-b flex items-center gap-2">
                <Users size={18} className="text-slate-500" />
                <h3 className="font-semibold text-slate-700">1. Informasi Pelanggan</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Jemaah / Group</label>
                  <input type="text" name="customerName" value={formData.customerName} onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Contoh: PT. Amanah Wisata" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No. Paspor / ID (Opsional)</label>
                  <input type="text" name="passportNo" value={formData.passportNo} onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="X1234567" />
                </div>
              </div>
            </div>

            {/* CARD 2: SPESIFIKASI VISA */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-6 py-3 border-b flex items-center gap-2">
                <FileText size={18} className="text-slate-500" />
                <h3 className="font-semibold text-slate-700">2. Spesifikasi Visa</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Jenis Visa */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jenis Visa</label>
                  <select name="visaType" value={formData.visaType} onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none">
                    <option>Umrah Reguler</option>
                    <option>Umrah Plus</option>
                    <option>Visa Turis / Ziarah</option>
                  </select>
                </div>

                {/* Provider (Muassasah) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Provider (Muassasah)</label>
                  <input type="text" name="provider" value={formData.provider} onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" 
                    placeholder="Contoh: Eatmarna / Syarikah..." />
                </div>

                {/* Tipe Entry */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipe Entry</label>
                  <select name="entryType" value={formData.entryType} onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none">
                    <option>Single Entry</option>
                    <option>Multiple Entry (1 Tahun)</option>
                  </select>
                </div>

                {/* Durasi */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Masa Tinggal (Hari)</label>
                  <input type="text" name="validity" value={formData.validity} onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
                
                {/* Estimasi Proses */}
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estimasi Proses</label>
                   <input type="text" name="processingTime" value={formData.processingTime} onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
              </div>
            </div>

            {/* CARD 3: HARGA & PERSYARATAN */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-6 py-3 border-b flex items-center gap-2">
                <Banknote size={18} className="text-slate-500" />
                <h3 className="font-semibold text-slate-700">3. Harga & Persyaratan</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Mata Uang */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mata Uang</label>
                   <select name="currency" value={formData.currency} onChange={handleChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none">
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="USD">USD (Dollar)</option>
                   </select>
                </div>
                
                {/* Jumlah Pax */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jumlah Pax</label>
                   <input type="number" name="pax" value={formData.pax} onChange={handleChange} min="1"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
                
                {/* Harga Satuan */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Harga Satuan</label>
                   <input type="number" name="price" value={formData.price} onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="0" />
                </div>

                {/* Requirements Text Area */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Checklist Dokumen Fisik (Wajib Dikirim)</label>
                  <textarea name="requirements" value={formData.requirements} onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg h-28 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" 
                    placeholder="Masukkan list dokumen..." />
                </div>

                {/* Notes Text Area */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Tambahan</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg h-20 text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
              </div>
            </div>

          </div>

          {/* --- AREA PREVIEW & ACTION (KANAN) --- */}
          <div className="xl:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Box Summary Total */}
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Banknote size={100} /></div>
                <h3 className="font-bold text-yellow-800 text-lg mb-4">Live Estimate</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-yellow-900/70">
                    <span>Harga Satuan:</span>
                    <span>{formatMoney(formData.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-yellow-900/70 border-b border-yellow-200 pb-2">
                    <span>Jumlah Pax:</span>
                    <span>x {formData.pax} Org</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-yellow-900">Total:</span>
                    <span className="font-bold text-2xl text-yellow-700">
                      {formData.currency} {formatMoney(totalEstimate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-semibold mb-2 text-slate-700">Siap Cetak?</h3>
                <p className="text-xs text-slate-400 mb-4">Pastikan data di samping sudah benar sebelum mengunduh PDF.</p>
                
                {isClient && (
                  <PDFDownloadLink
                    document={<VisaPdfDocument data={formData} />}
                    fileName={`Q-${formData.customerName.replace(/\s+/g, '_') || 'Draft'}.pdf`}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-slate-200"
                  >
                    {({ loading }) => 
                      loading ? 'Sedang Membuat PDF...' : <><Download size={20} /> Download Quotation</>
                    }
                  </PDFDownloadLink>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}