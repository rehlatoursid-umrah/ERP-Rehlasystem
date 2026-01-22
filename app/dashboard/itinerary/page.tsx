"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Document, Page, Text, View, StyleSheet, pdf, Image as PdfImage } from '@react-pdf/renderer';
import { Plane, Plus, Trash2, Send, Loader2, Calendar, User, Ticket, Calculator, Briefcase, Luggage, ArrowRight, Book, MapPin } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// --- 1. CONFIG & CONSTANTS ---
const MARKUP_PERCENT = 0.20; 

const BRAND = {
  primary: '#3a0519',   
  secondary: '#a77a0b', 
  accent: '#fdf8e8',    
};

// --- 2. TIPE DATA ---
type CustomerItem = {
  name: string;
  passport: string;
  ticketNumber: string;
};

type FlightSegment = {
  airline: string;       
  flightNumber: string;  
  origin: string;        
  destination: string;
  transit: string;       
  departTime: string;    
  arriveTime: string;    
  baggage: string;       
  cabinBaggage: string;  
  classType: string;     
};

type PricingTier = {
  adultQty: number; adultPrice: number;
  childQty: number; childPrice: number;
  infantQty: number; infantPrice: number;
};

type FlightFormValues = {
  customers: CustomerItem[];
  customerWhatsapp: string;  
  pnrCode: string;           
  currency: string;          
  routes: FlightSegment[];
  pricing: PricingTier;
  notes: string;
  snapshotRate: number;      
};

// --- 3. HELPER ---
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

// --- 4. PDF TEMPLATE ---
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottom: `2px solid ${BRAND.secondary}`, paddingBottom: 15 },
  logoSection: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 50, height: 50, marginRight: 10 },
  companyName: { fontSize: 18, fontWeight: 'bold', color: BRAND.primary },
  companySub: { fontSize: 9, color: '#666' },
  titleSection: { alignItems: 'flex-end', justifyContent: 'center' },
  docTitle: { fontSize: 16, fontWeight: 'bold', color: BRAND.primary, textTransform: 'uppercase' },
  docRef: { fontSize: 9, color: '#888', marginTop: 4 },
  pnrContainer: { backgroundColor: '#f8f9fa', padding: 10, borderRadius: 5, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${BRAND.secondary}` },
  pnrLabel: { fontSize: 8, color: '#666', textTransform: 'uppercase' },
  pnrValue: { fontSize: 14, fontWeight: 'bold', color: '#000', letterSpacing: 1 },
  sectionHeader: { fontSize: 11, fontWeight: 'bold', color: BRAND.primary, marginBottom: 8, marginTop: 15, borderBottom: '1px solid #eee', paddingBottom: 5 },
  table: { width: '100%', marginBottom: 5 },
  rowHeader: { flexDirection: 'row', backgroundColor: BRAND.primary, padding: 6, color: '#fff', fontSize: 8, fontWeight: 'bold' },
  row: { flexDirection: 'row', borderBottom: '1px solid #eee', padding: 6, fontSize: 9 },
  colNo: { width: '5%', textAlign:'center' }, 
  colName: { width: '35%' }, 
  colPass: { width: '25%' }, 
  colTicket: { width: '35%' }, 
  flightRow: { flexDirection: 'row', marginBottom: 10, paddingBottom: 10, borderBottom: '1px dashed #eee' },
  flightLeft: { width: '20%', alignItems: 'center', justifyContent: 'center' },
  flightMid: { width: '55%', paddingLeft: 10, justifyContent: 'center' }, 
  flightRight: { width: '25%', alignItems: 'flex-end' },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 }, 
  routeCity: { fontSize: 11, fontWeight: 'bold', color: BRAND.primary }, 
  routeDot: { fontSize: 14, color: '#a77a0b', marginHorizontal: 8, marginTop: -2 }, 
  transitText: { fontSize: 8, color: '#666', fontStyle: 'italic', marginBottom: 4 }, 
  airlineText: { fontSize: 10, fontWeight: 'bold' },
  flightNoText: { fontSize: 9, color: '#666', marginBottom: 4 },
  timeText: { fontSize: 9, color: '#333' },
  baggageLabel: { fontSize: 7, color: '#888', marginTop: 2 },
  colPax: { width: '40%' }, colQty: { width: '20%', textAlign: 'center' }, colPrice: { width: '40%', textAlign: 'right' },
  totalBoxContainer: { flexDirection: 'column', alignItems: 'flex-end', marginTop: 20 },
  totalBox: { width: '50%', backgroundColor: BRAND.accent, padding: 12, borderRadius: 4, border: `1px solid ${BRAND.secondary}`, marginBottom: 5 },
  idrBox: { width: '50%', backgroundColor: '#fff', padding: 8, borderRadius: 4, border: `1px dashed #ccc` },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: BRAND.primary, textAlign: 'right' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#aaa', borderTop: '1px solid #eee', paddingTop: 10 }
});

