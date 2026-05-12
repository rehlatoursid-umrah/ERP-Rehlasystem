"use client";

import React, { useState, useEffect, useTransition } from 'react';
import {
  Receipt, Trash2, X, Loader2, DollarSign, ChevronDown, CheckCircle,
  Clock, AlertTriangle, Send, Search, Filter, FileText, Edit3, Ban,
  CreditCard, Eye, Printer
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import {
  getInvoices, updateInvoiceStatus, updateInvoice, deleteInvoice
} from '@/app/actions/admin';
import { Input, Textarea, Select } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Badge } from '@/app/components/ui/Badge';

type InvoiceItem = Awaited<ReturnType<typeof getInvoices>>[number];

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  SENT: { label: 'Terkirim', variant: 'info' },
  PAID: { label: 'Lunas', variant: 'success' },
  OVERDUE: { label: 'Overdue', variant: 'danger' },
  CANCELLED: { label: 'Dibatalkan', variant: 'danger' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Terkirim' },
  { value: 'PAID', label: 'Lunas' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [editForm, setEditForm] = useState({
    discount: 0, tax: 0, notes: '', dueDate: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch { toast.error("Gagal memuat data invoice"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // --- Filter & Search ---
  const filtered = invoices.filter(inv => {
    const matchStatus = !filterStatus || inv.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.booking?.customer?.fullName?.toLowerCase().includes(q) ||
      inv.booking?.package?.name?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // --- Stats ---
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalUnpaid = totalAmount - totalPaid;
  const overdueCount = invoices.filter(i =>
    i.status !== 'PAID' && i.status !== 'CANCELLED' && i.dueDate && new Date(i.dueDate) < new Date()
  ).length;

  // --- Actions ---
  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      try {
        await updateInvoiceStatus(id, status);
        toast.success(`Status diubah ke ${STATUS_BADGE[status]?.label || status}`);
        loadData();
      } catch { toast.error("Gagal mengubah status"); }
    });
  };

  const handleEdit = (inv: InvoiceItem) => {
    setEditingId(inv.id);
    setEditForm({
      discount: inv.discount,
      tax: inv.tax,
      notes: inv.notes || '',
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
    });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    startTransition(async () => {
      try {
        await updateInvoice(editingId, editForm);
        toast.success("Invoice diperbarui!");
        setEditingId(null);
        loadData();
      } catch { toast.error("Gagal menyimpan"); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus invoice ini?")) return;
    startTransition(async () => {
      try {
        await deleteInvoice(id);
        toast.success("Invoice dihapus");
        loadData();
      } catch { toast.error("Gagal menghapus"); }
    });
  };

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const fmtDate = (d: string | Date | null) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isOverdue = (inv: InvoiceItem) =>
    inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.dueDate && new Date(inv.dueDate) < new Date();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />
      <PageHeader
        title="Invoice"
        description="Kelola invoice jamaah — otomatis ter-generate dari booking."
        icon={<Receipt className="text-[#a77a0b]" size={28} />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg"><FileText size={20} className="text-blue-600" /></div>
          <div><p className="text-xl font-bold">{totalInvoices}</p><p className="text-[10px] text-gray-400 font-bold uppercase">Total Invoice</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg"><DollarSign size={20} className="text-green-600" /></div>
          <div><p className="text-xl font-bold text-green-700">{fmt(totalPaid)}</p><p className="text-[10px] text-gray-400 font-bold uppercase">Terbayar</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg"><Clock size={20} className="text-amber-600" /></div>
          <div><p className="text-xl font-bold text-amber-700">{fmt(totalUnpaid)}</p><p className="text-[10px] text-gray-400 font-bold uppercase">Belum Lunas</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg"><AlertTriangle size={20} className="text-red-600" /></div>
          <div><p className="text-xl font-bold text-red-700">{overdueCount}</p><p className="text-[10px] text-gray-400 font-bold uppercase">Overdue</p></div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nomor invoice, jamaah, paket..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#a77a0b]/30 focus:border-[#a77a0b] bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#a77a0b]/30 focus:border-[#a77a0b] bg-white"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b text-left">
            <th className="px-4 py-3 font-semibold text-gray-600">No. Invoice</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Jamaah</th>
            <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Paket</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-right">Total</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-right hidden md:table-cell">Terbayar</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-center hidden lg:table-cell">Jatuh Tempo</th>
            <th className="px-4 py-3 font-semibold text-gray-600 text-center">Status</th>
            <th className="px-4 py-3 w-28"></th>
          </tr></thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-16 text-gray-400"><Loader2 className="animate-spin mx-auto mb-2" size={24} />Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-16 text-gray-400"><Receipt size={40} className="mx-auto mb-3 opacity-30" /><p>Belum ada invoice</p></td></tr>
            ) : filtered.map(inv => {
              const st = STATUS_BADGE[inv.status] || STATUS_BADGE.DRAFT;
              const overdue = isOverdue(inv);
              const progress = inv.total > 0 ? Math.round((inv.paidAmount / inv.total) * 100) : 0;
              const remaining = Math.max(0, inv.total - inv.paidAmount);

              return (
                <React.Fragment key={inv.id}>
                  <tr
                    className={`border-b hover:bg-gray-50 cursor-pointer transition ${overdue ? 'bg-red-50/30' : ''}`}
                    onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-[#a77a0b]">{inv.invoiceNumber}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(inv.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{inv.booking?.customer?.fullName || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{inv.booking?.package?.name || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold">{fmt(inv.total)}</span>
                      {(inv.discount > 0 || inv.tax > 0) && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {inv.discount > 0 && <span>Disc: {fmt(inv.discount)}</span>}
                          {inv.tax > 0 && <span> Tax: {fmt(inv.tax)}</span>}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-green-600 font-bold">{fmt(inv.paidAmount)}</span>
                      {remaining > 0 && <p className="text-[10px] text-red-500 mt-0.5">Sisa: {fmt(remaining)}</p>}
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1"><div className="bg-green-500 h-1 rounded-full transition-all" style={{ width: `${progress}%` }}></div></div>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className={`text-xs ${overdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                        {fmtDate(inv.dueDate)}
                      </span>
                      {overdue && <p className="text-[10px] text-red-500 font-bold mt-0.5">OVERDUE!</p>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={overdue && inv.status !== 'PAID' ? 'danger' : st.variant} size="sm">
                        {overdue && inv.status !== 'PAID' ? 'Overdue' : st.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 justify-end">
                        {inv.status === 'DRAFT' && (
                          <button onClick={() => handleStatusChange(inv.id, 'SENT')} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Kirim Invoice">
                            <Send size={14} />
                          </button>
                        )}
                        {(inv.status === 'SENT' || inv.status === 'DRAFT') && (
                          <button onClick={() => handleStatusChange(inv.id, 'PAID')} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Tandai Lunas">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button onClick={() => handleEdit(inv)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        {inv.status !== 'CANCELLED' && inv.status !== 'PAID' && (
                          <button onClick={() => handleStatusChange(inv.id, 'CANCELLED')} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Batalkan">
                            <Ban size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row — Payment History & Details */}
                  {expandedId === inv.id && (
                    <tr><td colSpan={8} className="bg-gray-50 px-6 py-4 border-b">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Info Booking */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><Eye size={12} /> Detail Invoice</p>
                          <div className="bg-white rounded-lg border p-3 space-y-2 text-xs">
                            <div className="flex justify-between"><span className="text-gray-400">Booking:</span><span className="font-mono font-bold">{inv.booking?.bookingCode || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Jamaah:</span><span className="font-medium">{inv.booking?.customer?.fullName || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Phone:</span><span>{inv.booking?.customer?.phone || inv.booking?.customer?.whatsapp || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Paket:</span><span>{inv.booking?.package?.name || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Kamar:</span><span>{inv.booking?.roomType || '-'}</span></div>
                            <div className="border-t pt-2 mt-2 flex justify-between"><span className="text-gray-400">Subtotal:</span><span className="font-bold">{fmt(inv.subtotal)}</span></div>
                            {inv.discount > 0 && <div className="flex justify-between"><span className="text-gray-400">Diskon:</span><span className="text-red-500">-{fmt(inv.discount)}</span></div>}
                            {inv.tax > 0 && <div className="flex justify-between"><span className="text-gray-400">Pajak:</span><span className="text-amber-600">+{fmt(inv.tax)}</span></div>}
                            <div className="flex justify-between font-bold text-sm border-t pt-2"><span>Total:</span><span>{fmt(inv.total)}</span></div>
                            {inv.notes && <div className="pt-2 border-t"><span className="text-gray-400">Catatan: </span><span>{inv.notes}</span></div>}
                          </div>
                        </div>

                        {/* Payment History */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><CreditCard size={12} /> Riwayat Pembayaran</p>
                          {inv.booking?.payments && inv.booking.payments.length > 0 ? (
                            <div className="space-y-1.5">
                              {inv.booking.payments.map(p => (
                                <div key={p.id} className="flex justify-between items-center text-xs bg-white p-2.5 rounded-lg border">
                                  <div>
                                    <span className="font-medium">{p.method || '-'}</span>
                                    {p.bankName && <span className="text-gray-400"> • {p.bankName}</span>}
                                    {p.referenceNumber && <span className="text-gray-400 font-mono"> #{p.referenceNumber}</span>}
                                    <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(p.paidAt || p.createdAt)}</p>
                                  </div>
                                  <div className="text-right flex items-center gap-3">
                                    <div>
                                      <span className="font-bold text-green-600">+{fmt(p.amount)}</span>
                                      <p className="text-[10px] mt-0.5">
                                        <Badge variant={p.status === 'VERIFIED' ? 'success' : p.status === 'REJECTED' ? 'danger' : 'default'} size="sm">{p.status}</Badge>
                                      </p>
                                    </div>
                                    {p.status === 'VERIFIED' && (
                                      <a href={`/dashboard/kwitansi/${p.id}`} target="_blank" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Cetak Kwitansi">
                                        <Printer size={14} />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <div className="flex justify-between items-center text-xs bg-green-50 p-2.5 rounded-lg border border-green-200 font-bold">
                                <span className="text-green-700">Total Terbayar</span>
                                <span className="text-green-700">{fmt(inv.paidAmount)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border p-6 text-center text-gray-400 text-xs">
                              <CreditCard size={24} className="mx-auto mb-2 opacity-30" />
                              <p>Belum ada pembayaran</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td></tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EDIT INVOICE MODAL */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-[#3a0519] p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">Edit Invoice</h2>
              <button onClick={() => setEditingId(null)} className="text-white/50 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" label="Diskon (Rp)" value={editForm.discount || ''} onChange={e => setEditForm({ ...editForm, discount: +e.target.value })} className="text-right" />
                <Input type="number" label="Pajak (Rp)" value={editForm.tax || ''} onChange={e => setEditForm({ ...editForm, tax: +e.target.value })} className="text-right" />
              </div>
              <Input type="date" label="Jatuh Tempo" value={editForm.dueDate} onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })} />
              <Textarea label="Catatan" value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={2} />
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditingId(null)}>Batal</Button>
              <Button onClick={handleSaveEdit} loading={isPending}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
