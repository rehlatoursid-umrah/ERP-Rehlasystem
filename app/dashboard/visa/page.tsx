"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
import { Document, Page, Text, View, StyleSheet, pdf, Image as PdfImage } from '@react-pdf/renderer';
import { FileText, Loader2, Download, Users, Banknote, Globe, Calculator, User, Info, Plus, Trash2, Send, ClipboardList } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// --- 1. CONFIG & CONSTANTS ---
const MARKUP_PERCENT = 0.20; // Markup 20%

const BRAND = {
  primary: '#3a0519',
  secondary: '#a77a0b',
  accent: '#fdf8e8',
};

// --- 2. PDF ENGINE ---
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color:'#333' },
  
  // HEADER (LAYOUT BARU DENGAN LOGO)
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 25, 
    borderBottom: `2px solid ${BRAND.secondary}`, 
    paddingBottom: 15,
    alignItems: 'center' 
  },
  
  // BAGIAN KIRI (LOGO + TEKS)
  headerLeftContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  logo: { 
    width: 60, 
    height: 60, 
    marginRight: 12,
    objectFit: 'contain' 
  },
  headerInfo: { 
    flexDirection: 'column' 
  },
  
  // BAGIAN KANAN (JUDUL)
  headerRight: { 
    alignItems: 'flex-end', 
    justifyContent: 'flex-end',
    height: 60, // Menyamakan tinggi dengan logo biar sejajar
    paddingTop: 10
  },

  companyName: { fontSize: 18, fontWeight: 'bold', color: BRAND.primary, marginBottom: 4 },
  companySub: { fontSize: 9, color: '#555' },
  docTitle: { fontSize: 16, fontWeight: 'bold', color: BRAND.primary, textTransform: 'uppercase' },
  docRef: { fontSize: 9, color: '#888', marginTop: 4 },

  // SECTION STYLES
  sectionHeader: { fontSize: 11, fontWeight: 'bold', color: BRAND.primary, marginTop: 15, marginBottom: 8, textTransform: 'uppercase', borderBottom: '1px solid #eee', paddingBottom: 4 },
  jemaahRow: { flexDirection: 'row', paddingVertical: 4, borderBottom: '1px dashed #eee' },
  colNo: { width: '5%', fontSize: 9 },
  colName: { width: '55%', fontSize: 9, fontWeight: 'bold' },
  colPass: { width: '40%', fontSize: 9, color: '#555' },
  specContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  specItem: { width: '33%', marginBottom: 8 },
  specLabel: { fontSize: 8, color: '#888', marginBottom: 2 },
  specValue: { fontSize: 10, fontWeight: 'bold' },
  table: { marginTop: 10, border: '1px solid #eee', borderRadius: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', padding: 8, borderBottom: '1px solid #ddd' },
  tableRow: { flexDirection: 'row', padding: 8, borderBottom: '1px solid #eee' },
  th: { fontSize: 9, fontWeight: 'bold', color: '#555' },
  td: { fontSize: 9, color: '#333' },
  colDesc: { width: '60%' },
  colPax: { width: '15%', textAlign: 'center' },
  colPrice: { width: '25%', textAlign: 'right' },
  totalSection: { marginTop: 15, alignItems: 'flex-end' },
  totalBox: { width: '40%', padding: 10, backgroundColor: BRAND.accent, border: `1px solid ${BRAND.secondary}`, borderRadius: 4 },
  grandTotalLabel: { fontSize: 9, color: '#666', textAlign: 'right' },
  grandTotalValue: { fontSize: 14, fontWeight: 'bold', color: BRAND.primary, textAlign: 'right', marginTop: 2 },
  estBox: { marginTop: 4, paddingTop: 4, borderTop: '1px dashed #ccc' },
  estLabel: { fontSize: 8, color: '#888', textAlign: 'right', fontStyle: 'italic' },
  estValue: { fontSize: 10, fontWeight: 'bold', color: '#555', textAlign: 'right' },
  checklistSection: { marginTop: 20, padding: 10, backgroundColor: '#f9fafb', borderRadius: 4 },
  checklistItem: { fontSize: 9, color: '#555', marginBottom: 3, lineHeight: 1.4 },
  notes: { fontSize: 9, color: '#555', marginTop: 2, lineHeight: 1.4, fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#aaa', borderTop: '1px solid #eee', paddingTop: 10 }
});

