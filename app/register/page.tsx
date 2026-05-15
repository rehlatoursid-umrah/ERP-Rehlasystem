"use client";

import React, { useState, useEffect } from 'react';
import { User, Phone, FileText, Heart, Star, CheckCircle2, ChevronRight, ChevronLeft, Check, Loader2, Calendar, Building2, MapPin, Shield, Info, Image as ImageIcon } from 'lucide-react';

type Package = {
  id: string; name: string; type: string; description: string | null;
  priceQuad: number; priceTriple: number; priceDouble: number; priceSingle: number;
  currency: string; durationDays: number; durationNights: number;
  includes: string | null; excludes: string | null;
  hotelMakkah: string | null; hotelMadinah: string | null; airline: string | null;
  coverImage: string | null;
};

const STEPS = [
  { id: 'Data Diri', icon: User, desc: 'Informasi Pribadi' },
  { id: 'Kontak', icon: Phone, desc: 'Informasi Kontak' },
  { id: 'Dokumen', icon: FileText, desc: 'KTP & Paspor' },
  { id: 'Kesehatan', icon: Heart, desc: 'Kesehatan & Ibadah' },
  { id: 'Paket', icon: Star, desc: 'Layanan Umrah' },
  { id: 'Review', icon: CheckCircle2, desc: 'Syarat & Ketentuan' }
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
    fullName: '', nik: '', birthPlace: '', birthDate: '', gender: '',
    fatherName: '', motherName: '', maritalStatus: '', occupation: '',
    phone: '', email: '', address: '', city: '', province: '', postalCode: '',
    whatsapp: '', emergencyName: '', emergencyRelation: '', emergencyPhone: '',
    passportNumber: '', passportIssued: '', passportExpiry: '', passportPlace: '',
    hasDiseases: false, diseaseNotes: '', specialNeeds: false, wheelchair: false,
    previousUmrah: false, previousHajj: false,
    packageId: '', roomType: 'QUAD', bookingNotes: '',
    agreedTerms: false,
  });
  const [ktpUploadedUrl, setKtpUploadedUrl] = useState<string | null>(null);
  const [passportUploadedUrl, setPassportUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    if (!form.agreedTerms) { alert('Anda harus menyetujui syarat dan ketentuan'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) formData.append(k, String(v));
      });
      // Pass pre-uploaded URLs instead of files
      if (ktpUploadedUrl) formData.append('ktpUrl', ktpUploadedUrl);
      if (passportUploadedUrl) formData.append('passportUrl', passportUploadedUrl);
      // Also send files as fallback if not pre-uploaded
      if (ktpFile && !ktpUploadedUrl) formData.append('ktpFile', ktpFile);
      if (passportFile && !passportUploadedUrl) formData.append('passportFile', passportFile);

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
      <div className="min-h-screen bg-[#faf8f9] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl shadow-[#3a0519]/5 border border-[#3a0519]/10 max-w-lg w-full p-10 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-[#3a0519]/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-[#3a0519]" />
          </div>
          <h2 className="text-3xl font-bold text-[#3a0519] mb-2">Pendaftaran Berhasil</h2>
          <p className="text-gray-500 mb-8 text-lg">Terima kasih, <strong className="text-[#3a0519]">{result.customerName}</strong></p>
          
          {result.booking && (
            <div className="bg-[#faf8f9] border border-[#3a0519]/10 rounded-xl p-6 mb-8 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#3a0519]/5 rounded-bl-full" />
              <p className="text-[10px] font-bold text-[#3a0519] uppercase tracking-widest mb-4">Detail Reservasi</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3"><span className="text-gray-500 text-sm">Kode Booking</span><span className="font-bold font-mono text-lg text-[#3a0519] bg-white px-3 py-1 rounded-md border border-gray-100 shadow-sm">{result.booking.bookingCode}</span></div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3"><span className="text-gray-500 text-sm">Total Tagihan</span><span className="font-bold text-[#3a0519] text-lg">{fmt(result.booking.priceTotal)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500 text-sm">Sisa Pembayaran</span><span className="font-bold text-[#3a0519] text-lg">{fmt(result.booking.remainingAmount)}</span></div>
              </div>
            </div>
          )}
          
          <div className="bg-[#3a0519]/5 border border-[#3a0519]/20 rounded-xl p-5 mb-8 text-left flex gap-4 items-start">
            <Info size={20} className="text-[#3a0519] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#3a0519] mb-1">Penting: Simpan Kode Booking</p>
              <p className="text-xs text-gray-600 leading-relaxed">Kode ini digunakan untuk mengakses portal pembayaran dan melihat detail perjalanan Anda.</p>
            </div>
          </div>
          
          <a href="/payment" className="inline-flex items-center justify-center gap-2 bg-[#3a0519] text-white w-full py-4 rounded-xl font-bold hover:bg-[#5a0826] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Menuju Portal Pembayaran <ChevronRight size={18} />
          </a>
        </div>
      </div>
    );
  }

  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-[#faf8f9] text-gray-900 selection:bg-[#3a0519]/20 selection:text-[#3a0519]">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center gap-4">
          <img src="/rehlasticky.png" alt="Rehla" className="w-10 h-10 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
          <div>
            <h1 className="text-base font-bold text-[#3a0519] tracking-wide">REHLA INDONESIA</h1>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Portal Pendaftaran Umrah</p>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        
        {/* Interactive Stepper (Desktop) */}
        <div className="hidden lg:block relative">
          <div className="sticky top-32 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 ml-2">Progress Pendaftaran</h3>
            <div className="space-y-0">
              {STEPS.map((s, i) => {
                const isActive = i === step;
                const isPast = i < step;
                const Icon = s.icon;
                return (
                  <div key={i} className="flex group cursor-pointer" onClick={() => { if (i < step) setStep(i); }}>
                    <div className="relative flex flex-col items-center px-4">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${isActive ? 'border-[#3a0519] bg-[#3a0519] text-white shadow-lg shadow-[#3a0519]/20 scale-110' : isPast ? 'border-[#3a0519] text-[#3a0519] bg-[#3a0519]/5' : 'bg-white border-gray-200 text-gray-400 group-hover:border-gray-300'}`}>
                        {isPast ? <Check size={18} strokeWidth={3} /> : <Icon size={18} className={isActive ? 'text-white' : ''} />}
                      </div>
                      {i !== STEPS.length - 1 && (
                        <div className={`w-0.5 h-12 absolute top-10 ${isPast ? 'bg-[#3a0519]/30' : 'bg-gray-100'}`} />
                      )}
                    </div>
                    <div className={`pt-2 pb-10 transition-all duration-300 ${isActive ? 'translate-x-2' : ''}`}>
                      <p className={`text-sm font-bold ${isActive ? 'text-[#3a0519]' : isPast ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{s.id}</p>
                      <p className={`text-[11px] font-medium mt-0.5 ${isActive ? 'text-[#3a0519]/70' : isPast ? 'text-gray-500' : 'text-gray-400'}`}>{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Stepper */}
        <div className="lg:hidden bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-2">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Langkah {step + 1} dari {STEPS.length}</p>
              <h2 className="text-lg font-bold text-[#3a0519] mt-1">{STEPS[step].id}</h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#3a0519]/5 flex items-center justify-center text-[#3a0519]">
              <StepIcon size={20} />
            </div>
          </div>
          <div className="flex gap-1.5 h-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-[#3a0519]' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="min-w-0">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-[#3a0519]/5 overflow-hidden transition-all duration-500">
            
            {/* Form Header */}
            <div className="bg-[#faf8f9] px-8 py-6 border-b border-gray-100 hidden lg:flex items-center gap-4">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-[#3a0519] shadow-sm">
                <StepIcon size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#3a0519] tracking-tight">{STEPS[step].id}</h2>
                <p className="text-sm font-medium text-gray-500 mt-0.5">{STEPS[step].desc}</p>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10 relative overflow-hidden">
              {/* Animation wrapper for steps */}
              <div key={step} className="animate-fade-in-up">
                
                {/* Step 0: Data Diri */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Field label="Nama Lengkap *" value={form.fullName} onChange={v => set('fullName', v)} placeholder="Contoh: Ahmad Sulaiman" icon={User} />
                      <Field label="NIK (Nomor Induk Kependudukan) *" value={form.nik} onChange={v => set('nik', v)} placeholder="16 digit NIK" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Field label="Tempat Lahir *" value={form.birthPlace} onChange={v => set('birthPlace', v)} placeholder="Contoh: Jakarta" />
                      <Field label="Tanggal Lahir *" type="date" value={form.birthDate} onChange={v => set('birthDate', v)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Field label="Nama Ayah *" value={form.fatherName} onChange={v => set('fatherName', v)} placeholder="Masukkan nama ayah" />
                      <Field label="Nama Ibu *" value={form.motherName} onChange={v => set('motherName', v)} placeholder="Masukkan nama ibu" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <SelectField label="Jenis Kelamin *" value={form.gender} onChange={v => set('gender', v)} options={[{v:'',l:'Pilih jenis kelamin'},{v:'MALE',l:'Laki-laki'},{v:'FEMALE',l:'Perempuan'}]} />
                      <SelectField label="Status Pernikahan *" value={form.maritalStatus} onChange={v => set('maritalStatus', v)} options={[{v:'',l:'Pilih status pernikahan'},{v:'SINGLE',l:'Belum Menikah'},{v:'MARRIED',l:'Menikah'},{v:'DIVORCED',l:'Cerai'},{v:'WIDOWED',l:'Janda/Duda'}]} />
                    </div>
                    <Field label="Pekerjaan *" value={form.occupation} onChange={v => set('occupation', v)} placeholder="Contoh: Pegawai Swasta" />
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Field label="Nomor Telepon *" value={form.phone} onChange={v => set('phone', v)} placeholder="Contoh: 08123456789" icon={Phone} />
                      <Field label="Email *" type="email" value={form.email} onChange={v => set('email', v)} placeholder="contoh@email.com" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Field label="Alamat Lengkap *" value={form.address} onChange={v => set('address', v)} textarea placeholder="Alamat lengkap dengan RT/RW, Kelurahan, Kecamatan" />
                      <Field label="Kota *" value={form.city} onChange={v => set('city', v)} placeholder="Masukkan kota" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Field label="Provinsi *" value={form.province} onChange={v => set('province', v)} placeholder="Masukkan provinsi" />
                      <Field label="Kode Pos *" value={form.postalCode} onChange={v => set('postalCode', v)} placeholder="Masukkan kode pos" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Field label="Nomor WhatsApp *" value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder="Masukkan nomor WhatsApp" icon={Phone} />
                      <Field label="Kontak Darurat *" value={form.emergencyName} onChange={v => set('emergencyName', v)} placeholder="Nama kontak darurat" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <SelectField label="Hubungan *" value={form.emergencyRelation} onChange={v => set('emergencyRelation', v)} options={[{v:'',l:'Pilih hubungan'},{v:'SPOUSE',l:'Suami/Istri'},{v:'PARENT',l:'Orang Tua'},{v:'CHILD',l:'Anak'},{v:'SIBLING',l:'Saudara'},{v:'OTHER',l:'Lainnya'}]} />
                      <Field label="Nomor Telepon Kontak Darurat *" value={form.emergencyPhone} onChange={v => set('emergencyPhone', v)} placeholder="Masukkan nomor telepon kontak darurat" />
                    </div>
                  </div>
                )}

                {/* Step 2: Dokumen */}
                {step === 2 && (
                  <div className="space-y-10">
                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-[#3a0519]/20 transition-colors">
                      <h4 className="text-sm font-bold text-[#3a0519] mb-6 flex items-center gap-2">
                        <FileText size={18} /> Dokumen Wajib
                      </h4>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Foto KTP Asli *</label>
                        <div className="relative group">
                          <input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setKtpFile(file);
                            setUploading(true);
                            try {
                              const fd = new FormData(); fd.append('file', file); fd.append('folder', 'documents'); fd.append('category', 'KTP');
                              const res = await fetch('/api/public/upload', { method: 'POST', body: fd });
                              const data = await res.json();
                              if (data.url) setKtpUploadedUrl(data.url);
                            } catch {} finally { setUploading(false); }
                          }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className={`w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${ktpFile || ktpUploadedUrl ? 'border-[#3a0519] bg-[#3a0519]/5' : 'border-gray-300 bg-gray-50 group-hover:border-[#3a0519]/50 group-hover:bg-[#faf8f9]'}`}>
                            {ktpUploadedUrl ? (
                              <><img src={ktpUploadedUrl} alt="KTP" className="w-full max-w-xs rounded-lg mb-2 border" /><p className="text-sm font-semibold text-[#3a0519]">✓ KTP berhasil diunggah</p></>
                            ) : (
                              <><ImageIcon size={32} className={`mb-3 ${ktpFile ? 'text-[#3a0519]' : 'text-gray-400'}`} /><p className={`text-sm font-semibold mb-1 ${ktpFile ? 'text-[#3a0519]' : 'text-gray-700'}`}>{uploading ? 'Mengunggah...' : ktpFile ? ktpFile.name : 'Klik atau seret file KTP ke sini'}</p><p className="text-xs text-gray-500">Format JPG/PNG maksimal 5MB</p></>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-[#3a0519]/20 transition-colors">
                      <h4 className="text-sm font-bold text-[#3a0519] mb-6 flex items-center gap-2">
                        <Shield size={18} /> Informasi Paspor
                      </h4>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <Field label="Nomor Paspor *" value={form.passportNumber} onChange={v => set('passportNumber', v)} placeholder="Contoh: A1234567" />
                          <Field label="Tanggal Penerbitan *" type="date" value={form.passportIssued} onChange={v => set('passportIssued', v)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <Field label="Tanggal Kadaluarsa *" type="date" value={form.passportExpiry} onChange={v => set('passportExpiry', v)} />
                          <Field label="Tempat Penerbitan *" value={form.passportPlace} onChange={v => set('passportPlace', v)} placeholder="Contoh: Jakarta" />
                        </div>
                        <div className="space-y-2 pt-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Foto Halaman Paspor</label>
                          <div className="relative group">
                            <input type="file" accept="image/*" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setPassportFile(file);
                              setUploading(true);
                              try {
                                const fd = new FormData(); fd.append('file', file); fd.append('folder', 'documents'); fd.append('category', 'PASSPORT');
                                const res = await fetch('/api/public/upload', { method: 'POST', body: fd });
                                const data = await res.json();
                                if (data.url) setPassportUploadedUrl(data.url);
                              } catch {} finally { setUploading(false); }
                            }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className={`w-full p-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-4 transition-colors ${passportFile || passportUploadedUrl ? 'border-[#3a0519] bg-[#3a0519]/5' : 'border-gray-300 bg-gray-50 group-hover:border-[#3a0519]/50'}`}>
                              {passportUploadedUrl ? (
                                <><img src={passportUploadedUrl} alt="Paspor" className="w-full max-w-xs rounded-lg border" /><p className="text-sm font-semibold text-[#3a0519]">✓ Paspor berhasil diunggah</p></>
                              ) : (
                                <><ImageIcon size={24} className={`${passportFile ? 'text-[#3a0519]' : 'text-gray-400'}`} /><p className={`text-sm font-semibold ${passportFile ? 'text-[#3a0519]' : 'text-gray-700'}`}>{uploading ? 'Mengunggah...' : passportFile ? passportFile.name : 'Pilih file foto paspor'}</p></>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Kesehatan & Ibadah */}
                {step === 3 && (
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <label className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-[#3a0519]/30 hover:bg-[#faf8f9] transition-all group">
                        <div className={`w-6 h-6 rounded flex items-center justify-center transition-all ${form.hasDiseases ? 'bg-[#3a0519] shadow-md scale-105' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                          {form.hasDiseases && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" checked={form.hasDiseases} onChange={e => set('hasDiseases', e.target.checked)} className="hidden" />
                        <p className={`text-sm font-bold ${form.hasDiseases ? 'text-[#3a0519]' : 'text-gray-800'}`}>Apakah Anda memiliki penyakit tertentu?</p>
                      </label>

                      {form.hasDiseases && (
                        <Field label="Jenis Penyakit *" value={form.diseaseNotes} onChange={v => set('diseaseNotes', v)} textarea placeholder="Sebutkan jenis penyakit yang Anda miliki" />
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-[#3a0519]/30 hover:bg-[#faf8f9] transition-all group">
                          <div className={`w-6 h-6 rounded flex items-center justify-center transition-all ${form.specialNeeds ? 'bg-[#3a0519] shadow-md scale-105' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                            {form.specialNeeds && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                          <input type="checkbox" checked={form.specialNeeds} onChange={e => set('specialNeeds', e.target.checked)} className="hidden" />
                          <p className={`text-sm font-bold ${form.specialNeeds ? 'text-[#3a0519]' : 'text-gray-800'}`}>Kebutuhan Khusus</p>
                        </label>
                        <label className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-[#3a0519]/30 hover:bg-[#faf8f9] transition-all group">
                          <div className={`w-6 h-6 rounded flex items-center justify-center transition-all ${form.wheelchair ? 'bg-[#3a0519] shadow-md scale-105' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                            {form.wheelchair && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                          <input type="checkbox" checked={form.wheelchair} onChange={e => set('wheelchair', e.target.checked)} className="hidden" />
                          <p className={`text-sm font-bold ${form.wheelchair ? 'text-[#3a0519]' : 'text-gray-800'}`}>Kursi Roda</p>
                        </label>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-[#3a0519] mb-6 flex items-center gap-2">
                        <MapPin size={18} /> Pengalaman Ibadah
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-[#3a0519]/30 hover:bg-[#faf8f9] transition-all group">
                          <div className={`w-6 h-6 rounded flex items-center justify-center transition-all ${form.previousUmrah ? 'bg-[#3a0519] shadow-md scale-105' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                            {form.previousUmrah && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                          <input type="checkbox" checked={form.previousUmrah} onChange={e => set('previousUmrah', e.target.checked)} className="hidden" />
                          <p className={`text-sm font-bold ${form.previousUmrah ? 'text-[#3a0519]' : 'text-gray-800'}`}>Pernah melaksanakan Umrah sebelumnya</p>
                        </label>
                        <label className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-[#3a0519]/30 hover:bg-[#faf8f9] transition-all group">
                          <div className={`w-6 h-6 rounded flex items-center justify-center transition-all ${form.previousHajj ? 'bg-[#3a0519] shadow-md scale-105' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                            {form.previousHajj && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                          <input type="checkbox" checked={form.previousHajj} onChange={e => set('previousHajj', e.target.checked)} className="hidden" />
                          <p className={`text-sm font-bold ${form.previousHajj ? 'text-[#3a0519]' : 'text-gray-800'}`}>Pernah melaksanakan Haji</p>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Paket */}
                {step === 4 && (
                  <div className="space-y-8">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
                      <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900 leading-relaxed">Pilih paket umrah. Anda dapat mengosongkan pilihan ini jika hanya ingin mendaftarkan data diri terlebih dahulu (Masuk Waiting List).</p>
                    </div>
                    
                    {packages.length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                        <Star size={32} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-500">Belum ada paket tersedia saat ini.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* No package option */}
                        <div onClick={() => set('packageId', '')} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center ${!form.packageId ? 'border-[#3a0519] bg-[#faf8f9] shadow-md shadow-[#3a0519]/5' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}>
                          <div className="flex gap-4 items-center">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${!form.packageId ? 'border-[#3a0519] bg-[#3a0519]' : 'border-gray-300'}`}>
                              {!form.packageId && <div className="w-2 h-2 bg-white rounded-full"/>}
                            </div>
                            <div>
                              <p className={`font-bold ${!form.packageId ? 'text-[#3a0519]' : 'text-gray-800'}`}>Daftar Data Diri Saja</p>
                              <p className="text-xs text-gray-500 mt-1">Menunggu pilihan paket berikutnya</p>
                            </div>
                          </div>
                        </div>

                        {/* Package Cards */}
                        {packages.map(p => {
                          const isSelected = form.packageId === p.id;
                          return (
                            <div key={p.id} onClick={() => set('packageId', p.id)} className={`rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden flex flex-col relative ${isSelected ? 'border-[#3a0519] shadow-lg shadow-[#3a0519]/10 ring-1 ring-[#3a0519]' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'}`}>
                              {isSelected && <div className="absolute top-0 left-0 w-full h-1 bg-[#3a0519]" />}
                              <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-start gap-4">
                                <div className={`w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-[#3a0519] bg-[#3a0519]' : 'border-gray-300 bg-white'}`}>
                                  {isSelected && <div className="w-2 h-2 bg-white rounded-full"/>}
                                </div>
                                <div>
                                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-gray-200 px-2 py-0.5 rounded-sm">{p.type}</span>
                                  <h4 className={`font-bold text-lg mt-1.5 leading-tight ${isSelected ? 'text-[#3a0519]' : 'text-gray-900'}`}>{p.name}</h4>
                                </div>
                              </div>
                              <div className="p-5 flex-1 flex flex-col justify-between">
                                <div className="flex flex-col gap-2 mb-6">
                                  <span className="text-xs font-medium text-gray-600 flex items-center gap-2"><Calendar size={14} className="text-[#3a0519]/60"/> {p.durationDays} Hari / {p.durationNights} Malam</span>
                                  {p.hotelMakkah && <span className="text-xs font-medium text-gray-600 flex items-center gap-2"><Building2 size={14} className="text-[#3a0519]/60"/> {p.hotelMakkah}</span>}
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mulai Dari</p>
                                  <p className="font-bold text-xl text-gray-900">{fmt(p.priceQuad)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Room Selection */}
                    <div className={`transition-all duration-500 overflow-hidden ${form.packageId ? 'max-h-[500px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
                      <div className="p-6 border-2 border-[#3a0519]/10 rounded-2xl bg-[#faf8f9]">
                        <p className="text-sm font-bold text-[#3a0519] mb-5 flex items-center gap-2"><Building2 size={16} /> Pilih Tipe Kamar</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['QUAD','TRIPLE','DOUBLE','SINGLE'].map(r => {
                            const isActive = form.roomType === r;
                            return (
                              <button key={r} onClick={() => set('roomType', r)} className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 ${isActive ? 'bg-[#3a0519] border-[#3a0519] text-white shadow-md scale-105' : 'bg-white border-gray-200 text-gray-600 hover:border-[#3a0519]/30 hover:bg-white'}`}>
                                {r}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-8 flex justify-between items-end border-t border-[#3a0519]/10 pt-5">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Estimasi Biaya Paket</span>
                          <span className="text-2xl font-bold text-[#3a0519]">{fmt(getPrice())}</span>
                        </div>
                      </div>
                    </div>

                    <Field label="Catatan Request Booking (Opsional)" value={form.bookingNotes} onChange={v => set('bookingNotes', v)} textarea placeholder="Bila ada permintaan khusus kamar, rekan sekamar, ukuran baju, dll." />
                  </div>
                )}

                {/* Step 5: Syarat & Ketentuan */}
                {step === 5 && (
                  <div className="space-y-8">
                    <div className="bg-[#faf8f9] rounded-2xl p-6 text-center border border-[#3a0519]/10">
                      <FileText size={32} className="text-[#3a0519] mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-[#3a0519]">Review Pendaftaran</h3>
                      <p className="text-sm text-gray-600 mt-2">Mohon teliti kembali ringkasan data di bawah ini. Pastikan tidak ada kesalahan penulisan nama dan kontak.</p>
                    </div>

                    <div className="space-y-6">
                      <SummaryBlock title="Data Diri Pribadi" icon={User} items={[['Nama Lengkap',form.fullName],['NIK',form.nik||'-'],['TTL',`${form.birthPlace||'-'}, ${form.birthDate||'-'}`],['Nama Ayah',form.fatherName||'-'],['Nama Ibu',form.motherName||'-'],['Jenis Kelamin',form.gender==='MALE'?'Laki-laki':form.gender==='FEMALE'?'Perempuan':'-'],['Status',form.maritalStatus||'-'],['Pekerjaan',form.occupation||'-']]} />
                      <SummaryBlock title="Kontak & Alamat" icon={Phone} items={[['No. Telepon',form.phone],['WhatsApp',form.whatsapp||'-'],['Email',form.email||'-'],['Alamat',`${form.address||'-'}, ${form.city||'-'}, ${form.province||'-'} ${form.postalCode||''}`],['Kontak Darurat',`${form.emergencyName||'-'} (${form.emergencyRelation||'-'}) - ${form.emergencyPhone||'-'}`]]} />
                      
                      {form.passportNumber && (
                        <SummaryBlock title="Informasi Paspor" icon={Shield} items={[['No. Paspor', form.passportNumber],['Tanggal Terbit', form.passportIssued||'-'],['Kadaluarsa', form.passportExpiry||'-'],['Tempat Penerbitan', form.passportPlace||'-']]} />
                      )}

                      <SummaryBlock title="Kesehatan & Ibadah" icon={Heart} items={[['Penyakit', form.hasDiseases ? (form.diseaseNotes||'Ya') : 'Tidak ada'],['Kebutuhan Khusus', form.specialNeeds ? 'Ya' : 'Tidak'],['Kursi Roda', form.wheelchair ? 'Ya' : 'Tidak'],['Pengalaman Umrah', form.previousUmrah ? 'Pernah' : 'Belum'],['Pengalaman Haji', form.previousHajj ? 'Pernah' : 'Belum']]} />

                      {form.packageId && (() => {
                        const p = packages.find(x => x.id === form.packageId);
                        return p ? (
                          <div className="border-2 border-[#3a0519] rounded-2xl overflow-hidden relative shadow-lg shadow-[#3a0519]/5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3a0519]/5 rounded-bl-full" />
                            <div className="bg-[#3a0519] px-6 py-4 flex items-center gap-3">
                              <Star size={16} className="text-white" />
                              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Layanan Paket Terpilih</h4>
                            </div>
                            <div className="p-6 bg-white relative z-10">
                              <p className="font-bold text-xl text-[#3a0519] mb-1">{p.name}</p>
                              <p className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wider">{p.type} • Kamar {form.roomType}</p>
                              <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Tagihan</span>
                                <span className="font-bold text-2xl text-[#3a0519]">{fmt(getPrice())}</span>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Syarat dan Ketentuan */}
                    <div className="border-2 border-[#3a0519]/10 rounded-2xl overflow-hidden bg-[#fdf2f4]">
                      <div className="p-6">
                        <h4 className="text-base font-bold text-[#3a0519] mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#3a0519]" /> Persyaratan Umum
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2"><span className="text-[#3a0519] mt-1">•</span> Paspor masih berlaku minimal 6 bulan</li>
                          <li className="flex items-start gap-2"><span className="text-[#3a0519] mt-1">•</span> Sertifikat vaksin meningitis</li>
                          <li className="flex items-start gap-2"><span className="text-[#3a0519] mt-1">•</span> Sertifikat vaksin polio (bila diperlukan)</li>
                          <li className="flex items-start gap-2"><span className="text-[#3a0519] mt-1">•</span> Membayar biaya pendaftaran</li>
                          <li className="flex items-start gap-2"><span className="text-[#3a0519] mt-1">•</span> Mengikuti briefing sebelum keberangkatan</li>
                        </ul>
                      </div>
                    </div>

                    <label className="flex items-start gap-4 p-5 border-2 border-gray-100 rounded-xl cursor-pointer hover:border-[#3a0519]/30 hover:bg-[#faf8f9] transition-all group">
                      <div className={`w-6 h-6 rounded flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${form.agreedTerms ? 'bg-[#3a0519] shadow-md scale-105' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                        {form.agreedTerms && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                      <input type="checkbox" checked={form.agreedTerms} onChange={e => set('agreedTerms', e.target.checked)} className="hidden" />
                      <div>
                        <p className={`text-sm font-bold ${form.agreedTerms ? 'text-[#3a0519]' : 'text-gray-800'}`}>
                          Saya telah membaca dan menyetujui <span className="underline text-[#3a0519] font-bold">syarat dan ketentuan</span> yang berlaku untuk perjalanan umrah ini.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Saya memahami bahwa semua informasi yang saya berikan adalah benar dan dapat dipertanggungjawabkan.</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Form Footer Navigation */}
            <div className="px-6 py-6 sm:px-10 border-t border-gray-100 bg-white flex justify-between items-center rounded-b-3xl">
              {step > 0 ? (
                <button onClick={() => setStep(s => s - 1)} className="px-5 py-3 text-sm font-bold text-gray-500 hover:text-[#3a0519] hover:bg-[#3a0519]/5 rounded-xl transition-all flex items-center gap-2">
                  <ChevronLeft size={16} /> <span className="hidden sm:inline">Kembali</span>
                </button>
              ) : <div />}
              
              {step < STEPS.length - 1 ? (
                <button onClick={() => { if (validate()) setStep(s => s + 1); window.scrollTo({top:0, behavior:'smooth'}); }} className="flex items-center gap-2 bg-[#3a0519] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#5a0826] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Lanjutkan <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-3 bg-[#3a0519] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#5a0826] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />} 
                  {loading ? 'Memproses...' : 'Konfirmasi & Kirim'}
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center pb-10">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">© {new Date().getFullYear()} REHLA INDONESIA. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

// ----------------------
// Premium Minimalist Sub-components
// ----------------------

function Field({ label, value, onChange, type = 'text', placeholder, textarea, icon: Icon }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; textarea?: boolean; icon?: any }) {
  const inputClass = "block w-full rounded-xl border-0 py-3.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#3a0519] focus:outline-none sm:text-sm font-medium transition-all bg-gray-50/50 hover:bg-white";
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-2 tracking-wide flex items-center gap-2">
        {Icon && <Icon size={14} className="text-[#3a0519]" />}
        {label}
      </label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${inputClass} resize-y`} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: {v:string;l:string}[] }) {
  const cls = "block w-full rounded-xl border-0 py-3.5 px-4 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-[#3a0519] focus:outline-none sm:text-sm font-medium transition-all bg-gray-50/50 hover:bg-white appearance-none cursor-pointer";
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-2 tracking-wide">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} className={cls}>
          {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
          <ChevronRight size={16} className="rotate-90" />
        </div>
      </div>
    </div>
  );
}

function SummaryBlock({ title, icon: Icon, items }: { title: string; icon: any; items: string[][] }) {
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="bg-[#faf8f9] px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#3a0519]/10 flex items-center justify-center">
          <Icon size={14} className="text-[#3a0519]" />
        </div>
        <h4 className="text-xs font-bold text-[#3a0519] uppercase tracking-widest">{title}</h4>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
        {items.map(([k,v], i) => (
          <div key={i}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{k}</p>
            <p className="text-sm font-semibold text-gray-800">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
