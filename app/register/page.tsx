"use client";

import React, { useState, useEffect } from 'react';
import { User, Phone, FileText, Heart, Star, CheckCircle2, ChevronRight, ChevronLeft, Check, Loader2, Calendar, Building2, Plane, Sparkles, MapPin, Shield } from 'lucide-react';

type Package = {
  id: string; name: string; type: string; description: string | null;
  priceQuad: number; priceTriple: number; priceDouble: number; priceSingle: number;
  currency: string; durationDays: number; durationNights: number;
  includes: string | null; excludes: string | null;
  hotelMakkah: string | null; hotelMadinah: string | null; airline: string | null;
  coverImage: string | null;
};

const STEPS = [
  { id: 'Data Diri', icon: User, desc: 'Informasi dasar' },
  { id: 'Kontak', icon: Phone, desc: 'Alamat & Komunikasi' },
  { id: 'Dokumen', icon: FileText, desc: 'KTP & Paspor' },
  { id: 'Kesehatan', icon: Heart, desc: 'Kondisi fisik' },
  { id: 'Paket', icon: Star, desc: 'Pilih layanan' },
  { id: 'Konfirmasi', icon: CheckCircle2, desc: 'Review akhir' }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md border border-[#3a0519]/20 max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 bg-[#3a0519]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-[#3a0519]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil</h2>
          <p className="text-gray-500 mb-8">Terima kasih, <strong className="text-gray-900">{result.customerName}</strong></p>
          
          {result.booking && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8 text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Detail Booking</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">Kode Booking</span><span className="font-semibold font-mono text-gray-900">{result.booking.bookingCode}</span></div>
                <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-500">Total Tagihan</span><span className="font-semibold text-gray-900">{fmt(result.booking.priceTotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Sisa Bayar</span><span className="font-semibold text-amber-600">{fmt(result.booking.remainingAmount)}</span></div>
              </div>
            </div>
          )}
          
          <div className="bg-[#3a0519]/5 border border-[#3a0519]/20 rounded-lg p-4 mb-8 text-left flex gap-3 items-start">
            <Shield size={18} className="text-[#3a0519] mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#3a0519] mb-1">Simpan Kode Booking</p>
              <p className="text-sm text-gray-700">Gunakan kode ini untuk mengupdate bukti pembayaran di halaman <strong>/payment</strong>.</p>
            </div>
          </div>
          
          <a href="/payment" className="inline-flex items-center justify-center gap-2 bg-[#3a0519] text-white w-full py-3 rounded-lg font-semibold hover:bg-[#2c0413] transition-colors">
            Lanjut ke Pembayaran <ChevronRight size={18} />
          </a>
        </div>
      </div>
    );
  }

  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Clean Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <img src="/rehlasticky.png" alt="Rehla" className="w-8 h-8 rounded bg-gray-100" onError={e => (e.currentTarget.style.display = 'none')} />
          <div>
            <h1 className="text-sm font-bold text-[#3a0519]">REHLA INDONESIA</h1>
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Pendaftaran Jamaah Umrah</p>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        
        {/* Sidebar Stepper */}
        <div className="hidden md:block">
          <div className="sticky top-24">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Progress Pendaftaran</h3>
            <div className="space-y-6">
              {STEPS.map((s, i) => {
                const isActive = i === step;
                const isPast = i < step;
                const Icon = s.icon;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white z-10 transition-colors ${isActive ? 'border-[#3a0519] text-[#3a0519] bg-[#3a0519]/5' : isPast ? 'border-[#3a0519] bg-[#3a0519] text-white' : 'border-gray-200 text-gray-300'}`}>
                        {isPast ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                      </div>
                      {i !== STEPS.length - 1 && (
                        <div className={`w-0.5 h-full absolute top-8 bottom-0 -mb-6 ${isPast ? 'bg-[#3a0519]' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="pt-1.5 pb-4">
                      <p className={`text-sm font-semibold ${isActive ? 'text-[#3a0519]' : isPast ? 'text-gray-900' : 'text-gray-400'}`}>{s.id}</p>
                      <p className={`text-xs ${isActive || isPast ? 'text-gray-500' : 'text-gray-400'}`}>{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Stepper */}
        <div className="md:hidden flex flex-col gap-2 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">Langkah {step + 1} dari {STEPS.length}</p>
          <div className="flex gap-1 h-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`flex-1 rounded-full ${i <= step ? 'bg-[#3a0519]' : 'bg-gray-200'}`} />
            ))}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-2">{STEPS[step].id}</h2>
        </div>

        {/* Form Main Area */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-6 md:p-8">
              
              <div className="hidden md:flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-[#3a0519]/5 flex items-center justify-center text-[#3a0519]">
                  <StepIcon size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{STEPS[step].id}</h2>
                  <p className="text-sm text-gray-500">{STEPS[step].desc}</p>
                </div>
              </div>

              {/* Step 0: Data Diri */}
              {step === 0 && (
                <div className="space-y-5">
                  <Field label="Nama Lengkap *" value={form.fullName} onChange={v => set('fullName', v)} placeholder="Sesuai paspor atau KTP" />
                  <Field label="Nama Panggilan" value={form.nickname} onChange={v => set('nickname', v)} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SelectField label="Jenis Kelamin" value={form.gender} onChange={v => set('gender', v)} options={[{v:'',l:'Pilih...'},{v:'MALE',l:'Laki-laki'},{v:'FEMALE',l:'Perempuan'}]} />
                    <Field label="Tempat Lahir" value={form.birthPlace} onChange={v => set('birthPlace', v)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Tanggal Lahir" type="date" value={form.birthDate} onChange={v => set('birthDate', v)} />
                    <Field label="NIK (KTP)" value={form.nik} onChange={v => set('nik', v)} placeholder="16 digit" />
                  </div>
                </div>
              )}

              {/* Step 1: Kontak */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Nomor HP *" value={form.phone} onChange={v => set('phone', v)} placeholder="Contoh: 081234567890" />
                    <Field label="WhatsApp" value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder="Contoh: 081234567890" />
                  </div>
                  <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} placeholder="alamat@email.com" />
                  <Field label="Alamat Lengkap" value={form.address} onChange={v => set('address', v)} textarea />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Kota / Kabupaten" value={form.city} onChange={v => set('city', v)} />
                    <Field label="Provinsi" value={form.province} onChange={v => set('province', v)} />
                  </div>
                </div>
              )}

              {/* Step 2: Dokumen */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText size={16} className="text-gray-400"/>
                      Dokumen Wajib
                    </h4>
                    <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Foto KTP Asli *</label>
                      <input type="file" accept="image/*" onChange={e => setKtpFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-colors bg-white border border-gray-200 rounded cursor-pointer" />
                      <p className="text-xs text-gray-500 mt-2">Format: JPG/PNG. Pastikan tulisan terbaca jelas.</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield size={16} className="text-gray-400"/>
                      Dokumen Opsional (Paspor)
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">Jika belum memiliki paspor, bagian ini bisa dikosongkan dan disusulkan nanti.</p>
                    <div className="space-y-5">
                      <Field label="Nomor Paspor" value={form.passportNumber} onChange={v => set('passportNumber', v)} placeholder="Contoh: A 1234567" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Tanggal Terbit" type="date" value={form.passportIssued} onChange={v => set('passportIssued', v)} />
                        <Field label="Berlaku s/d" type="date" value={form.passportExpiry} onChange={v => set('passportExpiry', v)} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Foto Halaman Data Paspor</label>
                        <input type="file" accept="image/*" onChange={e => setPassportFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-colors bg-white border border-gray-200 rounded cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Kesehatan */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <SelectField label="Golongan Darah" value={form.bloodType} onChange={v => set('bloodType', v)} options={[{v:'',l:'Pilih...'},{v:'A',l:'A'},{v:'B',l:'B'},{v:'AB',l:'AB'},{v:'O',l:'O'}]} />
                      <Field label="Tanggal Vaksin Meningitis" type="date" value={form.vaccineDate} onChange={v => set('vaccineDate', v)} />
                    </div>
                    
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" checked={form.vaccineMeningitis} onChange={e => set('vaccineMeningitis', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#3a0519] focus:ring-[#3a0519]" />
                      <span className="text-sm font-semibold text-gray-800">Saya sudah divaksin Meningitis</span>
                    </label>
                    
                    <Field label="Riwayat & Catatan Medis" value={form.healthNotes} onChange={v => set('healthNotes', v)} textarea placeholder="Misal: Alergi obat, diabetes, riwayat jantung, dll." />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Phone size={16} className="text-gray-400"/>
                      Kontak Darurat Keluarga
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <Field label="Nama Keluarga" value={form.emergencyName} onChange={v => set('emergencyName', v)} />
                      <Field label="Nomor HP" value={form.emergencyPhone} onChange={v => set('emergencyPhone', v)} />
                      <Field label="Hubungan" value={form.emergencyRelation} onChange={v => set('emergencyRelation', v)} placeholder="Istri / Suami / Anak" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Paket */}
              {step === 4 && (
                <div className="space-y-6">
                  <p className="text-sm text-gray-600 mb-2">Pilih paket perjalanan umrah. Anda dapat mengosongkan jika hanya ingin melengkapi data pendaftaran.</p>
                  
                  {packages.length === 0 ? (
                    <div className="text-center py-12 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">Belum ada paket tersedia saat ini.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* No package option */}
                      <div onClick={() => set('packageId', '')} className={`p-5 rounded-lg border cursor-pointer transition-colors ${!form.packageId ? 'border-[#3a0519] bg-[#3a0519]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!form.packageId ? 'border-[#3a0519] bg-[#3a0519]' : 'border-gray-300'}`}>
                            {!form.packageId && <div className="w-1.5 h-1.5 bg-white rounded-full"/>}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">Belum Memilih Paket</p>
                            <p className="text-xs text-gray-500">Daftar sebagai database jamaah</p>
                          </div>
                        </div>
                      </div>

                      {/* Package Cards */}
                      {packages.map(p => {
                        const isSelected = form.packageId === p.id;
                        return (
                          <div key={p.id} onClick={() => set('packageId', p.id)} className={`rounded-lg border cursor-pointer transition-colors overflow-hidden ${isSelected ? 'border-[#3a0519] ring-1 ring-[#3a0519]' : 'border-gray-200 hover:border-gray-300'}`}>
                            <div className="p-4 border-b border-gray-100 flex items-start justify-between bg-gray-50">
                              <div className="flex gap-3 items-start">
                                <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#3a0519] bg-[#3a0519]' : 'border-gray-300 bg-white'}`}>
                                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"/>}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-900 leading-tight">{p.name}</h4>
                                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{p.type}</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex flex-col gap-2 mb-4">
                                <span className="text-xs text-gray-600 flex items-center gap-2"><Calendar size={14} className="text-gray-400"/> {p.durationDays} Hari / {p.durationNights} Malam</span>
                                {p.hotelMakkah && <span className="text-xs text-gray-600 flex items-center gap-2"><Building2 size={14} className="text-gray-400"/> {p.hotelMakkah}</span>}
                              </div>
                              <p className="text-[10px] text-gray-500 uppercase">Mulai Dari</p>
                              <p className="font-bold text-gray-900">{fmt(p.priceQuad)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Room Selection */}
                  {form.packageId && (
                    <div className="mt-6 p-5 border border-gray-200 rounded-lg bg-gray-50">
                      <p className="text-sm font-semibold text-gray-900 mb-4">Pilihan Tipe Kamar</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['QUAD','TRIPLE','DOUBLE','SINGLE'].map(r => {
                          const isActive = form.roomType === r;
                          return (
                            <button key={r} onClick={() => set('roomType', r)} className={`py-2 px-3 rounded-md text-sm font-medium transition-colors border ${isActive ? 'bg-white border-[#3a0519] text-[#3a0519] shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                              {r}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-6 flex justify-between items-end border-t border-gray-200 pt-4">
                        <span className="text-sm font-semibold text-gray-500">Estimasi Total</span>
                        <span className="text-xl font-bold text-gray-900">{fmt(getPrice())}</span>
                      </div>
                    </div>
                  )}

                  <Field label="Catatan Booking Tambahan" value={form.bookingNotes} onChange={v => set('bookingNotes', v)} textarea placeholder="Bila ada permintaan khusus kamar, rekan sekamar, dll." />
                </div>
              )}

              {/* Step 5: Konfirmasi */}
              {step === 5 && (
                <div className="space-y-8">
                  <p className="text-sm text-gray-600">Silakan periksa kembali ringkasan data pendaftaran Anda sebelum dikirimkan ke sistem.</p>

                  <div className="space-y-6">
                    <SummaryBlock title="Data Diri" items={[['Nama Lengkap',form.fullName],['Gender',form.gender==='MALE'?'Laki-laki':form.gender==='FEMALE'?'Perempuan':'-'],['TTL',`${form.birthPlace||'-'}, ${form.birthDate||'-'}`],['NIK',form.nik||'-']]} />
                    <SummaryBlock title="Kontak & Alamat" items={[['No. HP',form.phone],['WhatsApp',form.whatsapp||'-'],['Email',form.email||'-'],['Alamat',`${form.address||'-'} - ${form.city||'-'} - ${form.province||'-'}`]]} />
                    
                    {(form.passportNumber || form.healthNotes || form.vaccineMeningitis) && (
                      <SummaryBlock title="Dokumen & Medis" items={[
                        ...(form.passportNumber ? [['No. Paspor', form.passportNumber], ['Berlaku s/d', form.passportExpiry||'-']] : []),
                        ['Vaksin', form.vaccineMeningitis ? 'Sudah Meningitis' : 'Belum Meningitis'],
                        ...(form.healthNotes ? [['Catatan Medis', form.healthNotes]] : [])
                      ]} />
                    )}

                    {form.packageId && (() => {
                      const p = packages.find(x => x.id === form.packageId);
                      return p ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Layanan Paket</h4>
                          </div>
                          <div className="p-4">
                            <p className="font-semibold text-gray-900 mb-1">{p.name}</p>
                            <p className="text-sm text-gray-600 mb-4">Kamar {form.roomType}</p>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                              <span className="text-sm text-gray-500">Estimasi Tagihan</span>
                              <span className="font-bold text-gray-900">{fmt(getPrice())}</span>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Form Footer Navigation */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center rounded-b-xl">
              {step > 0 ? (
                <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                  Kembali
                </button>
              ) : <div />}
              
              {step < STEPS.length - 1 ? (
                <button onClick={() => { if (validate()) setStep(s => s + 1); window.scrollTo({top:0, behavior:'smooth'}); }} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                  Lanjut <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-[#3a0519] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#2c0413] transition-colors disabled:opacity-70">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
                  {loading ? 'Memproses...' : 'Kirim Pendaftaran'}
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} ERP Rehla System. Dilindungi oleh Enova DMS.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------
// Minimalist Sub-components
// ----------------------

function Field({ label, value, onChange, type = 'text', placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; textarea?: boolean }) {
  const cls = "block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#3a0519] sm:text-sm sm:leading-6 transition-all bg-white";
  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-y`} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: {v:string;l:string}[] }) {
  const cls = "block w-full rounded-md border-0 py-2.5 px-3.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#3a0519] sm:text-sm sm:leading-6 transition-all appearance-none bg-white cursor-pointer";
  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} className={cls}>
          {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          <ChevronRight size={14} className="rotate-90" />
        </div>
      </div>
    </div>
  );
}

function SummaryBlock({ title, items }: { title: string; items: string[][] }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
        {items.map(([k,v], i) => (
          <div key={i}>
            <p className="text-xs text-gray-500 mb-1">{k}</p>
            <p className="text-sm font-semibold text-gray-900">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
