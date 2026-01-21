"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
import { Document, Page, Text, View, StyleSheet, pdf, Image as PdfImage } from '@react-pdf/renderer';
import { FileText, CreditCard, CheckCircle, AlignLeft, ListChecks, Plus, Trash2, Users, Send, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner'; // <-- Import ini sekarang akan berhasil setelah npm install

// --- 1. CONFIG WARNA BRANDING ---
const BRAND = {
  primary: '#3a0519',   
  secondary: '#a77a0b', 
  accent: '#fdf8e8',    
};

// --- 2. TIPE DATA ---
type Customer = {
  name: string;
  passport: string;
};

type VisaFormValues = {
  customers: Customer[];
  customerWhatsapp: string;
  visaType: string;
  provider: string;
  entryType: string;
  duration: number;
  processingTime: string;
  currency: string;
  pax: number;
  pricePerPax: number;
  checklist: string;
  notes: string;
};

// --- 3. TEMPLATE PDF ---
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottom: `1px solid ${BRAND.secondary}`, paddingBottom: 15 },
  companyGroup: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 45, height: 45, marginRight: 10, objectFit: 'contain' },
  companyInfo: { flexDirection: 'column' },
  companyName: { fontSize: 18, fontWeight: 'bold', color: BRAND.primary, marginBottom: 4 },
  companyDetail: { fontSize: 9, color: '#666', marginBottom: 2 },
  docTitleContainer: { alignItems: 'flex-end', justifyContent: 'center', marginTop: 5 },
  docTitle: { fontSize: 16, fontWeight: 'bold', color: BRAND.primary },
  docRef: { fontSize: 9, color: '#888', marginTop: 2 },
  infoGrid: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  infoColumn: { flex: 1, backgroundColor: '#f9fafb', padding: 10, borderRadius: 4 },
  sectionTitle: { fontSize: 9, fontWeight: 'bold', color: BRAND.secondary, marginBottom: 8, textTransform: 'uppercase' },
  row: { marginBottom: 6 },
  label: { fontSize: 8, color: '#666', marginBottom: 1 },
  value: { fontSize: 10, fontWeight: 'bold', color: '#000' },
  customerItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2, borderBottom: '1px dashed #eee', paddingBottom: 2 },
  customerName: { fontSize: 9, fontWeight: 'bold', color: '#333' },
  customerPass: { fontSize: 9, color: '#666' },
  table: { marginTop: 10, marginBottom: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: BRAND.primary, padding: 8, borderRadius: 2 },
  tableRow: { flexDirection: 'row', padding: 10, borderBottom: '1px solid #eee' },
  th: { fontSize: 9, fontWeight: 'bold', color: '#fff' },
  td: { fontSize: 9, color: '#333' },
  tdDesc: { fontSize: 9, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  tdSub: { fontSize: 8, color: '#666' },
  colDesc: { flex: 3 },
  colPax: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  totalContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
  totalBox: { width: '45%', backgroundColor: BRAND.accent, padding: 10, borderRadius: 4, borderLeft: `3px solid ${BRAND.secondary}` },
  totalLabel: { fontSize: 9, color: BRAND.primary, marginBottom: 2, textAlign: 'right' },
  totalValue: { fontSize: 14, fontWeight: 'bold', color: BRAND.secondary, textAlign: 'right' },
  notesSection: { marginTop: 20, borderTop: '1px dashed #ddd', paddingTop: 10 },
  notesLabel: { fontSize: 9, fontWeight: 'bold', marginBottom: 4, color: BRAND.primary },
  notesContent: { fontSize: 9, color: '#555', lineHeight: 1.4 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#aaa', textAlign: 'center' }
});

