"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { CalendarCheck, Plus, Trash2, X, Loader2, Plane, Users, MapPin, Edit } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { getDepartures, createDeparture, updateDepartureStatus, deleteDeparture } from '@/app/actions/admin';
import { getPackages } from '@/app/actions/operations';
import { Input, Select, Textarea } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Badge } from '@/app/components/ui/Badge';

type DepartureItem = Awaited<ReturnType<typeof getDepartures>>[number];
type PkgOption = { id: string; name: string };

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  PLANNING: { label: 'Planning', variant: 'default' },
  CONFIRMED: { label: 'Confirmed', variant: 'info' },
  IN_PROGRESS: { label: 'Berjalan', variant: 'warning' },
  COMPLETED: { label: 'Selesai', variant: 'success' },
  CANCELLED: { label: 'Batal', variant: 'danger' },
};

export default function DeparturesPage() {
  const [departures, setDepartures] = useState<DepartureItem[]>([]);
  const [packages, setPackages] = useState<PkgOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const emptyForm = {
    packageId: '', departureDate: '', returnDate: '', flightDepart: '', flightReturn: '',
    pnrCode: '', maxCapacity: 45, tourLeader: '', muthowwif: '', notes: '',
  };
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [d, p] = await Promise.all([getDepartures(), getPackages()]);
      setDepartures(d);
      setPackages(p.map(x => ({ id: x.id, name: x.name })));
    } catch { toast.error("Gagal memuat data"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = () => {
    if (!form.packageId) { toast.error("Pilih paket umrah"); return; }
    if (!form.departureDate) { toast.error("Tanggal keberangkatan wajib"); return; }

    startTransition(async () => {
      try {
        await createDeparture(form);
        toast.success("Keberangkatan berhasil ditambahkan!");
        setForm(emptyForm); setShowForm(false); loadData();
      } catch { toast.error("Gagal menyimpan"); }
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      try { await updateDepartureStatus(id, status); toast.success("Status diupdate"); loadData(); }
      catch { toast.error("Gagal update"); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus keberangkatan ini?")) return;
    startTransition(async () => {
      try { await deleteDeparture(id); toast.success("Dihapus"); loadData(); }
      catch { toast.error("Gagal menghapus"); }
    });
  };

  const formatDate = (d: Date | string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />
      <PageHeader title="Manajemen Keberangkatan" description="Atur grup keberangkatan dan jadwal perjalanan." icon={<CalendarCheck className="text-[#a77a0b]" size={28}/>}
        actions={<Button icon={<Plus size={18}/>} onClick={() => { setForm(emptyForm); setShowForm(true); }}>Tambah Keberangkatan</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: departures.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Planning', value: departures.filter(d => d.status === 'PLANNING').length, color: 'bg-gray-50 text-gray-700' },
          { label: 'Confirmed', value: departures.filter(d => d.status === 'CONFIRMED').length, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Selesai', value: departures.filter(d => d.status === 'COMPLETED').length, color: 'bg-green-50 text-green-700' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl border border-gray-200 shadow-sm bg-white`}>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32}/></div>
      ) : departures.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarCheck size={48} className="mx-auto mb-3 opacity-30"/><p className="font-medium">Belum ada keberangkatan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {departures.map(dep => {
            const st = STATUS_BADGE[dep.status] || STATUS_BADGE.PLANNING;
            const paxCount = dep.bookings?.length || 0;
            const isExpanded = expandedId === dep.id;

            return (
              <div key={dep.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Header Row */}
                <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : dep.id)}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#3a0519] rounded-xl flex flex-col items-center justify-center text-white shrink-0">
                        <p className="text-lg font-bold leading-none">{new Date(dep.departureDate).getDate()}</p>
                        <p className="text-[9px] uppercase">{new Date(dep.departureDate).toLocaleDateString('id-ID', {month:'short'})}</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{dep.package?.name || 'Paket -'}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Plane size={12}/> {dep.flightDepart || '-'}</span>
                          <span className="flex items-center gap-1"><Users size={12}/> {paxCount}/{dep.maxCapacity} pax</span>
                          {dep.tourLeader && <span className="flex items-center gap-1"><MapPin size={12}/> {dep.tourLeader}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={st.variant} size="sm">{st.label}</Badge>
                      <Select value={dep.status} onChange={e => { e.stopPropagation(); handleStatusChange(dep.id, e.target.value); }}
                        options={[{value:'PLANNING',label:'Planning'},{value:'CONFIRMED',label:'Confirmed'},{value:'IN_PROGRESS',label:'Berjalan'},{value:'COMPLETED',label:'Selesai'},{value:'CANCELLED',label:'Batal'}]}
                        className="w-32 py-1.5 text-xs"
                      />
                      <button onClick={e => { e.stopPropagation(); handleDelete(dep.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Kapasitas</span>
                      <span>{paxCount}/{dep.maxCapacity}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#a77a0b] h-1.5 rounded-full transition-all" style={{width: `${Math.min((paxCount/dep.maxCapacity)*100, 100)}%`}}></div>
                    </div>
                  </div>
                </div>

                {/* Expanded: Passenger List */}
                {isExpanded && dep.bookings && dep.bookings.length > 0 && (
                  <div className="border-t bg-gray-50 px-5 py-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Daftar Jamaah ({paxCount} orang)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {dep.bookings.map((b, i) => (
                        <div key={b.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-100">
                          <span className="w-6 h-6 bg-[#3a0519] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{b.customer?.fullName || '-'}</p>
                            <p className="text-[10px] text-gray-400">{b.customer?.phone || '-'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto py-10 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="bg-[#3a0519] p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">Tambah Keberangkatan</h2>
              <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <Select label="Paket Umrah *" value={form.packageId} onChange={e => setForm({...form, packageId: e.target.value})}
                options={[{value:'',label:'Pilih paket...'}, ...packages.map(p => ({value:p.id, label:p.name}))]} />
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="Tgl Berangkat *" value={form.departureDate} onChange={e => setForm({...form, departureDate: e.target.value})} />
                <Input type="date" label="Tgl Pulang" value={form.returnDate} onChange={e => setForm({...form, returnDate: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Penerbangan Pergi" value={form.flightDepart} onChange={e => setForm({...form, flightDepart: e.target.value})} placeholder="SV-819" icon={<Plane size={14}/>} />
                <Input label="Penerbangan Pulang" value={form.flightReturn} onChange={e => setForm({...form, flightReturn: e.target.value})} placeholder="SV-820" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Kode PNR" value={form.pnrCode} onChange={e => setForm({...form, pnrCode: e.target.value})} placeholder="ABC123" />
                <Input type="number" label="Kapasitas Maks" value={form.maxCapacity} onChange={e => setForm({...form, maxCapacity: +e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Tour Leader" value={form.tourLeader} onChange={e => setForm({...form, tourLeader: e.target.value})} placeholder="Ust. Abdullah" />
                <Input label="Muthowwif" value={form.muthowwif} onChange={e => setForm({...form, muthowwif: e.target.value})} placeholder="Ahmad" />
              </div>
              <Textarea label="Catatan" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              <Button onClick={handleSubmit} loading={isPending} icon={<Plus size={16}/>}>Tambah</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
