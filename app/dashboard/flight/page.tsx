"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Document, Page, Text, View, StyleSheet, pdf, Image as PdfImage } from '@react-pdf/renderer';
import { Plane, Plus, Trash2, Send, Loader2, Calendar, User, Ticket, Calculator, Briefcase, Luggage, ArrowRight, Book, MapPin, Download } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Shared Components & Utils
import { Input, Textarea, Select } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { PageHeader, SectionHeader } from '@/app/components/layout/PageHeader';
import { CurrencyRateWidget } from '@/app/components/shared/CurrencyRateWidget';
import { useExchangeRate } from '@/app/hooks/useExchangeRate';
import { flightQuotationSchema, FlightQuotationInput } from '@/app/lib/validators';
import { PdfHeader, PdfFooter, PdfSectionHeader, pdfSharedStyles } from '@/app/components/pdf/PdfShared';
import { BRAND } from '@/app/lib/constants';

// --- 1. HELPER ---
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getDuration = (start: string, end: string) => {
  if (!start || !end) return '';
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}j ${minutes}m`;
};

// --- 2. PDF TEMPLATE ---
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  
  // PNR Box
  pnrContainer: { backgroundColor: '#f8f9fa', padding: 10, borderRadius: 5, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${BRAND.secondary}` },
  pnrLabel: { fontSize: 8, color: '#666', textTransform: 'uppercase' },
  pnrValue: { fontSize: 14, fontWeight: 'bold', color: '#000', letterSpacing: 1 },
  
  // Tables
  table: { width: '100%', marginBottom: 5 },
  rowHeader: { flexDirection: 'row', backgroundColor: BRAND.primary, padding: 6, color: '#fff', fontSize: 8, fontWeight: 'bold' },
  row: { flexDirection: 'row', borderBottom: '1px solid #eee', padding: 6, fontSize: 9 },
  
  // Manifest Cols
  colNo: { width: '5%', textAlign:'center' }, 
  colName: { width: '35%' }, 
  colPass: { width: '25%' }, 
  colTicket: { width: '35%' }, 

  // Flight Row Style
  flightRow: { flexDirection: 'row', marginBottom: 10, paddingBottom: 10, borderBottom: '1px dashed #eee' },
  flightLeft: { width: '20%', alignItems: 'center', justifyContent: 'center' },
  flightMid: { width: '55%', paddingLeft: 10, justifyContent: 'center' }, 
  flightRight: { width: '25%', alignItems: 'flex-end' },
  
  // Route Text Styling
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 }, 
  routeCity: { fontSize: 11, fontWeight: 'bold', color: BRAND.primary }, 
  routeDot: { fontSize: 14, color: '#a77a0b', marginHorizontal: 8, marginTop: -2 }, 
  transitText: { fontSize: 8, color: '#666', fontStyle: 'italic', marginBottom: 4 }, 

  airlineText: { fontSize: 10, fontWeight: 'bold' },
  flightNoText: { fontSize: 9, color: '#666', marginBottom: 4 },
  timeText: { fontSize: 9, color: '#333' },
  baggageLabel: { fontSize: 7, color: '#888', marginTop: 2 },

  // Pricing Cols
  colPax: { width: '40%' }, colQty: { width: '20%', textAlign: 'center' }, colPrice: { width: '40%', textAlign: 'right' },

  // Totals
  totalBoxContainer: { flexDirection: 'column', alignItems: 'flex-end', marginTop: 20 },
  totalBox: { width: '50%', backgroundColor: BRAND.accent, padding: 12, borderRadius: 4, border: `1px solid ${BRAND.secondary}`, marginBottom: 5 },
  idrBox: { width: '50%', backgroundColor: '#fff', padding: 8, borderRadius: 4, border: `1px dashed #ccc` },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: BRAND.primary, textAlign: 'right' },
});

