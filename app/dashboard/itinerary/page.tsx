"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Document, Page, Text, View, StyleSheet, pdf, Image as PdfImage } from '@react-pdf/renderer';
import { 
  BookOpen, Calendar, MapPin, Coffee, Utensils, Moon, 
  Loader2, Plane, Hotel, Calculator, User, Image as ImageIcon, 
  FileCheck, Trash2, Plus, Bus
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Shared Components & Utils
import { Input, Textarea, Select } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { itinerarySchema, ItineraryInput } from '@/app/lib/validators';
import { BRAND } from '@/app/lib/constants';

// --- 1. CONFIGURATION ---
const COLORS = {
  primary: '#3a0519',   
  secondary: '#c59d5f', 
  accent: '#fdf8e8',    
  text: '#1f2937',      
  gray: '#9ca3af',      
};

// --- 2. PDF STYLES ---
const s = StyleSheet.create({
  page: { padding: 0, fontFamily: 'Helvetica', backgroundColor: '#fff', color: '#333' },
  coverBg: { height: '100%', width: '100%', position: 'absolute', objectFit: 'cover' },
  coverOverlay: { position: 'absolute', bottom: 0, width: '100%', height: '40%', backgroundColor: COLORS.primary, opacity: 0.95, padding: 40, borderTopLeftRadius: 40 },
  coverTitle: { fontSize: 32, color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
  coverSub: { fontSize: 14, color: COLORS.secondary, letterSpacing: 2, marginBottom: 20 },
  coverBadge: { position: 'absolute', top: 40, right: 40, backgroundColor: COLORS.secondary, padding: 10, borderRadius: 5 },
  coverBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  headerBox: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: `2px solid ${COLORS.secondary}`, paddingBottom: 10, marginBottom: 20, paddingTop: 30, paddingHorizontal: 30 },
  headerTitle: { fontSize: 16, color: COLORS.primary, fontWeight: 'bold', textTransform: 'uppercase' },
  content: { paddingHorizontal: 30 },
  card: { border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 15, backgroundColor: '#f9fafb' },
  cardHeader: { fontSize: 10, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5, borderBottom: '1px solid #ddd', paddingBottom: 5 },
  grid2: { flexDirection: 'row', gap: 10 }, col2: { width: '48%' },
  cvBox: { flexDirection: 'row', backgroundColor: '#fcfcfc', border: `1px solid ${COLORS.secondary}`, borderRadius: 10, padding: 15, marginBottom: 20 },
  cvImg: { width: 70, height: 70, borderRadius: 35, objectFit: 'cover', marginRight: 15, backgroundColor: '#eee' },
  ticketBox: { border: '1px solid #ccc', borderRadius: 6, marginBottom: 10 },
  ticketHead: { backgroundColor: COLORS.primary, padding: 5, flexDirection: 'row', justifyContent: 'space-between' },
  ticketHeadText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  ticketBody: { padding: 10, flexDirection: 'row', justifyContent: 'space-between' },
  ticketInfo: { fontSize: 8, color: '#555', marginTop: 2 },
  hotelImg: { width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, marginBottom: 5, backgroundColor: '#eee' },
  hotelTitle: { fontSize: 11, fontWeight: 'bold', color: COLORS.primary },
  hotelSub: { fontSize: 8, color: '#666' },
  timelineItem: { flexDirection: 'row', marginBottom: 0, minHeight: 50 },
  timeCol: { width: '15%', alignItems: 'center', borderRight: `2px solid ${COLORS.secondary}`, paddingRight: 10, paddingTop: 5 },
  infoCol: { width: '85%', paddingLeft: 15, paddingBottom: 15 },
  dayCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.primary, color: '#fff', fontSize: 10, textAlign: 'center', paddingVertical: 4, marginBottom: 2 },
  priceRow: { flexDirection: 'row', borderBottom: '1px solid #eee', paddingVertical: 6 },
  priceLabel: { flex: 3, fontSize: 10, color: '#444' },
  priceVal: { flex: 1, fontSize: 10, fontWeight: 'bold', textAlign: 'right', color: COLORS.primary },
  totalRow: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: 8, borderRadius: 4, marginTop: 10 },
  totalLabel: { flex: 3, fontSize: 12, fontWeight: 'bold', color: '#fff' },
  totalVal: { flex: 1, fontSize: 12, fontWeight: 'bold', color: '#fff', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#aaa', borderTop: '1px solid #eee', paddingTop: 10 }
});

