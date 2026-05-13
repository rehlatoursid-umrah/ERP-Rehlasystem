"use client";

import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, FileText, Heart, ChevronRight, ChevronLeft, Check, Loader2, Star, Calendar, Building2, Plane, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

type Package = {
  id: string; name: string; type: string; description: string | null;
  priceQuad: number; priceTriple: number; priceDouble: number; priceSingle: number;
  currency: string; durationDays: number; durationNights: number;
  includes: string | null; excludes: string | null;
  hotelMakkah: string | null; hotelMadinah: string | null; airline: string | null;
  coverImage: string | null;
};

const STEPS = [
  { id: 'Data Diri', icon: User },
  { id: 'Kontak', icon: Phone },
  { id: 'Dokumen', icon: FileText },
  { id: 'Kesehatan', icon: Heart },
  { id: 'Pilih Paket', icon: Star },
  { id: 'Konfirmasi', icon: CheckCircle2 }
];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    fullName: '', nickname: '', gender: '', birthDate: '', birthPlace: '',
    nik: '', phone: '', whatsapp: '', email: '', address: '', city: '', province: '',
    passportNumber: '', passportExpiry: '', passportIssued: '',
    bloodType: '', healthNotes: '', vaccineMeningitis: false, vaccineDate: '',
    emergencyName: '', emergencyPhone: '', emergencyRelation: '',
    notes: '', packageId: '', roomType: 'QUAD', bookingNotes: '',
  });

  useEffect(() => {
    fetch('/api/public/packages').then(r => r.json()).then(d => {
      if (d.success) setPackages(d.packages);
    }).catch(() => {});
  }, []);

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const getPrice = () => {
    const pkg = packages.find(p => p.id === form.packageId);
    if (!pkg) return 0;
    const map: Record<string, number> = { QUAD: pkg.priceQuad, TRIPLE: pkg.priceTriple, DOUBLE: pkg.priceDouble, SINGLE: pkg.priceSingle };
    return map[form.roomType] || pkg.priceQuad;
  };

  const validate = () => {
    if (step === 0 && !form.fullName.trim()) { alert('Nama lengkap wajib diisi'); return false; }
    if (step === 1 && !form.phone.trim()) { alert('Nomor HP wajib diisi'); return false; }
    if (step === 2 && !ktpFile) { alert('Foto KTP wajib diunggah'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) formData.append(k, String(v));
      });
      if (ktpFile) formData.append('ktpFile', ktpFile);
      if (passportFile) formData.append('passportFile', passportFile);

      const res = await fetch('/api/public/register', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setSubmitted(true);
      } else {
        alert(data.error || 'Gagal mendaftar');
      }
    } catch { alert('Terjadi kesalahan jaringan'); }
    finally { setLoading(false); }
  };

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#3a0519] to-transparent opacity-90" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#a77a0b] rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 max-w-lg w-full p-10 text-center animate-[scaleIn_0.5s_ease-out] relative z-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/30">
            <Check size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#3a0519] mb-3 tracking-tight">Pendaftaran Berhasil!</h2>
          <p className="text-gray-500 mb-8 text-lg">Terima kasih, <strong className="text-[#a77a0b]">{result.customerName}</strong></p>
          
          {result.booking && (
            <div className="bg-gradient-to-br from-[#fdf8e8] to-white border border-[#a77a0b]/20 rounded-2xl p-6 mb-8 text-left shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#a77a0b]/5 rounded-bl-[100px] pointer-events-none" />
              <p className="text-xs font-bold text-[#a77a0b] uppercase tracking-widest mb-4">Detail Booking</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Kode Booking</span><span className="font-bold font-mono text-lg text-[#3a0519] bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">{result.booking.bookingCode}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Total Tagihan</span><span className="font-bold text-[#3a0519]">{fmt(result.booking.priceTotal)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Sisa Bayar</span><span className="font-bold text-amber-600">{fmt(result.booking.remainingAmount)}</span></div>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mb-8 text-left flex gap-4 items-start">
            <div className="mt-0.5"><AlertCircle size={20} className="text-blue-500" /></div>
            <div>
              <p className="text-sm font-bold text-blue-900 mb-1">Simpan kode booking Anda</p>
              <p className="text-xs text-blue-700 leading-relaxed">Gunakan kode ini untuk mengupdate pembayaran dan melihat detail keberangkatan Anda di halaman <strong>/payment</strong>.</p>
            </div>
          </div>
          
          <a href="/payment" className="inline-flex items-center justify-center gap-2 bg-[#3a0519] text-white w-full py-4 rounded-xl font-bold hover:bg-[#5a0826] transition-all shadow-xl shadow-[#3a0519]/20 hover:-translate-y-0.5">
            Update Pembayaran <ChevronRight size={18} />
          </a>
        </div>
      </div>
    );
  }

  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-[#fcfaf8] relative selection:bg-[#a77a0b]/20 selection:text-[#3a0519]">
      {/* Premium Background Elements */}
      <div className="fixed top-0 w-full h-[45vh] bg-gradient-to-b from-[#3a0519] via-[#4a061e] to-transparent z-0" />
      <div className="fixed top-0 w-full h-full bg-[url('/noise.png')] opacity-[0.03] pointer-events-none z-0" />

      <div className="relative z-10 pt-10 pb-20 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-2 pr-6 rounded-full shadow-2xl">
            <img src="/rehlasticky.png" alt="Rehla" className="w-12 h-12 rounded-full shadow-inner bg-white" onError={e => (e.currentTarget.style.display = 'none')} />
            <div className="text-left">
              <h1 className="text-xl font-bold text-white tracking-wide">REHLA INDONESIA</h1>
              <p className="text-[#e2c174] text-[10px] font-bold tracking-widest uppercase">Pendaftaran Jamaah Umrah</p>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="max-w-3xl mx-auto mb-10 px-2 hidden sm:block">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/20 -z-10 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#d4af37] -z-10 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
            
            {STEPS.map((s, i) => {
              const isActive = i === step;
              const isPast = i < step;
              const Icon = s.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-2 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-[#d4af37] text-white scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)] border-4 border-[#3a0519]' : isPast ? 'bg-[#d4af37] text-white border-4 border-[#3a0519]' : 'bg-[#4a061e] text-white/40 border-4 border-[#3a0519]'}`}>
                    {isPast ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider absolute -bottom-6 w-24 text-center transition-colors duration-300 ${isActive ? 'text-white' : isPast ? 'text-white/80' : 'text-white/40'}`}>
                    {s.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Step Indicator */}
        <div className="sm:hidden flex items-center justify-center gap-2 mb-8 text-white">
          <span className="text-sm font-bold text-[#d4af37]">Langkah {step + 1} dari {STEPS.length}</span>
          <span className="text-sm opacity-50">— {STEPS[step].id}</span>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-6 md:p-8 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#3a0519]/5 rounded-2xl flex items-center justify-center text-[#3a0519]">
                <StepIcon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[#3a0519] text-xl">{STEPS[step].id}</h3>
                <p className="text-xs text-gray-500 mt-1">Lengkapi informasi di bawah ini dengan benar.</p>
              </div>
            </div>

            <div className="p-6 md:p-10">
              {/* Step 0: Data Diri */}
              {step === 0 && (
                <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                  <Field label="Nama Lengkap *" value={form.fullName} onChange={v => set('fullName', v)} placeholder="Sesuai paspor atau KTP" />
                  <Field label="Nama Panggilan" value={form.nickname} onChange={v => set('nickname', v)} placeholder="Contoh: Budi" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Jenis Kelamin" value={form.gender} onChange={v => set('gender', v)} options={[{v:'',l:'Pilih Jenis Kelamin'},{v:'MALE',l:'Laki-laki'},{v:'FEMALE',l:'Perempuan'}]} />
                    <Field label="Tempat Lahir" value={form.birthPlace} onChange={v => set('birthPlace', v)} placeholder="Kota kelahiran" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Tanggal Lahir" type="date" value={form.birthDate} onChange={v => set('birthDate', v)} />
                    <Field label="NIK (KTP)" value={form.nik} onChange={v => set('nik', v)} placeholder="16 digit NIK" />
                  </div>
                </div>
              )}

              {/* Step 1: Kontak */}
              {step === 1 && (
                <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Nomor HP *" value={form.phone} onChange={v => set('phone', v)} placeholder="+62 8xx xxxx xxxx" />
                    <Field label="WhatsApp" value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder="+62 8xx xxxx xxxx" />
                  </div>
                  <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} placeholder="alamat@email.com" />
                  <Field label="Alamat Lengkap" value={form.address} onChange={v => set('address', v)} textarea placeholder="Nama jalan, RT/RW, kelurahan..." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Kota / Kabupaten" value={form.city} onChange={v => set('city', v)} placeholder="Contoh: Jakarta Selatan" />
                    <Field label="Provinsi" value={form.province} onChange={v => set('province', v)} placeholder="Contoh: DKI Jakarta" />
                  </div>
                </div>
              )}

              {/* Step 2: Dokumen */}
              {step === 2 && (
                <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
                  <div className="bg-[#fdf8e8]/50 border border-[#a77a0b]/20 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#a77a0b]" />
                    <h4 className="text-sm font-bold text-[#3a0519] mb-4">Upload KTP (Wajib)</h4>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 tracking-wide">File Foto KTP</label>
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={e => setKtpFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#a77a0b] file:text-white hover:file:bg-[#8a6509] file:transition-all file:cursor-pointer border border-gray-200 rounded-xl bg-white p-1" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px bg-gray-200 flex-1" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informasi Paspor (Opsional)</p>
                      <div className="h-px bg-gray-200 flex-1" />
                    </div>
                    <p className="text-xs text-gray-500 mb-6 text-center">Jika Anda belum memiliki paspor, bagian ini bisa dilewati dan dilengkapi nanti.</p>
                    
                    <div className="space-y-6">
                      <Field label="Nomor Paspor" value={form.passportNumber} onChange={v => set('passportNumber', v)} placeholder="Contoh: A 1234567" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Tanggal Terbit" type="date" value={form.passportIssued} onChange={v => set('passportIssued', v)} />
                        <Field label="Berlaku s/d" type="date" value={form.passportExpiry} onChange={v => set('passportExpiry', v)} />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 tracking-wide">Foto Paspor</label>
                        <input type="file" accept="image/*" onChange={e => setPassportFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:transition-all file:cursor-pointer border border-gray-200 rounded-xl bg-white p-1" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Kesehatan */}
              {step === 3 && (
                <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField label="Golongan Darah" value={form.bloodType} onChange={v => set('bloodType', v)} options={[{v:'',l:'Pilih...'},{v:'A',l:'A'},{v:'B',l:'B'},{v:'AB',l:'AB'},{v:'O',l:'O'}]} />
                    <Field label="Tgl Vaksin Meningitis" type="date" value={form.vaccineDate} onChange={v => set('vaccineDate', v)} />
                  </div>
                  
                  <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors group">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${form.vaccineMeningitis ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 group-hover:border-green-500'}`}>
                      {form.vaccineMeningitis && <Check size={14} className="text-white" />}
                    </div>
                    <input type="checkbox" checked={form.vaccineMeningitis} onChange={e => set('vaccineMeningitis', e.target.checked)} className="hidden" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">Sudah Vaksin Meningitis</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Centang jika Anda sudah melakukan vaksinasi</p>
                    </div>
                  </label>
                  
                  <Field label="Riwayat & Catatan Kesehatan" value={form.healthNotes} onChange={v => set('healthNotes', v)} textarea placeholder="Alergi obat, penyakit penyerta, atau kebutuhan khusus lainnya..." />
                  
                  <div className="pt-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px bg-gray-200 flex-1" />
                      <p className="text-xs font-bold text-[#a77a0b] uppercase tracking-widest">Kontak Darurat</p>
                      <div className="h-px bg-gray-200 flex-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Field label="Nama Keluarga" value={form.emergencyName} onChange={v => set('emergencyName', v)} placeholder="Contoh: Siti Aminah" />
                      <Field label="Nomor HP" value={form.emergencyPhone} onChange={v => set('emergencyPhone', v)} placeholder="+62 8xx..." />
                      <Field label="Hubungan" value={form.emergencyRelation} onChange={v => set('emergencyRelation', v)} placeholder="Contoh: Istri/Anak" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Paket */}
              {step === 4 && (
                <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                  <p className="text-sm text-gray-500 text-center mb-8">Pilih paket perjalanan ibadah Umrah Anda. Anda juga bisa melewati langkah ini jika hanya ingin mendaftar data diri terlebih dahulu.</p>
                  
                  {packages.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                      <Sparkles size={40} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 font-medium">Belum ada paket tersedia saat ini</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* No package option */}
                      <div onClick={() => set('packageId', '')} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-center text-center h-full min-h-[140px] ${!form.packageId ? 'border-[#a77a0b] bg-[#fdf8e8] shadow-[0_4px_20px_rgba(167,122,11,0.1)]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}`}>
                        <div>
                          <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center transition-colors ${!form.packageId ? 'bg-[#a77a0b] text-white' : 'bg-gray-200 text-gray-400'}`}>
                            {!form.packageId ? <Check size={16} /> : <span className="w-2 h-2 rounded-full bg-gray-400" />}
                          </div>
                          <p className={`font-bold text-sm ${!form.packageId ? 'text-[#3a0519]' : 'text-gray-600'}`}>Daftar Saja Dulu</p>
                          <p className="text-[10px] text-gray-500 mt-1">Pilih paket di kemudian hari</p>
                        </div>
                      </div>

                      {/* Package Cards */}
                      {packages.map(p => {
                        const isSelected = form.packageId === p.id;
                        return (
                          <div key={p.id} onClick={() => set('packageId', p.id)} className={`rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden flex flex-col ${isSelected ? 'border-[#a77a0b] shadow-[0_8px_30px_rgba(167,122,11,0.15)] ring-1 ring-[#a77a0b]/50' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}`}>
                            <div className="h-24 bg-gradient-to-r from-[#3a0519] to-[#5a0826] relative p-4 flex flex-col justify-end">
                              {isSelected && <div className="absolute top-3 right-3 w-6 h-6 bg-[#d4af37] rounded-full flex items-center justify-center shadow-md"><Check size={14} className="text-[#3a0519] font-bold" /></div>}
                              <div className="relative z-10">
                                <span className="bg-black/30 backdrop-blur-sm text-white border border-white/20 text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">{p.type}</span>
                                <h4 className="text-white font-bold mt-2 truncate text-sm">{p.name}</h4>
                              </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                              <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 mb-4 font-medium">
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Calendar size={12} className="text-[#a77a0b]" /> {p.durationDays} Hari</span>
                                {p.hotelMakkah && <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded truncate max-w-[120px]"><Building2 size={12} className="text-[#a77a0b]" /> {p.hotelMakkah}</span>}
                              </div>
                              <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Mulai Dari</span>
                                <span className="font-bold text-[#3a0519]">{fmt(p.priceQuad)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Room Selection (Shows only if a package is selected) */}
                  <div className={`transition-all duration-500 overflow-hidden ${form.packageId ? 'max-h-96 opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 bg-gradient-to-br from-[#fdf8e8] to-white rounded-2xl border border-[#a77a0b]/20 shadow-inner">
                      <p className="text-xs font-bold text-[#a77a0b] uppercase tracking-widest mb-4 flex items-center gap-2"><Building2 size={14} /> Pilihan Tipe Kamar</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['QUAD','TRIPLE','DOUBLE','SINGLE'].map(r => {
                          const isActive = form.roomType === r;
                          return (
                            <button key={r} onClick={() => set('roomType', r)} className={`p-3 rounded-xl text-xs font-bold transition-all border-2 ${isActive ? 'bg-[#3a0519] border-[#3a0519] text-white shadow-lg shadow-[#3a0519]/20 scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                              {r}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-6 pt-4 border-t border-[#a77a0b]/20 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Tagihan</span>
                        <span className="text-2xl font-bold text-[#3a0519]">{fmt(getPrice())}</span>
                      </div>
                    </div>
                  </div>

                  <Field label="Catatan Tambahan (Opsional)" value={form.bookingNotes} onChange={v => set('bookingNotes', v)} textarea placeholder="Permintaan khusus mengenai kamar, diet makanan, dll." />
                </div>
              )}

              {/* Step 5: Konfirmasi */}
              {step === 5 && (
                <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#fdf8e8] text-[#a77a0b] rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText size={32} />
                    </div>
                    <h3 className="font-bold text-[#3a0519] text-xl">Review Pendaftaran</h3>
                    <p className="text-xs text-gray-500 mt-1">Mohon periksa kembali data Anda sebelum menekan tombol kirim.</p>
                  </div>

                  <div className="space-y-4">
                    <SummarySection title="Data Pribadi" icon={User} items={[['Nama Lengkap',form.fullName],['Jenis Kelamin',form.gender==='MALE'?'Laki-laki':form.gender==='FEMALE'?'Perempuan':'-'],['Tempat, Tgl Lahir',`${form.birthPlace||'-'}, ${form.birthDate||'-'}`],['NIK (KTP)',form.nik||'-']]} />
                    <SummarySection title="Informasi Kontak" icon={Phone} items={[['No. HP',form.phone],['WhatsApp',form.whatsapp||'-'],['Email',form.email||'-'],['Alamat',`${form.address||'-'}`],['Kota / Prov',`${form.city||'-'}, ${form.province||'-'}`]]} />
                    
                    {(form.passportNumber || form.healthNotes || form.vaccineMeningitis) && (
                      <SummarySection title="Dokumen & Kesehatan" icon={Shield} items={[
                        ...(form.passportNumber ? [['No. Paspor', form.passportNumber], ['Berlaku s/d', form.passportExpiry||'-']] : []),
                        ['Vaksin Meningitis', form.vaccineMeningitis ? 'Sudah' : 'Belum'],
                        ...(form.healthNotes ? [['Catatan Medis', form.healthNotes]] : [])
                      ]} />
                    )}

                    {form.packageId && (() => {
                      const p = packages.find(x => x.id === form.packageId);
                      return p ? (
                        <div className="bg-gradient-to-br from-[#3a0519] to-[#5a0826] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                          <div className="flex items-center gap-2 mb-4 text-[#d4af37]">
                            <Star size={16} />
                            <p className="text-xs font-bold uppercase tracking-widest">Paket Pilihan</p>
                          </div>
                          <h4 className="font-bold text-xl mb-1">{p.name}</h4>
                          <p className="text-white/70 text-sm mb-6">{p.type} • Tipe Kamar: {form.roomType}</p>
                          <div className="pt-4 border-t border-white/20 flex justify-between items-end">
                            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Estimasi Biaya</span>
                            <span className="text-2xl font-bold text-[#d4af37]">{fmt(getPrice())}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-[2rem]">
              {step > 0 ? (
                <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#3a0519] transition-colors px-4 py-3 rounded-xl hover:bg-gray-200/50">
                  <ChevronLeft size={18} /> Kembali
                </button>
              ) : <div />}
              
              {step < STEPS.length - 1 ? (
                <button onClick={() => { if (validate()) setStep(s => s + 1); window.scrollTo({top:0, behavior:'smooth'}); }} className="flex items-center gap-2 bg-[#3a0519] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#5a0826] transition-all shadow-lg shadow-[#3a0519]/20 hover:-translate-y-0.5 hover:shadow-xl">
                  Selanjutnya <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-3 bg-gradient-to-r from-[#a77a0b] to-[#c29624] text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-[0_8px_25px_rgba(167,122,11,0.3)] transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />} 
                  {loading ? 'Memproses...' : 'Kirim Pendaftaran'}
                </button>
              )}
            </div>
          </div>
          
          <p className="text-center text-white/60 text-xs mt-8 pb-8 font-medium">© {new Date().getFullYear()} Rehla Indonesia. Sistem Informasi Manajemen Umrah.</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

// ----------------------
// Enhanced Sub-components
// ----------------------

function Field({ label, value, onChange, type = 'text', placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; textarea?: boolean }) {
  const cls = "w-full p-4 border-2 border-gray-100 rounded-xl text-sm outline-none bg-gray-50/50 text-gray-800 transition-all focus:bg-white focus:border-[#a77a0b] focus:ring-4 focus:ring-[#a77a0b]/10 placeholder:text-gray-400 font-medium";
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 tracking-widest ml-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-y leading-relaxed`} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: {v:string;l:string}[] }) {
  const cls = "w-full p-4 border-2 border-gray-100 rounded-xl text-sm outline-none bg-gray-50/50 text-gray-800 transition-all focus:bg-white focus:border-[#a77a0b] focus:ring-4 focus:ring-[#a77a0b]/10 cursor-pointer font-medium appearance-none";
  return (
    <div className="relative">
      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 tracking-widest ml-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className={cls}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <div className="absolute right-4 bottom-4 pointer-events-none text-gray-400">
        <ChevronRight size={16} className="rotate-90" />
      </div>
    </div>
  );
}

function SummarySection({ title, icon: Icon, items }: { title: string; icon: any; items: string[][] }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
        <Icon size={16} className="text-[#a77a0b]" />
        <p className="text-xs font-bold text-[#3a0519] uppercase tracking-widest">{title}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
        {items.map(([k,v], i) => (
          <div key={i}>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{k}</p>
            <p className="font-semibold text-gray-800 text-sm">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