const VisaPdfDoc = ({ data }: { data: any }) => {
  const total = (data.price || 0) * (data.paxQuantity || 1);
  const customers = data.customers || [];
  const showIdrEstimate = data.currency !== 'IDR' && data.convertedIDR > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER DENGAN LOGO PRESISI */}
        <View style={styles.header}>
          
          {/* SISI KIRI: LOGO + INFO TRAVEL */}
          <View style={styles.headerLeftContainer}>
             {/* Logo diambil dari public folder */}
             <PdfImage 
                src={window.location.origin + "/rehlasticky.png"} 
                style={styles.logo} 
             />
             <View style={styles.headerInfo}>
                <Text style={styles.companyName}>REHLA INDONESIA</Text>
                <Text style={styles.companySub}>PPIU SK No. 03010220049160002</Text>
                <Text style={styles.companySub}>Komplek Permata Biru Bandung Jawa Barat</Text>
             </View>
          </View>

          {/* SISI KANAN: JUDUL DOKUMEN */}
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>QUOTATION VISA</Text>
            <Text style={styles.docRef}>Ref: {data.refNumber}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>DAFTAR JEMAAH</Text>
        <View style={{ marginBottom: 10 }}>
           {customers.map((c: any, i: number) => (
             <View key={i} style={styles.jemaahRow}>
                <Text style={styles.colNo}>{i+1}.</Text>
                <Text style={styles.colName}>{c.name || 'Nama Belum Diisi'}</Text>
                <Text style={styles.colPass}>{c.passport ? `Passport: ${c.passport}` : '-'}</Text>
             </View>
           ))}
        </View>

        <Text style={styles.sectionHeader}>SPESIFIKASI VISA</Text>
        <View style={styles.specContainer}>
            <View style={styles.specItem}><Text style={styles.specLabel}>Jenis Visa</Text><Text style={styles.specValue}>{data.visaType}</Text></View>
            <View style={styles.specItem}><Text style={styles.specLabel}>Provider</Text><Text style={styles.specValue}>{data.provider || '-'}</Text></View>
            <View style={styles.specItem}><Text style={styles.specLabel}>Durasi</Text><Text style={styles.specValue}>{data.duration} Hari</Text></View>
            <View style={styles.specItem}><Text style={styles.specLabel}>Tipe Entry</Text><Text style={styles.specValue}>{data.entryType}</Text></View>
            <View style={styles.specItem}><Text style={styles.specLabel}>Proses</Text><Text style={styles.specValue}>{data.processingTime}</Text></View>
        </View>

        <View style={styles.table}>
            <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.colDesc]}>Deskripsi Layanan</Text>
                <Text style={[styles.th, styles.colPax]}>Pax</Text>
                <Text style={[styles.th, styles.colPrice]}>Harga Satuan</Text>
            </View>
            <View style={styles.tableRow}>
                <View style={styles.colDesc}>
                    <Text style={{fontSize:9, fontWeight:'bold'}}>Biaya Visa {data.visaType} & Processing</Text>
                    <Text style={{fontSize:8, color:'#666', marginTop:2}}>Include: Gov Fee, Tasheel, Insurance & Handling Fee.</Text>
                </View>
                <Text style={[styles.td, styles.colPax]}>{data.paxQuantity}</Text>
                <Text style={[styles.td, styles.colPrice]}>{data.currency} {(data.price || 0).toLocaleString('id-ID')}</Text>
            </View>
        </View>

        <View style={styles.totalSection}>
            <View style={styles.totalBox}>
                <Text style={styles.grandTotalLabel}>Total Estimasi Biaya</Text>
                <Text style={styles.grandTotalValue}>{data.currency} {total.toLocaleString('id-ID')}</Text>
                {showIdrEstimate && (
                  <View style={styles.estBox}>
                      <Text style={styles.estLabel}>Estimasi Rupiah:</Text>
                      <Text style={styles.estValue}>Rp {Math.ceil(data.convertedIDR).toLocaleString('id-ID')}</Text>
                  </View>
                )}
            </View>
        </View>

        <View style={styles.checklistSection}>
            <Text style={{fontSize:10, fontWeight:'bold', marginBottom:5}}>Checklist Dokumen Fisik:</Text>
            {data.checklist && data.checklist.split('\n').map((item: string, i: number) => (
                <Text key={i} style={styles.checklistItem}>{item}</Text>
            ))}
            <Text style={{fontSize:10, fontWeight:'bold', marginTop:10, marginBottom:2}}>Catatan:</Text>
            <Text style={styles.notes}>{data.notes}</Text>
        </View>

        <Text style={styles.footer}>Generated by Travel Rehla System</Text>
      </Page>
    </Document>
  );
};