// --- 3. PDF COMPONENT ---
const BookletPdf = ({ data }: { data: ItineraryInput }) => {
  const totalPrice = (data.costFlight||0) + (data.costHotel||0) + (data.costVisa||0) + (data.costHandling||0) + (data.margin||0);
  
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {data.coverImage ? <PdfImage src={data.coverImage} style={s.coverBg} /> : <View style={[s.coverBg, {backgroundColor:'#ddd'}]}/>}
        <View style={s.coverBadge}><Text style={s.coverBadgeText}>PAKET PREMIUM</Text></View>
        <View style={s.coverOverlay}>
           <Text style={s.coverSub}>{data.programTitle}</Text>
           <Text style={s.coverTitle}>{data.packageName}</Text>
           <View style={{height:2, width:50, backgroundColor:COLORS.secondary, marginVertical:10}}/>
           <Text style={{color:'#fff', fontSize:12}}>Keberangkatan: {data.departDate ? new Date(data.departDate).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : '-'}</Text>
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.headerBox}><Text style={s.headerTitle}>Jadwal Perjalanan</Text></View>
        <View style={s.content}>
            {data.days.map((d, i) => (
                <View key={i} style={s.timelineItem} wrap={false}>
                    <View style={s.timeCol}>
                        <Text style={s.dayCircle}>{i+1}</Text>
                        <Text style={{fontSize:8, color:'#666'}}>{d.date ? new Date(d.date).toLocaleDateString('id-ID', {day:'numeric', month:'short'}) : '-'}</Text>
                    </View>
                    <View style={s.infoCol}>
                        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:2}}>
                            <Text style={{fontSize:9, fontWeight:'bold', color:COLORS.primary}}>{d.activity}</Text>
                            <Text style={{fontSize:8, backgroundColor:'#eee', padding:2}}>{d.time}</Text>
                        </View>
                        <Text style={{fontSize:8, color:'#666', marginBottom:2}}>📍 {d.city}</Text>
                        <Text style={{fontSize:8, color:'#666', marginBottom:2}}>🚌 {d.vehicle}</Text>
                        <View style={{flexDirection:'row', gap:5}}>
                            {d.meals.b && <Text style={{fontSize:7, border:'1px solid #ddd', padding:1}}>☕ Breakfast</Text>}
                            {d.meals.l && <Text style={{fontSize:7, border:'1px solid #ddd', padding:1}}>🍱 Lunch</Text>}
                            {d.meals.d && <Text style={{fontSize:7, border:'1px solid #ddd', padding:1}}>🍽️ Dinner</Text>}
                        </View>
                    </View>
                </View>
            ))}
        </View>
        <Text style={s.footer}>Travel Rehla | {data.packageName}</Text>
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.headerBox}><Text style={s.headerTitle}>Investasi & Fasilitas</Text></View>
        <View style={s.content}>
            <View style={s.card}>
                <Text style={s.cardHeader}>RINCIAN BIAYA (COST BREAKDOWN)</Text>
                <View style={s.priceRow}><Text style={s.priceLabel}>Tiket Penerbangan</Text><Text style={s.priceVal}>{data.currency} {(data.costFlight||0).toLocaleString('id-ID')}</Text></View>
                <View style={s.priceRow}><Text style={s.priceLabel}>Akomodasi Hotel</Text><Text style={s.priceVal}>{data.currency} {(data.costHotel||0).toLocaleString('id-ID')}</Text></View>
                <View style={s.priceRow}><Text style={s.priceLabel}>Visa & Dokumen</Text><Text style={s.priceVal}>{data.currency} {(data.costVisa||0).toLocaleString('id-ID')}</Text></View>
                <View style={s.priceRow}><Text style={s.priceLabel}>Handling & Muthowwif</Text><Text style={s.priceVal}>{data.currency} {(data.costHandling||0).toLocaleString('id-ID')}</Text></View>
                <View style={s.priceRow}><Text style={s.priceLabel}>Biaya Layanan</Text><Text style={s.priceVal}>{data.currency} {(data.margin||0).toLocaleString('id-ID')}</Text></View>
                <View style={s.totalRow}><Text style={s.totalLabel}>TOTAL HARGA PAKET</Text><Text style={s.totalVal}>{data.currency} {totalPrice.toLocaleString('id-ID')}</Text></View>
            </View>
            <View style={{marginTop:20, flexDirection:'row', gap:20}}>
                <View style={{flex:1}}><Text style={{fontSize:10, fontWeight:'bold', marginBottom:5, color:COLORS.primary}}>HARGA TERMASUK:</Text><Text style={{fontSize:9, lineHeight:1.5, color:'#555'}}>{data.includes}</Text></View>
                <View style={{flex:1}}><Text style={{fontSize:10, fontWeight:'bold', marginBottom:5, color:COLORS.secondary}}>HARGA TIDAK TERMASUK:</Text><Text style={{fontSize:9, lineHeight:1.5, color:'#555'}}>{data.excludes}</Text></View>
            </View>
        </View>
        <Text style={s.footer}>Travel Rehla | {data.packageName}</Text>
      </Page>
    </Document>
  );
};

