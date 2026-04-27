"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useWatch, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { FileText, Loader2, Download, Users, Banknote, Globe, Calculator, User, Info, Plus, Trash2, Send, ClipboardList } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Shared Components & Utils
import { Input, Textarea, Select } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { PageHeader, SectionHeader } from '@/app/components/layout/PageHeader';
import { CurrencyRateWidget } from '@/app/components/shared/CurrencyRateWidget';
import { useExchangeRate } from '@/app/hooks/useExchangeRate';
import { visaQuotationSchema, VisaQuotationInput } from '@/app/lib/validators';
import { PdfHeader, PdfFooter, PdfSectionHeader, pdfSharedStyles } from '@/app/components/pdf/PdfShared';
import { BRAND } from '@/app/lib/constants';

// ============================================
// PDF ENGINE
// ============================================
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color:'#333' },
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
});

const VisaPdfDoc = ({ data }: { data: any }) => {
  const total = (data.price || 0) * (data.paxQuantity || 1);
  const customers = data.customers || [];
  const showIdrEstimate = data.currency !== 'IDR' && data.convertedIDR > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader title="QUOTATION VISA" refNumber={data.refNumber} />

        <PdfSectionHeader title="DAFTAR JEMAAH" />
        <View style={{ marginBottom: 10 }}>
           {customers.map((c: any, i: number) => (
             <View key={i} style={styles.jemaahRow}>
                <Text style={styles.colNo}>{i+1}.</Text>
                <Text style={styles.colName}>{c.name || 'Nama Belum Diisi'}</Text>
                <Text style={styles.colPass}>{c.passport ? `Passport: ${c.passport}` : '-'}</Text>
             </View>
           ))}
        </View>

        <PdfSectionHeader title="SPESIFIKASI VISA" />
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

        <PdfFooter />
      </Page>
    </Document>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function VisaGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const { convertToIDR } = useExchangeRate();

  const { register, control, watch, setValue, formState: { errors }, trigger } = useForm<VisaQuotationInput>({
    resolver: zodResolver(visaQuotationSchema),
    defaultValues: {
      refNumber: `Q-VIS-${Date.now().toString().slice(-6)}`,
      customerWhatsapp: '',
      customers: [{ name: '', passport: '' }],
      visaType: 'Tourist Visa (Multiple Entry)',
      entryType: 'Multiple Entry', 
      provider: '',
      duration: '90', 
      processingTime: '3-5 Hari Kerja',
      paxQuantity: 1, 
      price: 0, 
      currency: 'IDR',
      checklist: `1. Paspor Asli (Min 2 kata nama, berlaku 7 bulan).\n2. Pasfoto 4x6 Background Putih (2 Lembar).\n3. Buku Vaksin Meningitis (Kartu Kuning).`,
      notes: `Harga belum termasuk tiket pesawat dan akomodasi hotel. Pembayaran DP minimal 50% saat pengajuan dokumen.`
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "customers" });

  const w = useWatch({ control });
  const currency = w.currency || 'IDR';
  const total = (w.price || 0) * (w.paxQuantity || 1);

  // Auto-update paxQuantity based on customers length
  useEffect(() => { setValue('paxQuantity', fields.length); }, [fields.length, setValue]);

  const convertedIDR = convertToIDR(total, currency);
  const pdfData = { ...w, convertedIDR };

  const handleDownload = async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Mohon lengkapi semua field wajib");
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await pdf(<VisaPdfDoc data={pdfData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); 
      link.href = url; 
      link.download = `Quotation-${w.customers?.[0]?.name || 'Visa'}.pdf`; 
      link.click();
      toast.success("PDF Visa Siap!");
    } catch(e) { 
      toast.error("Gagal membuat PDF"); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handleSendWA = async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Mohon lengkapi semua field wajib");
      return;
    }

    const leaderName = w.customers?.[0]?.name;
    const phone = w.customerWhatsapp;

    setIsSending(true);
    const toastId = toast.loading("Memproses PDF & Mengirim ke WA...");

    try {
        const blob = await pdf(<VisaPdfDoc data={pdfData} />).toBlob();
        const formData = new FormData();
        const safeName = leaderName?.replace(/\s+/g, '-') || 'Visa';
        formData.append('file', blob, `Quotation-${safeName}.pdf`);
        formData.append('phone', phone!);
        
        const caption = `*Assalamu'alaikum, Kak ${leaderName}* 👋\n\nBerikut kami lampirkan Quotation *Visa Perjalanan*.\n\n📄 *Jenis:* ${w.visaType}\n👥 *Jumlah:* ${w.paxQuantity} Pax\n💰 *Total:* ${currency} ${total.toLocaleString('id-ID')}\n\nSilakan dicek dokumen terlampir. Terima kasih! 🙏`;
        formData.append('caption', caption);

        const res = await fetch('/api/send-quotation', { method: 'POST', body: formData });
        
        if (res.ok) {
          toast.success("Sukses Terkirim ke WhatsApp!", { id: toastId });
        } else { 
          const err = await res.json(); 
          toast.error("Gagal: " + (err.message || "Cek koneksi WA"), { id: toastId }); 
        }
    } catch (e) { 
      toast.error("Terjadi kesalahan sistem", { id: toastId }); 
    } finally { 
      setIsSending(false); 
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />

      <PageHeader 
        title="Visa Quotation" 
        description="Buat penawaran visa Umrah/Turis."
        icon={<FileText className="text-[#a77a0b]" size={28}/>}
        actions={<CurrencyRateWidget />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
            <Card accentColor={BRAND.secondary}>
                <CardContent>
                    <SectionHeader 
                      number={1} 
                      title="Daftar Jemaah" 
                      icon={<Users size={18}/>}
                      action={
                        <button type="button" onClick={() => append({ name: '', passport: '' })} className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:underline">
                          <Plus size={14}/> Tambah Jemaah
                        </button>
                      }
                    />
                    
                    <div className="mb-5 bg-green-50 p-4 rounded-lg border border-green-100">
                      <Input 
                        label="WhatsApp Leader / Penerima File" 
                        {...register('customerWhatsapp')} 
                        error={errors.customerWhatsapp?.message}
                        placeholder="0812..." 
                        className="bg-white focus:ring-green-100 focus:border-green-500"
                      />
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div className="flex-[3] w-full">
                                  <Input 
                                    label={`${index + 1}. Nama Lengkap`} 
                                    {...register(`customers.${index}.name` as const)} 
                                    error={errors.customers?.[index]?.name?.message}
                                    placeholder="Sesuai Paspor" 
                                  />
                                </div>
                                <div className="flex-[2] w-full">
                                  <Input 
                                    label="No. Paspor" 
                                    {...register(`customers.${index}.passport` as const)} 
                                    error={errors.customers?.[index]?.passport?.message}
                                    placeholder="X12345" 
                                  />
                                </div>
                                {index > 0 && (
                                  <button onClick={() => remove(index)} className="p-2.5 mt-6 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                                    <Trash2 size={18}/>
                                  </button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card accentColor={BRAND.secondary}>
                <CardContent>
                    <SectionHeader number={2} title="Spesifikasi Visa" icon={<Globe size={18}/>} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <Select 
                          label="Jenis Visa" 
                          {...register('visaType')}
                          error={errors.visaType?.message}
                          options={[
                            { value: 'Tourist Visa (Multiple Entry)', label: 'Tourist Visa (Multiple Entry)' },
                            { value: 'Visa Entry Mesir', label: 'Visa Entry Mesir' },
                            { value: 'Visa VoA Mesir', label: 'Visa VoA Mesir' },
                            { value: 'Visa Single Entry Umrah', label: 'Visa Single Entry Umrah' },
                            { value: 'Visa Turis Elektronik Saudi', label: 'Visa Turis Elektronik Saudi' },
                            { value: 'Umrah Plus', label: 'Umrah Plus' },
                          ]}
                        />
                        <Input label="Provider" {...register('provider')} placeholder="Provider..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <Select 
                          label="Tipe Entry" 
                          {...register('entryType')}
                          error={errors.entryType?.message}
                          options={[
                            { value: 'Single Entry', label: 'Single Entry' },
                            { value: 'Multiple Entry', label: 'Multiple Entry' },
                          ]}
                        />
                        <Input label="Durasi (Hari)" {...register('duration')} placeholder="90" />
                    </div>
                    <Input label="Waktu Proses (Estimasi)" {...register('processingTime')} placeholder="3-5 Hari Kerja" />
                </CardContent>
            </Card>

            <Card accentColor={BRAND.secondary}>
                <CardContent>
                    <SectionHeader 
                      number={3} 
                      title="Harga & Mata Uang" 
                      icon={<Banknote size={18}/>} 
                      action={
                        <select {...register('currency')} className="bg-gray-100 text-xs font-bold p-1.5 rounded-md border border-gray-200 cursor-pointer outline-none">
                          <option value="IDR">IDR</option>
                          <option value="SAR">SAR</option>
                          <option value="USD">USD</option>
                        </select>
                      }
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input 
                          label="Jumlah Pax (Otomatis)" 
                          type="number" 
                          {...register('paxQuantity', {valueAsNumber:true})} 
                          className="bg-gray-100 font-bold" 
                          readOnly
                        />
                        <Input 
                          label="Harga Satuan" 
                          type="number" 
                          {...register('price', {valueAsNumber:true})} 
                          error={errors.price?.message}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card accentColor={BRAND.secondary}>
                <CardContent>
                    <SectionHeader number={4} title="Checklist & Catatan (Footer)" icon={<ClipboardList size={18}/>} />
                    <div className="space-y-5">
                        <Textarea 
                          label="Checklist Dokumen Fisik" 
                          {...register('checklist')} 
                          className="h-28 font-mono text-xs leading-relaxed" 
                        />
                        <Textarea 
                          label="Catatan Tambahan" 
                          {...register('notes')} 
                          className="h-24 text-xs leading-relaxed" 
                        />
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-[#3a0519] p-4 flex items-center justify-between text-white">
                         <div className="flex items-center gap-2">
                           <Calculator size={20} className="text-[#a77a0b]"/>
                           <span className="font-bold text-sm uppercase tracking-wide">Live Preview</span>
                         </div>
                         <div className="bg-white/10 px-2 py-1 rounded text-xs font-mono">{currency}</div>
                    </div>
                    <div className="p-5 space-y-5">
                         <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><User size={12}/> Leader / Jemaah</p>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="font-bold text-[#3a0519] text-sm">{w.customers?.[0]?.name || 'Belum diisi...'}</p>
                                {fields.length > 1 && <p className="text-xs text-gray-500 mt-1">+ {fields.length - 1} Jemaah Lainnya</p>}
                            </div>
                         </div>
                         <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <p className="text-xs font-bold text-yellow-700 uppercase mb-2 flex items-center gap-1"><Info size={12}/> Detail Visa</p>
                            <div className="flex justify-between text-sm border-b border-dashed border-yellow-200 pb-2 mb-2">
                              <span className="text-gray-600">Jenis</span>
                              <span className="font-bold text-[#3a0519] w-32 text-right truncate">{w.visaType}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Durasi</span>
                              <span className="font-bold text-[#3a0519]">{w.duration} Hari</span>
                            </div>
                         </div>
                         <div className="mt-4 pt-4 border-t border-gray-100">
                             <p className="text-xs font-bold text-gray-500 uppercase">Total ({currency})</p>
                             <p className="text-3xl font-bold text-[#3a0519] my-1">{currency} {total.toLocaleString('id-ID')}</p>
                             {currency !== 'IDR' && (
                                <div className="bg-white border border-[#a77a0b] border-dashed rounded-lg p-3 mt-3">
                                    <p className="text-[10px] font-bold text-[#a77a0b] uppercase mb-1">Estimasi Rupiah (+20%)</p>
                                    <p className="text-lg font-bold text-gray-800">Rp {convertedIDR.toLocaleString('id-ID', {maximumFractionDigits:0})}</p>
                                </div>
                             )}
                         </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button 
                      variant="success" 
                      size="lg" 
                      className="w-full text-base" 
                      onClick={handleSendWA} 
                      loading={isSending}
                      icon={<Send size={20}/>}
                    >
                      Kirim PDF ke WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleDownload} 
                      loading={isGenerating}
                      icon={<Download size={18}/>}
                    >
                      Download Manual
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}