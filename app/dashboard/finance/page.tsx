"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Wallet, Plus, TrendingUp, TrendingDown, DollarSign, Trash2, X, ArrowUpRight, ArrowDownRight, Loader2, BarChart3, ChevronLeft, ChevronRight, PieChart, FileText } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { getCashFlows, createCashFlow, deleteCashFlow, getCashFlowCategories, getAnnualReport } from '@/app/actions/finance';
import { ACCOUNT_CLASSES } from '@/app/lib/accounting';
import type { AnnualReport } from '@/app/lib/accounting';
import { Input, Textarea, Select } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Badge } from '@/app/components/ui/Badge';

type CashFlowItem = Awaited<ReturnType<typeof getCashFlows>>[number];
type Category = Awaited<ReturnType<typeof getCashFlowCategories>>[number];

const TABS = [
  { id: 'overview', label: 'Ringkasan Tahunan', icon: <BarChart3 size={15}/> },
  { id: 'pnl', label: 'Laba Rugi (P&L)', icon: <PieChart size={15}/> },
  { id: 'transactions', label: 'Transaksi', icon: <FileText size={15}/> },
];

export default function FinancePage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<AnnualReport | null>(null);
  const [flows, setFlows] = useState<CashFlowItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    type: 'INCOME' as string, categoryId: '', description: '', amount: 0,
    currency: 'IDR', bankName: '', referenceNumber: '',
    transactionDate: new Date().toISOString().split('T')[0], notes: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [r, c, f] = await Promise.all([
        getAnnualReport(year),
        getCashFlowCategories(),
        getCashFlows(filterType ? { type: filterType, startDate: `${year}-01-01`, endDate: `${year}-12-31` } : { startDate: `${year}-01-01`, endDate: `${year}-12-31` }),
      ]);
      setReport(r); setCategories(c); setFlows(f);
    } catch { toast.error("Gagal memuat data"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, [year, filterType]);

  const handleSubmit = () => {
    if (!form.description.trim()) { toast.error("Deskripsi wajib diisi"); return; }
    if (form.amount <= 0) { toast.error("Jumlah harus > 0"); return; }
    startTransition(async () => {
      try {
        await createCashFlow(form);
        toast.success("Transaksi berhasil dicatat!");
        setForm({ type: 'INCOME', categoryId: '', description: '', amount: 0, currency: 'IDR', bankName: '', referenceNumber: '', transactionDate: new Date().toISOString().split('T')[0], notes: '' });
        setShowForm(false); loadData();
      } catch { toast.error("Gagal menyimpan"); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin hapus transaksi ini?")) return;
    startTransition(async () => {
      try { await deleteCashFlow(id); toast.success("Dihapus"); loadData(); }
      catch { toast.error("Gagal"); }
    });
  };

  const fmt = (n: number) => `Rp ${Math.abs(n).toLocaleString('id-ID')}`;
  const fmtShort = (n: number) => {
    if (Math.abs(n) >= 1_000_000_000) return `${(n/1_000_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000_000) return `${(n/1_000_000).toFixed(1)}jt`;
    if (Math.abs(n) >= 1_000) return `${(n/1_000).toFixed(0)}rb`;
    return n.toString();
  };

  if (isLoading || !report) {
    return <div className="flex items-center justify-center h-full min-h-[60vh]"><Loader2 size={32} className="animate-spin text-[#a77a0b]"/></div>;
  }

  const maxBar = Math.max(...report.months.map(m => Math.max(m.revenue, m.cogs + m.opex)), 1);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Toaster position="top-center" richColors />

      {/* HEADER */}
      <PageHeader title="Laporan Keuangan" description="Arus kas & laba rugi berdasarkan periode bulanan." icon={<Wallet className="text-[#a77a0b]" size={28}/>}
        actions={<Button icon={<Plus size={18}/>} onClick={() => setShowForm(true)}>Catat Transaksi</Button>}
      />

      {/* YEAR SELECTOR */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-white border rounded-xl px-2 py-1 shadow-sm">
          <button onClick={() => setYear(y => y-1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronLeft size={18}/></button>
          <span className="font-bold text-lg text-[#3a0519] px-3 min-w-[80px] text-center">{year}</span>
          <button onClick={() => setYear(y => y+1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ChevronRight size={18}/></button>
        </div>
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition ${activeTab === t.id ? 'bg-[#3a0519] text-white border-[#3a0519]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
              {t.icon} <span className="hidden md:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* P&L SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Pendapatan</p>
          <p className="text-lg font-bold text-green-700 mt-1">{fmt(report.totalRevenue)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">HPP</p>
          <p className="text-lg font-bold text-orange-600 mt-1">{fmt(report.totalCogs)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Laba Kotor</p>
          <p className={`text-lg font-bold mt-1 ${report.totalGrossProfit >= 0 ? 'text-blue-700' : 'text-red-600'}`}>{fmt(report.totalGrossProfit)}</p>
          <p className="text-[9px] text-gray-400">Margin: {report.grossMarginPct}%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Biaya Operasional</p>
          <p className="text-lg font-bold text-red-600 mt-1">{fmt(report.totalOpex)}</p>
        </div>
        <div className={`p-4 rounded-xl border shadow-sm ${report.totalNetProfit >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'}`}>
          <p className="text-[10px] font-bold text-gray-500 uppercase">Laba Bersih</p>
          <p className={`text-lg font-bold mt-1 ${report.totalNetProfit >= 0 ? 'text-green-800' : 'text-red-700'}`}>{report.totalNetProfit < 0 ? '-' : ''}{fmt(report.totalNetProfit)}</p>
          <p className="text-[9px] text-gray-500">Net Margin: {report.netMarginPct}%</p>
        </div>
      </div>

      {/* ======= TAB: OVERVIEW ======= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* MONTHLY BAR CHART */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-sm text-gray-800 mb-4">Arus Kas Bulanan {year}</h3>
            <div className="flex items-end gap-2 h-44">
              {report.months.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-36 gap-[1px]">
                    <div className="bg-green-400 hover:bg-green-500 rounded-t w-full transition" style={{height:`${(m.revenue/maxBar)*100}%`, minHeight: m.revenue > 0 ? 3 : 0}} title={`Pendapatan: ${fmt(m.revenue)}`}/>
                    <div className="bg-orange-400 hover:bg-orange-500 w-full transition" style={{height:`${(m.cogs/maxBar)*100}%`, minHeight: m.cogs > 0 ? 3 : 0}} title={`HPP: ${fmt(m.cogs)}`}/>
                    <div className="bg-red-400 hover:bg-red-500 rounded-b w-full transition" style={{height:`${(m.opex/maxBar)*100}%`, minHeight: m.opex > 0 ? 3 : 0}} title={`OpEx: ${fmt(m.opex)}`}/>
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold">{m.monthLabel}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-5 mt-4 justify-center">
              <span className="text-[10px] text-gray-500 flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-400 rounded-sm"/>Pendapatan</span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-400 rounded-sm"/>HPP</span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-400 rounded-sm"/>Operasional</span>
            </div>
          </div>

          {/* NET PROFIT LINE */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-sm text-gray-800 mb-4">Laba Bersih per Bulan</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50 border-b">
                  <th className="px-2 py-2 text-left font-bold text-gray-500">Bulan</th>
                  <th className="px-2 py-2 text-right font-bold text-green-600">Pendapatan</th>
                  <th className="px-2 py-2 text-right font-bold text-orange-600">HPP</th>
                  <th className="px-2 py-2 text-right font-bold text-blue-600">Laba Kotor</th>
                  <th className="px-2 py-2 text-right font-bold text-red-600">OpEx</th>
                  <th className="px-2 py-2 text-right font-bold text-[#3a0519]">Laba Bersih</th>
                  <th className="px-2 py-2 text-center font-bold text-gray-400">#Trx</th>
                </tr></thead>
                <tbody>
                  {report.months.map((m, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-2 py-2 font-bold text-gray-700">{m.monthLabel}</td>
                      <td className="px-2 py-2 text-right text-green-700">{m.revenue > 0 ? fmtShort(m.revenue) : '-'}</td>
                      <td className="px-2 py-2 text-right text-orange-600">{m.cogs > 0 ? fmtShort(m.cogs) : '-'}</td>
                      <td className="px-2 py-2 text-right font-medium text-blue-700">{m.grossProfit !== 0 ? fmtShort(m.grossProfit) : '-'}</td>
                      <td className="px-2 py-2 text-right text-red-600">{m.opex > 0 ? fmtShort(m.opex) : '-'}</td>
                      <td className={`px-2 py-2 text-right font-bold ${m.netProfit >= 0 ? 'text-green-800' : 'text-red-700'}`}>{m.netProfit !== 0 ? fmtShort(m.netProfit) : '-'}</td>
                      <td className="px-2 py-2 text-center text-gray-400">{m.transactionCount || '-'}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#3a0519] text-white font-bold">
                    <td className="px-2 py-2">TOTAL</td>
                    <td className="px-2 py-2 text-right">{fmtShort(report.totalRevenue)}</td>
                    <td className="px-2 py-2 text-right">{fmtShort(report.totalCogs)}</td>
                    <td className="px-2 py-2 text-right">{fmtShort(report.totalGrossProfit)}</td>
                    <td className="px-2 py-2 text-right">{fmtShort(report.totalOpex)}</td>
                    <td className="px-2 py-2 text-right">{fmtShort(report.totalNetProfit)}</td>
                    <td className="px-2 py-2 text-center">{flows.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======= TAB: P&L DETAIL ======= */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          {/* PENDAPATAN */}
          <PnlSection title="PENDAPATAN" color="green" totals={report.revenueTotals} grandTotal={report.totalRevenue} accounts={ACCOUNT_CLASSES.REVENUE.accounts} fmt={fmt}/>
          {/* HPP */}
          <PnlSection title="HARGA POKOK PENJUALAN (HPP)" color="orange" totals={report.cogsTotals} grandTotal={report.totalCogs} accounts={ACCOUNT_CLASSES.COGS.accounts} fmt={fmt}/>
          {/* Laba Kotor */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex justify-between items-center">
            <span className="font-bold text-blue-800 text-sm">LABA KOTOR (Gross Profit)</span>
            <span className="font-bold text-blue-800 text-lg">{fmt(report.totalGrossProfit)} <span className="text-xs font-normal">({report.grossMarginPct}%)</span></span>
          </div>
          {/* OPEX */}
          <PnlSection title="BIAYA OPERASIONAL" color="red" totals={report.opexTotals} grandTotal={report.totalOpex} accounts={ACCOUNT_CLASSES.OPEX.accounts} fmt={fmt}/>
          {/* Laba Bersih */}
          <div className={`p-5 rounded-xl border-2 flex justify-between items-center ${report.totalNetProfit >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
            <span className={`font-bold text-sm ${report.totalNetProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>LABA BERSIH (Net Profit)</span>
            <span className={`font-bold text-xl ${report.totalNetProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>{report.totalNetProfit < 0 ? '-' : ''}{fmt(report.totalNetProfit)} <span className="text-xs font-normal">({report.netMarginPct}%)</span></span>
          </div>
        </div>
      )}

      {/* ======= TAB: TRANSACTIONS ======= */}
      {activeTab === 'transactions' && (
        <div>
          <div className="flex gap-2 mb-4">
            {[{v:'',l:'Semua'},{v:'INCOME',l:'Pemasukan'},{v:'EXPENSE',l:'Pengeluaran'}].map(f => (
              <button key={f.v} onClick={() => setFilterType(f.v)} className={`px-4 py-2 text-xs font-bold rounded-lg border transition ${filterType === f.v ? 'bg-[#3a0519] text-white border-[#3a0519]' : 'bg-white text-gray-500 border-gray-200'}`}>{f.l}</button>
            ))}
          </div>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Tanggal</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Deskripsi</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Kategori</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Jumlah</th>
                <th className="px-4 py-3 w-12"></th>
              </tr></thead>
              <tbody>
                {flows.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-16 text-gray-400"><Wallet size={36} className="mx-auto mb-2 opacity-30"/><p>Belum ada transaksi di {year}</p></td></tr>
                ) : flows.map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(f.transactionDate).toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {f.type === 'INCOME' ? <ArrowUpRight size={14} className="text-green-500 shrink-0"/> : <ArrowDownRight size={14} className="text-red-500 shrink-0"/>}
                        <div><p className="font-medium text-gray-800 text-sm">{f.description}</p>{f.notes && <p className="text-[10px] text-gray-400">{f.notes}</p>}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><Badge variant="default" size="sm">{f.category?.name || '-'}</Badge></td>
                    <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${f.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{f.type === 'INCOME' ? '+':'-'}{fmt(f.amount)}</td>
                    <td className="px-4 py-3"><button onClick={() => handleDelete(f.id)} className="p-1 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="bg-[#3a0519] p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">Catat Transaksi</h2>
              <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <button onClick={() => setForm({...form, type: 'INCOME'})} className={`flex-1 py-3 text-sm font-bold rounded-xl border-2 transition ${form.type === 'INCOME' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-400'}`}><TrendingUp size={16} className="inline mr-1 mb-0.5"/>Pemasukan</button>
                <button onClick={() => setForm({...form, type: 'EXPENSE'})} className={`flex-1 py-3 text-sm font-bold rounded-xl border-2 transition ${form.type === 'EXPENSE' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200 text-gray-400'}`}><TrendingDown size={16} className="inline mr-1 mb-0.5"/>Pengeluaran</button>
              </div>
              <Select label="Kategori" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
                options={[{value:'',label:'Pilih kategori...'}, ...categories.filter(c => form.type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE').map(c => ({value:c.id, label:c.name}))]} />
              <Input label="Deskripsi *" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" label="Jumlah (Rp) *" value={form.amount||''} onChange={e => setForm({...form, amount: +e.target.value})} className="text-right"/>
                <Input type="date" label="Tanggal" value={form.transactionDate} onChange={e => setForm({...form, transactionDate: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Bank" value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} placeholder="BCA"/>
                <Input label="No. Referensi" value={form.referenceNumber} onChange={e => setForm({...form, referenceNumber: e.target.value})}/>
              </div>
              <Textarea label="Catatan" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}/>
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              <Button onClick={handleSubmit} loading={isPending} icon={<Plus size={16}/>}>Simpan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- P&L Section Component ---
function PnlSection({ title, color, totals, grandTotal, accounts, fmt }: {
  title: string; color: string; totals: Record<string, number>; grandTotal: number; accounts: string[]; fmt: (n:number)=>string;
}) {
  const colorMap: Record<string, string> = { green: 'border-green-200 bg-green-50/50', orange: 'border-orange-200 bg-orange-50/50', red: 'border-red-200 bg-red-50/50' };
  const textMap: Record<string, string> = { green: 'text-green-800', orange: 'text-orange-800', red: 'text-red-800' };
  return (
    <div className={`rounded-xl border ${colorMap[color]} overflow-hidden`}>
      <div className="px-5 py-3 border-b border-gray-200/50 flex justify-between items-center">
        <h3 className={`font-bold text-sm ${textMap[color]}`}>{title}</h3>
        <span className={`font-bold ${textMap[color]}`}>{fmt(grandTotal)}</span>
      </div>
      <div className="divide-y divide-gray-100/80">
        {accounts.map(acc => {
          const val = totals[acc] || 0;
          const pct = grandTotal > 0 ? Math.round((val/grandTotal)*100) : 0;
          return (
            <div key={acc} className="px-5 py-2.5 flex justify-between items-center text-sm">
              <span className="text-gray-600">{acc}</span>
              <div className="flex items-center gap-3">
                {val > 0 && <div className="w-20 bg-gray-200/50 rounded-full h-1.5 hidden md:block"><div className={`h-1.5 rounded-full bg-${color}-400`} style={{width:`${pct}%`}}/></div>}
                <span className={`font-medium min-w-[100px] text-right ${val > 0 ? 'text-gray-800' : 'text-gray-300'}`}>{val > 0 ? fmt(val) : '-'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