// --- 4. MAIN PAGE ---
export default function ItineraryGeneratorPage() {
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('cover');

  const { register, control, watch, trigger, formState: { errors } } = useForm<ItineraryInput>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: {
      packageName: 'Paket Umrah Eksklusif 2026', programTitle: 'Menjemput Rindu di Baitullah', programDesc: 'Program perjalanan ibadah Umrah 9 hari...',
      coverImage: '', guideName: 'Ust. Abdullah', guideEdu: 'Lc. Univ Madinah', guideExp: '8 Tahun', guideLang: 'Arab/Indo', guidePhoto: '',
      airline: 'Saudia', flightRoute: 'CGK-JED', pnr: 'SA-12345', departFlight: 'SV-819', departDate: '2026-02-10', departTime: '11:00', airportOrigin: 'Soekarno Hatta (CGK)',
      arrivalDate: '2026-02-10', arrivalTime: '17:00', airportDest: 'King Abdulaziz (JED)',
      visaProvider: 'Muqeem', visaType: 'Umrah Visa', visaDuration: '90 Hari', muassasah: 'Rawaf Mina', visaIssueDate: '2026-01-01', visaExpiryDate: '2026-04-01',
      hotelMakkah: 'Zamzam Tower', hotelMakkahRating: '⭐⭐⭐⭐⭐', hotelMakkahLoc: 'Pelataran', hotelMakkahImg: '', hotelMakkahCheckIn: '', hotelMakkahCheckOut: '',
      hotelMadinah: 'Rove Hotel', hotelMadinahRating: '⭐⭐⭐⭐', hotelMadinahLoc: 'Pintu 25', hotelMadinahImg: '', hotelMadinahCheckIn: '', hotelMadinahCheckOut: '',
      days: [], currency: 'IDR', costFlight: 14000000, costHotel: 8000000, costVisa: 3500000, costHandling: 2000000, margin: 2500000,
      includes: '1. Tiket Pesawat PP\n2. Visa Umrah\n3. Hotel Fullboard', excludes: '1. Paspor\n2. Suntik Meningitis'
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'days' });
  const w = useWatch({ control });

  useEffect(() => { 
    if(fields.length === 0) {
      for(let i=0; i<9; i++) {
        append({ date: '', city: 'Makkah', activity: 'Ibadah', time: '08:00', vehicle: 'Bus AC', meals: {b:true, l:true, d:true} }); 
      }
    }
  }, [append, fields.length]);

  const handleDownload = async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Mohon cek kembali isian form");
      return;
    }

    setIsSending(true);
    try {
        const blob = await pdf(<BookletPdf data={w as ItineraryInput} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); 
        link.href = url; 
        link.download = `Booklet-${w.packageName}.pdf`; 
        link.click();
        toast.success("Booklet Premium Siap!");
    } catch(e) { 
      toast.error("Gagal Render PDF"); 
    } finally { 
      setIsSending(false); 
    }
  };

  const tabs = [
    { id: 'cover', label: 'Cover', icon: <ImageIcon size={14}/> },
    { id: 'guide', label: 'Muthowwif', icon: <User size={14}/> },
    { id: 'flight', label: 'Flight', icon: <Plane size={14}/> },
    { id: 'visa', label: 'Visa', icon: <FileCheck size={14}/> },
    { id: 'hotel', label: 'Hotel', icon: <Hotel size={14}/> },
    { id: 'itinerary', label: 'Itinerary', icon: <Calendar size={14}/> },
    { id: 'pricing', label: 'Pricing', icon: <Calculator size={14}/> },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 font-sans text-slate-800 -mx-6 md:-mx-8">
      <Toaster position="top-center" richColors />
      
      {/* Left Panel - Editor */}
      <div className="w-7/12 flex flex-col border-r bg-white h-full overflow-hidden">
        
        {/* Header Tabs */}
        <div className="border-b z-10 bg-white shadow-sm flex flex-col">
            <div className="p-4 flex items-center gap-2 border-b border-gray-100">
              <BookOpen size={20} className="text-[#3a0519]"/>
              <h1 className="font-bold text-[#3a0519] text-lg">Booklet Engine Pro</h1>
            </div>
            <div className="flex overflow-x-auto px-4 py-3 gap-2 no-scrollbar">
                {tabs.map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => setActiveTab(t.id)} 
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg uppercase transition whitespace-nowrap ${activeTab === t.id ? 'bg-[#3a0519] text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {activeTab === 'cover' && (
              <div className="space-y-5 animate-in fade-in">
                  <Input label="Nama Paket" {...register('packageName')} error={errors.packageName?.message} className="font-bold text-lg" />
                  <Input label="Tagline / Sub-title" {...register('programTitle')} />
                  <Textarea label="Deskripsi Program" {...register('programDesc')} rows={4} />
                  <Input label="URL Cover Image (High-Res)" {...register('coverImage')} placeholder="https://..." icon={<ImageIcon size={16}/>} />
              </div>
            )}
            
            {activeTab === 'guide' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="grid grid-cols-2 gap-5">
                    <Input label="Nama Muthowwif" {...register('guideName')} icon={<User size={16}/>} />
                    <Input label="Pendidikan Terakhir" {...register('guideEdu')} placeholder="Lc. Univ Madinah" />
                    <Input label="Pengalaman" {...register('guideExp')} placeholder="8 Tahun" />
                    <Input label="Bahasa" {...register('guideLang')} placeholder="Arab/Indo" />
                    <div className="col-span-2">
                        <Input label="URL Foto Profile" {...register('guidePhoto')} placeholder="https://..." icon={<ImageIcon size={16}/>} />
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'flight' && (
              <div className="space-y-5 animate-in fade-in">
                  <div className="grid grid-cols-3 gap-4">
                      <Input label="Maskapai" {...register('airline')} placeholder="Saudia" />
                      <Input label="Rute" {...register('flightRoute')} placeholder="CGK-JED" />
                      <Input label="PNR" {...register('pnr')} placeholder="SA-12345" />
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mt-4">
                      <h4 className="font-bold text-sm mb-3">Keberangkatan (Departure)</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <Input label="No Penerbangan" {...register('departFlight')} />
                          <Input type="date" label="Tanggal" {...register('departDate')} />
                          <Input type="time" label="Jam" {...register('departTime')} />
                          <Input label="Bandara Asal" {...register('airportOrigin')} />
                      </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="font-bold text-sm mb-3">Kedatangan (Arrival)</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <Input type="date" label="Tanggal" {...register('arrivalDate')} />
                          <Input type="time" label="Jam" {...register('arrivalTime')} />
                          <div className="col-span-2">
                              <Input label="Bandara Tujuan" {...register('airportDest')} />
                          </div>
                      </div>
                  </div>
              </div>
            )}

            {activeTab === 'visa' && (
              <div className="space-y-5 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4">
                      <Input label="Provider Visa" {...register('visaProvider')} placeholder="Muqeem" />
                      <Input label="Tipe Visa" {...register('visaType')} placeholder="Umrah Visa" />
                      <Input label="Durasi" {...register('visaDuration')} placeholder="90 Hari" />
                      <Input label="Muassasah" {...register('muassasah')} placeholder="Rawaf Mina" />
                      <Input type="date" label="Issue Date" {...register('visaIssueDate')} />
                      <Input type="date" label="Expiry Date" {...register('visaExpiryDate')} />
                  </div>
              </div>
            )}

            {activeTab === 'hotel' && (
              <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="font-bold text-sm mb-3 text-[#3a0519]">Hotel Makkah</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <Input label="Nama Hotel" {...register('hotelMakkah')} />
                          <Input label="Bintang / Rating" {...register('hotelMakkahRating')} placeholder="⭐⭐⭐⭐⭐" />
                          <Input label="Lokasi/Jarak" {...register('hotelMakkahLoc')} />
                          <Input label="URL Foto" {...register('hotelMakkahImg')} />
                          <Input type="date" label="Check In" {...register('hotelMakkahCheckIn')} />
                          <Input type="date" label="Check Out" {...register('hotelMakkahCheckOut')} />
                      </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="font-bold text-sm mb-3 text-[#3a0519]">Hotel Madinah</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <Input label="Nama Hotel" {...register('hotelMadinah')} />
                          <Input label="Bintang / Rating" {...register('hotelMadinahRating')} placeholder="⭐⭐⭐⭐" />
                          <Input label="Lokasi/Jarak" {...register('hotelMadinahLoc')} />
                          <Input label="URL Foto" {...register('hotelMadinahImg')} />
                          <Input type="date" label="Check In" {...register('hotelMadinahCheckIn')} />
                          <Input type="date" label="Check Out" {...register('hotelMadinahCheckOut')} />
                      </div>
                  </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="space-y-4 animate-in fade-in">
                  <Button 
                    variant="outline" 
                    className="w-full text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                    onClick={() => append({ date: '', city: '', activity: '', time: '', vehicle: '', meals: {b:true, l:true, d:true} })}
                    icon={<Plus size={16}/>}
                  >
                    Tambah Hari Baru
                  </Button>

                  {fields.map((field, index) => (
                      <div key={field.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex gap-4 items-start">
                          <div className="w-8 h-8 bg-[#3a0519] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                              {index+1}
                          </div>
                          <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <Input type="date" label="Tanggal" {...register(`days.${index}.date` as const)} />
                                  <Input type="time" label="Jam" {...register(`days.${index}.time` as const)} />
                                  <Input label="Kota" {...register(`days.${index}.city` as const)} placeholder="Makkah" />
                                  <Input label="Transport" {...register(`days.${index}.vehicle` as const)} placeholder="Bus" icon={<Bus size={14}/>} />
                              </div>
                              <Input label="Kegiatan Utama" {...register(`days.${index}.activity` as const)} className="font-medium" placeholder="Melaksanakan ibadah umrah..." />
                              
                              <div className="flex gap-4">
                                  <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                                      <input type="checkbox" {...register(`days.${index}.meals.b` as const)} className="rounded border-gray-300 text-[#3a0519] focus:ring-[#3a0519]" />
                                      Breakfast
                                  </label>
                                  <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                                      <input type="checkbox" {...register(`days.${index}.meals.l` as const)} className="rounded border-gray-300 text-[#3a0519] focus:ring-[#3a0519]" />
                                      Lunch
                                  </label>
                                  <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                                      <input type="checkbox" {...register(`days.${index}.meals.d` as const)} className="rounded border-gray-300 text-[#3a0519] focus:ring-[#3a0519]" />
                                      Dinner
                                  </label>
                              </div>
                          </div>
                          <button onClick={() => remove(index)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg shrink-0 mt-4">
                              <Trash2 size={18}/>
                          </button>
                      </div>
                  ))}
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-[#3a0519]">Rincian Biaya Dasar</h3>
                          <Select 
                            {...register('currency')}
                            options={[{value:'IDR', label:'IDR'}, {value:'USD', label:'USD'}, {value:'SAR', label:'SAR'}]}
                            className="w-24 py-1.5 text-sm font-bold"
                          />
                      </div>
                      <div className="space-y-4">
                          <div className="flex items-center justify-between gap-4">
                              <label className="text-sm font-medium w-1/2">Tiket Pesawat</label>
                              <div className="w-1/2"><Input type="number" {...register('costFlight', {valueAsNumber:true})} className="text-right" /></div>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                              <label className="text-sm font-medium w-1/2">Akomodasi Hotel</label>
                              <div className="w-1/2"><Input type="number" {...register('costHotel', {valueAsNumber:true})} className="text-right" /></div>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                              <label className="text-sm font-medium w-1/2">Visa & Dokumen</label>
                              <div className="w-1/2"><Input type="number" {...register('costVisa', {valueAsNumber:true})} className="text-right" /></div>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                              <label className="text-sm font-medium w-1/2">Handling & Muthowwif</label>
                              <div className="w-1/2"><Input type="number" {...register('costHandling', {valueAsNumber:true})} className="text-right" /></div>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                              <label className="text-sm font-bold text-[#3a0519] w-1/2">Margin (Laba)</label>
                              <div className="w-1/2"><Input type="number" {...register('margin', {valueAsNumber:true})} className="text-right font-bold bg-yellow-50" /></div>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Textarea label="Harga Termasuk" {...register('includes')} rows={6} className="text-sm" />
                      <Textarea label="Harga Tidak Termasuk" {...register('excludes')} rows={6} className="text-sm" />
                  </div>
              </div>
            )}
        </div>
      </div>
      
      {/* Right Panel - Action */}
      <div className="w-5/12 bg-slate-50 h-full flex flex-col justify-center items-center p-10 border-l relative overflow-hidden">
         {/* Decorative Background */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
             <BookOpen size={400} />
         </div>

         <div className="relative z-10 text-center mb-10">
             <div className="w-24 h-24 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-6">
                 <BookOpen size={40} className="text-[#3a0519]"/>
             </div>
             <h2 className="text-2xl font-bold text-[#3a0519]">Booklet Premium</h2>
             <p className="text-sm text-gray-500 mt-2 max-w-[280px] mx-auto">
                 Sistem akan membuat PDF resolusi tinggi dengan desain eksklusif menggunakan data yang Anda masukkan.
             </p>
         </div>

         <Button 
            size="lg"
            onClick={handleDownload} 
            loading={isSending} 
            icon={<FileCheck size={20}/>}
            className="w-full max-w-sm py-4 shadow-xl text-base hover:scale-[1.02] active:scale-[0.98]"
         >
            DOWNLOAD BOOKLET PDF
         </Button>
      </div>
    </div>
  );
}