// --- 3. MAIN PAGE COMPONENT ---
export default function VisaGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // RATES DEFAULT
  const [rates, setRates] = useState({ SAR: 4300, USD: 16200 }); 
  const [loadingRates, setLoadingRates] = useState(true);

  // FETCH LIVE RATES (API KEY BARU & REAL)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://v6.exchangerate-api.com/v6/706a72e4c866009aea40c82a/latest/USD');
        const data = await res.json();
        
        if(data && data.conversion_rates) {
          setRates({
            USD: Math.ceil(data.conversion_rates.IDR),
            SAR: Math.ceil(data.conversion_rates.IDR / data.conversion_rates.SAR)
          });
          toast.success("Kurs Live Terupdate!");
        }
      } catch (e) { 
        console.error("Gagal fetch rate", e);
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  const { register, control, watch, setValue } = useForm({
    defaultValues: {
      refNumber: `Q-VIS-${Date.now().toString().slice(-6)}`,
      customerWhatsapp: '',
      customers: [{ name: '', passport: '' }],
      visaType: 'Tourist Visa (Multiple Entry)',
      entryType: 'Multiple Entry', provider: '',
      duration: '90', 
      processingTime: '3-5 Hari Kerja',
      paxQuantity: 1, price: 0, currency: 'IDR',
      checklist: `1. Paspor Asli (Min 2 kata nama, berlaku 7 bulan).\n2. Pasfoto 4x6 Background Putih (2 Lembar).\n3. Buku Vaksin Meningitis (Kartu Kuning).`,
      notes: `Harga belum termasuk tiket pesawat dan akomodasi hotel. Pembayaran DP minimal 50% saat pengajuan dokumen.`
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "customers" });

  const w = useWatch({ control });
  const currency = w.currency || 'IDR';
  const total = (w.price || 0) * (w.paxQuantity || 1);

  useEffect(() => { setValue('paxQuantity', fields.length); }, [fields.length, setValue]);

  let rateUsed = 1;
  if (currency === 'USD') rateUsed = rates.USD;
  if (currency === 'SAR') rateUsed = rates.SAR;
  const convertedIDR = total * rateUsed * (1 + MARKUP_PERCENT);

  const pdfData = { ...w, convertedIDR };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<VisaPdfDoc data={pdfData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `Quotation-${w.customers?.[0]?.name || 'Visa'}.pdf`; link.click();
      toast.success("PDF Visa Siap!");
    } catch(e) { toast.error("Gagal PDF"); }
    finally { setIsGenerating(false); }
  };

  const handleSendWA = async () => {
    const leaderName = w.customers?.[0]?.name;
    const phone = w.customerWhatsapp;

    if (!leaderName || !phone) {
        toast.error("Nama Jemaah Pertama & Nomor WhatsApp WAJIB diisi!");
        return;
    }

    setIsSending(true);
    const toastId = toast.loading("Memproses PDF & Mengirim ke WA...");

    try {
        const blob = await pdf(<VisaPdfDoc data={pdfData} />).toBlob();
        const formData = new FormData();
        const safeName = leaderName.replace(/\s+/g, '-');
        formData.append('file', blob, `Quotation-${safeName}.pdf`);
        formData.append('phone', phone);
        
        const caption = `*Assalamu'alaikum, Kak ${leaderName}* 👋\n\nBerikut kami lampirkan Quotation *Visa Perjalanan*.\n\n📄 *Jenis:* ${w.visaType}\n👥 *Jumlah:* ${w.paxQuantity} Pax\n💰 *Total:* ${currency} ${total.toLocaleString('id-ID')}\n\nSilakan dicek dokumen terlampir. Terima kasih! 🙏`;
        formData.append('caption', caption);

        const res = await fetch('/api/send-quotation', { method: 'POST', body: formData });
        
        if (res.ok) toast.success("Sukses Terkirim ke WhatsApp!", { id: toastId });
        else { const err = await res.json(); toast.error("Gagal: " + (err.message || "Cek koneksi WA"), { id: toastId }); }
    } catch (e) { toast.error("Terjadi kesalahan sistem", { id: toastId }); } 
    finally { setIsSending(false); }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans text-slate-800">
      <Toaster position="top-center" richColors />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3a0519] flex gap-2 items-center"><FileText className="text-[#a77a0b]"/> Visa Quotation</h1>
          <p className="text-sm text-gray-500">Buat penawaran visa Umrah/Turis.</p>
        </div>
        
        {/* KOTAK KURS LIVE (API REAL) */}
        <div className="flex gap-4">
            {!loadingRates && (
                <>
                    <div className="bg-white border px-3 py-1 rounded shadow-sm text-right">
                        <p className="text-[10px] font-bold text-gray-400">SAR (XE)</p>
                        <p className="text-sm font-bold">Rp {rates.SAR.toLocaleString()}</p>
                    </div>
                    <div className="bg-white border px-3 py-1 rounded shadow-sm text-right">
                        <p className="text-[10px] font-bold text-gray-400">USD (XE)</p>
                        <p className="text-sm font-bold">Rp {rates.USD.toLocaleString()}</p>
                    </div>
                </>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4" style={{borderTopColor: BRAND.secondary}}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-[#3a0519] flex items-center gap-2"><Users size={18}/> 1. Daftar Jemaah</h3>
                    <button type="button" onClick={() => append({ name: '', passport: '' })} className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:underline"><Plus size={14}/> Tambah Jemaah</button>
                </div>
                <div className="mb-4 bg-green-50 p-3 rounded border border-green-100">
                      <label className="text-[10px] font-bold text-green-700 uppercase">WhatsApp Leader / Penerima File (Wajib)</label>
                      <input {...register('customerWhatsapp')} className="w-full p-2 border rounded mt-1 outline-none focus:ring-2 focus:ring-green-500 bg-white" placeholder="0812..." />
                </div>
                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-3 rounded border relative group">
                            <div className="flex-[3] w-full"><label className="text-[10px] font-bold text-gray-400 uppercase">{index + 1}. Nama Lengkap</label><input {...register(`customers.${index}.name`)} className="input-field mt-1" placeholder="Sesuai Paspor" /></div>
                            <div className="flex-[2] w-full"><label className="text-[10px] font-bold text-gray-400 uppercase">No. Paspor</label><input {...register(`customers.${index}.passport`)} className="input-field mt-1" placeholder="X12345" /></div>
                            {index > 0 && (<button onClick={() => remove(index)} className="p-2 text-gray-400 hover:text-red-500 mb-1"><Trash2 size={16}/></button>)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4" style={{borderTopColor: BRAND.secondary}}>
                <h3 className="font-bold text-[#3a0519] flex items-center gap-2 mb-4"><Globe size={18}/> 2. Spesifikasi Visa</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><label className="label-xs">Jenis Visa</label><select {...register('visaType')} className="input-field cursor-pointer"><option>Tourist Visa (Multiple Entry)</option><option>Visa Entry Mesir</option><option>Visa VoA Mesir</option><option>Visa Single Entry Umrah</option><option>Visa Turis Elektronik Saudi</option><option>Umrah Plus</option></select></div>
                    <div><label className="label-xs">Provider</label><input {...register('provider')} className="input-field" placeholder="Provider..."/></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><label className="label-xs">Tipe Entry</label><select {...register('entryType')} className="input-field"><option>Single Entry</option><option>Multiple Entry</option></select></div>
                    <div><label className="label-xs">Durasi (Hari)</label><input {...register('duration')} className="input-field" placeholder="90"/></div>
                </div>
                <div className="grid grid-cols-1">
                    <div><label className="label-xs">Waktu Proses (Estimasi)</label><input {...register('processingTime')} className="input-field" placeholder="3-5 Hari Kerja"/></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4" style={{borderTopColor: BRAND.secondary}}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-[#3a0519] flex items-center gap-2"><Banknote size={18}/> 3. Harga & Mata Uang</h3>
                    <select {...register('currency')} className="bg-gray-100 text-xs font-bold p-1 rounded border cursor-pointer"><option value="IDR">IDR</option><option value="SAR">SAR</option><option value="USD">USD</option></select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="label-xs">Jumlah Pax (Otomatis)</label><input type="number" {...register('paxQuantity', {valueAsNumber:true})} className="input-field bg-gray-100" readOnly/></div>
                    <div><label className="label-xs">Harga Satuan</label><input type="number" {...register('price', {valueAsNumber:true})} className="input-field"/></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4" style={{borderTopColor: BRAND.secondary}}>
                <h3 className="font-bold text-[#3a0519] flex items-center gap-2 mb-4"><ClipboardList size={18}/> 4. Checklist & Catatan (Footer)</h3>
                <div className="space-y-4">
                    <div><label className="label-xs">Checklist Dokumen Fisik</label><textarea {...register('checklist')} className="input-field h-24 font-mono text-xs leading-relaxed"></textarea></div>
                    <div><label className="label-xs">Catatan Tambahan</label><textarea {...register('notes')} className="input-field h-20 text-xs"></textarea></div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-4">
            <div className="sticky top-4 space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-[#3a0519] p-4 flex items-center justify-between text-white">
                         <div className="flex items-center gap-2"><Calculator size={20} className="text-[#a77a0b]"/><span className="font-bold text-sm uppercase">Live Preview</span></div>
                         <div className="bg-white/10 px-2 py-1 rounded text-xs font-mono">{currency}</div>
                    </div>
                    <div className="p-5 space-y-5">
                         <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><User size={12}/> Leader / Jemaah</p>
                            <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                <p className="font-bold text-[#3a0519] text-sm">{w.customers?.[0]?.name || 'Belum diisi...'}</p>
                                {fields.length > 1 && <p className="text-xs text-gray-500 mt-1">+ {fields.length - 1} Jemaah Lainnya</p>}
                            </div>
                         </div>
                         <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <p className="text-xs font-bold text-yellow-700 uppercase mb-2 flex items-center gap-1"><Info size={12}/> Detail Visa</p>
                            <div className="flex justify-between text-sm border-b border-dashed border-yellow-200 pb-1 mb-1"><span className="text-gray-600">Jenis</span><span className="font-bold text-[#3a0519] w-32 text-right truncate">{w.visaType}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-600">Durasi</span><span className="font-bold text-[#3a0519]">{w.duration} Hari</span></div>
                         </div>
                         <div className="mt-4 pt-4 border-t border-gray-100">
                             <p className="text-xs font-bold text-gray-500 uppercase">Total ({currency})</p>
                             <p className="text-2xl font-bold text-[#3a0519]">{currency} {total.toLocaleString('id-ID')}</p>
                             {currency !== 'IDR' && (
                                <div className="bg-white border border-[#a77a0b] border-dashed rounded p-2 mt-2">
                                    <p className="text-[10px] font-bold text-[#a77a0b] uppercase">Estimasi Rupiah (+20%)</p>
                                    <p className="text-lg font-bold text-gray-700">Rp {convertedIDR.toLocaleString('id-ID', {maximumFractionDigits:0})}</p>
                                </div>
                             )}
                         </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={handleSendWA} disabled={isSending} className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 transition disabled:opacity-50">
                        {isSending ? <Loader2 size={20} className="animate-spin"/> : <Send size={20}/>} {isSending ? 'Mengirim ke WA...' : 'Kirim PDF ke WhatsApp'}
                    </button>
                    <button onClick={handleDownload} disabled={isGenerating} className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-bold shadow-sm flex justify-center items-center gap-2 transition disabled:opacity-50">
                        {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <Download size={16}/>} Download Manual
                    </button>
                </div>
            </div>
        </div>
      </div>
      <style jsx global>{`
        .input-field { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; outline: none; background: #fff; transition: all 0.2s; }
        .input-field:focus { border-color: ${BRAND.secondary}; ring: 2px; ring-color: #fdf8e8; }
        .label-xs { display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
      `}</style>
    </div>
  );
}