const VisaPdfDocument = ({ data }: { data: VisaFormValues }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.headerContainer}>
        <View style={pdfStyles.companyGroup}>
            <PdfImage src="/rehlasticky.png" style={pdfStyles.logoImage} />
            <View style={pdfStyles.companyInfo}>
                <Text style={pdfStyles.companyName}>TRAVEL REHLA</Text>
                <Text style={pdfStyles.companyDetail}>PPIU SK No. 123/2026</Text>
                <Text style={pdfStyles.companyDetail}>Jl. Menuju Baitullah No. 1, Jakarta</Text>
            </View>
        </View>
        <View style={pdfStyles.docTitleContainer}>
            <Text style={pdfStyles.docTitle}>QUOTATION VISA</Text>
            <Text style={pdfStyles.docRef}>Ref: Q-VIS-{new Date().getTime().toString().slice(-6)}</Text>
        </View>
      </View>

      <View style={pdfStyles.infoGrid}>
        <View style={pdfStyles.infoColumn}>
            <Text style={pdfStyles.sectionTitle}>Daftar Jemaah</Text>
            {data.customers.map((cust, index) => (
                <View key={index} style={pdfStyles.customerItem}>
                    <Text style={pdfStyles.customerName}>{index + 1}. {cust.name || "Tanpa Nama"}</Text>
                    <Text style={pdfStyles.customerPass}>{cust.passport || "-"}</Text>
                </View>
            ))}
        </View>
        <View style={pdfStyles.infoColumn}>
            <Text style={pdfStyles.sectionTitle}>Spesifikasi Visa</Text>
            <View style={pdfStyles.row}><Text style={pdfStyles.label}>Jenis:</Text><Text style={pdfStyles.value}>{data.visaType} ({data.entryType})</Text></View>
            <View style={pdfStyles.row}><Text style={pdfStyles.label}>Provider:</Text><Text style={pdfStyles.value}>{data.provider || "All Provider"}</Text></View>
            <View style={pdfStyles.row}><Text style={pdfStyles.label}>Durasi:</Text><Text style={pdfStyles.value}>{data.duration} Hari</Text></View>
        </View>
      </View>

      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.th, pdfStyles.colDesc]}>Deskripsi Layanan</Text>
            <Text style={[pdfStyles.th, pdfStyles.colPax]}>Pax</Text>
            <Text style={[pdfStyles.th, pdfStyles.colPrice]}>Harga Satuan</Text>
        </View>
        <View style={pdfStyles.tableRow}>
            <View style={pdfStyles.colDesc}>
                <Text style={pdfStyles.tdDesc}>Biaya Visa {data.visaType} & Processing</Text>
                <Text style={pdfStyles.tdSub}>Include: Gov Fee, Tasheel, Insurance & Handling Fee.</Text>
            </View>
            <Text style={[pdfStyles.td, pdfStyles.colPax]}>{data.pax}</Text>
            <Text style={[pdfStyles.td, pdfStyles.colPrice]}>
                {data.currency.split(' ')[0]} {data.pricePerPax.toLocaleString()}
            </Text>
        </View>
      </View>

      <View style={pdfStyles.totalContainer}>
        <View style={pdfStyles.totalBox}>
            <Text style={pdfStyles.totalLabel}>Total Estimasi Biaya</Text>
            <Text style={pdfStyles.totalValue}>
                {data.currency?.split(' ')[0] || "IDR"} {(data.pricePerPax * data.pax).toLocaleString()}
            </Text>
        </View>
      </View>

      <View style={pdfStyles.notesSection}>
         <Text style={pdfStyles.notesLabel}>Checklist Dokumen Fisik:</Text>
         <Text style={{fontSize: 9, color: '#444', marginBottom: 10, lineHeight: 1.4}}>{data.checklist}</Text>
         <Text style={pdfStyles.notesLabel}>Catatan:</Text>
         <Text style={pdfStyles.notesContent}>{data.notes}</Text>
      </View>
      <Text style={pdfStyles.footer}>Generated by Travel Rehla System</Text>
    </Page>
  </Document>
);

