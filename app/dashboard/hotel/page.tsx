"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Document, Page, Text, View, StyleSheet, pdf, Image as PdfImage, Link as PdfLink } from '@react-pdf/renderer';
import { Building2, Plus, Trash2, Send, Loader2, BedDouble, MapPin, Calculator, RefreshCw, User, Book, Image as ImageIcon, Link as LinkIcon, Info } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// --- 1. CONFIG & CONSTANTS ---
const MARKUP_PERCENT = 0.20; 

const BRAND = {
  primary: '#3a0519',   
  secondary: '#a77a0b', 
  accent: '#fdf8e8',    
};

// --- 2. DEFINISI TIPE DATA ---
type CustomerItem = {
  name: string;
  passport: string;
};

type HotelItem = {
  city: string;
  name: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  mapsUrl: string;
  image1: string;
  image2: string;
};

type RoomItem = {
  type: string;     
  qty: number;
  pricePerNight: number;
  nights: number;   
};

type HotelFormValues = {
  customers: CustomerItem[];
  customerWhatsapp: string;
  currency: string;
  hotels: HotelItem[];
  rooms: RoomItem[];
  notes: string;
  snapshotRate: number; 
};

// --- 3. HELPER ---
const calculateNights = (start: string, end: string) => {
  if (!start || !end) return 0;
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays > 0 ? diffDays : 0;
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
  sectionHeader: { backgroundColor: '#f8f9fa', padding: 8, marginTop: 15, marginBottom: 8, borderLeft: `4px solid ${BRAND.primary}` },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', color: BRAND.primary, textTransform: 'uppercase' },
  table: { width: '100%', marginBottom: 10, border: '1px solid #eee', borderRadius: 4 },
  rowHeader: { flexDirection: 'row', backgroundColor: BRAND.primary, padding: 8, color: '#fff', fontSize: 9, fontWeight: 'bold' },
  row: { flexDirection: 'row', borderBottom: '1px solid #eee', padding: 8, fontSize: 9 },
  
  // Kolom Styles
  colCity: { width: '20%' }, colHotel: { width: '40%' }, colDate: { width: '25%' }, colNight: { width: '15%', textAlign: 'center', fontWeight: 'bold' },
  colType: { width: '30%' }, colRoomNight: { width: '15%', textAlign: 'center' }, colQty: { width: '10%', textAlign: 'center' }, colPrice: { width: '20%', textAlign: 'right' }, colSubtotal: { width: '25%', textAlign: 'right', fontWeight: 'bold', color: BRAND.primary },
  colNo: { width: '10%', textAlign:'center' }, colPaxName: { width: '50%' }, colPassport: { width: '40%' },

  // Gallery & Map Styles (Update Rapih)
  galleryContainer: { marginTop: 5, marginBottom: 15, borderBottom: '1px dashed #eee', paddingBottom: 10 },
  galleryHeader: { fontSize: 11, fontWeight: 'bold', color: BRAND.primary, marginBottom: 5 },
  galleryRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  galleryImage: { width: 140, height: 90, objectFit: 'cover', borderRadius: 4, backgroundColor: '#f0f0f0' },
  
  // Map Button Style (NEW)
  mapButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f0ff', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, alignSelf: 'flex-start' },
  mapText: { color: '#0066cc', fontSize: 8, textDecoration: 'none', fontWeight: 'bold' },

  totalBoxContainer: { flexDirection: 'column', alignItems: 'flex-end', marginTop: 15 },
  totalBox: { width: '50%', backgroundColor: BRAND.accent, padding: 12, borderRadius: 4, border: `1px solid ${BRAND.secondary}`, marginBottom: 5 },
  idrBox: { width: '50%', backgroundColor: '#fff', padding: 8, borderRadius: 4, border: `1px dashed #ccc` },
  totalLabel: { fontSize: 9, color: '#666', textAlign: 'right', marginBottom: 4 },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: BRAND.primary, textAlign: 'right' },
  idrValue: { fontSize: 11, fontWeight: 'bold', color: '#555', textAlign: 'right' },
  
  // Notes Style
  notesContainer: { marginTop: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 4, borderLeft: '2px solid #ccc' },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#aaa', borderTop: '1px solid #eee', paddingTop: 10 }
});

