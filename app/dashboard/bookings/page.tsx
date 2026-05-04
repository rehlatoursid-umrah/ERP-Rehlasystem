"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { ClipboardList, Plus, Trash2, X, Loader2, CreditCard, Users, ChevronDown, DollarSign, CheckCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { getBookings, createBooking, updateBookingStatus, deleteBooking, addPayment, getPackages } from '@/app/actions/operations';
import { getCustomers } from '@/app/actions/customers';
import { Input, Textarea, Select } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Badge } from '@/app/components/ui/Badge';

type BookingItem = Awaited<ReturnType<typeof getBookings>>[number];

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  PENDING: { label: 'Pending', variant: 'default' },
  CONFIRMED: { label: 'Confirmed', variant: 'info' },
  DP_PAID: { label: 'DP Paid', variant: 'warning' },
  FULLY_PAID: { label: 'Lunas', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
  REFUNDED: { label: 'Refunded', variant: 'danger' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [customers, setCustomers] = useState<{ id: string; fullName: string }[]>([]);
  const [packages, setPackages] = useState<{ id: string; name: string; priceQuad: number; priceTriple: number; priceDouble: number; priceSingle: number }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({ customerId: '', packageId: '', roomType: 'QUAD', priceTotal: 0, currency: 'IDR', notes: '' });
  const [payForm, setPayForm] = useState({ amount: 0, method: 'TRANSFER', bankName: '', referenceNumber: '', notes: '' });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [b, c, p] = await Promise.all([getBookings(), getCustomers(), getPackages()]);
      setBookings(b);
      setCustomers(c.map(x => ({ id: x.id, fullName: x.fullName })));
      setPackages(p.map(x => ({ id: x.id, name: x.name, priceQuad: x.priceQuad, priceTriple: x.priceTriple, priceDouble: x.priceDouble, priceSingle: x.priceSingle })));
    } catch { toast.error("Gagal memuat data"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // Auto-fill price when package + room type selected
  useEffect(() => {
    if (form.packageId && form.roomType) {
      const pkg = packages.find(p => p.id === form.packageId);
      if (pkg) {
        const priceMap: Record<string, number> = { QUAD: pkg.priceQuad, TRIPLE: pkg.priceTriple, DOUBLE: pkg.priceDouble, SINGLE: pkg.priceSingle };
        setForm(f => ({ ...f, priceTotal: priceMap[f.roomType] || 0 }));
      }
    }
  }, [form.packageId, form.roomType, packages]);

  const handleSubmit = () => {
    if (!form.customerId) { toast.error("Pilih jamaah"); return; }
    if (form.priceTotal <= 0) { toast.error("Harga harus > 0"); return; }
    startTransition(async () => {
      try {
        await createBooking(form);
        toast.success("Booking berhasil dibuat!");
        setForm({ customerId: '', packageId: '', roomType: 'QUAD', priceTotal: 0, currency: 'IDR', notes: '' });
        setShowForm(false); loadData();
      } catch { toast.error("Gagal menyimpan"); }
    });
  };

  const handlePayment = (bookingId: string) => {
    if (payForm.amount <= 0) { toast.error("Jumlah harus > 0"); return; }
    startTransition(async () => {
      try {
        await addPayment({ bookingId, ...payForm });
        toast.success("Pembayaran dicatat!");
        setPayForm({ amount: 0, method: 'TRANSFER', bankName: '', referenceNumber: '', notes: '' });
        setShowPayment(null); loadData();
      } catch { toast.error("Gagal mencatat"); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus booking ini?")) return;
    startTransition(async () => {
      try { 
        const res = await deleteBooking(id); 
        if (res.success) {
          toast.success("Booking berhasil dihapus"); 
          loadData(); 
        } else {
          toast.error(res.error || "Gagal menghapus");
        }
      } catch { toast.error("Gagal menghapus"); }
    });
  };

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  // Summary stats
  const totalRevenue = bookings.reduce((s, b) => s + b.paidAmount, 0);
  const totalPending = bookings.reduce((s, b) => s + b.remainingAmount, 0);
  const fullyPaid = bookings.filter(b => b.status === 'FULLY_PAID').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />
      <PageHeader title="Booking & Pembayaran" description="Kelola pendaftaran jamaah dan status pembayaran." icon={<ClipboardList className="text-[#a77a0b]" size={28}/>}
        actions={<Button icon={<Plus size={18}/>} onClick={() => setShowForm(true)}>Booking Baru</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg"><ClipboardList size={20} className="text-blue-600"/></div>
          <div><p className="text-xl font-bold">{bookings.length}</p><p className="text-[10px] text-gray-400 font-bold uppercase">Total Booking</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg"><DollarSign size={20} className="text-green-600"/></div>
          <div><p className="text-xl font-bold text-green-700">{fmt(totalRevenue)}</p><p className="text-[10px] text-gray-400 font-bold uppercase">Terbayar</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg"><CreditCard size={20} className="text-amber-600"/></div>
          <div><p className="text-xl font-bold text-amber-700">{fmt(totalPending)}</p><p className="text-[10px] text-gray-400 font-bold uppercase">Sisa Tagihan</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle size={20} className="text-emerald-600"/></div>
          <div><p className="text-xl font-bold text-emerald-700">{fullyPaid}</p><p className="text-[10px] text-gray-400 font-bold uppercase">Lunas</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b text-left">
            <th className="px-4 py-3 font-semibold text-gray-600">Kode</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Jamaah</th>
            <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Paket</th>
            <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Kamar</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-right">Total</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-right hidden md:table-cell">Terbayar</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-center">Status</th>
            <th className="px-4 py-3 w-20"></th>
          </tr></thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={24}/>Memuat...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-16 text-gray-400"><ClipboardList size={40} className="mx-auto mb-3 opacity-30"/><p>Belum ada booking</p></td></tr>
            ) : bookings.map(b => {
              const st = STATUS_BADGE[b.status] || STATUS_BADGE.PENDING;
              const progress = b.priceTotal > 0 ? Math.round((b.paidAmount / b.priceTotal) * 100) : 0;
              return (
                <React.Fragment key={b.id}>
                  <tr className="border-b hover:bg-gray-50 cursor-pointer transition" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#a77a0b]">{b.bookingCode}</td>
                    <td className="px-4 py-3 font-medium">{b.customer?.fullName || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{b.package?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{b.roomType || '-'}</td>
                    <td className="px-4 py-3 text-right font-bold">{fmt(b.priceTotal)}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-green-600 font-bold">{fmt(b.paidAmount)}</span>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1"><div className="bg-green-500 h-1 rounded-full transition-all" style={{width:`${progress}%`}}></div></div>
                    </td>
                    <td className="px-4 py-3 text-center"><Badge variant={st.variant} size="sm">{st.label}</Badge></td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => { setShowPayment(b.id); setPayForm({ amount: 0, method: 'TRANSFER', bankName: '', referenceNumber: '', notes: '' }); }} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Bayar"><CreditCard size={16}/></button>
                        <button onClick={() => handleDelete(b.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Payment History */}
                  {expandedId === b.id && b.payments.length > 0 && (
                    <tr><td colSpan={8} className="bg-gray-50 px-8 py-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Riwayat Pembayaran</p>
                      <div className="space-y-1">
                        {b.payments.map(p => (
                          <div key={p.id} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                            <div><span className="font-medium">{p.method || '-'}</span> {p.bankName && <span className="text-gray-400">• {p.bankName}</span>} {p.referenceNumber && <span className="text-gray-400 font-mono">#{p.referenceNumber}</span>}</div>
                            <span className="font-bold text-green-600">+{fmt(p.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </td></tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* NEW BOOKING MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="bg-[#3a0519] p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">Booking Baru</h2>
              <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <Select label="Jamaah *" value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}
                options={[{value:'',label:'Pilih jamaah...'}, ...customers.map(c => ({value:c.id, label:c.fullName}))]} />
              <Select label="Paket" value={form.packageId} onChange={e => setForm({...form, packageId: e.target.value})}
                options={[{value:'',label:'Pilih paket (opsional)'}, ...packages.map(p => ({value:p.id, label:p.name}))]} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Tipe Kamar" value={form.roomType} onChange={e => setForm({...form, roomType: e.target.value})}
                  options={[{value:'QUAD',label:'Quad'},{value:'TRIPLE',label:'Triple'},{value:'DOUBLE',label:'Double'},{value:'SINGLE',label:'Single'}]} />
                <Input type="number" label="Total Harga *" value={form.priceTotal||''} onChange={e => setForm({...form, priceTotal: +e.target.value})} className="text-right" />
              </div>
              <Textarea label="Catatan" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              <Button onClick={handleSubmit} loading={isPending}>Buat Booking</Button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-green-700 p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">Catat Pembayaran</h2>
              <button onClick={() => setShowPayment(null)} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <Input type="number" label="Jumlah (Rp) *" value={payForm.amount||''} onChange={e => setPayForm({...payForm, amount: +e.target.value})} className="text-right text-lg font-bold" />
              <Select label="Metode" value={payForm.method} onChange={e => setPayForm({...payForm, method: e.target.value})}
                options={[{value:'TRANSFER',label:'Transfer'},{value:'CASH',label:'Cash'},{value:'CARD',label:'Kartu'},{value:'QRIS',label:'QRIS'}]} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Bank" value={payForm.bankName} onChange={e => setPayForm({...payForm, bankName: e.target.value})} placeholder="BCA" />
                <Input label="Ref No." value={payForm.referenceNumber} onChange={e => setPayForm({...payForm, referenceNumber: e.target.value})} />
              </div>
              <Textarea label="Catatan" value={payForm.notes} onChange={e => setPayForm({...payForm, notes: e.target.value})} rows={2} />
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowPayment(null)}>Batal</Button>
              <Button variant="success" onClick={() => handlePayment(showPayment)} loading={isPending} icon={<CreditCard size={16}/>}>Simpan Pembayaran</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