// --- 4. KOMPONEN UTAMA (WEB) ---
export default function VisaGeneratorPage() {
  const { register, control, setValue } = useForm<VisaFormValues>({
    defaultValues: {
      customers: [{ name: '', passport: '' }],
      customerWhatsapp: '', 
      currency: 'IDR (Rupiah)',
      pax: 1,
      duration: 90,
      pricePerPax: 0,
      visaType: 'Umrah Reguler',
      entryType: 'Single Entry',
      processingTime: '3-5 Hari Kerja',
      checklist: "1. Paspor Asli (Min 2 kata nama, berlaku 7 bulan).\n2. Pasfoto 4x6 Background Putih (2 Lembar).\n3. Buku Vaksin Meningitis (Kartu Kuning).",
      notes: 'Harga belum termasuk tiket pesawat dan akomodasi hotel. Pembayaran DP minimal 50% saat pengajuan dokumen.'
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "customers" });
  const formValues = useWatch({ control });
  
  // State untuk Loading Kirim
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (formValues.customers) setValue('pax', formValues.customers.length);
  }, [formValues.customers?.length, setValue]);

  const totalEstimate = (formValues.pricePerPax || 0) * (formValues.pax || 1);

  // --- FUNGSI KIRIM KE WHATSAPP ---
  const handleSendWhatsApp = async () => {
    if (!formValues.customerWhatsapp) {
        toast.error("Harap isi Nomor WhatsApp Customer terlebih dahulu!");
        return;
    }

    setIsSending(true);
    const toastId = toast.loading("Sedang membuat & mengirim PDF...");

    try {
        // 1. Generate PDF Blob
        const blob = await pdf(<VisaPdfDocument data={formValues as VisaFormValues} />).toBlob();
        
        // 2. Siapkan Data
        const formData = new FormData();
        formData.append('file', blob, `Quotation-${formValues.customers?.[0]?.name || 'Visa'}.pdf`);
        formData.append('phone', formValues.customerWhatsapp);
        formData.append('caption', `Halo Kak ${formValues.customers?.[0]?.name || 'Jemaah'},\n\nBerikut adalah Quotation Visa Anda dari Travel Rehla.\n\nTotal: ${formValues.currency?.split(' ')[0]} ${totalEstimate.toLocaleString()}`);

        // 3. Panggil API Backend (Pastikan file route.ts sudah dibuat)
        const response = await fetch('/api/send-quotation', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            toast.success("Berhasil! Quotation terkirim ke WhatsApp Customer & Admin.", { id: toastId });
        } else {
            const err = await response.json();
            toast.error("Gagal mengirim: " + (err.message || "Unknown Error"), { id: toastId });
        }

    } catch (error) {
        console.error("Error generating/sending PDF:", error);
        toast.error("Terjadi kesalahan sistem saat memproses PDF.", { id: toastId });
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans text-slate-800">
      {/* TOASTER (PENTING AGAR NOTIF MUNCUL) */}
      <Toaster position="top-center" richColors />

      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
            <img src="/rehlasticky.png" alt="Logo Travel Rehla" style={{ width: 50, height: 50, objectFit: 'contain' }} />
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Travel Rehla System</h1>
                <p className="text-sm font-semibold" style={{ color: BRAND.secondary }}>Visa Quotation Generator Module</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* === KIRI: FORM INPUT === */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Pelanggan & WhatsApp */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4" style={{ borderTopColor: BRAND.secondary }}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                 <div className="flex items-center gap-2">
                    <Users size={18} style={{ color: BRAND.primary }} />
                    <h2 className="font-bold text-sm" style={{ color: BRAND.primary }}>1. Daftar Jemaah & Kontak</h2>
                 </div>
                 <span className="text-xs text-white px-2 py-1 rounded-full font-bold" style={{ backgroundColor: BRAND.secondary }}>
                    {fields.length} Orang
                 </span>
              </div>

              {/* Input Nomor WA */}
              <div className="mb-4 bg-green-50 p-3 rounded-lg border border-green-100">
                  <label className="block text-[10px] font-bold text-green-700 uppercase mb-1">Nomor WhatsApp Customer (Wajib)</label>
                  <input 
                    {...register("customerWhatsapp")} 
                    className="w-full p-2.5 bg-white border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                    placeholder="Contoh: 08123456789 (Format angka)" 
                  />
                  <p className="text-[10px] text-green-600 mt-1">*File PDF akan dikirim otomatis ke nomor ini & nomor Admin.</p>
              </div>
              
              <div className="space-y-3">
                {fields.map((item, index) => (
                    <div key={item.id} className="flex gap-3 items-end group">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{index === 0 ? "Nama Jemaah" : ""}</label>
                            <input {...register(`customers.${index}.name`)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 outline-none" style={{ '--tw-ring-color': BRAND.secondary } as React.CSSProperties} placeholder={`Jemaah ${index + 1}`} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{index === 0 ? "No. Paspor" : ""}</label>
                            <input {...register(`customers.${index}.passport`)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 outline-none" style={{ '--tw-ring-color': BRAND.secondary } as React.CSSProperties} placeholder="X00000" />
                        </div>
                        {fields.length > 1 && (
                            <button type="button" onClick={() => remove(index)} className="p-2.5 mb-[1px] text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                        )}
                    </div>
                ))}
              </div>
              <button type="button" onClick={() => append({ name: '', passport: '' })} className="mt-4 flex items-center gap-2 text-sm font-bold hover:opacity-80 transition" style={{ color: BRAND.secondary }}>
                <Plus size={16} /> Tambah Jemaah Lain
              </button>
            </div>

            {/* 2. Spesifikasi */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4" style={{ borderTopColor: BRAND.secondary }}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <FileText size={18} style={{ color: BRAND.primary }} />
                <h2 className="font-bold text-sm" style={{ color: BRAND.primary }}>2. Spesifikasi Visa</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Jenis Visa</label>
                  <select {...register("visaType")} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2" style={{ '--tw-ring-color': BRAND.secondary } as React.CSSProperties}>
                    <option>Umrah Reguler</option>
                    <option>Umrah Plus</option>
                    <option>Tourist Visa</option>
                  </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Provider</label>
                    <input {...register("provider")} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2" style={{ '--tw-ring-color': BRAND.secondary } as React.CSSProperties} placeholder="Contoh: Eatmarna..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipe Entry</label>
                  <select {...register("entryType")} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2" style={{ '--tw-ring-color': BRAND.secondary } as React.CSSProperties}>
                    <option>Single Entry</option>
                    <option>Multiple Entry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Durasi (Hari)</label>
                  <input type="number" {...register("duration")} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2" style={{ '--tw-ring-color': BRAND.secondary } as React.CSSProperties} />
                </div>
              </div>
            </div>

            {/* 3. Harga */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4" style={{ borderTopColor: BRAND.secondary }}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                <CreditCard size={18} style={{ color: BRAND.primary }} />
                <h2 className="font-bold text-sm" style={{ color: BRAND.primary }}>3. Harga & Persyaratan</h2>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mata Uang</label>
                   <select {...register("currency")} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2" style={{ '--tw-ring-color': BRAND.secondary } as React.CSSProperties}>
                    <option value="IDR (Rupiah)">IDR (Rupiah)</option>
                    <option value="USD (Dollar)">USD (Dollar)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pax</label>
                   <input type="number" {...register("pax", { valueAsNumber: true })} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg text-sm outline-none cursor-not-allowed" readOnly />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Harga Satuan</label>
                   <input type="number" {...register("pricePerPax", { valueAsNumber: true })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2" style={{ '--tw-ring-color': BRAND.secondary } as React.CSSProperties} />
                </div>
              </div>

              <div className="mb-6">
                 <div className="flex items-center gap-1 mb-1">
                    <ListChecks size={14} className="text-gray-400"/>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Checklist Dokumen</label>
                </div>
                <textarea {...register("checklist")} rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono outline-none focus:ring-2" style={{ '--tw-ring-color': BRAND.secondary } as React.CSSProperties}></textarea>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1">
                    <AlignLeft size={14} className="text-gray-400"/>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Catatan Tambahan</label>
                </div>
                <textarea {...register("notes")} rows={3} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2" style={{ '--tw-ring-color': BRAND.secondary } as React.CSSProperties}></textarea>
              </div>
            </div>
          </div>

          {/* === KANAN: LIVE ESTIMATE === */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
                <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: BRAND.primary }}>
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <CheckCircle size={18} className="text-green-400"/> Live Estimate
                    </h3>
                    <span className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded-full">Auto-Update</span>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="font-bold text-sm mb-3 border-b border-gray-100 pb-1 flex justify-between" style={{ color: BRAND.secondary }}>
                            1. Informasi Pelanggan
                            <span className="text-xs text-gray-400 font-normal">{formValues.customers?.length} Pax</span>
                        </h4>
                        <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {formValues.customers?.map((cust, i) => (
                                <div key={i} className="flex justify-between items-center border-b border-dashed border-gray-100 pb-1 last:border-0">
                                    <span className="text-gray-500 text-xs w-6">{i+1}.</span>
                                    <span className="font-semibold text-gray-800 truncate flex-1">{cust.name || "-"}</span>
                                    <span className="text-gray-400 text-xs ml-2">{cust.passport}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-3 border-b border-gray-100 pb-1" style={{ color: BRAND.secondary }}>2. Spesifikasi Visa</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Jenis:</span><span className="font-semibold text-gray-800">{formValues.visaType}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Provider:</span><span className="font-semibold text-gray-800">{formValues.provider || "-"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Durasi:</span><span className="font-semibold text-gray-800">{formValues.duration} Hari</span></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-3 border-b border-gray-100 pb-1" style={{ color: BRAND.secondary }}>3. Harga & Pax</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Jumlah Pax:</span><span className="font-semibold text-gray-800">{formValues.pax} Orang</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Harga Satuan:</span><span className="font-semibold text-gray-800">{formValues.currency} {formValues.pricePerPax?.toLocaleString()}</span></div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-300 flex justify-between items-center">
                            <span className="font-bold text-gray-700">Total Estimasi :</span>
                            <span className="text-2xl font-bold" style={{ color: BRAND.secondary }}>
                                {formValues.currency?.split(' ')[0] || "IDR"} {totalEstimate.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
              </div>

              {/* TOMBOL AKSI: KIRIM WA */}
              <div>
                <button 
                    onClick={handleSendWhatsApp}
                    disabled={isSending}
                    className="w-full py-4 text-white rounded-xl font-bold hover:opacity-90 transition shadow-lg flex justify-center items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#25D366' }} // Warna WA
                >
                    {isSending ? (
                        <>
                            <Loader2 size={20} className="animate-spin" /> Sedang Mengirim...
                        </>
                    ) : (
                        <>
                            <Send size={20}/> Kirim Quotation ke WhatsApp
                        </>
                    )}
                </button>
                 <p className="text-center text-xs text-gray-500 mt-3">PDF akan dikirim otomatis ke Customer & Admin</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}