const HotelPdfDocument = ({ data }: { data: HotelFormValues }) => {
  const grandTotal = data.rooms.reduce((acc, curr) => acc + (curr.pricePerNight * curr.qty * curr.nights), 0);
  const totalNights = data.hotels.reduce((acc, curr) => acc + curr.nights, 0);
  const idrEquivalent = data.currency !== 'IDR' ? grandTotal * data.snapshotRate * (1 + MARKUP_PERCENT) : 0;
  const leaderName = data.customers[0]?.name || "Pelanggan";

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
            <View style={pdfStyles.logoSection}>
                <PdfImage src={window.location.origin + "/rehlasticky.png"} style={pdfStyles.logo} />
                <View>
                    <Text style={pdfStyles.companyName}>TRAVEL REHLA</Text>
                    <Text style={pdfStyles.companySub}>PPIU SK No. 123/2026 | travelrehla.com</Text>
                </View>
            </View>
            <View style={pdfStyles.titleSection}>
                <Text style={pdfStyles.docTitle}>QUOTATION HOTEL</Text>
                <Text style={pdfStyles.docRef}>Date: {new Date().toLocaleDateString('id-ID')}</Text>
            </View>
        </View>
        
        <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 9, color: '#666' }}>Kepada Yth:</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
                {leaderName} {data.customers.length > 1 ? `& Rombongan (${data.customers.length} Pax)` : ''}
            </Text>
            <Text style={{ fontSize: 9, color: '#666', marginTop: 2 }}>{data.customerWhatsapp}</Text>
        </View>
        
        {/* A. MANIFEST */}
        <View style={pdfStyles.sectionHeader}><Text style={pdfStyles.sectionTitle}>A. Data Jamaah (Passenger Manifest)</Text></View>
        <View style={pdfStyles.table}>
            <View style={pdfStyles.rowHeader}><Text style={pdfStyles.colNo}>No</Text><Text style={pdfStyles.colPaxName}>Nama Lengkap</Text><Text style={pdfStyles.colPassport}>No. Paspor</Text></View>
            {data.customers.map((c, i) => (
                <View key={i} style={pdfStyles.row}><Text style={pdfStyles.colNo}>{i + 1}</Text><Text style={pdfStyles.colPaxName}>{c.name || '-'}</Text><Text style={pdfStyles.colPassport}>{c.passport || '-'}</Text></View>
            ))}
        </View>

        {/* B. ITINERARY */}
        <View style={pdfStyles.sectionHeader}><Text style={pdfStyles.sectionTitle}>B. Rincian Akomodasi (Total: {totalNights} Malam)</Text></View>
        <View style={pdfStyles.table}>
            <View style={pdfStyles.rowHeader}><Text style={pdfStyles.colCity}>Kota</Text><Text style={pdfStyles.colHotel}>Nama Hotel</Text><Text style={pdfStyles.colDate}>Check-In/Out</Text><Text style={pdfStyles.colNight}>Durasi</Text></View>
            {data.hotels.map((h, i) => (
                <View key={i} style={pdfStyles.row}><Text style={pdfStyles.colCity}>{h.city}</Text><Text style={pdfStyles.colHotel}>{h.name}</Text><Text style={pdfStyles.colDate}>{h.checkIn} - {h.checkOut}</Text><Text style={pdfStyles.colNight}>{h.nights} Malam</Text></View>
            ))}
        </View>

        {/* C. VISUALISASI HOTEL */}
        <View style={pdfStyles.sectionHeader}><Text style={pdfStyles.sectionTitle}>C. Visualisasi & Lokasi Hotel</Text></View>
        {data.hotels.map((h, i) => (
            <View key={i} style={pdfStyles.galleryContainer}>
                <Text style={pdfStyles.galleryHeader}>{i+1}. {h.name} ({h.city})</Text>
                
                {/* Images */}
                <View style={pdfStyles.galleryRow}>
                    {h.image1 ? <PdfImage src={h.image1} style={pdfStyles.galleryImage} /> : null}
                    {h.image2 ? <PdfImage src={h.image2} style={pdfStyles.galleryImage} /> : null}
                    {!h.image1 && !h.image2 && <Text style={{fontSize:8, color:'#999', fontStyle:'italic'}}>(Tidak ada preview foto)</Text>}
                </View>

                {/* Map Link (Tampilan Tombol Rapih) */}
                {h.mapsUrl && (
                     <PdfLink src={h.mapsUrl} style={pdfStyles.mapButton}>
                        <Text style={pdfStyles.mapText}>📍 Lihat Lokasi di Google Maps</Text>
                     </PdfLink>
                )}
            </View>
        ))}

        {/* D. HARGA */}
        <View style={pdfStyles.sectionHeader}><Text style={pdfStyles.sectionTitle}>D. Rincian Biaya</Text></View>
        <View style={pdfStyles.table}>
            <View style={pdfStyles.rowHeader}><Text style={pdfStyles.colType}>Tipe Kamar</Text><Text style={pdfStyles.colQty}>Jml</Text><Text style={pdfStyles.colRoomNight}>Durasi</Text><Text style={pdfStyles.colPrice}>Harga/Malam</Text><Text style={pdfStyles.colSubtotal}>Subtotal</Text></View>
            {data.rooms.map((r, i) => (
                <View key={i} style={pdfStyles.row}><Text style={pdfStyles.colType}>{r.type}</Text><Text style={pdfStyles.colQty}>{r.qty}</Text><Text style={pdfStyles.colRoomNight}>{r.nights} Mlm</Text><Text style={pdfStyles.colPrice}>{Number(r.pricePerNight).toLocaleString('id-ID')}</Text><Text style={pdfStyles.colSubtotal}>{data.currency} {(r.pricePerNight * r.qty * r.nights).toLocaleString('id-ID')}</Text></View>
            ))}
        </View>

        {/* TOTAL BOX */}
        <View style={pdfStyles.totalBoxContainer}>
            <View style={pdfStyles.totalBox}>
                <Text style={pdfStyles.totalLabel}>Grand Total ({data.currency}):</Text>
                <Text style={pdfStyles.totalValue}>{data.currency} {grandTotal.toLocaleString('id-ID')}</Text>
            </View>
            {data.currency !== 'IDR' && (
                <View style={pdfStyles.idrBox}>
                    <Text style={pdfStyles.totalLabel}>Estimasi Setara Rupiah:</Text>
                    <Text style={pdfStyles.idrValue}>Rp {Math.ceil(idrEquivalent).toLocaleString('id-ID')}</Text>
                    <Text style={{fontSize: 7, color:'#aaa', textAlign:'right', marginTop:2}}>*Kurs Transaksi (Est)</Text>
                </View>
            )}
        </View>

        {/* E. CATATAN TAMBAHAN (Wajib Muncul) */}
        <View style={pdfStyles.notesContainer}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5, color: BRAND.primary }}>Catatan Penting:</Text>
            <Text style={{ fontSize: 9, color: '#333', lineHeight: 1.5 }}>{data.notes}</Text>
        </View>

        <Text style={pdfStyles.footer}>Generated by Travel Rehla System | Document ID: {Date.now()}</Text>
      </Page>
    </Document>
  );
};

