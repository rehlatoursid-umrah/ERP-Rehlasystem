"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Users, Plus, Search, Trash2, Edit, Eye, Phone, Mail, MapPin, FileText, X, ChevronRight, Shield, Loader2, ImageIcon } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerStats } from '@/app/actions/customers';
import { Input, Textarea, Select } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { PageHeader, SectionHeader } from '@/app/components/layout/PageHeader';
import { Badge } from '@/app/components/ui/Badge';
import { BRAND } from '@/app/lib/constants';

type Customer = Awaited<ReturnType<typeof getCustomers>>[number];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({ total: 0, withPassport: 0, withVaccine: 0 });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [form, setForm] = useState({
    fullName: '', nickname: '', gender: '', birthDate: '', birthPlace: '',
    nik: '', fatherName: '', motherName: '', maritalStatus: '', occupation: '',
    phone: '', whatsapp: '', email: '', address: '', city: '', province: '', postalCode: '',
    passportNumber: '', passportExpiry: '', passportIssued: '', passportPlace: '', passportPhoto: '',
    bloodType: '', healthNotes: '', vaccineMeningitis: false, vaccineDate: '',
    hasDiseases: false, diseaseNotes: '', specialNeeds: false, wheelchair: false,
    previousUmrah: false, previousHajj: false,
    emergencyName: '', emergencyPhone: '', emergencyRelation: '', notes: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [c, s] = await Promise.all([getCustomers(search || undefined), getCustomerStats()]);
      setCustomers(c);
      setStats(s);
    } catch (e) { toast.error("Gagal memuat data"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, [search]);

  const resetForm = () => {
    setForm({ fullName: '', nickname: '', gender: '', birthDate: '', birthPlace: '', nik: '', fatherName: '', motherName: '', maritalStatus: '', occupation: '', phone: '', whatsapp: '', email: '', address: '', city: '', province: '', postalCode: '', passportNumber: '', passportExpiry: '', passportIssued: '', passportPlace: '', passportPhoto: '', bloodType: '', healthNotes: '', vaccineMeningitis: false, vaccineDate: '', hasDiseases: false, diseaseNotes: '', specialNeeds: false, wheelchair: false, previousUmrah: false, previousHajj: false, emergencyName: '', emergencyPhone: '', emergencyRelation: '', notes: '' });
    setEditingId(null);
  };

  const handleEdit = (c: Customer) => {
    setForm({
      fullName: c.fullName || '', nickname: c.nickname || '', gender: c.gender || '',
      birthDate: c.birthDate ? new Date(c.birthDate).toISOString().split('T')[0] : '',
      birthPlace: c.birthPlace || '', nik: c.nik || '',
      fatherName: (c as any).fatherName || '', motherName: (c as any).motherName || '',
      maritalStatus: (c as any).maritalStatus || '', occupation: (c as any).occupation || '',
      phone: c.phone || '', whatsapp: c.whatsapp || '', email: c.email || '',
      address: c.address || '', city: c.city || '', province: c.province || '',
      postalCode: (c as any).postalCode || '',
      passportNumber: c.passportNumber || '',
      passportExpiry: c.passportExpiry ? new Date(c.passportExpiry).toISOString().split('T')[0] : '',
      passportIssued: c.passportIssued ? new Date(c.passportIssued).toISOString().split('T')[0] : '',
      passportPlace: (c as any).passportPlace || '',
      passportPhoto: c.passportPhoto || '',
      bloodType: c.bloodType || '', healthNotes: c.healthNotes || '',
      vaccineMeningitis: c.vaccineMeningitis || false,
      vaccineDate: c.vaccineDate ? new Date(c.vaccineDate).toISOString().split('T')[0] : '',
      hasDiseases: (c as any).hasDiseases || false, diseaseNotes: (c as any).diseaseNotes || '',
      specialNeeds: (c as any).specialNeeds || false, wheelchair: (c as any).wheelchair || false,
      previousUmrah: (c as any).previousUmrah || false, previousHajj: (c as any).previousHajj || false,
      emergencyName: c.emergencyName || '', emergencyPhone: c.emergencyPhone || '',
      emergencyRelation: c.emergencyRelation || '', notes: c.notes || '',
    });
    setEditingId(c.id);
    setShowForm(true);
    setSelectedCustomer(null);
  };

  const handleSubmit = () => {
    if (!form.fullName.trim()) { toast.error("Nama wajib diisi"); return; }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateCustomer(editingId, form);
          toast.success("Data jamaah berhasil diupdate!");
        } else {
          await createCustomer(form);
          toast.success("Jamaah baru berhasil ditambahkan!");
        }
        resetForm();
        setShowForm(false);
        loadData();
      } catch (e) { toast.error("Gagal menyimpan data"); }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Yakin hapus data "${name}"?`)) return;
    startTransition(async () => {
      try {
        const res = await deleteCustomer(id);
        if (res.success) {
          toast.success("Data berhasil dihapus");
          loadData();
          if (selectedCustomer?.id === id) setSelectedCustomer(null);
        } else {
          toast.error(res.error || "Gagal menghapus data");
        }
      } catch (e) { toast.error("Gagal menghapus data"); }
    });
  };

  const formatDate = (d: Date | string | null) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />

      <PageHeader
        title="Database Jamaah (CRM)"
        description="Kelola seluruh data jamaah dan dokumen penting."
        icon={<Users className="text-[#a77a0b]" size={28} />}
        actions={
          <Button icon={<Plus size={18} />} onClick={() => { resetForm(); setShowForm(true); setSelectedCustomer(null); }}>
            Tambah Jamaah
          </Button>
        }
      />

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Jamaah', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Users size={20}/> },
          { label: 'Punya Paspor', value: stats.withPassport, color: 'bg-green-50 text-green-700 border-green-200', icon: <FileText size={20}/> },
          { label: 'Sudah Vaksin', value: stats.withVaccine, color: 'bg-purple-50 text-purple-700 border-purple-200', icon: <Shield size={20}/> },
        ].map((s, i) => (
          <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${s.color}`}>
            <div className="p-2.5 rounded-lg bg-white shadow-sm">{s.icon}</div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Cari nama, telepon, paspor, kota..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#a77a0b] focus:ring-1 focus:ring-[#a77a0b]/20 bg-white shadow-sm"
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* TABLE */}
        <div className={`flex-1 transition-all ${selectedCustomer ? 'max-w-[60%]' : ''}`}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">Nama</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Telepon</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Kota</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Paspor</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={24}/>Memuat...</td></tr>
                  ) : customers.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-400">
                      <Users size={40} className="mx-auto mb-3 opacity-30"/>
                      <p className="font-medium">Belum ada data jamaah</p>
                      <p className="text-xs mt-1">Klik "Tambah Jamaah" untuk memulai</p>
                    </td></tr>
                  ) : customers.map(c => (
                    <tr key={c.id} onClick={() => { setSelectedCustomer(c); setShowForm(false); }}
                      className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${selectedCustomer?.id === c.id ? 'bg-[#fdf8e8]' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{c.fullName}</p>
                        {c.email && <p className="text-xs text-gray-400 mt-0.5">{c.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.phone || c.whatsapp || '-'}</td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{c.city || '-'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {c.passportNumber ? (
                          <Badge variant="success" size="sm">{c.passportNumber}</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Belum ada</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(c.id, c.fullName)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* DETAIL PANEL */}
        {selectedCustomer && !showForm && (
          <div className="w-[40%] hidden lg:block">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-6 overflow-hidden">
              <div className="bg-[#3a0519] p-5 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-[#a77a0b] font-bold uppercase tracking-wider mb-1">Detail Jamaah</p>
                    <h3 className="text-lg font-bold">{selectedCustomer.fullName}</h3>
                    {selectedCustomer.nickname && <p className="text-sm text-white/70 mt-0.5">"{selectedCustomer.nickname}"</p>}
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="text-white/50 hover:text-white p-1"><X size={18}/></button>
                </div>
              </div>
              <div className="p-5 space-y-4 max-h-[calc(100vh-260px)] overflow-y-auto">
                {/* Contact */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Kontak</p>
                  <div className="space-y-2">
                    {selectedCustomer.phone && <p className="text-sm flex items-center gap-2"><Phone size={14} className="text-gray-400"/>{selectedCustomer.phone}</p>}
                    {selectedCustomer.whatsapp && <p className="text-sm flex items-center gap-2"><Phone size={14} className="text-green-500"/>{selectedCustomer.whatsapp} <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">WA</span></p>}
                    {selectedCustomer.email && <p className="text-sm flex items-center gap-2"><Mail size={14} className="text-gray-400"/>{selectedCustomer.email}</p>}
                    {(selectedCustomer.address || selectedCustomer.city) && <p className="text-sm flex items-center gap-2"><MapPin size={14} className="text-gray-400"/>{[selectedCustomer.address, selectedCustomer.city, selectedCustomer.province, (selectedCustomer as any).postalCode].filter(Boolean).join(', ')}</p>}
                  </div>
                </div>

                {/* Identity */}
                <div className="border-t pt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Identitas</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-[10px] text-gray-400">NIK</p><p className="font-medium">{selectedCustomer.nik || '-'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Gender</p><p className="font-medium">{selectedCustomer.gender === 'MALE' ? 'Laki-laki' : selectedCustomer.gender === 'FEMALE' ? 'Perempuan' : '-'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Tempat, Tgl Lahir</p><p className="font-medium">{selectedCustomer.birthPlace || '-'}, {formatDate(selectedCustomer.birthDate)}</p></div>
                    <div><p className="text-[10px] text-gray-400">Gol. Darah</p><p className="font-medium">{selectedCustomer.bloodType || '-'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Nama Ayah</p><p className="font-medium">{(selectedCustomer as any).fatherName || '-'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Nama Ibu</p><p className="font-medium">{(selectedCustomer as any).motherName || '-'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Status Pernikahan</p><p className="font-medium">{{SINGLE:'Belum Menikah',MARRIED:'Menikah',DIVORCED:'Cerai',WIDOWED:'Janda/Duda'}[(selectedCustomer as any).maritalStatus || ''] || '-'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Pekerjaan</p><p className="font-medium">{(selectedCustomer as any).occupation || '-'}</p></div>
                  </div>
                </div>

                {/* Passport */}
                <div className="border-t pt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Paspor</p>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div><p className="text-[10px] text-gray-400">Nomor</p><p className="font-medium font-mono">{selectedCustomer.passportNumber || '-'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Berlaku s/d</p><p className="font-medium">{formatDate(selectedCustomer.passportExpiry)}</p></div>
                    <div><p className="text-[10px] text-gray-400">Tgl Terbit</p><p className="font-medium">{formatDate(selectedCustomer.passportIssued)}</p></div>
                    <div><p className="text-[10px] text-gray-400">Tempat Terbit</p><p className="font-medium">{(selectedCustomer as any).passportPlace || '-'}</p></div>
                  </div>
                  {selectedCustomer.passportPhoto && (
                    <a href={selectedCustomer.passportPhoto} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-[#a77a0b] bg-[#a77a0b]/10 px-3 py-1.5 rounded-lg hover:bg-[#a77a0b]/20 transition-colors">
                      <FileText size={14} /> Lihat File Paspor
                    </a>
                  )}
                </div>

                {/* Dokumen (KTP & Paspor) */}
                {selectedCustomer.documents && selectedCustomer.documents.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Dokumen Terunggah</p>
                    <div className="space-y-2">
                      {selectedCustomer.documents.map((doc: any) => (
                        <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                          <div className={`p-2 rounded-lg ${doc.category === 'KTP' ? 'bg-blue-50 text-blue-600' : doc.category === 'PASSPORT' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                            {doc.category === 'KTP' ? <ImageIcon size={16}/> : <FileText size={16}/>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.category === 'KTP' ? 'Foto KTP' : doc.category === 'PASSPORT' ? 'Foto Paspor' : doc.fileName}</p>
                            <p className="text-[10px] text-gray-400">{doc.category}</p>
                          </div>
                          <Eye size={14} className="text-gray-300 group-hover:text-gray-500"/>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health & Ibadah */}
                <div className="border-t pt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Kesehatan & Pengalaman Ibadah</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-[10px] text-gray-400">Penyakit</p><p className="font-medium">{(selectedCustomer as any).hasDiseases ? ((selectedCustomer as any).diseaseNotes || 'Ya') : 'Tidak ada'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Kebutuhan Khusus</p><p className="font-medium">{(selectedCustomer as any).specialNeeds ? 'Ya' : 'Tidak'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Kursi Roda</p><p className="font-medium">{(selectedCustomer as any).wheelchair ? 'Ya' : 'Tidak'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Vaksin Meningitis</p><p className="font-medium">{selectedCustomer.vaccineMeningitis ? `Ya (${formatDate(selectedCustomer.vaccineDate)})` : 'Belum'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Pengalaman Umrah</p><p className="font-medium">{(selectedCustomer as any).previousUmrah ? 'Pernah' : 'Belum'}</p></div>
                    <div><p className="text-[10px] text-gray-400">Pengalaman Haji</p><p className="font-medium">{(selectedCustomer as any).previousHajj ? 'Pernah' : 'Belum'}</p></div>
                  </div>
                  {selectedCustomer.healthNotes && <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">{selectedCustomer.healthNotes}</p>}
                </div>

                {/* Emergency */}
                {selectedCustomer.emergencyName && (
                  <div className="border-t pt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Kontak Darurat</p>
                    <p className="text-sm font-medium">{selectedCustomer.emergencyName}</p>
                    <p className="text-xs text-gray-500">{selectedCustomer.emergencyRelation} • {selectedCustomer.emergencyPhone}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedCustomer.notes && (
                  <div className="border-t pt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Catatan</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedCustomer.notes}</p>
                  </div>
                )}

                <div className="pt-4 flex gap-2">
                  <Button variant="outline" size="sm" icon={<Edit size={14}/>} onClick={() => handleEdit(selectedCustomer)} className="flex-1">Edit</Button>
                  <Button variant="danger" size="sm" icon={<Trash2 size={14}/>} onClick={() => handleDelete(selectedCustomer.id, selectedCustomer.fullName)} className="flex-1">Hapus</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-10 px-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl">
            <div className="bg-[#3a0519] p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">{editingId ? 'Edit Data Jamaah' : 'Tambah Jamaah Baru'}</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Personal */}
              <div>
                <p className="text-xs font-bold text-[#a77a0b] uppercase mb-3">Data Pribadi</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nama Lengkap *" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="Sesuai paspor" />
                  <Input label="Nama Panggilan" value={form.nickname} onChange={e => setForm({...form, nickname: e.target.value})} />
                  <Select label="Jenis Kelamin" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} options={[{value:'',label:'Pilih...'},{value:'MALE',label:'Laki-laki'},{value:'FEMALE',label:'Perempuan'}]} />
                  <Input label="NIK" value={form.nik} onChange={e => setForm({...form, nik: e.target.value})} placeholder="16 digit" />
                  <Input label="Tempat Lahir" value={form.birthPlace} onChange={e => setForm({...form, birthPlace: e.target.value})} />
                  <Input type="date" label="Tanggal Lahir" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} />
                  <Input label="Nama Ayah" value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} />
                  <Input label="Nama Ibu" value={form.motherName} onChange={e => setForm({...form, motherName: e.target.value})} />
                  <Select label="Status Pernikahan" value={form.maritalStatus} onChange={e => setForm({...form, maritalStatus: e.target.value})} options={[{value:'',label:'Pilih...'},{value:'SINGLE',label:'Belum Menikah'},{value:'MARRIED',label:'Menikah'},{value:'DIVORCED',label:'Cerai'},{value:'WIDOWED',label:'Janda/Duda'}]} />
                  <Input label="Pekerjaan" value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} />
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-xs font-bold text-[#a77a0b] uppercase mb-3">Kontak</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="No. HP" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} icon={<Phone size={14}/>} />
                  <Input label="WhatsApp" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} icon={<Phone size={14}/>} />
                  <Input label="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} icon={<Mail size={14}/>} />
                  <Input label="Kota" value={form.city} onChange={e => setForm({...form, city: e.target.value})} icon={<MapPin size={14}/>} />
                  <div className="md:col-span-2">
                    <Input label="Alamat Lengkap" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                  </div>
                  <Input label="Provinsi" value={form.province} onChange={e => setForm({...form, province: e.target.value})} />
                  <Input label="Kode Pos" value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})} />
                </div>
              </div>

              {/* Passport */}
              <div>
                <p className="text-xs font-bold text-[#a77a0b] uppercase mb-3">Data Paspor</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Nomor Paspor" value={form.passportNumber} onChange={e => setForm({...form, passportNumber: e.target.value})} className="font-mono" />
                  <Input type="date" label="Tgl Terbit" value={form.passportIssued} onChange={e => setForm({...form, passportIssued: e.target.value})} />
                  <Input type="date" label="Berlaku s/d" value={form.passportExpiry} onChange={e => setForm({...form, passportExpiry: e.target.value})} />
                  <Input label="Tempat Terbit" value={form.passportPlace} onChange={e => setForm({...form, passportPlace: e.target.value})} placeholder="Kantor Imigrasi..." />
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Foto Paspor (Upload)</label>
                    <div className="flex items-center gap-4">
                      {form.passportPhoto ? (
                        <div className="relative group">
                          <img src={form.passportPhoto} alt="Passport" className="w-24 h-24 object-cover rounded-lg border" />
                          <button onClick={() => setForm({...form, passportPhoto: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                          </button>
                        </div>
                      ) : null}
                      <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploading(true);
                          const toastId = toast.loading("Mengunggah paspor...");
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('folder', 'passports');
                            const { uploadAction } = await import('@/app/actions/storage');
                            const res = await uploadAction(formData);
                            if (res.success && res.url) {
                              setForm({...form, passportPhoto: res.url});
                              toast.success("Paspor berhasil diunggah", { id: toastId });
                            } else {
                              toast.error(res.error || "Gagal mengunggah", { id: toastId });
                            }
                          } catch (err) {
                            toast.error("Terjadi kesalahan jaringan", { id: toastId });
                          } finally {
                            setIsUploading(false);
                            e.target.value = '';
                          }
                        }}
                        disabled={isUploading}
                        className={`text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#a77a0b]/10 file:text-[#a77a0b] hover:file:bg-[#a77a0b]/20 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Health */}
              <div>
                <p className="text-xs font-bold text-[#a77a0b] uppercase mb-3">Kesehatan</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select label="Golongan Darah" value={form.bloodType} onChange={e => setForm({...form, bloodType: e.target.value})} options={[{value:'',label:'Pilih...'},{value:'A',label:'A'},{value:'B',label:'B'},{value:'AB',label:'AB'},{value:'O',label:'O'}]} />
                  <div className="flex items-end gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium pb-2">
                      <input type="checkbox" checked={form.vaccineMeningitis} onChange={e => setForm({...form, vaccineMeningitis: e.target.checked})} className="rounded border-gray-300 text-[#3a0519] focus:ring-[#3a0519]" />
                      Sudah Vaksin Meningitis
                    </label>
                  </div>
                  <Input type="date" label="Tgl Vaksin" value={form.vaccineDate} onChange={e => setForm({...form, vaccineDate: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input type="checkbox" checked={form.hasDiseases} onChange={e => setForm({...form, hasDiseases: e.target.checked})} className="rounded border-gray-300 text-[#3a0519] focus:ring-[#3a0519]" />
                      Memiliki Penyakit
                    </label>
                    {form.hasDiseases && <Input label="Jenis Penyakit" value={form.diseaseNotes} onChange={e => setForm({...form, diseaseNotes: e.target.value})} placeholder="Diabetes, Asma, dll." />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input type="checkbox" checked={form.specialNeeds} onChange={e => setForm({...form, specialNeeds: e.target.checked})} className="rounded border-gray-300 text-[#3a0519] focus:ring-[#3a0519]" />
                      Kebutuhan Khusus
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input type="checkbox" checked={form.wheelchair} onChange={e => setForm({...form, wheelchair: e.target.checked})} className="rounded border-gray-300 text-[#3a0519] focus:ring-[#3a0519]" />
                      Membutuhkan Kursi Roda
                    </label>
                  </div>
                </div>
                <Textarea label="Catatan Kesehatan" value={form.healthNotes} onChange={e => setForm({...form, healthNotes: e.target.value})} rows={2} className="mt-4" placeholder="Alergi, riwayat penyakit, dsb." />
              </div>

              {/* Ibadah Experience */}
              <div>
                <p className="text-xs font-bold text-[#a77a0b] uppercase mb-3">Pengalaman Ibadah</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <input type="checkbox" checked={form.previousUmrah} onChange={e => setForm({...form, previousUmrah: e.target.checked})} className="rounded border-gray-300 text-[#3a0519] focus:ring-[#3a0519]" />
                    Pernah Umrah
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <input type="checkbox" checked={form.previousHajj} onChange={e => setForm({...form, previousHajj: e.target.checked})} className="rounded border-gray-300 text-[#3a0519] focus:ring-[#3a0519]" />
                    Pernah Haji
                  </label>
                </div>
              </div>

              {/* Emergency */}
              <div>
                <p className="text-xs font-bold text-[#a77a0b] uppercase mb-3">Kontak Darurat</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Nama" value={form.emergencyName} onChange={e => setForm({...form, emergencyName: e.target.value})} />
                  <Input label="No. HP" value={form.emergencyPhone} onChange={e => setForm({...form, emergencyPhone: e.target.value})} />
                  <Input label="Hubungan" value={form.emergencyRelation} onChange={e => setForm({...form, emergencyRelation: e.target.value})} placeholder="Suami/Istri/Anak" />
                </div>
              </div>

              {/* Notes */}
              <Textarea label="Catatan Tambahan" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
            </div>

            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Batal</Button>
              <Button onClick={handleSubmit} loading={isPending} icon={editingId ? <Edit size={16}/> : <Plus size={16}/>}>
                {editingId ? 'Simpan Perubahan' : 'Tambah Jamaah'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
