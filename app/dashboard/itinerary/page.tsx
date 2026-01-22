"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Document, Page, Text, View, StyleSheet, pdf, Image as PdfImage } from '@react-pdf/renderer';
// FIXED: Semua icon sudah di-import
import { 
  BookOpen, Calendar, MapPin, Coffee, Utensils, Moon, 
  Loader2, Plane, Hotel, Calculator, User, Image as ImageIcon, 
  FileCheck, Trash2, Plus, Bus
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// --- 1. CONFIGURATION ---
const COLORS = {
  primary: '#3a0519',   
  secondary: '#c59d5f', 
  accent: '#fdf8e8',    
  text: '#1f2937',      
  gray: '#9ca3af',      
};

// --- 2. DATA TYPES ---
type ItineraryForm = {
  packageName: string;
  programTitle: string;
  programDesc: string;
  coverImage: string;
  guideName: string; guideEdu: string; guideExp: string; guideLang: string; guidePhoto: string;
  airline: string; flightRoute: string; pnr: string;
  departFlight: string; departDate: string; departTime: string; airportOrigin: string;
  arrivalDate: string; arrivalTime: string; airportDest: string;
  visaProvider: string; visaType: string; visaDuration: string; muassasah: string;
  visaIssueDate: string; visaExpiryDate: string;
  hotelMakkah: string; hotelMakkahRating: string; hotelMakkahLoc: string; hotelMakkahImg: string; hotelMakkahCheckIn: string; hotelMakkahCheckOut: string;
  hotelMadinah: string; hotelMadinahRating: string; hotelMadinahLoc: string; hotelMadinahImg: string; hotelMadinahCheckIn: string; hotelMadinahCheckOut: string;
  days: { date: string; city: string; activity: string; time: string; vehicle: string; meals: { b: boolean; l: boolean; d: boolean; }; }[];
  currency: string; costFlight: number; costHotel: number; costVisa: number; costHandling: number; margin: number;
  includes: string; excludes: string;
};

// --- 3. PDF STYLES ---
const s = StyleSheet.create({
  page: { padding: 0, fontFamily: 'Helvetica', backgroundColor: '#fff', color: '#333' },
  coverBg: { height: '100%', width: '100%', position: 'absolute' },
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

// --- 4. PDF COMPONENT ---
const BookletPdf = ({ data }: { data: ItineraryForm }) => {
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
           <Text style={{color:'#fff', fontSize:12}}>Keberangkatan: {new Date(data.departDate).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</Text>
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

// --- 5. MAIN PAGE ---
export default function ItineraryGeneratorPage() {
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('cover');

  const { register, control, watch } = useForm<ItineraryForm>({
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

  useEffect(() => { if(fields.length === 0) for(let i=0; i<9; i++) append({ date: '', city: 'Makkah', activity: 'Ibadah', time: '08:00', vehicle: 'Bus AC', meals: {b:true, l:true, d:true} }); }, []);

  const handleDownload = async () => {
    setIsSending(true);
    try {
        const blob = await pdf(<BookletPdf data={w as ItineraryForm} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = `Booklet-${w.packageName}.pdf`; link.click();
        toast.success("Booklet Premium Siap!");
    } catch(e) { toast.error("Gagal Render PDF"); } finally { setIsSending(false); }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      <Toaster position="top-center" richColors />
      <div className="w-7/12 flex flex-col border-r bg-white h-full">
        <div className="p-4 border-b z-10 flex justify-between items-center bg-white shadow-sm">
            <h1 className="font-bold text-[#3a0519] flex items-center gap-2"><BookOpen size={18}/> Booklet Engine Pro</h1>
            <div className="flex gap-1 overflow-x-auto">
                {['cover','guide','flight','visa','hotel','itinerary','pricing'].map(t => (
                    <button key={t} onClick={()=>setActiveTab(t)} className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase transition ${activeTab===t ? 'bg-[#3a0519] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{t}</button>
                ))}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'cover' && (<div className="space-y-4 animate-in fade-in"><div><label className="label-block">Nama Paket</label><input {...register('packageName')} className="input-block font-bold"/></div><div><label className="label-block">Tagline</label><input {...register('programTitle')} className="input-block"/></div><div><label className="label-block">Deskripsi</label><textarea {...register('programDesc')} className="input-block h-24"/></div><div><label className="label-block">URL Cover</label><input {...register('coverImage')} className="input-block" placeholder="https://..."/></div></div>)}
            {activeTab === 'guide' && (<div className="space-y-4 animate-in fade-in"><div className="grid grid-cols-2 gap-4"><div><label className="label-block">Nama Muthowwif</label><input {...register('guideName')} className="input-block"/></div><div><label className="label-block">Pendidikan</label><input {...register('guideEdu')} className="input-block"/></div><div><label className="label-block">Pengalaman</label><input {...register('guideExp')} className="input-block"/></div><div><label className="label-block">Bahasa</label><input {...register('guideLang')} className="input-block"/></div><div className="col-span-2"><label className="label-block">URL Foto</label><input {...register('guidePhoto')} className="input-block"/></div></div></div>)}
            {activeTab === 'itinerary' && (<div className="space-y-4 animate-in fade-in"><button onClick={() => append({ date: '', city: '', activity: '', time: '', vehicle: '', meals: {b:true, l:true, d:true} })} className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded font-bold w-full flex items-center justify-center gap-2"><Plus size={14}/> Tambah Hari</button>{fields.map((field, index) => (<div key={field.id} className="border p-3 rounded bg-gray-50 flex gap-3 items-center"><div className="w-8 h-8 bg-[#3a0519] text-white rounded-full flex items-center justify-center font-bold text-xs">{index+1}</div><div className="flex-1 grid grid-cols-2 gap-2"><input type="date" {...register(`days.${index}.date`)} className="input-block text-xs"/><input {...register(`days.${index}.time`)} className="input-block text-xs" placeholder="Jam"/><input {...register(`days.${index}.activity`)} className="input-block text-xs font-bold col-span-2" placeholder="Kegiatan"/><input {...register(`days.${index}.city`)} className="input-block text-xs" placeholder="Kota"/><input {...register(`days.${index}.vehicle`)} className="input-block text-xs" placeholder="Kendaraan"/></div><button onClick={() => remove(index)} className="text-red-500"><Trash2 size={16}/></button></div>))}</div>)}
            {activeTab === 'pricing' && (<div className="space-y-4 animate-in fade-in"><div className="bg-green-50 p-4 rounded border border-green-200"><h3 className="font-bold text-green-800 mb-3 text-xs">RINCIAN BIAYA</h3><div className="space-y-2"><div className="flex justify-between items-center"><label className="text-xs">Tiket Pesawat</label><input type="number" {...register('costFlight', {valueAsNumber:true})} className="input-block w-32 text-right"/></div><div className="flex justify-between items-center"><label className="text-xs">Akomodasi Hotel</label><input type="number" {...register('costHotel', {valueAsNumber:true})} className="input-block w-32 text-right"/></div><div className="flex justify-between items-center"><label className="text-xs">Visa & Dokumen</label><input type="number" {...register('costVisa', {valueAsNumber:true})} className="input-block w-32 text-right"/></div><div className="flex justify-between items-center"><label className="text-xs">Handling</label><input type="number" {...register('costHandling', {valueAsNumber:true})} className="input-block w-32 text-right"/></div><div className="flex justify-between items-center border-t pt-2"><label className="text-xs font-bold text-[#3a0519]">Margin</label><input type="number" {...register('margin', {valueAsNumber:true})} className="input-block w-32 text-right font-bold"/></div></div></div><div className="grid grid-cols-2 gap-4"><div><label className="label-block">Termasuk</label><textarea {...register('includes')} className="input-block h-24"/></div><div><label className="label-block">Tidak Termasuk</label><textarea {...register('excludes')} className="input-block h-24"/></div></div></div>)}
        </div>
      </div>
      <div className="w-5/12 bg-gray-100 h-full flex flex-col justify-center items-center p-10 border-l">
         <div className="text-center mb-6"><BookOpen size={64} className="text-[#3a0519] mx-auto mb-4 opacity-20"/><h2 className="text-xl font-bold text-gray-700">Booklet Premium Ready</h2><p className="text-sm text-gray-500 mt-2">Klik tombol di bawah untuk men-generate PDF Booklet resolusi tinggi.</p></div>
         <button onClick={handleDownload} disabled={isSending} className="bg-[#3a0519] hover:bg-[#5a0826] text-white px-8 py-4 rounded-xl font-bold shadow-xl flex items-center gap-3 transition transform hover:scale-105">{isSending ? <Loader2 size={24} className="animate-spin"/> : <FileCheck size={24}/>} DOWNLOAD BOOKLET PDF</button>
      </div>
      <style jsx global>{`.label-block { display: block; font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 3px; } .input-block { width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; outline: none; transition: all 0.2s; background: #fff; } .input-block:focus { border-color: ${COLORS.secondary}; ring: 1px; }`}</style>
    </div>
  );
}