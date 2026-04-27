"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Truck, Plus, Edit, Trash2, X, Loader2, Phone, Mail, Globe, Building2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/app/actions/operations';
import { Input, Textarea, Select } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Badge } from '@/app/components/ui/Badge';

type SupplierItem = Awaited<ReturnType<typeof getSuppliers>>[number];

const TYPE_BADGE: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'primary' | 'default' }> = {
  HOTEL: { label: 'Hotel', variant: 'primary' },
  AIRLINE: { label: 'Airline', variant: 'info' },
  VISA_PROVIDER: { label: 'Visa', variant: 'success' },
  TRANSPORT: { label: 'Transport', variant: 'warning' },
  CATERING: { label: 'Catering', variant: 'default' },
  OTHER: { label: 'Lainnya', variant: 'default' },
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const emptyForm = { name: '', type: 'HOTEL', contactPerson: '', phone: '', email: '', address: '', country: '', bankName: '', bankAccount: '', notes: '' };
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setIsLoading(true);
    try { setSuppliers(await getSuppliers(filterType || undefined)); } catch { toast.error("Gagal memuat"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, [filterType]);

  const handleEdit = (s: SupplierItem) => {
    setForm({ name: s.name, type: s.type, contactPerson: s.contactPerson || '', phone: s.phone || '', email: s.email || '', address: s.address || '', country: s.country || '', bankName: s.bankName || '', bankAccount: s.bankAccount || '', notes: s.notes || '' });
    setEditingId(s.id); setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Nama supplier wajib"); return; }
    startTransition(async () => {
      try {
        if (editingId) { await updateSupplier(editingId, form); toast.success("Supplier diupdate!"); }
        else { await createSupplier(form); toast.success("Supplier ditambahkan!"); }
        setForm(emptyForm); setEditingId(null); setShowForm(false); loadData();
      } catch { toast.error("Gagal menyimpan"); }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus supplier "${name}"?`)) return;
    startTransition(async () => {
      try { await deleteSupplier(id); toast.success("Dihapus"); loadData(); }
      catch { toast.error("Gagal"); }
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />
      <PageHeader title="Manajemen Supplier" description="Kelola data hotel, airline, dan vendor lainnya." icon={<Truck className="text-[#a77a0b]" size={28}/>}
        actions={<Button icon={<Plus size={18}/>} onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>Tambah Supplier</Button>}
      />

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{v:'',l:'Semua'}, {v:'HOTEL',l:'Hotel'}, {v:'AIRLINE',l:'Airline'}, {v:'VISA_PROVIDER',l:'Visa'}, {v:'TRANSPORT',l:'Transport'}, {v:'OTHER',l:'Lainnya'}].map(f => (
          <button key={f.v} onClick={() => setFilterType(f.v)} className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${filterType === f.v ? 'bg-[#3a0519] text-white border-[#3a0519]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{f.l}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b text-left">
            <th className="px-4 py-3 font-semibold text-gray-600">Supplier</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Tipe</th>
            <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">PIC</th>
            <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Kontak</th>
            <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Negara</th>
            <th className="px-4 py-3 w-24"></th>
          </tr></thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={24}/>Memuat...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400"><Truck size={40} className="mx-auto mb-3 opacity-30"/><p>Belum ada supplier</p></td></tr>
            ) : suppliers.map(s => {
              const tb = TYPE_BADGE[s.type] || TYPE_BADGE.OTHER;
              return (
                <tr key={s.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{s.name}</p>
                    {s.bankName && <p className="text-[10px] text-gray-400 mt-0.5">Bank: {s.bankName} {s.bankAccount ? `• ${s.bankAccount}` : ''}</p>}
                  </td>
                  <td className="px-4 py-3"><Badge variant={tb.variant} size="sm">{tb.label}</Badge></td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{s.contactPerson || '-'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {s.phone && <p className="text-xs flex items-center gap-1"><Phone size={10} className="text-gray-400"/>{s.phone}</p>}
                      {s.email && <p className="text-xs flex items-center gap-1"><Mail size={10} className="text-gray-400"/>{s.email}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{s.country || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto py-10 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="bg-[#3a0519] p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">{editingId ? 'Edit Supplier' : 'Tambah Supplier'}</h2>
              <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nama Supplier *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <Select label="Tipe" value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  options={[{value:'HOTEL',label:'Hotel'},{value:'AIRLINE',label:'Airline'},{value:'VISA_PROVIDER',label:'Visa Provider'},{value:'TRANSPORT',label:'Transport'},{value:'CATERING',label:'Catering'},{value:'OTHER',label:'Lainnya'}]} />
              </div>
              <Input label="PIC (Contact Person)" value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Telepon" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} icon={<Phone size={14}/>} />
                <Input label="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} icon={<Mail size={14}/>} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Negara" value={form.country} onChange={e => setForm({...form, country: e.target.value})} icon={<Globe size={14}/>} />
                <Input label="Alamat" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nama Bank" value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} />
                <Input label="No. Rekening" value={form.bankAccount} onChange={e => setForm({...form, bankAccount: e.target.value})} />
              </div>
              <Textarea label="Catatan" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              <Button onClick={handleSubmit} loading={isPending}>{editingId ? 'Simpan' : 'Tambah'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
