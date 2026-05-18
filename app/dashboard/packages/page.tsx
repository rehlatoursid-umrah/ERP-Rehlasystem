"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Package, Plus, Edit, Trash2, X, Loader2, Star, Calendar, Users, Plane, Building2, ChevronRight, ImageIcon } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { getPackages, createPackage, updatePackage, deletePackage } from '@/app/actions/operations';
import { uploadAction } from '@/app/actions/storage';
import { Input, Textarea, Select } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Badge } from '@/app/components/ui/Badge';
import { BRAND } from '@/app/lib/constants';

type Pkg = Awaited<ReturnType<typeof getPackages>>[number];

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'danger' }> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  ACTIVE: { label: 'Active', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'warning' },
  ARCHIVED: { label: 'Archived', variant: 'danger' },
};

const TYPE_MAP: Record<string, string> = { ECONOMY: 'Ekonomi', REGULAR: 'Reguler', PREMIUM: 'Premium', VIP: 'VIP', VVIP: 'VVIP', CUSTOM: 'Custom' };

export default function PackagesPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const emptyForm = {
    name: '', type: 'REGULAR', description: '', status: 'DRAFT',
    priceQuad: 0, priceTriple: 0, priceDouble: 0, priceSingle: 0, priceOriginal: 0, currency: 'IDR',
    durationDays: 9, durationNights: 7, includes: '', excludes: '',
    hotelMakkah: '', hotelMadinah: '', airline: '', coverImage: '',
    badge: '', highlights: '', rating: 0, reviewCount: 0,
    isPopular: false, isBestSeller: false, groupSizeMin: 15, groupSizeMax: 45,
  };
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setIsLoading(true);
    try { setPackages(await getPackages()); } catch { toast.error("Gagal memuat"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (p: Pkg) => {
    setForm({
      name: p.name, type: p.type, description: p.description || '', status: p.status,
      priceQuad: p.priceQuad, priceTriple: p.priceTriple, priceDouble: p.priceDouble, priceSingle: p.priceSingle,
      priceOriginal: (p as any).priceOriginal || 0,
      currency: p.currency, durationDays: p.durationDays, durationNights: p.durationNights,
      includes: p.includes || '', excludes: p.excludes || '',
      hotelMakkah: p.hotelMakkah || '', hotelMadinah: p.hotelMadinah || '',
      airline: p.airline || '', coverImage: p.coverImage || '',
      badge: (p as any).badge || '', highlights: (p as any).highlights || '',
      rating: (p as any).rating || 0, reviewCount: (p as any).reviewCount || 0,
      isPopular: (p as any).isPopular || false, isBestSeller: (p as any).isBestSeller || false,
      groupSizeMin: (p as any).groupSizeMin || 15, groupSizeMax: (p as any).groupSizeMax || 45,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Nama paket wajib diisi"); return; }
    startTransition(async () => {
      try {
        if (editingId) { await updatePackage(editingId, form); toast.success("Paket diupdate!"); }
        else { await createPackage(form); toast.success("Paket baru ditambahkan!"); }
        setForm(emptyForm); setEditingId(null); setShowForm(false); loadData();
      } catch { toast.error("Gagal menyimpan"); }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Mengunggah gambar...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'packages');

      const res = await uploadAction(formData);
      if (res.success && res.url) {
        setForm({ ...form, coverImage: res.url });
        toast.success('Gambar berhasil diunggah', { id: toastId });
      } else {
        toast.error(res.error || 'Gagal mengunggah', { id: toastId });
      }
    } catch (err) {
      toast.error('Terjadi kesalahan', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus paket "${name}"?`)) return;
    startTransition(async () => {
      try { await deletePackage(id); toast.success("Paket dihapus"); loadData(); }
      catch { toast.error("Gagal menghapus"); }
    });
  };

  const fmt = (n: number) => n.toLocaleString('id-ID');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />
      <PageHeader title="Manajemen Paket Umrah" description="Kelola paket perjalanan umrah dan haji." icon={<Package className="text-[#a77a0b]" size={28}/>}
        actions={<Button icon={<Plus size={18}/>} onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>Tambah Paket</Button>}
      />

      {/* PACKAGE CARDS */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32}/></div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-30"/><p className="font-medium">Belum ada paket</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map(p => {
            const totalBookings = p.bookings?.length || 0;
            const st = STATUS_MAP[p.status] || STATUS_MAP.DRAFT;
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-br from-[#3a0519] to-[#5a0826] relative flex items-end p-4">
                  {p.coverImage && <img src={p.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-40" alt=""/>}
                  <div className="relative z-10">
                    <Badge variant={st.variant} size="sm">{st.label}</Badge>
                    <h3 className="text-white font-bold text-lg mt-1 leading-tight">{p.name}</h3>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-[#a77a0b] text-white text-[10px] font-bold px-2 py-1 rounded">{TYPE_MAP[p.type] || p.type}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {p.durationDays}H/{p.durationNights}M</span>
                    <span className="flex items-center gap-1"><Users size={12}/> {totalBookings} booking</span>
                  </div>

                  {p.hotelMakkah && <p className="text-xs text-gray-500 flex items-center gap-1"><Building2 size={12}/> {p.hotelMakkah}</p>}
                  {p.airline && <p className="text-xs text-gray-500 flex items-center gap-1"><Plane size={12}/> {p.airline}</p>}

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <div className="text-center bg-gray-50 rounded p-1.5"><p className="text-[9px] text-gray-400 font-bold">QUAD</p><p className="text-xs font-bold text-[#3a0519]">{fmt(p.priceQuad)}</p></div>
                    <div className="text-center bg-gray-50 rounded p-1.5"><p className="text-[9px] text-gray-400 font-bold">TRIPLE</p><p className="text-xs font-bold text-[#3a0519]">{fmt(p.priceTriple)}</p></div>
                    <div className="text-center bg-gray-50 rounded p-1.5"><p className="text-[9px] text-gray-400 font-bold">DOUBLE</p><p className="text-xs font-bold text-[#3a0519]">{fmt(p.priceDouble)}</p></div>
                    <div className="text-center bg-gray-50 rounded p-1.5"><p className="text-[9px] text-gray-400 font-bold">SINGLE</p><p className="text-xs font-bold text-[#3a0519]">{fmt(p.priceSingle)}</p></div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" icon={<Edit size={14}/>} onClick={() => handleEdit(p)} className="flex-1">Edit</Button>
                    <Button variant="danger" size="sm" icon={<Trash2 size={14}/>} onClick={() => handleDelete(p.id, p.name)} className="flex-1">Hapus</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-10 px-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl">
            <div className="bg-[#3a0519] p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">{editingId ? 'Edit Paket' : 'Tambah Paket Baru'}</h2>
              <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nama Paket *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Paket Umrah Reguler 2026" />
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Tipe" value={form.type} onChange={e => setForm({...form, type: e.target.value})} options={[{value:'ECONOMY',label:'Ekonomi'},{value:'REGULAR',label:'Reguler'},{value:'PREMIUM',label:'Premium'},{value:'VIP',label:'VIP'},{value:'VVIP',label:'VVIP'},{value:'CUSTOM',label:'Custom'}]} />
                  <Select label="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value})} options={[{value:'DRAFT',label:'Draft'},{value:'ACTIVE',label:'Active'},{value:'CLOSED',label:'Closed'}]} />
                </div>
              </div>
              <Textarea label="Deskripsi" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
              
              <p className="text-xs font-bold text-[#a77a0b] uppercase mt-2">Harga Per Orang ({form.currency})</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input type="number" label="Quad" value={form.priceQuad||''} onChange={e => setForm({...form, priceQuad: +e.target.value})} className="text-right" />
                <Input type="number" label="Triple" value={form.priceTriple||''} onChange={e => setForm({...form, priceTriple: +e.target.value})} className="text-right" />
                <Input type="number" label="Double" value={form.priceDouble||''} onChange={e => setForm({...form, priceDouble: +e.target.value})} className="text-right" />
                <Input type="number" label="Single" value={form.priceSingle||''} onChange={e => setForm({...form, priceSingle: +e.target.value})} className="text-right" />
              </div>

              <p className="text-xs font-bold text-[#a77a0b] uppercase mt-2">Detail</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input type="number" label="Durasi (Hari)" value={form.durationDays} onChange={e => setForm({...form, durationDays: +e.target.value})} />
                <Input type="number" label="Malam" value={form.durationNights} onChange={e => setForm({...form, durationNights: +e.target.value})} />
                <Input label="Hotel Makkah" value={form.hotelMakkah} onChange={e => setForm({...form, hotelMakkah: e.target.value})} />
                <Input label="Hotel Madinah" value={form.hotelMadinah} onChange={e => setForm({...form, hotelMadinah: e.target.value})} />
              </div>
              <Input label="Maskapai" value={form.airline} onChange={e => setForm({...form, airline: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Textarea label="Include" value={form.includes} onChange={e => setForm({...form, includes: e.target.value})} rows={3} />
                <Textarea label="Exclude" value={form.excludes} onChange={e => setForm({...form, excludes: e.target.value})} rows={3} />
              </div>

              <p className="text-xs font-bold text-[#a77a0b] uppercase mt-4">Website Display (Tampilan di Website Publik)</p>
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Gambar Paket (Cover Image)</label>
                  <div className="flex gap-4 items-center">
                    {form.coverImage ? (
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-300">
                        <img src={form.coverImage} className="w-full h-full object-cover" alt="Cover" />
                        <button onClick={() => setForm({...form, coverImage: ''})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"><X size={12}/></button>
                      </div>
                    ) : (
                      <div className="w-32 h-20 rounded-lg bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <ImageIcon className="text-gray-400" size={24} />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="text-sm" />
                      {isUploading && <p className="text-xs text-[#a77a0b] mt-1 flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Mengunggah...</p>}
                      <p className="text-[10px] text-gray-500 mt-1">Atau masukkan URL gambar di bawah:</p>
                      <Input value={form.coverImage} onChange={e => setForm({...form, coverImage: e.target.value})} placeholder="https://..." className="mt-1 text-sm" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Input label="Badge Label" value={form.badge} onChange={e => setForm({...form, badge: e.target.value})} placeholder="Best Seller, Hemat, Premium" />
                  <Input type="number" label="Rating (0-5)" value={form.rating||''} onChange={e => setForm({...form, rating: +e.target.value})} />
                  <Input type="number" label="Jumlah Review" value={form.reviewCount||''} onChange={e => setForm({...form, reviewCount: +e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" label="Harga Asli (coret)" value={form.priceOriginal||''} onChange={e => setForm({...form, priceOriginal: +e.target.value})} placeholder="Harga sebelum diskon" />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" label="Min Grup" value={form.groupSizeMin||''} onChange={e => setForm({...form, groupSizeMin: +e.target.value})} />
                  <Input type="number" label="Max Grup" value={form.groupSizeMax||''} onChange={e => setForm({...form, groupSizeMax: +e.target.value})} />
                </div>
              </div>
              <Textarea label="Highlights (satu per baris)" value={form.highlights} onChange={e => setForm({...form, highlights: e.target.value})} rows={4} placeholder={"Hotel dekat Masjidil Haram\nMakan 3x sehari\nBimbingan manasik lengkap"} />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPopular} onChange={e => setForm({...form, isPopular: e.target.checked})} className="accent-[#3a0519]" />
                  <span className="text-sm font-medium">Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isBestSeller} onChange={e => setForm({...form, isBestSeller: e.target.checked})} className="accent-[#3a0519]" />
                  <span className="text-sm font-medium">Best Seller</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              <Button onClick={handleSubmit} loading={isPending}>{editingId ? 'Simpan' : 'Tambah Paket'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
