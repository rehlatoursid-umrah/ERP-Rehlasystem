"use client";

import React, { useState } from 'react';
import { Search, CreditCard, Check, Loader2, ChevronRight, Clock, CheckCircle, XCircle, Upload, DollarSign, FileText, User, Phone } from 'lucide-react';

type PaymentItem = { id: string; amount: number; method: string | null; bankName: string | null; referenceNumber: string | null; status: string; paidAt: string | null; notes: string | null; createdAt: string; };
type BookingData = {
  id: string; bookingCode: string; status: string; roomType: string | null;
  priceTotal: number; paidAmount: number; remainingAmount: number; currency: string;
  customer: { fullName: string; phone: string | null; };
  package: { name: string; type: string; } | null;
  payments: PaymentItem[];
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  DP_PAID: 'bg-amber-50 text-amber-700 border-amber-200',
  FULLY_PAID: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};
const STATUS_LABELS: Record<string, string> = { PENDING: 'Pending', VERIFIED: 'Terverifikasi', REJECTED: 'Ditolak', CONFIRMED: 'Confirmed', DP_PAID: 'DP Dibayar', FULLY_PAID: 'Lunas', CANCELLED: 'Dibatalkan' };
const STATUS_ICONS: Record<string, React.ReactNode> = { PENDING: <Clock size={14}/>, VERIFIED: <CheckCircle size={14}/>, REJECTED: <XCircle size={14}/> };