const FlightPdfDocument = ({ data }: { data: any }) => {
  const pricing = data.pricing || {};
  const adultQty = pricing.adultQty || 0;
  const adultPrice = pricing.adultPrice || 0;
  const childQty = pricing.childQty || 0;
  const childPrice = pricing.childPrice || 0;
  const infantQty = pricing.infantQty || 0;
  const infantPrice = pricing.infantPrice || 0;

  const grandTotal = (adultQty * adultPrice) + (childQty * childPrice) + (infantQty * infantPrice);
  const leaderName = (data.customers && data.customers[0]) ? data.customers[0].name : "Pelanggan";
  const showIdrEstimate = data.currency !== 'IDR' && data.convertedIDR > 0;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader title="TIKET PESAWAT" refNumber={`Ref: FL-${Date.now().toString().slice(-6)}`} />

        {/* Customer & PNR */}
        <View style={pdfStyles.pnrContainer}>
            <View>
                <Text style={pdfStyles.pnrLabel}>LEADER / CONTACT</Text>
                <Text style={{fontSize:11, fontWeight:'bold', marginTop:2}}>{leaderName}</Text>
                <Text style={{fontSize:9, color:'#666'}}>{data.customerWhatsapp}</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
                <Text style={pdfStyles.pnrLabel}>BOOKING CODE (PNR)</Text>
                <Text style={pdfStyles.pnrValue}>{data.pnrCode || 'DRAFT'}</Text>
            </View>
        </View>

        {/* 1. MANIFEST */}
        <PdfSectionHeader title="A. DATA PENUMPANG (PASSENGER MANIFEST)" variant="bar" />
        <View style={pdfStyles.table}>
            <View style={pdfStyles.rowHeader}>
                <Text style={pdfStyles.colNo}>No</Text>
                <Text style={pdfStyles.colName}>Nama Lengkap</Text>
                <Text style={pdfStyles.colPass}>Nomor Paspor</Text>
                <Text style={pdfStyles.colTicket}>No. Tiket (E-Ticket)</Text>
            </View>
            {data.customers?.map((c: any, i: number) => (
                <View key={i} style={pdfStyles.row}>
                    <Text style={pdfStyles.colNo}>{i+1}</Text>
                    <Text style={pdfStyles.colName}>{c.name || '-'}</Text>
                    <Text style={pdfStyles.colPass}>{c.passport || '-'}</Text>
                    <Text style={pdfStyles.colTicket}>{c.ticketNumber || '-'}</Text>
                </View>
            ))}
        </View>

        {/* 2. FLIGHT DETAILS */}
        <PdfSectionHeader title="B. RUTE PENERBANGAN (FLIGHT DETAILS)" variant="bar" />
        {data.routes?.map((route: any, i: number) => (
            <View key={i} style={pdfStyles.flightRow}>
                <View style={pdfStyles.flightLeft}>
                    <Text style={pdfStyles.airlineText}>{route.airline}</Text>
                    <Text style={pdfStyles.flightNoText}>{route.flightNumber}</Text>
                    <Text style={{fontSize:8, color:'#666'}}>{route.classType}</Text>
                </View>
                <View style={pdfStyles.flightMid}>
                    <View style={pdfStyles.routeRow}>
                        <Text style={pdfStyles.routeCity}>{route.origin}</Text>
                        <Text style={pdfStyles.routeDot}>•</Text> 
                        <Text style={pdfStyles.routeCity}>{route.destination}</Text>
                    </View>
                    
                    {route.transit ? (
                        <Text style={pdfStyles.transitText}>Via: {route.transit}</Text>
                    ) : (
                        <Text style={[pdfStyles.transitText, {opacity:0}]}>Direct</Text> 
                    )}

                    <Text style={pdfStyles.timeText}>Berangkat: {formatDate(route.departTime)}</Text>
                    <Text style={pdfStyles.timeText}>Tiba: {formatDate(route.arriveTime)}</Text>
                </View>
                <View style={pdfStyles.flightRight}>
                    <Text style={{fontSize:9, fontWeight:'bold'}}>Durasi: {getDuration(route.departTime, route.arriveTime)}</Text>
                    <Text style={pdfStyles.baggageLabel}>Check-in: {route.baggage}</Text>
                    <Text style={pdfStyles.baggageLabel}>Kabin: {route.cabinBaggage}</Text>
                </View>
            </View>
        ))}

        {/* 3. PRICING */}
        <PdfSectionHeader title="C. RINCIAN BIAYA (PRICE BREAKDOWN)" variant="bar" />
        <View style={pdfStyles.table}>
            <View style={pdfStyles.rowHeader}>
                <Text style={pdfStyles.colPax}>Kategori Penumpang</Text>
                <Text style={pdfStyles.colQty}>Jumlah</Text>
                <Text style={pdfStyles.colPrice}>Harga Satuan</Text>
            </View>
            {adultQty > 0 && (
                <View style={pdfStyles.row}>
                    <Text style={pdfStyles.colPax}>Dewasa (Adult)</Text>
                    <Text style={pdfStyles.colQty}>{adultQty}</Text>
                    <Text style={pdfStyles.colPrice}>{Number(adultPrice).toLocaleString('id-ID')}</Text>
                </View>
            )}
            {childQty > 0 && (
                <View style={pdfStyles.row}>
                    <Text style={pdfStyles.colPax}>Anak (Child)</Text>
                    <Text style={pdfStyles.colQty}>{childQty}</Text>
                    <Text style={pdfStyles.colPrice}>{Number(childPrice).toLocaleString('id-ID')}</Text>
                </View>
            )}
            {infantQty > 0 && (
                <View style={pdfStyles.row}>
                    <Text style={pdfStyles.colPax}>Bayi (Infant)</Text>
                    <Text style={pdfStyles.colQty}>{infantQty}</Text>
                    <Text style={pdfStyles.colPrice}>{Number(infantPrice).toLocaleString('id-ID')}</Text>
                </View>
            )}
        </View>

        {/* Totals */}
        <View style={pdfStyles.totalBoxContainer}>
            <View style={pdfStyles.totalBox}>
                <Text style={{fontSize:9, color:'#666', textAlign:'right'}}>Grand Total ({data.currency}):</Text>
                <Text style={pdfStyles.totalValue}>{data.currency} {grandTotal.toLocaleString('id-ID')}</Text>
            </View>
            {showIdrEstimate && (
                <View style={pdfStyles.idrBox}>
                    <Text style={{fontSize:9, color:'#666', textAlign:'right'}}>Estimasi Setara Rupiah:</Text>
                    <Text style={{fontSize:11, fontWeight:'bold', textAlign:'right', color:'#555'}}>Rp {Math.ceil(data.convertedIDR).toLocaleString('id-ID')}</Text>
                    <Text style={{fontSize:7, color:'#aaa', textAlign:'right', marginTop:2}}>*Sudah termasuk pajak & overhead</Text>
                </View>
            )}
        </View>

        <View style={{marginTop:20, padding:10, backgroundColor:'#f9f9f9', borderRadius:4}}>
            <Text style={{fontSize:9, fontWeight:'bold', marginBottom:5}}>Catatan Tiket:</Text>
            <Text style={{fontSize:9, color:'#555', lineHeight:1.5}}>{data.notes}</Text>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
};

