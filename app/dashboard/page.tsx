"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, Wallet, FileText, Building2, Plane, MapPin, 
  ArrowRight, TrendingUp, TrendingDown, DollarSign, AlertTriangle, 
  Calendar, ArrowUpRight, ArrowDownRight, Loader2, Clock, ChevronRight 
} from 'lucide-react';
import { getDashboardStats } from '@/app/actions/dashboard';
import { Badge } from '@/app/components/ui/Badge';
import { BRAND } from '@/app/lib/constants';

type DashboardData = Awaited<ReturnType<typeof getDashboardStats>>;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stats = await getDashboardStats();
        setData(stats);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const formatDate = (d: Date | string | null) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[#a77a0b] mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxChart = Math.max(...data.chartData.map(d => Math.max(d.income, d.expense)), 1);

  // Quick access modules
  const modules = [
    { title: 'Visa Generator', icon: <FileText size={20} className="text-[#3a0519]" />, href: '/dashboard/visa', color: 'bg-red-50 border-red-100' },
    { title: 'Hotel Quotation', icon: <Building2 size={20} className="text-[#a77a0b]" />, href: '/dashboard/hotel', color: 'bg-yellow-50 border-yellow-100' },
    { title: 'Flight Generator', icon: <Plane size={20} className="text-blue-700" />, href: '/dashboard/flight', color: 'bg-blue-50 border-blue-100' },
    { title: 'Itinerary Builder', icon: <MapPin size={20} className="text-green-700" />, href: '/dashboard/itinerary', color: 'bg-green-50 border-green-100' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-[#3a0519] rounded-lg">
            <LayoutDashboard size={22} className="text-[#a77a0b]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#3a0519]">Dashboard</h1>
            <p className="text-sm text-gray-500">Selamat datang kembali! Berikut ringkasan operasional Anda.</p>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/customers" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition"><Users size={20} className="text-blue-600"/></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{data.totalCustomers}</p>
          <p className="text-xs font-medium text-gray-400 mt-1">Total Jamaah</p>
        </Link>
        
        <Link href="/dashboard/finance" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-green-50 rounded-lg group-hover:bg-green-100 transition"><TrendingUp size={20} className="text-green-600"/></div>
          </div>
          <p className="text-2xl font-bold text-green-700">{fmt(data.totalIncome)}</p>
          <p className="text-xs font-medium text-gray-400 mt-1">Total Pemasukan</p>
        </Link>

        <Link href="/dashboard/finance" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-red-50 rounded-lg group-hover:bg-red-100 transition"><TrendingDown size={20} className="text-red-500"/></div>
          </div>
          <p className="text-2xl font-bold text-red-600">{fmt(data.totalExpense)}</p>
          <p className="text-xs font-medium text-gray-400 mt-1">Total Pengeluaran</p>
        </Link>

        <div className="bg-gradient-to-br from-[#3a0519] to-[#5a0826] p-5 rounded-xl shadow-sm text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/10 rounded-lg"><DollarSign size={20} className="text-[#a77a0b]"/></div>
          </div>
          <p className="text-2xl font-bold">{fmt(data.balance)}</p>
          <p className="text-xs font-medium text-white/60 mt-1">Saldo Kas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CHART */}
          {data.chartData.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800 text-sm">Arus Kas Bulanan</h3>
                <Link href="/dashboard/finance" className="text-xs text-[#a77a0b] font-bold hover:underline flex items-center gap-1">Lihat Semua <ChevronRight size={14}/></Link>
              </div>
              <div className="flex items-end gap-4 h-36">
                {data.chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-1 items-end justify-center h-28">
                      <div className="bg-green-400 hover:bg-green-500 rounded-t-sm w-4 transition-all cursor-default" style={{height: `${(d.income / maxChart) * 100}%`, minHeight: d.income > 0 ? 4 : 0}} title={`Income: ${fmt(d.income)}`}></div>
                      <div className="bg-red-400 hover:bg-red-500 rounded-t-sm w-4 transition-all cursor-default" style={{height: `${(d.expense / maxChart) * 100}%`, minHeight: d.expense > 0 ? 4 : 0}} title={`Expense: ${fmt(d.expense)}`}></div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">{d.month}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-6 mt-4 justify-center">
                <span className="text-[10px] text-gray-500 flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-400 rounded-sm"></span> Pemasukan</span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-400 rounded-sm"></span> Pengeluaran</span>
              </div>
            </div>
          )}

          {/* RECENT TRANSACTIONS */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Transaksi Terakhir</h3>
              <Link href="/dashboard/finance" className="text-xs text-[#a77a0b] font-bold hover:underline flex items-center gap-1">Lihat Semua <ChevronRight size={14}/></Link>
            </div>
            {data.recentCashFlows.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Wallet size={32} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.recentCashFlows.map(f => (
                  <div key={f.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${f.type === 'INCOME' ? 'bg-green-50' : 'bg-red-50'}`}>
                        {f.type === 'INCOME' ? <ArrowUpRight size={16} className="text-green-500"/> : <ArrowDownRight size={16} className="text-red-500"/>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{f.description}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(f.transactionDate)} {f.category?.name ? `• ${f.category.name}` : ''}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${f.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {f.type === 'INCOME' ? '+' : '-'}{fmt(f.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QUICK ACCESS MODULES */}
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-4">Generator Tools</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {modules.map((m, i) => (
                <Link key={i} href={m.href} className={`p-4 rounded-xl border ${m.color} hover:shadow-md transition-all group flex flex-col items-center text-center`}>
                  <div className="p-2.5 bg-white rounded-lg shadow-sm mb-2 group-hover:scale-110 transition-transform">{m.icon}</div>
                  <p className="text-xs font-bold text-gray-700">{m.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* RECENT CUSTOMERS */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Jamaah Terbaru</h3>
              <Link href="/dashboard/customers" className="text-xs text-[#a77a0b] font-bold hover:underline flex items-center gap-1">Lihat Semua <ChevronRight size={14}/></Link>
            </div>
            {data.recentCustomers.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Belum ada jamaah</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.recentCustomers.map(c => (
                  <Link key={c.id} href="/dashboard/customers" className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#3a0519] flex items-center justify-center text-white font-bold text-xs">
                        {c.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.fullName}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{c.city || c.phone || '-'}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* PASSPORT ALERTS */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500"/>
              <h3 className="font-bold text-gray-800 text-sm">Paspor Segera Expired</h3>
            </div>
            {data.expiringPassports.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm">Tidak ada paspor yang hampir expired ✅</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.expiringPassports.map(p => {
                  const expiry = new Date(p.passportExpiry!);
                  const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000*60*60*24));
                  const isExpired = daysLeft < 0;
                  
                  return (
                    <div key={p.id} className="px-5 py-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.fullName}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{p.passportNumber}</p>
                      </div>
                      <Badge variant={isExpired ? 'danger' : 'warning'} size="sm">
                        {isExpired ? `Expired ${Math.abs(daysLeft)}h lalu` : `${daysLeft} hari lagi`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}