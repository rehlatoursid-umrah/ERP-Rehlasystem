"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Shield, Plus, Edit, Trash2, X, Loader2, Mail, Phone, UserCheck, UserX, Eye, EyeOff } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { getUsers, createUser, updateUser, deleteUser } from '@/app/actions/admin';
import { Input, Select } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Badge } from '@/app/components/ui/Badge';

type UserItem = Awaited<ReturnType<typeof getUsers>>[number];

const ROLE_BADGE: Record<string, { label: string; variant: 'danger' | 'primary' | 'info' | 'default' }> = {
  SUPERADMIN: { label: 'Super Admin', variant: 'danger' },
  ADMIN: { label: 'Admin', variant: 'primary' },
  STAFF: { label: 'Staff', variant: 'info' },
  AGENT: { label: 'Agen', variant: 'default' },
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const emptyForm = { name: '', email: '', password: '', role: 'STAFF', phone: '' };
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setIsLoading(true);
    try { setUsers(await getUsers()); }
    catch { toast.error("Gagal memuat data"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (u: UserItem) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' });
    setEditingId(u.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Nama dan email wajib diisi"); return; }
    if (!editingId && !form.password) { toast.error("Password wajib diisi untuk user baru"); return; }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateUser(editingId, {
            name: form.name, email: form.email, role: form.role,
            phone: form.phone, password: form.password || undefined,
          });
          toast.success("User berhasil diupdate!");
        } else {
          await createUser(form);
          toast.success("User baru berhasil ditambahkan!");
        }
        setForm(emptyForm); setEditingId(null); setShowForm(false); loadData();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal menyimpan";
        toast.error(msg);
      }
    });
  };

  const handleToggleActive = (u: UserItem) => {
    startTransition(async () => {
      try {
        await updateUser(u.id, { isActive: !u.isActive });
        toast.success(u.isActive ? "User dinonaktifkan" : "User diaktifkan");
        loadData();
      } catch { toast.error("Gagal update status"); }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Yakin hapus user "${name}"? Aksi ini tidak dapat dibatalkan.`)) return;
    startTransition(async () => {
      try { await deleteUser(id); toast.success("User dihapus"); loadData(); }
      catch { toast.error("Gagal menghapus"); }
    });
  };

  const formatDate = (d: Date | string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <Toaster position="top-center" richColors />
      <PageHeader title="User & Role Management" description="Kelola akun pengguna dan hak akses sistem." icon={<Shield className="text-[#a77a0b]" size={28}/>}
        actions={<Button icon={<Plus size={18}/>} onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>Tambah User</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(ROLE_BADGE).map(([role, config]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-2xl font-bold text-gray-800">{count}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">Pengguna</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Kontak</th>
              <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Tgl Dibuat</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-center">Status</th>
              <th className="px-4 py-3 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={24}/>Memuat...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400"><Shield size={40} className="mx-auto mb-3 opacity-30"/><p>Belum ada user</p></td></tr>
            ) : users.map(u => {
              const rb = ROLE_BADGE[u.role] || ROLE_BADGE.STAFF;
              return (
                <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${u.isActive ? 'bg-[#3a0519]' : 'bg-gray-300'}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold ${u.isActive ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{u.name}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1"><Mail size={10}/>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant={rb.variant} size="sm">{rb.label}</Badge></td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {u.phone ? <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10}/>{u.phone}</p> : <span className="text-xs text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggleActive(u)} className={`p-1.5 rounded-lg transition ${u.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title={u.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                      {u.isActive ? <UserCheck size={18}/> : <UserX size={18}/>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => handleEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(u.id, u.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-[#3a0519] p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">{editingId ? 'Edit User' : 'Tambah User Baru'}</h2>
              <button onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); }} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Nama Lengkap *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <Input label="Email *" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} icon={<Mail size={14}/>} />
              <div className="relative">
                <Input label={editingId ? "Password Baru (kosongkan jika tidak diubah)" : "Password *"} type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-7 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  options={[{value:'SUPERADMIN',label:'Super Admin'},{value:'ADMIN',label:'Admin'},{value:'STAFF',label:'Staff'},{value:'AGENT',label:'Agen'}]} />
                <Input label="No. HP" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} icon={<Phone size={14}/>} />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowForm(false); setForm(emptyForm); setEditingId(null); }}>Batal</Button>
              <Button onClick={handleSubmit} loading={isPending} icon={editingId ? <Edit size={16}/> : <Plus size={16}/>}>
                {editingId ? 'Simpan Perubahan' : 'Tambah User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