const FlightPdfDocument = ({ data }: { data: FlightFormValues }) => {
  // SAFE DESTRUCTURING
  const pricing = data.pricing || {};
  const adultQty = pricing.adultQty || 0;
  const adultPrice = pricing.adultPrice || 0;
  const childQty = pricing.childQty || 0;
  const childPrice = pricing.childPrice || 0;
  const infantQty = pricing.infantQty || 0;
  const infantPrice = pricing.infantPrice || 0;

  const grandTotal = (adultQty * adultPrice) + (childQty * childPrice) + (infantQty * infantPrice);
  const idrEquivalent = data.currency !== 'IDR' ? grandTotal * (data.snapshotRate || 0) * (1 + MARKUP_PERCENT) : 0;
  const leaderName = (data.customers && data.customers[0]) ? data.customers[0].name : "Pelanggan";

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
            <View style={pdfStyles.logoSection}>
                <PdfImage src={window.location.origin + "/rehlasticky.png"} style={pdfStyles.logo} />
                <View>
                    <Text style={pdfStyles.companyName}>TRAVEL REHLA</Text>
                    <Text style={pdfStyles.companySub}>PPIU SK No. 123/2026</Text>
                </View>
            </View>
            <View style={pdfStyles.titleSection}>
                <Text style={pdfStyles.docTitle}>TIKET PESAWAT</Text>
                <Text style={pdfStyles.docRef}>Ref: FL-{Date.now().toString().slice(-6)}</Text>
            </View>
        </View>
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
        <Text style={pdfStyles.sectionHeader}>A. DATA PENUMPANG (PASSENGER MANIFEST)</Text>
        <View style={pdfStyles.table}>
            <View style={pdfStyles.rowHeader}>
                <Text style={pdfStyles.colNo}>No</Text>
                <Text style={pdfStyles.colName}>Nama Lengkap</Text>
                <Text style={pdfStyles.colPass}>Nomor Paspor</Text>
                <Text style={pdfStyles.colTicket}>No. Tiket (E-Ticket)</Text>
            </View>
            {data.customers?.map((c, i) => (
                <View key={i} style={pdfStyles.row}>
                    <Text style={pdfStyles.colNo}>{i+1}</Text>
                    <Text style={pdfStyles.colName}>{c.name || '-'}</Text>
                    <Text style={pdfStyles.colPass}>{c.passport || '-'}</Text>
                    <Text style={pdfStyles.colTicket}>{c.ticketNumber || '-'}</Text>
                </View>
            ))}
        </View>
        <Text style={pdfStyles.sectionHeader}>B. RUTE PENERBANGAN (FLIGHT DETAILS)</Text>
        {data.routes?.map((route, i) => (
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
        <Text style={pdfStyles.sectionHeader}>C. RINCIAN BIAYA (PRICE BREAKDOWN)</Text>
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
        <View style={pdfStyles.totalBoxContainer}>
            <View style={pdfStyles.totalBox}>
                <Text style={{fontSize:9, color:'#666', textAlign:'right'}}>Grand Total ({data.currency}):</Text>
                <Text style={pdfStyles.totalValue}>{data.currency} {grandTotal.toLocaleString('id-ID')}</Text>
            </View>
            {data.currency !== 'IDR' && (
                <View style={pdfStyles.idrBox}>
                    <Text style={{fontSize:9, color:'#666', textAlign:'right'}}>Estimasi Setara Rupiah:</Text>
                    <Text style={{fontSize:11, fontWeight:'bold', textAlign:'right', color:'#555'}}>Rp {Math.ceil(idrEquivalent).toLocaleString('id-ID')}</Text>
                    <Text style={{fontSize:7, color:'#aaa', textAlign:'right', marginTop:2}}>*Sudah termasuk pajak & overhead</Text>
                </View>
            )}
        </View>
        <View style={{marginTop:20, padding:10, backgroundColor:'#f9f9f9', borderRadius:4}}>
            <Text style={{fontSize:9, fontWeight:'bold', marginBottom:5}}>Catatan Tiket:</Text>
            <Text style={{fontSize:9, color:'#555', lineHeight:1.5}}>{data.notes}</Text>
        </View>
        <Text style={pdfStyles.footer}>Travel Rehla System | Flight Quotation Generated at {new Date().toLocaleDateString()}</Text>
      </Page>
    </Document>
  );
};

// --- 5. MAIN PAGE ---
export default function FlightGeneratorPage() {
  const [isSending, setIsSending] = useState(false);
  const [rates, setRates] = useState({ SAR: 4300, USD: 16200 });
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await res.json();
            if(data?.rates) {
                setRates({
                    USD: Math.ceil(data.rates.IDR),
                    SAR: Math.ceil(data.rates.IDR / data.rates.SAR)
                });
            }
        } catch (e) { toast.error("Gagal load rate, pakai default."); } 
        finally { setLoadingRates(false); }
    };
    fetchRates();
  }, []);

  const { register, control, watch } = useForm<FlightFormValues>({
    defaultValues: {
      customers: [{ name: '', passport: '', ticketNumber: '' }], 
      customerWhatsapp: '', 
      pnrCode: '', 
      currency: 'IDR',
      notes: 'Tiket Non-Refundable / Reschedule kena charge sesuai maskapai.',
      routes: [{ airline: 'Saudia', flightNumber: '', origin: 'CGK', destination: 'JED', transit: '', departTime: '', arriveTime: '', baggage: '2x23kg', cabinBaggage: '7kg', classType: 'Economy' }], 
      pricing: { adultQty: 1, adultPrice: 0, childQty: 0, childPrice: 0, infantQty: 0, infantPrice: 0 },
      snapshotRate: 0
    }
  });

  const { fields: routeFields, append: appendRoute, remove: removeRoute } = useFieldArray({ control, name: 'routes' });
  const { fields: customerFields, append: appendCustomer, remove: removeCustomer } = useFieldArray({ control, name: 'customers' });
  
  const w = useWatch({ control });
  const currency = w.currency || 'IDR';
  
  // SAFE CALCULATION
  const pricing = w.pricing || {};
  const adultQty = pricing.adultQty || 0;
  const adultPrice = pricing.adultPrice || 0;
  const childQty = pricing.childQty || 0;
  const childPrice = pricing.childPrice || 0;
  const infantQty = pricing.infantQty || 0;
  const infantPrice = pricing.infantPrice || 0;

  const grandTotal = (adultQty * adultPrice) + (childQty * childPrice) + (infantQty * infantPrice);
  
  let currentRawRate = currency === 'SAR' ? rates.SAR : (currency === 'USD' ? rates.USD : 1);
  const convertedIDR = grandTotal * currentRawRate * (1 + MARKUP_PERCENT);
  const leaderName = (w.customers && w.customers[0]) ? w.customers[0].name : '';

  const handleSend = async () => {
    if(!leaderName || !w.customerWhatsapp) { toast.error("Data Leader wajib diisi!"); return; }
    
    setIsSending(true);
    const toastId = toast.loading("Memproses Tiket...");
    try {
        const formDataValues = { ...w, snapshotRate: currentRawRate } as FlightFormValues;
        const blob = await pdf(<FlightPdfDocument data={formDataValues} />).toBlob();
        const formData = new FormData();
        const safeName = leaderName.replace(/\s+/g, '-');
        formData.append('file', blob, `Flight-${safeName}.pdf`);
        formData.append('phone', w.customerWhatsapp);
        formData.append('caption', `*Tiket Penerbangan*\nKepada Yth: ${leaderName}\n\nKode Booking: *${w.pnrCode || 'DRAFT'}*\nTotal: ${currency} ${grandTotal.toLocaleString('id-ID')}\n\nSilakan cek lampiran PDF.`);
        const res = await fetch('/api/send-quotation', { method: 'POST', body: formData });
        if(res.ok) toast.success("Tiket Terkirim!", { id: toastId });
        else toast.error("Gagal Kirim", { id: toastId });
    } catch(e) { toast.error("Error System", { id: toastId }); } finally { setIsSending(false); }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans text-slate-800">
      <Toaster position="top-center" richColors />
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
            <h1 className="text-2xl font-bold text-[#3a0519] flex items-center gap-2"><Plane className="text-[#a77a0b]"/> Flight Quotation</h1>
            <p className="text-sm text-gray-500">Buat penawaran tiket pesawat + Manifest + E-Ticket.</p>
        </div>
        <div className="flex gap-4">
            {!loadingRates && (
                <>
                    <div className="bg-white border px-3 py-1 rounded shadow-sm text-right"><p className="text-[10px] text-gray-400">SAR (XE)</p><p className="text-sm font-bold">Rp {rates.SAR.toLocaleString()}</p></div>
                    <div className="bg-white border px-3 py-1 rounded shadow-sm text-right"><p className="text-[10px] text-gray-400">USD (XE)</p><p className="text-sm font-bold">Rp {rates.USD.toLocaleString()}</p></div>
                </>
            )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-t-4 shadow-sm" style={{borderTopColor: BRAND.secondary}}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-[#3a0519] flex items-center gap-2"><User size={18}/> 1. Data Penumpang (Manifest)</h3>
                    <button type="button" onClick={() => appendCustomer({ name: '', passport: '', ticketNumber: '' })} className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:underline"><Plus size={14}/> Tambah Jamaah</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-green-50 p-3 rounded border border-green-100">
                    <div><label className="text-[10px] font-bold text-green-700 uppercase">WhatsApp Leader / Penerima (Wajib)</label><input {...register('customerWhatsapp')} className="input-field bg-white" placeholder="08..." /></div>
                    <div><label className="text-[10px] font-bold text-blue-700 uppercase">Kode Booking (PNR)</label><input {...register('pnrCode')} className="input-field bg-white font-mono uppercase tracking-widest" placeholder="6X2J9A" /></div>
                </div>
                <div className="space-y-3">
                    {customerFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-3 rounded border relative group">
                            <div className="md:col-span-4"><label className="text-[10px] font-bold text-gray-400 uppercase">{index === 0 ? "Nama Leader (Ketua)" : `Nama Jamaah #${index + 1}`}</label><div className="flex items-center bg-white border rounded px-2 mt-1"><User size={14} className="text-gray-300 mr-2"/><input {...register(`customers.${index}.name`)} className="w-full p-1.5 outline-none text-sm" placeholder="Nama sesuai paspor" /></div></div>
                            <div className="md:col-span-3"><label className="text-[10px] font-bold text-gray-400 uppercase">No. Paspor</label><div className="flex items-center bg-white border rounded px-2 mt-1"><Book size={14} className="text-gray-300 mr-2"/><input {...register(`customers.${index}.passport`)} className="w-full p-1.5 outline-none text-sm" placeholder="X123456" /></div></div>
                            <div className="md:col-span-4"><label className="text-[10px] font-bold text-gray-400 uppercase">No. Tiket</label><div className="flex items-center bg-white border rounded px-2 mt-1"><Ticket size={14} className="text-gray-300 mr-2"/><input {...register(`customers.${index}.ticketNumber`)} className="w-full p-1.5 outline-none text-sm" placeholder="977-123..." /></div></div>
                            <div className="md:col-span-1 text-right">{index > 0 && <button onClick={() => removeCustomer(index)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-t-4 shadow-sm" style={{borderTopColor: BRAND.secondary}}>
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-[#3a0519] flex items-center gap-2"><Ticket size={18}/> 2. Rute Penerbangan</h3><button type="button" onClick={() => appendRoute({ airline: 'Saudia', flightNumber: '', origin: '', destination: '', transit: '', departTime: '', arriveTime: '', baggage: '2x23kg', cabinBaggage: '7kg', classType: 'Economy' })} className="text-xs text-blue-600 font-bold hover:underline flex gap-1"><Plus size={14}/> Tambah Rute</button></div>
                <div className="space-y-4">
                    {routeFields.map((field, index) => (
                        <div key={field.id} className="bg-gray-50 p-4 rounded-lg border relative group">
                            <button onClick={() => removeRoute(index)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                <div><label className="label-xs">Maskapai</label><input {...register(`routes.${index}.airline`)} className="input-field" placeholder="Ex: Garuda" /></div>
                                <div><label className="label-xs">No. Flight</label><input {...register(`routes.${index}.flightNumber`)} className="input-field" placeholder="GA-981" /></div>
                                <div><label className="label-xs">Asal (Code)</label><input {...register(`routes.${index}.origin`)} className="input-field uppercase" placeholder="CGK" /></div>
                                <div><label className="label-xs">Tujuan (Code)</label><input {...register(`routes.${index}.destination`)} className="input-field uppercase" placeholder="JED" /></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                <div><label className="label-xs">Waktu Berangkat</label><input type="datetime-local" {...register(`routes.${index}.departTime`)} className="input-field text-xs" /></div>
                                <div><label className="label-xs">Waktu Tiba</label><input type="datetime-local" {...register(`routes.${index}.arriveTime`)} className="input-field text-xs" /></div>
                                <div className="md:col-span-1"><label className="label-xs text-orange-600">Transit (Opsional)</label><input {...register(`routes.${index}.transit`)} className="input-field bg-orange-50 border-orange-100" placeholder="Ex: Doha (DOH)" /></div>
                                <div><label className="label-xs">Kelas</label><select {...register(`routes.${index}.classType`)} className="input-field"><option>Economy</option><option>Business</option><option>First</option></select></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                                <div><label className="label-xs flex gap-1 items-center"><Luggage size={10}/> Cek-in (Kg)</label><input {...register(`routes.${index}.baggage`)} className="input-field" placeholder="2x23kg" /></div>
                                <div><label className="label-xs flex gap-1 items-center"><Briefcase size={10}/> Kabin (Kg)</label><input {...register(`routes.${index}.cabinBaggage`)} className="input-field" placeholder="7kg" /></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-t-4 shadow-sm" style={{borderTopColor: BRAND.secondary}}>
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-[#3a0519] flex items-center gap-2"><Calculator size={18}/> 3. Harga & Mata Uang</h3><select {...register('currency')} className="bg-gray-100 p-1 rounded border text-sm font-bold"><option value="IDR">IDR</option><option value="USD">USD</option><option value="SAR">SAR</option></select></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded border"><p className="font-bold text-xs mb-2 text-gray-700">Dewasa (Adult)</p><div className="grid grid-cols-2 gap-2"><div><label className="text-[9px] text-gray-400">Jumlah</label><input type="number" {...register('pricing.adultQty', {valueAsNumber:true})} className="input-field text-center" placeholder="0" /></div><div><label className="text-[9px] text-gray-400">Harga Satuan</label><input type="number" {...register('pricing.adultPrice', {valueAsNumber:true})} className="input-field text-right" placeholder="0" /></div></div></div>
                    <div className="bg-gray-50 p-3 rounded border"><p className="font-bold text-xs mb-2 text-gray-700">Anak (Child)</p><div className="grid grid-cols-2 gap-2"><div><label className="text-[9px] text-gray-400">Jumlah</label><input type="number" {...register('pricing.childQty', {valueAsNumber:true})} className="input-field text-center" placeholder="0" /></div><div><label className="text-[9px] text-gray-400">Harga Satuan</label><input type="number" {...register('pricing.childPrice', {valueAsNumber:true})} className="input-field text-right" placeholder="0" /></div></div></div>
                    <div className="bg-gray-50 p-3 rounded border"><p className="font-bold text-xs mb-2 text-gray-700">Bayi (Infant)</p><div className="grid grid-cols-2 gap-2"><div><label className="text-[9px] text-gray-400">Jumlah</label><input type="number" {...register('pricing.infantQty', {valueAsNumber:true})} className="input-field text-center" placeholder="0" /></div><div><label className="text-[9px] text-gray-400">Harga Satuan</label><input type="number" {...register('pricing.infantPrice', {valueAsNumber:true})} className="input-field text-right" placeholder="0" /></div></div></div>
                </div>
                <div className="mt-4"><label className="label-xs">Catatan Tambahan</label><textarea {...register('notes')} className="input-field w-full" rows={2}></textarea></div>
            </div>
        </div>
        <div className="lg:col-span-4">
            <div className="sticky top-4 space-y-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
                    <div className="bg-[#3a0519] h-2 w-full"></div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                             <div><p className="text-[10px] text-gray-400 font-bold uppercase">Leader Passenger</p><p className="font-bold text-lg text-gray-800">{leaderName || 'Nama...'}</p>{w.customers && w.customers.length > 1 && (<p className="text-xs text-gray-500 font-medium">+ {w.customers.length - 1} Jamaah Lainnya</p>)}</div>
                             <div className="text-right"><p className="text-[10px] text-gray-400 font-bold uppercase">PNR Code</p><p className="font-mono font-bold text-xl text-[#a77a0b] tracking-widest">{w.pnrCode || '---'}</p></div>
                        </div>
                        <div className="space-y-4 relative">
                            <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gray-200 z-0"></div>
                            {w.routes?.map((r, i) => (
                                <div key={i} className="relative z-10 flex gap-4 bg-white py-1">
                                    <div className="flex flex-col items-center"><div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-white shadow-sm"><Plane size={16} /></div></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-gray-800">{r.origin || 'ORIG'} <ArrowRight size={10} className="inline"/> {r.destination || 'DEST'}</span><span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{r.airline}</span></div>
                                        {r.transit && (<p className="text-[9px] text-orange-600 bg-orange-50 px-1 rounded w-fit mb-1 flex items-center gap-1"><MapPin size={8}/> Via: {r.transit}</p>)}
                                        <p className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar size={10}/> {r.departTime ? new Date(r.departTime).toLocaleDateString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : '-'}</p>
                                        <div className="flex gap-3 mt-1"><p className="text-[10px] text-gray-400 flex items-center gap-1"><Luggage size={10}/> {r.baggage}</p><p className="text-[10px] text-gray-400 flex items-center gap-1"><Briefcase size={10}/> {r.cabinBaggage}</p></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-dashed border-gray-300">
                             <div className="flex justify-between items-end"><div><p className="text-xs text-gray-400">Total Price</p></div><div><p className="text-2xl font-bold text-[#3a0519]">{currency} {grandTotal.toLocaleString('id-ID')}</p></div></div>
                             {currency !== 'IDR' && (<div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-200 text-right"><p className="text-[10px] font-bold text-yellow-700">Estimasi Rupiah (+20%)</p><p className="text-sm font-bold text-gray-700">Rp {convertedIDR.toLocaleString('id-ID', {maximumFractionDigits:0})}</p></div>)}
                        </div>
                    </div>
                </div>
                <button onClick={handleSend} disabled={isSending} className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 transition disabled:opacity-50">{isSending ? <Loader2 size={20} className="animate-spin"/> : <Send size={20}/>}{isSending ? 'Sending...' : 'Kirim PDF ke WhatsApp'}</button>
            </div>
        </div>
      </div>
      <style jsx global>{`.input-field { width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem; outline: none; } .input-field:focus { border-color: ${BRAND.secondary}; ring: 1px; } .label-xs { display: block; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }`}</style>
    </div>
  );
}