"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  FileText, Building2, LogOut, LayoutDashboard, Menu, Plane, MapPin, 
  Users, Wallet, X, ChevronDown, Package, ClipboardList, Truck,
  CalendarCheck, Shield, Settings, Receipt
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [generatorsOpen, setGeneratorsOpen] = useState(
    ['/dashboard/visa', '/dashboard/hotel', '/dashboard/flight', '/dashboard/itinerary'].some(p => pathname === p)
  );
  const [opsOpen, setOpsOpen] = useState(
    ['/dashboard/packages', '/dashboard/bookings', '/dashboard/invoices', '/dashboard/suppliers', '/dashboard/departures'].some(p => pathname === p)
  );

  const handleLogout = async () => {
    // Clear backward compatibility cookie to prevent middleware loop
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    await signOut({ redirect: false });
    window.location.href = '/login';
  };

  const mainMenu = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Jamaah (CRM)', href: '/dashboard/customers', icon: <Users size={20}/> },
    { name: 'Keuangan', href: '/dashboard/finance', icon: <Wallet size={20}/> },
  ];

  const opsMenu = [
    { name: 'Paket Umrah', href: '/dashboard/packages', icon: <Package size={18}/> },
    { name: 'Booking', href: '/dashboard/bookings', icon: <ClipboardList size={18}/> },
    { name: 'Invoice', href: '/dashboard/invoices', icon: <Receipt size={18}/> },
    { name: 'Keberangkatan', href: '/dashboard/departures', icon: <CalendarCheck size={18}/> },
    { name: 'Supplier', href: '/dashboard/suppliers', icon: <Truck size={18}/> },
  ];

  const adminMenu = [
    { name: 'User & Role', href: '/dashboard/users', icon: <Shield size={18}/> },
    { name: 'Pengaturan', href: '/dashboard/settings', icon: <Settings size={18}/> },
  ];

  const generatorMenu = [
    { name: 'Visa Generator', href: '/dashboard/visa', icon: <FileText size={18}/> },
    { name: 'Hotel Quotation', href: '/dashboard/hotel', icon: <Building2 size={18}/> },
    { name: 'Flight Generator', href: '/dashboard/flight', icon: <Plane size={18}/> },
    { name: 'Itinerary Builder', href: '/dashboard/itinerary', icon: <MapPin size={18}/> },
  ];

  const isOpsActive = opsMenu.some(m => pathname === m.href);
  const isGeneratorActive = generatorMenu.some(m => pathname === m.href);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-10">
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
            <img src="/rehlasticky.png" className="w-9 h-9 object-contain" alt="Logo" />
            <div>
                <h1 className="font-bold text-gray-800 leading-tight">Travel Rehla</h1>
                <p className="text-[10px] text-[#a77a0b] font-bold tracking-wider">ERP SYSTEM</p>
            </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {/* Main Menu */}
            <p className="px-3 pt-3 pb-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider">Menu Utama</p>
            {mainMenu.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === item.href ? 'bg-[#3a0519] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-[#3a0519]'}`}>
                    {item.icon} {item.name}
                </Link>
            ))}

            {/* Operasional */}
            <p className="px-3 pt-5 pb-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider">Operasional</p>
            <button 
              onClick={() => setOpsOpen(!opsOpen)}
              className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isOpsActive ? 'bg-[#fdf8e8] text-[#a77a0b]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <span className="flex items-center gap-3"><Package size={20}/> Manajemen</span>
              <ChevronDown size={16} className={`transition-transform ${opsOpen ? 'rotate-180' : ''}`}/>
            </button>
            
            {opsOpen && (
              <div className="ml-3 space-y-0.5 border-l-2 border-gray-100 pl-3">
                {opsMenu.map((item) => (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${pathname === item.href ? 'bg-[#3a0519] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-[#3a0519]'}`}>
                    {item.icon} {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Generator Tools */}
            <p className="px-3 pt-5 pb-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider">Generator Tools</p>
            <button 
              onClick={() => setGeneratorsOpen(!generatorsOpen)}
              className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isGeneratorActive ? 'bg-[#fdf8e8] text-[#a77a0b]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <span className="flex items-center gap-3"><FileText size={20}/> Generators</span>
              <ChevronDown size={16} className={`transition-transform ${generatorsOpen ? 'rotate-180' : ''}`}/>
            </button>
            
            {generatorsOpen && (
              <div className="ml-3 space-y-0.5 border-l-2 border-gray-100 pl-3">
                {generatorMenu.map((item) => (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${pathname === item.href ? 'bg-[#3a0519] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-[#3a0519]'}`}>
                    {item.icon} {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Admin */}
            <p className="px-3 pt-5 pb-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider">Administrasi</p>
            {adminMenu.map((item) => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === item.href ? 'bg-[#3a0519] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-[#3a0519]'}`}>
                {item.icon} {item.name}
              </Link>
            ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition">
                <LogOut size={20}/> Logout
            </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 flex justify-between items-center z-50 h-14 shadow-sm" style={{paddingTop:'var(--safe-top)'}}>
         <div className="flex items-center gap-2">
            <img src="/rehlasticky.png" className="w-7 h-7 object-contain" alt="Logo" />
            <span className="font-bold text-[#3a0519] text-sm">Rehla ERP</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 active:bg-gray-200 transition">
           {isMobileMenuOpen ? <X size={22}/> : <Menu size={22}/>}
         </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto">
          <div className="p-4 space-y-1">
            <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider">Menu Utama</p>
            {mainMenu.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${pathname === item.href ? 'bg-[#3a0519] text-white' : 'text-gray-500'}`}>
                    {item.icon} {item.name}
                </Link>
            ))}
            <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider">Operasional</p>
            {opsMenu.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${pathname === item.href ? 'bg-[#3a0519] text-white' : 'text-gray-500'}`}>
                    {item.icon} {item.name}
                </Link>
            ))}
            <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider">Generator Tools</p>
            {generatorMenu.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${pathname === item.href ? 'bg-[#3a0519] text-white' : 'text-gray-500'}`}>
                    {item.icon} {item.name}
                </Link>
            ))}
            <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider">Administrasi</p>
            {adminMenu.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${pathname === item.href ? 'bg-[#3a0519] text-white' : 'text-gray-500'}`}>
                    {item.icon} {item.name}
                </Link>
            ))}
            <div className="border-t mt-4 pt-4">
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600">
                  <LogOut size={20}/> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14" style={{paddingBottom:'var(--safe-bottom)'}}>
        {children} 
      </main>
    </div>
  );
}