// --- 3. MAIN PAGE COMPONENT ---
export default function FlightGeneratorPage() {
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { convertToIDR, getRateFor } = useExchangeRate();

  const { register, control, watch, trigger, formState: { errors } } = useForm<FlightQuotationInput>({
    resolver: zodResolver(flightQuotationSchema),
    defaultValues: {
      customers: [{ name: '', passport: '', ticketNumber: '' }], 
      customerWhatsapp: '', 
      pnrCode: '', 
      currency: 'IDR',
      notes: 'Tiket Non-Refundable / Reschedule kena charge sesuai maskapai.',
      routes: [{ airline: 'Saudia', flightNumber: '', origin: 'CGK', destination: 'JED', transit: '', departTime: '', arriveTime: '', baggage: '2x23kg', cabinBaggage: '7kg', classType: 'Economy' }], 
      pricing: { adultQty: 1, adultPrice: 0, childQty: 0, childPrice: 0, infantQty: 0, infantPrice: 0 },
      snapshotRate: 1
    }
  });

  const { fields: routeFields, append: appendRoute, remove: removeRoute } = useFieldArray({ control, name: 'routes' });
  const { fields: customerFields, append: appendCustomer, remove: removeCustomer } = useFieldArray({ control, name: 'customers' });
  
  const w = useWatch({ control });
  const currency = w.currency || 'IDR';
  
  const pricing = w.pricing || {};
  const adultQty = pricing.adultQty || 0;
  const adultPrice = pricing.adultPrice || 0;
  const childQty = pricing.childQty || 0;
  const childPrice = pricing.childPrice || 0;
  const infantQty = pricing.infantQty || 0;
  const infantPrice = pricing.infantPrice || 0;

  const grandTotal = (adultQty * adultPrice) + (childQty * childPrice) + (infantQty * infantPrice);
  const convertedIDR = convertToIDR(grandTotal, currency);
  const leaderName = (w.customers && w.customers.length > 0 && w.customers[0].name) ? w.customers[0].name : '';

  const getPdfData = () => {
    return {
      ...w,
      snapshotRate: getRateFor(currency),
      convertedIDR
    };
  };

  const handleDownload = async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Mohon lengkapi semua field wajib");
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await pdf(<FlightPdfDocument data={getPdfData()} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); 
      link.href = url; 
      link.download = `Flight-${leaderName || 'Client'}.pdf`; 
      link.click();
      toast.success("PDF Penerbangan Siap!");
    } catch(e) { 
      toast.error("Gagal membuat PDF"); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handleSend = async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Mohon lengkapi semua field wajib");
      return;
    }

    setIsSending(true);
    const toastId = toast.loading("Memproses Tiket & Mengirim WA...");
    
    try {
        const formDataValues = getPdfData();
        const blob = await pdf(<FlightPdfDocument data={formDataValues} />).toBlob();
        
        const formData = new FormData();
        const safeName = leaderName.replace(/\s+/g, '-');
        formData.append('file', blob, `Flight-${safeName}.pdf`);
        formData.append('phone', w.customerWhatsapp as string);
        formData.append('caption', `*Tiket Penerbangan*\nKepada Yth: ${leaderName}\n\nKode Booking: *${w.pnrCode || 'DRAFT'}*\nTotal: ${currency} ${grandTotal.toLocaleString('id-ID')}\n\nSilakan cek lampiran PDF.`);

        const res = await fetch('/api/send-quotation', { method: 'POST', body: formData });
        if(res.ok) {
          toast.success("Tiket Terkirim!", { id: toastId });
        } else {
          toast.error("Gagal Kirim ke WA", { id: toastId });
        }
    } catch(e) { 
      toast.error("Error System", { id: toastId }); 
    } finally { 
      setIsSending(false); 
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />

      <PageHeader 
        title="Flight Quotation" 
        description="Buat penawaran tiket pesawat + Manifest + E-Ticket."
        icon={<Plane className="text-[#a77a0b]" size={28}/>}
        actions={<CurrencyRateWidget />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === FORM (KIRI) === */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* 1. DATA PENUMPANG (MANIFEST) */}
            <Card accentColor={BRAND.secondary}>
                <CardContent>
                    <SectionHeader 
                      number={1} 
                      title="Data Penumpang (Manifest)" 
                      icon={<User size={18}/>}
                      action={
                        <button type="button" onClick={() => appendCustomer({ name: '', passport: '', ticketNumber: '' })} className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:underline">
                          <Plus size={14}/> Tambah Jamaah
                        </button>
                      }
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
                        <Input 
                          label="WhatsApp Leader / Penerima (Wajib)" 
                          {...register('customerWhatsapp')} 
                          error={errors.customerWhatsapp?.message}
                          className="bg-white focus:ring-green-100 focus:border-green-500" 
                          placeholder="08..." 
                        />
                        <Input 
                          label="Kode Booking (PNR)" 
                          {...register('pnrCode')} 
                          className="bg-white font-mono uppercase tracking-widest focus:ring-green-100 focus:border-green-500" 
                          placeholder="6X2J9A" 
                        />
                    </div>

                    <div className="space-y-4">
                        {customerFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-100 relative">
                                <div className="md:col-span-4">
                                    <Input 
                                      label={index === 0 ? "Nama Leader (Ketua)" : `Nama Jamaah #${index + 1}`}
                                      icon={<User size={16} />}
                                      {...register(`customers.${index}.name` as const)}
                                      error={errors.customers?.[index]?.name?.message}
                                      placeholder="Sesuai paspor"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <Input 
                                      label="No. Paspor"
                                      icon={<Book size={16} />}
                                      {...register(`customers.${index}.passport` as const)}
                                      placeholder="X123456"
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <Input 
                                      label="No. Tiket"
                                      icon={<Ticket size={16} />}
                                      {...register(`customers.${index}.ticketNumber` as const)}
                                      placeholder="977-123..."
                                    />
                                </div>
                                <div className="md:col-span-1 flex justify-end">
                                     {index > 0 && (
                                       <button onClick={() => removeCustomer(index)} className="p-2.5 mt-6 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                                         <Trash2 size={18}/>
                                       </button>
                                     )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 2. ROUTES */}
            <Card accentColor={BRAND.secondary}>
                <CardContent>
                    <SectionHeader 
                      number={2} 
                      title="Rute Penerbangan" 
                      icon={<Ticket size={18}/>}
                      action={
                        <button type="button" onClick={() => appendRoute({ airline: 'Saudia', flightNumber: '', origin: '', destination: '', transit: '', departTime: '', arriveTime: '', baggage: '2x23kg', cabinBaggage: '7kg', classType: 'Economy' })} className="text-xs font-bold text-blue-600 hover:underline flex gap-1 items-center">
                          <Plus size={14}/> Tambah Rute
                        </button>
                      }
                    />

                    <div className="space-y-6">
                        {routeFields.map((field, index) => (
                            <div key={field.id} className="bg-gray-50 p-5 rounded-xl border border-gray-100 relative group">
                                {index > 0 && (
                                  <button onClick={() => removeRoute(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-white p-1 rounded-md border shadow-sm">
                                    <Trash2 size={16}/>
                                  </button>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pr-8">
                                    <Input label="Maskapai" {...register(`routes.${index}.airline` as const)} error={errors.routes?.[index]?.airline?.message} placeholder="Ex: Garuda" />
                                    <Input label="No. Flight" {...register(`routes.${index}.flightNumber` as const)} error={errors.routes?.[index]?.flightNumber?.message} placeholder="GA-981" />
                                    <Input label="Asal (Code)" {...register(`routes.${index}.origin` as const)} error={errors.routes?.[index]?.origin?.message} className="uppercase" placeholder="CGK" />
                                    <Input label="Tujuan (Code)" {...register(`routes.${index}.destination` as const)} error={errors.routes?.[index]?.destination?.message} className="uppercase" placeholder="JED" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <Input type="datetime-local" label="Waktu Berangkat" {...register(`routes.${index}.departTime` as const)} error={errors.routes?.[index]?.departTime?.message} />
                                    <Input type="datetime-local" label="Waktu Tiba" {...register(`routes.${index}.arriveTime` as const)} error={errors.routes?.[index]?.arriveTime?.message} />
                                    <Input label="Transit (Opsional)" {...register(`routes.${index}.transit` as const)} className="bg-orange-50 focus:border-orange-200" placeholder="Ex: Doha (DOH)" />
                                    <Select 
                                      label="Kelas" 
                                      {...register(`routes.${index}.classType` as const)}
                                      options={[
                                        { value: 'Economy', label: 'Economy' },
                                        { value: 'Business', label: 'Business' },
                                        { value: 'First', label: 'First' },
                                      ]}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input 
                                      label="Bagasi Cek-in (Kg)" 
                                      icon={<Luggage size={14}/>} 
                                      {...register(`routes.${index}.baggage` as const)} 
                                      placeholder="2x23kg" 
                                    />
                                    <Input 
                                      label="Bagasi Kabin (Kg)" 
                                      icon={<Briefcase size={14}/>} 
                                      {...register(`routes.${index}.cabinBaggage` as const)} 
                                      placeholder="7kg" 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 3. PRICING */}
            <Card accentColor={BRAND.secondary}>
                <CardContent>
                    <SectionHeader 
                      number={3} 
                      title="Harga & Mata Uang" 
                      icon={<Calculator size={18}/>}
                      action={
                        <select {...register('currency')} className="bg-gray-100 px-2 py-1.5 rounded-md border border-gray-200 text-xs font-bold outline-none cursor-pointer">
                          <option value="IDR">IDR</option>
                          <option value="USD">USD</option>
                          <option value="SAR">SAR</option>
                        </select>
                      }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                        {/* ADULT */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="font-bold text-sm mb-3 text-gray-700">Dewasa (Adult)</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Input type="number" label="Jumlah" {...register('pricing.adultQty', {valueAsNumber:true})} className="text-center" />
                                <Input type="number" label="Harga Satuan" {...register('pricing.adultPrice', {valueAsNumber:true})} className="text-right" />
                            </div>
                        </div>
                        {/* CHILD */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="font-bold text-sm mb-3 text-gray-700">Anak (Child)</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Input type="number" label="Jumlah" {...register('pricing.childQty', {valueAsNumber:true})} className="text-center" />
                                <Input type="number" label="Harga Satuan" {...register('pricing.childPrice', {valueAsNumber:true})} className="text-right" />
                            </div>
                        </div>
                        {/* INFANT */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="font-bold text-sm mb-3 text-gray-700">Bayi (Infant)</p>
                            <div className="grid grid-cols-2 gap-3">
                                <Input type="number" label="Jumlah" {...register('pricing.infantQty', {valueAsNumber:true})} className="text-center" />
                                <Input type="number" label="Harga Satuan" {...register('pricing.infantPrice', {valueAsNumber:true})} className="text-right" />
                            </div>
                        </div>
                    </div>

                    <Textarea 
                      label="Catatan Tambahan" 
                      {...register('notes')} 
                      rows={2} 
                      className="text-sm leading-relaxed"
                    />
                </CardContent>
            </Card>
        </div>

        {/* === LIVE PREVIEW (KANAN) === */}
        <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
                
                {/* TICKET CARD STYLE */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
                    <div className="bg-[#3a0519] h-2 w-full"></div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-5">
                             <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Leader Passenger</p>
                                <p className="font-bold text-lg text-gray-800 leading-tight mt-1">{leaderName || 'Nama...'}</p>
                                {w.customers && w.customers.length > 1 && (
                                    <p className="text-xs text-gray-500 font-medium mt-1">+ {w.customers.length - 1} Jamaah Lainnya</p>
                                )}
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">PNR Code</p>
                                <p className="font-mono font-bold text-xl text-[#a77a0b] tracking-widest mt-1">{w.pnrCode || '---'}</p>
                             </div>
                        </div>

                        {/* Timeline Preview */}
                        <div className="space-y-5 relative mt-4">
                            {/* Garis Vertikal */}
                            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gray-200 z-0"></div>
                            
                            {w.routes?.map((r, i) => (
                                <div key={i} className="relative z-10 flex gap-4 bg-white py-1">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-white shadow-sm">
                                            <Plane size={16} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-sm font-bold text-gray-800">{r.origin || 'ORIG'} <ArrowRight size={12} className="inline mx-1"/> {r.destination || 'DEST'}</span>
                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-md text-gray-600 font-medium border border-gray-200">{r.airline}</span>
                                        </div>
                                        
                                        {/* Transit Info in Preview */}
                                        {r.transit && (
                                            <p className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit mb-1.5 flex items-center gap-1 border border-orange-100">
                                                <MapPin size={10}/> Via: {r.transit}
                                            </p>
                                        )}

                                        <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                                            <Calendar size={12}/> {r.departTime ? new Date(r.departTime).toLocaleDateString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : '-'}
                                        </p>
                                        <div className="flex gap-4 mt-2">
                                            <p className="text-[10px] text-gray-500 flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded">
                                                <Luggage size={12}/> {r.baggage}
                                            </p>
                                            <p className="text-[10px] text-gray-500 flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded">
                                                <Briefcase size={12}/> {r.cabinBaggage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Price */}
                        <div className="mt-8 pt-5 border-t border-dashed border-gray-300">
                             <div className="flex justify-between items-end">
                                <div><p className="text-xs font-bold text-gray-400 uppercase">Total Price</p></div>
                                <div><p className="text-2xl font-bold text-[#3a0519]">{currency} {grandTotal.toLocaleString('id-ID')}</p></div>
                             </div>
                             {currency !== 'IDR' && (
                                <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-right">
                                    <p className="text-[10px] font-bold text-yellow-700 uppercase mb-1">Estimasi Rupiah (+20%)</p>
                                    <p className="text-sm font-bold text-gray-800">Rp {convertedIDR.toLocaleString('id-ID', {maximumFractionDigits:0})}</p>
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
                      onClick={handleSend} 
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