export default function PaymentPage() {
  const [mode, setMode] = useState<'lookup' | 'detail' | 'pay' | 'success'>('lookup');
  const [loading, setLoading] = useState(false);
  const [lookupForm, setLookupForm] = useState({ bookingCode: '', phone: '' });
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [payForm, setPayForm] = useState({ amount: 0, method: 'TRANSFER', bankName: '', referenceNumber: '', notes: '' });

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleLookup = async () => {
    if (!lookupForm.bookingCode.trim()) { alert('Masukkan kode booking'); return; }
    if (!lookupForm.phone.trim()) { alert('Masukkan nomor HP'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/public/booking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lookupForm),
      });
      const data = await res.json();
      if (data.success) { setBooking(data.booking); setMode('detail'); }
      else alert(data.error || 'Booking tidak ditemukan');
    } catch { alert('Terjadi kesalahan jaringan'); }
    finally { setLoading(false); }
  };

  const handlePayment = async () => {
    if (!booking) return;
    if (payForm.amount <= 0) { alert('Jumlah harus lebih dari 0'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/public/payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, phone: lookupForm.phone, ...payForm }),
      });
      const data = await res.json();
      if (data.success) { setMode('success'); }
      else alert(data.error || 'Gagal mencatat pembayaran');
    } catch { alert('Terjadi kesalahan jaringan'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3a0519] via-[#5a0826] to-[#3a0519]">
      {/* Header */}
      <div className="text-center pt-8 pb-4 px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/rehlasticky.png" alt="Rehla" className="w-12 h-12 rounded-xl shadow-lg" onError={e => (e.currentTarget.style.display = 'none')} />
          <div>
            <h1 className="text-2xl font-bold text-white">REHLA INDONESIA</h1>
            <p className="text-[#a77a0b] text-xs font-semibold tracking-wider">UPDATE PEMBAYARAN</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pb-12">
        {/* LOOKUP MODE */}
        {mode === 'lookup' && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_0.4s_ease]">
            <div className="bg-gradient-to-r from-[#3a0519] to-[#5a0826] p-6 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <Search size={28} className="text-[#a77a0b]"/>
              </div>
              <h2 className="text-white font-bold text-lg">Cari Booking Anda</h2>
              <p className="text-white/60 text-xs mt-1">Masukkan kode booking dan nomor HP yang terdaftar</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Kode Booking</label>
                <input value={lookupForm.bookingCode} onChange={e => setLookupForm(f => ({...f, bookingCode: e.target.value.toUpperCase()}))} placeholder="BK-2026-0001" className="w-full p-3 border border-gray-200 rounded-xl text-sm font-mono font-bold text-center tracking-widest outline-none focus:border-[#a77a0b] focus:ring-2 focus:ring-[#fdf8e8] text-lg"/>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Nomor HP</label>
                <input value={lookupForm.phone} onChange={e => setLookupForm(f => ({...f, phone: e.target.value}))} placeholder="08xxxxxxxxxx" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#a77a0b] focus:ring-2 focus:ring-[#fdf8e8]"/>
              </div>
              <button onClick={handleLookup} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#3a0519] text-white p-3.5 rounded-xl font-bold hover:bg-[#5a0826] transition-all shadow-lg shadow-[#3a0519]/30 disabled:opacity-50">
                {loading ? <Loader2 size={18} className="animate-spin"/> : <Search size={18}/>} Cari Booking
              </button>
              <div className="text-center pt-2">
                <a href="/register" className="text-xs text-[#a77a0b] font-bold hover:underline">Belum punya booking? Daftar di sini →</a>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL MODE */}
        {mode === 'detail' && booking && (
          <div className="space-y-4 animate-[fadeIn_0.4s_ease]">
            {/* Booking Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#3a0519] to-[#5a0826] p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#a77a0b] text-[10px] font-bold uppercase tracking-wider">Kode Booking</p>
                    <p className="text-white font-bold text-xl font-mono">{booking.bookingCode}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[booking.status] || booking.status}</span>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3"><User size={16} className="text-gray-400"/><div><p className="text-[10px] text-gray-400">Jamaah</p><p className="font-bold text-[#3a0519]">{booking.customer.fullName}</p></div></div>
                {booking.package && <div className="flex items-center gap-3"><FileText size={16} className="text-gray-400"/><div><p className="text-[10px] text-gray-400">Paket</p><p className="font-medium">{booking.package.name} <span className="text-[10px] bg-[#a77a0b]/10 text-[#a77a0b] px-1.5 py-0.5 rounded font-bold">{booking.package.type}</span></p></div></div>}

                {/* Payment Progress */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Total</span><span className="font-bold">{fmt(booking.priceTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Terbayar</span><span className="font-bold text-green-600">{fmt(booking.paidAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-500" style={{width: `${Math.min(100, booking.priceTotal > 0 ? (booking.paidAmount / booking.priceTotal) * 100 : 0)}%`}}/>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sisa</span><span className="font-bold text-amber-600">{fmt(booking.remainingAmount)}</span>
                  </div>
                </div>

                {booking.remainingAmount > 0 && (
                  <button onClick={() => { setPayForm({ amount: 0, method: 'TRANSFER', bankName: '', referenceNumber: '', notes: '' }); setMode('pay'); }} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white p-3.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/30">
                    <CreditCard size={18}/> Bayar Sekarang
                  </button>
                )}
              </div>
            </div>

            {/* Payment History */}
            {booking.payments.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="p-5 border-b"><p className="text-xs font-bold text-gray-400 uppercase">Riwayat Pembayaran ({booking.payments.length})</p></div>
                <div className="divide-y">
                  {booking.payments.map(p => (
                    <div key={p.id} className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">{STATUS_ICONS[p.status] || <DollarSign size={14}/>}</div>
                        <div>
                          <p className="text-sm font-bold">{fmt(p.amount)}</p>
                          <p className="text-[10px] text-gray-400">{p.method || '-'} {p.bankName ? `• ${p.bankName}` : ''} {p.referenceNumber ? `• #${p.referenceNumber}` : ''}</p>
                          <p className="text-[10px] text-gray-400">{p.paidAt ? fmtDate(p.paidAt) : fmtDate(p.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[p.status] || p.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { setMode('lookup'); setBooking(null); }} className="w-full text-center text-white/60 text-sm font-medium py-3 hover:text-white transition">← Kembali</button>
          </div>
        )}

        {/* PAY MODE */}
        {mode === 'pay' && booking && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_0.4s_ease]">
            <div className="bg-gradient-to-r from-green-700 to-green-800 p-6 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3"><CreditCard size={28} className="text-green-200"/></div>
              <h2 className="text-white font-bold text-lg">Update Pembayaran</h2>
              <p className="text-white/60 text-xs mt-1">Booking: <strong className="text-white">{booking.bookingCode}</strong></p>
              <p className="text-green-200 text-sm font-bold mt-1">Sisa: {fmt(booking.remainingAmount)}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Jumlah Transfer (Rp) *</label>
                <input type="number" value={payForm.amount || ''} onChange={e => setPayForm(f => ({...f, amount: +e.target.value}))} placeholder="0" className="w-full p-3 border border-gray-200 rounded-xl text-lg font-bold text-right outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"/>
              </div>
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[5000000, 10000000, booking.remainingAmount].map((v, i) => (
                  <button key={i} onClick={() => setPayForm(f => ({...f, amount: v}))} className="p-2 text-xs font-bold bg-gray-50 border rounded-lg hover:bg-green-50 hover:border-green-300 transition">
                    {i === 2 ? 'Lunasi' : fmt(v)}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Metode Pembayaran *</label>
                <select value={payForm.method} onChange={e => setPayForm(f => ({...f, method: e.target.value}))} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 cursor-pointer">
                  <option value="TRANSFER">Transfer Bank</option><option value="CASH">Cash</option><option value="QRIS">QRIS</option><option value="CARD">Kartu Kredit/Debit</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Nama Bank</label><input value={payForm.bankName} onChange={e => setPayForm(f => ({...f, bankName: e.target.value}))} placeholder="BCA, Mandiri, dll" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"/></div>
                <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">No. Referensi</label><input value={payForm.referenceNumber} onChange={e => setPayForm(f => ({...f, referenceNumber: e.target.value}))} placeholder="Nomor bukti transfer" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"/></div>
              </div>
              <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Catatan</label><textarea value={payForm.notes} onChange={e => setPayForm(f => ({...f, notes: e.target.value}))} rows={2} placeholder="Catatan pembayaran..." className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 resize-y"/></div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                <strong>⚠️ Perhatian:</strong> Pembayaran yang Anda submit akan berstatus <strong>PENDING</strong> dan perlu diverifikasi oleh admin.
              </div>

              <button onClick={handlePayment} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white p-3.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 disabled:opacity-50">
                {loading ? <Loader2 size={18} className="animate-spin"/> : <Check size={18}/>} Kirim Pembayaran
              </button>
              <button onClick={() => setMode('detail')} className="w-full text-center text-gray-400 text-sm font-medium py-2 hover:text-gray-600 transition">Batal</button>
            </div>
          </div>
        )}

        {/* SUCCESS MODE */}
        {mode === 'success' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center animate-[fadeIn_0.5s_ease]">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} className="text-green-600"/></div>
            <h2 className="text-2xl font-bold text-[#3a0519] mb-2">Pembayaran Tercatat! ✅</h2>
            <p className="text-gray-500 mb-4 text-sm">Pembayaran Anda telah berhasil dikirim dan menunggu verifikasi admin.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left text-xs text-blue-700">
              <strong>ℹ️ Info:</strong> Admin akan memverifikasi pembayaran Anda. Anda bisa cek status kapan saja di halaman ini.
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setMode('lookup'); setBooking(null); setLookupForm({ bookingCode: '', phone: '' }); }} className="flex-1 bg-gray-100 text-gray-700 p-3 rounded-xl font-bold hover:bg-gray-200 transition">Cek Lagi</button>
              <a href="/register" className="flex-1 bg-[#3a0519] text-white p-3 rounded-xl font-bold hover:bg-[#5a0826] transition text-center">Daftar Baru</a>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