// --- 5. PAGE COMPONENT ---
export default function HotelGeneratorPage() {
  const [isSending, setIsSending] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [rates, setRates] = useState({ SAR: 4300, USD: 16200 });
  const [loadingRates, setLoadingRates] = useState(true);

  // FETCH RATE
  useEffect(() => {
    setIsClient(true);
    const fetchRates = async () => {
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await res.json();
            if(data && data.rates) {
                setRates({
                    USD: Math.ceil(data.rates.IDR),
                    SAR: Math.ceil(data.rates.IDR / data.rates.SAR)
                });
            }
        } catch (error) { toast.error("Gagal ambil kurs live, menggunakan default."); } 
        finally { setLoadingRates(false); }
    };
    fetchRates();
  }, []);

  const { register, control, setValue, watch } = useForm<HotelFormValues>({
    defaultValues: {
      customers: [{ name: '', passport: '' }], 
      customerWhatsapp: '',
      currency: 'SAR',
      notes: '1. Harga sewaktu-waktu dapat berubah (Subject to Availability).\n2. Pembayaran Full Payment untuk lock kamar.',
      hotels: [{ city: 'Madinah', name: '', checkIn: '', checkOut: '', nights: 0, mapsUrl: '', image1: '', image2: '' }],
      rooms: [{ type: 'Quad (Sekamar Ber-4)', qty: 1, pricePerNight: 0, nights: 0 }],
      snapshotRate: 0 
    }
  });

  const { fields: hotelFields, append: appendHotel, remove: removeHotel } = useFieldArray({ control, name: 'hotels' });
  const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({ control, name: 'rooms' });
  const { fields: customerFields, append: appendCustomer, remove: removeCustomer } = useFieldArray({ control, name: 'customers' });

  const watchedCustomers = useWatch({ control, name: 'customers' });
  const watchedHotels = useWatch({ control, name: 'hotels' });
  const watchedRooms = useWatch({ control, name: 'rooms' });
  const currency = useWatch({ control, name: 'currency' });

  // AUTO CALCULATE NIGHTS
  useEffect(() => {
    if (watchedHotels) {
        watchedHotels.forEach((h, index) => {
            if (h.checkIn && h.checkOut) {
                const nights = calculateNights(h.checkIn, h.checkOut);
                if (nights !== h.nights) setValue(`hotels.${index}.nights`, nights);
            }
        });
    }
  }, [watchedHotels, setValue]);

  // --- HITUNGAN LIVE ---
  const totalDuration = watchedHotels?.reduce((acc, h) => acc + (h.nights || 0), 0) || 0;
  // Hitung Total Kamar
  const totalRooms = watchedRooms?.reduce((acc, r) => acc + (r.qty || 0), 0) || 0;
  
  const grandTotal = watchedRooms?.reduce((acc, r) => acc + ((r.pricePerNight || 0) * (r.qty || 0) * (r.nights || 0)), 0) || 0;
  
  let currentRawRate = currency === 'SAR' ? rates.SAR : (currency === 'USD' ? rates.USD : 1);
  const convertedIDR_WithMarkup = grandTotal * currentRawRate * (1 + MARKUP_PERCENT);
  const leaderName = watchedCustomers && watchedCustomers.length > 0 ? watchedCustomers[0].name : '';

  const handleSend = async () => {
    const formDataValues = {
        customers: watchedCustomers,
        customerWhatsapp: watch('customerWhatsapp'),
        currency: currency,
        hotels: watchedHotels,
        rooms: watchedRooms,
        notes: watch('notes'),
        snapshotRate: currentRawRate
    };

    if(!leaderName || !formDataValues.customerWhatsapp) {
        toast.error("Nama Leader & WhatsApp wajib diisi!");
        return;
    }

    setIsSending(true);
    const toastId = toast.loading("Memproses PDF & Mengirim WA...");

    try {
        const blob = await pdf(<HotelPdfDocument data={formDataValues as HotelFormValues} />).toBlob();
        const formData = new FormData();
        const safeName = leaderName.replace(/\s+/g, '-');
        formData.append('file', blob, `Quotation-${safeName}.pdf`);
        formData.append('phone', formDataValues.customerWhatsapp);
        formData.append('caption', `*Assalamu'alaikum, Kak ${leaderName}* 👋\n\nBerikut penawaran *Hotel / Land Arrangement* + Info Detail Lokasi.\n\n🏨 *Durasi:* ${totalDuration} Malam\n🛏 *Total Kamar:* ${totalRooms} Unit\n💰 *Total:* ${currency} ${grandTotal.toLocaleString('id-ID')}\n\nTerima kasih! 🙏`);

        const res = await fetch('/api/send-quotation', { method: 'POST', body: formData });
        if(res.ok) toast.success("Sukses Terkirim!", { id: toastId });
        else { const err = await res.json(); toast.error("Gagal: " + err.message, { id: toastId }); }
    } catch (e) { toast.error("Error System", { id: toastId }); } finally { setIsSending(false); }
  };

  if (!isClient) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans text-slate-800">
      <Toaster position="top-center" richColors />

      {/* HEADER RATE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
            <h1 className="text-2xl font-bold text-[#3a0519] flex items-center gap-2">
                <Building2 className="text-[#a77a0b]"/> Generator Quotation Hotel
            </h1>
            <p className="text-sm text-gray-500 mt-1">Buat penawaran LA + Manifest + Galeri Foto Hotel.</p>
        </div>
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
        
        {/* === KIRI: FORM INPUT === */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* 1. DATA PELANGGAN */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4" style={{borderTopColor: BRAND.secondary}}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-[#3a0519] flex items-center gap-2"><User size={18}/> 1. Data Pelanggan & Paspor</h3>
                    <button type="button" onClick={() => appendCustomer({ name: '', passport: '' })} className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:underline">
                        <Plus size={14}/> Tambah Jamaah
                    </button>
                </div>
                <div className="mb-4 bg-green-50 p-3 rounded border border-green-100">
                     <label className="text-[10px] font-bold text-green-700 uppercase">WhatsApp Leader / Penerima File (Wajib)</label>
                     <input {...register('customerWhatsapp')} className="w-full p-2 border rounded mt-1 outline-none focus:ring-2 focus:ring-green-500 bg-white" placeholder="0812..." />
                </div>
                <div className="space-y-3">
                    {customerFields.map((field, index) => (
                        <div key={field.id} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-3 rounded border relative group">
                            <div className="flex-[3] w-full">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">
                                    {index === 0 ? "Nama Leader (Ketua)" : `Nama Jamaah #${index + 1}`}
                                </label>
                                <div className="flex items-center bg-white border rounded px-2 mt-1">
                                    <User size={14} className="text-gray-300 mr-2"/>
                                    <input {...register(`customers.${index}.name`)} className="w-full p-1.5 outline-none text-sm" placeholder="Nama sesuai paspor" />
                                </div>
                            </div>
                            <div className="flex-[2] w-full">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">No. Paspor</label>
                                <div className="flex items-center bg-white border rounded px-2 mt-1">
                                    <Book size={14} className="text-gray-300 mr-2"/>
                                    <input {...register(`customers.${index}.passport`)} className="w-full p-1.5 outline-none text-sm" placeholder="X123456" />
                                </div>
                            </div>
                            {index > 0 && <button onClick={() => removeCustomer(index)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>}
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. ITINERARY & FOTO */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4" style={{borderTopColor: BRAND.secondary}}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-[#3a0519] flex items-center gap-2"><MapPin size={18}/> 2. Akomodasi (Detail)</h3>
                    <button type="button" onClick={() => appendHotel({ city: 'Mekkah', name: '', checkIn: '', checkOut: '', nights: 0, mapsUrl: '', image1: '', image2: '' })} className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:underline"><Plus size={14}/> Tambah</button>
                </div>
                <div className="space-y-6">
                    {hotelFields.map((field, index) => (
                        <div key={field.id} className="bg-gray-50 p-4 rounded-lg border relative">
                            <button onClick={() => removeHotel(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                            
                            {/* Baris 1: Info Dasar */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
                                <div className="md:col-span-3">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Kota</label>
                                    <input {...register(`hotels.${index}.city`)} className="w-full p-1.5 border rounded text-sm bg-white" placeholder="Mekkah" />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Hotel</label>
                                    <input {...register(`hotels.${index}.name`)} className="w-full p-1.5 border rounded text-sm bg-white" placeholder="Pullman Zamzam" />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Check In</label>
                                    <input type="date" {...register(`hotels.${index}.checkIn`)} className="w-full p-1.5 border rounded text-sm bg-white" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Out</label>
                                    <input type="date" {...register(`hotels.${index}.checkOut`)} className="w-full p-1.5 border rounded text-sm bg-white" />
                                </div>
                            </div>

                            {/* Baris 2: Detail Visual (Baru) */}
                            <div className="bg-white p-3 rounded border border-gray-200">
                                <p className="text-[10px] font-bold text-[#a77a0b] mb-2 flex items-center gap-1"><ImageIcon size={12}/> DETAIL VISUAL (LINK)</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Link Maps (Google)</label>
                                        <div className="flex items-center border rounded px-2 mt-1">
                                            <LinkIcon size={12} className="text-gray-300 mr-2"/>
                                            <input {...register(`hotels.${index}.mapsUrl`)} className="w-full p-1.5 outline-none text-xs" placeholder="https://maps.app..." />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Link Foto 1</label>
                                        <div className="flex items-center border rounded px-2 mt-1">
                                            <ImageIcon size={12} className="text-gray-300 mr-2"/>
                                            <input {...register(`hotels.${index}.image1`)} className="w-full p-1.5 outline-none text-xs" placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Link Foto 2</label>
                                        <div className="flex items-center border rounded px-2 mt-1">
                                            <ImageIcon size={12} className="text-gray-300 mr-2"/>
                                            <input {...register(`hotels.${index}.image2`)} className="w-full p-1.5 outline-none text-xs" placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[9px] text-gray-400 mt-1 italic">*Tips: Copy 'Image Address' dari Google Images/Traveloka untuk foto.</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. PRICING */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4" style={{borderTopColor: BRAND.secondary}}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-[#3a0519] flex items-center gap-2"><BedDouble size={18}/> 3. Harga & Kamar</h3>
                    <div className="flex gap-2">
                         <select {...register('currency')} className="bg-gray-100 text-xs font-bold p-1 rounded border"><option value="SAR">SAR</option><option value="USD">USD</option><option value="IDR">IDR</option></select>
                        <button type="button" onClick={() => appendRoom({ type: 'Quad', qty: 1, pricePerNight: 0, nights: totalDuration })} className="text-xs flex items-center gap-1 font-bold text-blue-600 hover:underline"><Plus size={14}/> Tambah</button>
                    </div>
                </div>
                <div className="space-y-3">
                    {roomFields.map((field, index) => (
                        <div key={field.id} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-3 rounded border">
                            <div className="flex-[3] w-full"><label className="text-[10px] font-bold text-gray-400 uppercase">Tipe</label><input {...register(`rooms.${index}.type`)} className="w-full p-1.5 border rounded text-sm" /></div>
                            <div className="flex-[1] w-full"><label className="text-[10px] font-bold text-gray-400 uppercase text-center">Qty</label><input type="number" {...register(`rooms.${index}.qty`, {valueAsNumber:true})} className="w-full p-1.5 border rounded text-sm text-center" /></div>
                            <div className="flex-[1] w-full"><label className="text-[10px] font-bold text-gray-400 uppercase text-center">Malam</label><input type="number" {...register(`rooms.${index}.nights`, {valueAsNumber:true})} className="w-full p-1.5 border rounded text-sm text-center" /></div>
                            <div className="flex-[2] w-full"><label className="text-[10px] font-bold text-gray-400 uppercase text-right">Harga</label><input type="number" {...register(`rooms.${index}.pricePerNight`, {valueAsNumber:true})} className="w-full p-1.5 border rounded text-sm text-right" /></div>
                            <button onClick={() => removeRoom(index)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
                <div className="mt-4"><label className="text-xs font-bold text-gray-500 uppercase">Catatan</label><textarea {...register('notes')} rows={2} className="w-full p-2 border rounded mt-1 text-sm"></textarea></div>
            </div>
        </div>

        {/* === KANAN: LIVE PREVIEW === */}
        <div className="lg:col-span-4">
            <div className="sticky top-4 space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-[#3a0519] p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2"><Calculator size={20} className="text-[#a77a0b]"/><span className="font-bold text-sm uppercase">Live Preview</span></div>
                        <div className="bg-white/10 px-2 py-1 rounded text-xs font-mono">{currency}</div>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* 1. PELANGGAN */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><User size={12}/> Pelanggan</p>
                            <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                <p className="font-bold text-[#3a0519] text-sm">{leaderName || 'Belum diisi...'}</p>
                                {watchedCustomers && watchedCustomers.length > 1 && (<p className="text-xs text-gray-500 mt-1">+ {watchedCustomers.length - 1} Jamaah Lainnya</p>)}
                            </div>
                        </div>

                        {/* 2. SUMMARY (YANG HILANG TADI) */}
                         <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <p className="text-xs font-bold text-yellow-700 uppercase mb-2 flex items-center gap-1"><Info size={12}/> Ringkasan Request</p>
                            <div className="flex justify-between text-sm border-b border-dashed border-yellow-200 pb-1 mb-1">
                                <span className="text-gray-600">Total Durasi</span>
                                <span className="font-bold text-[#3a0519]">{totalDuration} Malam</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Kamar</span>
                                <span className="font-bold text-[#3a0519]">{totalRooms} Unit</span>
                            </div>
                        </div>

                        {/* 3. VISUAL (THUMBNAIL) */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><ImageIcon size={12}/> Visual Hotel</p>
                            <div className="space-y-3">
                                {watchedHotels && watchedHotels.map((h, i) => (
                                    <div key={i} className="flex gap-2 items-start border-b border-gray-100 pb-2">
                                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                            {h.image1 ? <img src={h.image1} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-[8px]">No Pic</div>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-gray-700">{h.name || 'Nama Hotel...'}</p>
                                            <div className="flex gap-2 mt-1">
                                                {h.image2 && <span className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded">2 Foto</span>}
                                                {h.mapsUrl && <span className="text-[9px] bg-green-50 text-green-600 px-1 rounded">Ada Peta</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TOTAL */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                             <p className="text-xs font-bold text-gray-500 uppercase">Total ({currency})</p>
                             <p className="text-2xl font-bold text-[#3a0519]">{currency} {grandTotal.toLocaleString('id-ID')}</p>
                             
                             {currency !== 'IDR' && (
                                <div className="bg-white border border-[#a77a0b] border-dashed rounded p-2 mt-2">
                                    <p className="text-[10px] font-bold text-[#a77a0b] uppercase">Estimasi Rupiah (+20%)</p>
                                    <p className="text-lg font-bold text-gray-700">Rp {convertedIDR_WithMarkup.toLocaleString('id-ID', {maximumFractionDigits:0})}</p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleSend}
                    disabled={isSending}
                    className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 transition disabled:opacity-50"
                >
                    {isSending ? <Loader2 size={20} className="animate-spin"/> : <Send size={20}/>}
                    {isSending ? 'Sedang Mengirim...' : 'Kirim PDF ke WhatsApp'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}