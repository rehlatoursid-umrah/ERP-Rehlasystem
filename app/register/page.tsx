"use client";

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, FileText, Shield, Heart, ChevronRight, ChevronLeft, Check, Loader2, Star, Calendar, Building2, Plane, Sparkles } from 'lucide-react';

type Package = {
  id: string; name: string; type: string; description: string | null;
  priceQuad: number; priceTriple: number; priceDouble: number; priceSingle: number;
  currency: string; durationDays: number; durationNights: number;
  includes: string | null; excludes: string | null;
  hotelMakkah: string | null; hotelMadinah: string | null; airline: string | null;
  coverImage: string | null;
};

const STEPS = ['Data Diri', 'Kontak', 'Dokumen', 'Kesehatan', 'Pilih Paket', 'Konfirmasi'];

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
      <div className="min-h-screen bg-gradient-to-br from-[#3a0519] via-[#5a0826] to-[#3a0519] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center animate-[fadeIn_0.5s_ease]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#3a0519] mb-2">Pendaftaran Berhasil! 🎉</h2>
          <p className="text-gray-500 mb-6">Terima kasih, <strong>{result.customerName}</strong></p>
          {result.booking && (
            <div className="bg-[#fdf8e8] border border-[#a77a0b]/20 rounded-2xl p-5 mb-6 text-left">
              <p className="text-xs font-bold text-[#a77a0b] uppercase mb-3">Detail Booking</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Kode Booking</span><span className="font-bold font-mono text-[#3a0519]">{result.booking.bookingCode}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-[#3a0519]">{fmt(result.booking.priceTotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Sisa Bayar</span><span className="font-bold text-amber-600">{fmt(result.booking.remainingAmount)}</span></div>
              </div>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-bold text-blue-600 mb-1">📋 Simpan kode booking Anda!</p>
            <p className="text-xs text-blue-600">Gunakan kode ini untuk mengupdate pembayaran di halaman <strong>/payment</strong></p>
          </div>
          <a href="/payment" className="inline-flex items-center gap-2 bg-[#3a0519] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5a0826] transition-all">
            Update Pembayaran <ChevronRight size={18} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3a0519] via-[#5a0826] to-[#3a0519]">
      {/* Header */}
      <div className="text-center pt-8 pb-4 px-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/rehlasticky.png" alt="Rehla" className="w-12 h-12 rounded-xl shadow-lg" onError={e => (e.currentTarget.style.display = 'none')} />
          <div>
            <h1 className="text-2xl font-bold text-white">REHLA INDONESIA</h1>
            <p className="text-[#a77a0b] text-xs font-semibold tracking-wider">PENDAFTARAN JAMAAH UMRAH</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#a77a0b] text-white scale-110 shadow-lg shadow-[#a77a0b]/40' : 'bg-white/20 text-white/50'}`}>
                {i < step ? <Check size={14}/> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-4 sm:w-8 md:w-12 h-0.5 mx-1 transition-all ${i < step ? 'bg-green-500' : 'bg-white/20'}`}/>}
            </div>
          ))}
        </div>
        <p className="text-white/80 text-center text-sm mt-3 font-medium">{STEPS[step]}</p>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">

            {/* Step 0: Data Diri */}
            {step === 0 && (
              <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
                <div className="flex items-center gap-2 mb-4"><User className="text-[#a77a0b]" size={22}/><h3 className="font-bold text-[#3a0519] text-lg">Data Pribadi</h3></div>
                <Field label="Nama Lengkap *" value={form.fullName} onChange={v => set('fullName', v)} placeholder="Sesuai paspor/KTP" />
                <Field label="Nama Panggilan" value={form.nickname} onChange={v => set('nickname', v)} />
                <div className="grid grid-cols-2 gap-4">
                  <SelectField label="Jenis Kelamin" value={form.gender} onChange={v => set('gender', v)} options={[{v:'',l:'Pilih...'},{v:'MALE',l:'Laki-laki'},{v:'FEMALE',l:'Perempuan'}]} />
                  <Field label="Tempat Lahir" value={form.birthPlace} onChange={v => set('birthPlace', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tanggal Lahir" type="date" value={form.birthDate} onChange={v => set('birthDate', v)} />
                  <Field label="NIK (KTP)" value={form.nik} onChange={v => set('nik', v)} placeholder="16 digit" />
                </div>
              </div>
            )}

            {/* Step 1: Kontak */}
            {step === 1 && (
              <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
                <div className="flex items-center gap-2 mb-4"><Phone className="text-[#a77a0b]" size={22}/><h3 className="font-bold text-[#3a0519] text-lg">Informasi Kontak</h3></div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="No. HP *" value={form.phone} onChange={v => set('phone', v)} placeholder="08xxxxxxxxxx" />
                  <Field label="WhatsApp" value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder="08xxxxxxxxxx" />
                </div>
                <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} placeholder="email@contoh.com" />
                <Field label="Alamat Lengkap" value={form.address} onChange={v => set('address', v)} textarea />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Kota" value={form.city} onChange={v => set('city', v)} />
                  <Field label="Provinsi" value={form.province} onChange={v => set('province', v)} />
                </div>
              </div>
            )}

            {/* Step 2: Dokumen */}
            {step === 2 && (
              <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
                <div className="flex items-center gap-2 mb-4"><FileText className="text-[#a77a0b]" size={22}/><h3 className="font-bold text-[#3a0519] text-lg">Dokumen Pribadi</h3></div>
                
                <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Foto KTP *</label>
                    <input type="file" accept="image/*" onChange={e => setKtpFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#a77a0b]/10 file:text-[#a77a0b] hover:file:bg-[#a77a0b]/20" />
                  </div>
                </div>

                <div className="border-t pt-5 mt-5">
                  <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg mb-4">Opsional — bisa dilengkapi nanti. Jika sudah punya paspor, isi data di bawah.</p>
                  <div className="space-y-4">
                    <Field label="Nomor Paspor" value={form.passportNumber} onChange={v => set('passportNumber', v)} placeholder="A 1234567" />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Tanggal Terbit" type="date" value={form.passportIssued} onChange={v => set('passportIssued', v)} />
                      <Field label="Berlaku s/d" type="date" value={form.passportExpiry} onChange={v => set('passportExpiry', v)} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wide">Foto Paspor</label>
                      <input type="file" accept="image/*" onChange={e => setPassportFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#a77a0b]/10 file:text-[#a77a0b] hover:file:bg-[#a77a0b]/20" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Kesehatan & Darurat */}
            {step === 3 && (
              <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
                <div className="flex items-center gap-2 mb-4"><Heart className="text-[#a77a0b]" size={22}/><h3 className="font-bold text-[#3a0519] text-lg">Kesehatan & Darurat</h3></div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectField label="Golongan Darah" value={form.bloodType} onChange={v => set('bloodType', v)} options={[{v:'',l:'Pilih...'},{v:'A',l:'A'},{v:'B',l:'B'},{v:'AB',l:'AB'},{v:'O',l:'O'}]} />
                  <Field label="Tgl Vaksin Meningitis" type="date" value={form.vaccineDate} onChange={v => set('vaccineDate', v)} />
                </div>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" checked={form.vaccineMeningitis} onChange={e => set('vaccineMeningitis', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#3a0519] focus:ring-[#3a0519]" />
                  <span className="text-sm font-medium text-gray-700">Sudah Vaksin Meningitis</span>
                </label>
                <Field label="Catatan Kesehatan" value={form.healthNotes} onChange={v => set('healthNotes', v)} textarea placeholder="Alergi, riwayat penyakit, dll." />
                <div className="border-t pt-5 mt-5">
                  <p className="text-xs font-bold text-[#a77a0b] uppercase mb-3">Kontak Darurat</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Nama" value={form.emergencyName} onChange={v => set('emergencyName', v)} />
                    <Field label="No. HP" value={form.emergencyPhone} onChange={v => set('emergencyPhone', v)} />
                    <Field label="Hubungan" value={form.emergencyRelation} onChange={v => set('emergencyRelation', v)} placeholder="Suami/Istri" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Pilih Paket */}
            {step === 4 && (
              <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
                <div className="flex items-center gap-2 mb-4"><Star className="text-[#a77a0b]" size={22}/><h3 className="font-bold text-[#3a0519] text-lg">Pilih Paket Umrah</h3></div>
                <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">Opsional — Anda bisa memilih paket sekarang atau nanti.</p>
                {packages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400"><Sparkles size={32} className="mx-auto mb-2 opacity-40"/><p className="text-sm">Belum ada paket tersedia saat ini</p></div>
                ) : (
                  <div className="space-y-3">
                    {/* No package option */}
                    <div onClick={() => set('packageId', '')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${!form.packageId ? 'border-[#a77a0b] bg-[#fdf8e8]' : 'border-gray-200 hover:border-gray-300'}`}>
                      <p className="font-bold text-sm text-gray-700">Belum pilih paket (daftar saja dulu)</p>
                    </div>
                    {packages.map(p => (
                      <div key={p.id} onClick={() => set('packageId', p.id)} className={`rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${form.packageId === p.id ? 'border-[#a77a0b] shadow-lg shadow-[#a77a0b]/10' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}>
                        <div className="h-20 bg-gradient-to-r from-[#3a0519] to-[#5a0826] relative flex items-end p-3">
                          {form.packageId === p.id && <div className="absolute top-2 right-2 w-6 h-6 bg-[#a77a0b] rounded-full flex items-center justify-center"><Check size={14} className="text-white"/></div>}
                          <div className="relative z-10">
                            <span className="bg-[#a77a0b] text-white text-[9px] font-bold px-2 py-0.5 rounded">{p.type}</span>
                            <h4 className="text-white font-bold mt-1">{p.name}</h4>
                          </div>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Calendar size={11}/> {p.durationDays}H/{p.durationNights}M</span>
                            {p.hotelMakkah && <span className="flex items-center gap-1"><Building2 size={11}/> {p.hotelMakkah}</span>}
                            {p.airline && <span className="flex items-center gap-1"><Plane size={11}/> {p.airline}</span>}
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 pt-1">
                            {[{l:'Quad',v:p.priceQuad},{l:'Triple',v:p.priceTriple},{l:'Double',v:p.priceDouble},{l:'Single',v:p.priceSingle}].map(r => (
                              <div key={r.l} className="text-center bg-gray-50 rounded p-1"><p className="text-[8px] text-gray-400 font-bold">{r.l.toUpperCase()}</p><p className="text-[10px] font-bold text-[#3a0519]">{fmt(r.v)}</p></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {form.packageId && (
                  <div className="mt-4 p-4 bg-[#fdf8e8] rounded-xl border border-[#a77a0b]/20">
                    <p className="text-xs font-bold text-[#a77a0b] uppercase mb-3">Pilih Tipe Kamar</p>
                    <div className="grid grid-cols-4 gap-2">
                      {['QUAD','TRIPLE','DOUBLE','SINGLE'].map(r => (
                        <button key={r} onClick={() => set('roomType', r)} className={`p-2 rounded-lg text-xs font-bold transition-all ${form.roomType === r ? 'bg-[#3a0519] text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
                          {r}
                        </button>
                      ))}
                    </div>
                    <p className="text-center mt-3 text-lg font-bold text-[#3a0519]">{fmt(getPrice())}</p>
                  </div>
                )}
                <Field label="Catatan Booking" value={form.bookingNotes} onChange={v => set('bookingNotes', v)} textarea placeholder="Permintaan khusus, dll." />
              </div>
            )}

            {/* Step 5: Konfirmasi */}
            {step === 5 && (
              <div className="space-y-4 animate-[fadeIn_0.3s_ease]">
                <div className="flex items-center gap-2 mb-4"><Check className="text-[#a77a0b]" size={22}/><h3 className="font-bold text-[#3a0519] text-lg">Konfirmasi Data</h3></div>
                <SummarySection title="Data Pribadi" items={[['Nama',form.fullName],['Gender',form.gender||'-'],['Tempat/Tgl Lahir',`${form.birthPlace||'-'}, ${form.birthDate||'-'}`],['NIK',form.nik||'-']]} />
                <SummarySection title="Kontak" items={[['HP',form.phone],['WhatsApp',form.whatsapp||'-'],['Email',form.email||'-'],['Kota',`${form.city||'-'}, ${form.province||'-'}`]]} />
                {form.passportNumber && <SummarySection title="Paspor" items={[['Nomor',form.passportNumber],['Berlaku s/d',form.passportExpiry||'-']]} />}
                {form.packageId && (() => {
                  const p = packages.find(x => x.id === form.packageId);
                  return p ? (
                    <div className="bg-[#fdf8e8] border border-[#a77a0b]/20 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-[#a77a0b] uppercase mb-2">Paket Dipilih</p>
                      <p className="font-bold text-[#3a0519]">{p.name} ({p.type})</p>
                      <p className="text-sm text-gray-600">Kamar: {form.roomType} • {fmt(getPrice())}</p>
                    </div>
                  ) : null;
                })()}
                <Field label="Catatan Tambahan" value={form.notes} onChange={v => set('notes', v)} textarea />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#3a0519] transition px-4 py-2.5 rounded-xl hover:bg-gray-100">
                <ChevronLeft size={18}/> Kembali
              </button>
            ) : <div/>}
            {step < STEPS.length - 1 ? (
              <button onClick={() => { if (validate()) setStep(s => s + 1); }} className="flex items-center gap-2 bg-[#3a0519] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#5a0826] transition-all shadow-lg shadow-[#3a0519]/30">
                Lanjut <ChevronRight size={18}/>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-[#a77a0b] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#8a6509] transition-all shadow-lg shadow-[#a77a0b]/30 disabled:opacity-50">
                {loading ? <Loader2 size={18} className="animate-spin"/> : <Check size={18}/>} Kirim Pendaftaran
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// Sub-components
function Field({ label, value, onChange, type = 'text', placeholder, textarea }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; textarea?: boolean }) {
  const cls = "w-full p-3 border border-gray-200 rounded-xl text-sm outline-none bg-white transition-all focus:border-[#a77a0b] focus:ring-2 focus:ring-[#fdf8e8] placeholder:text-gray-400";
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wide">{label}</label>
      {textarea ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-y`}/> :
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls}/>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: {v:string;l:string}[] }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 tracking-wide">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none bg-white transition-all focus:border-[#a77a0b] focus:ring-2 focus:ring-[#fdf8e8] cursor-pointer">
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function SummarySection({ title, items }: { title: string; items: string[][] }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{title}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {items.map(([k,v]) => <div key={k}><p className="text-[10px] text-gray-400">{k}</p><p className="font-medium text-gray-800">{v}</p></div>)}
      </div>
    </div>
  );
}
