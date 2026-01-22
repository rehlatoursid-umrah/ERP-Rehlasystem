"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, Building2, LogOut, LayoutDashboard, Menu, Plane, MapPin } from 'lucide-react'; // Tambah MapPin
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Visa Generator', href: '/dashboard/visa', icon: <FileText size={20}/> },
    { name: 'Hotel Generator', href: '/dashboard/hotel', icon: <Building2 size={20}/> },
    { name: 'Flight Generator', href: '/dashboard/flight', icon: <Plane size={20}/> },
    { name: 'Itinerary Builder', href: '/dashboard/itinerary', icon: <MapPin size={20}/> }, // Menu Baru: Genre 4
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-10">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
            {/* Pastikan file rehlasticky.png ada di public folder */}
            <img src="/rehlasticky.png" className="w-8 h-8 object-contain" alt="Logo" />
            <div>
                <h1 className="font-bold text-gray-800 leading-tight">Travel Rehla</h1>
                <p className="text-[10px] text-yellow-600 font-bold">ADMIN PANEL</p>
            </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === item.href ? 'bg-[#3a0519] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-[#3a0519]'}`}>
                    {item.icon} {item.name}
                </Link>
            ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition">
                <LogOut size={20}/> Logout
            </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-50 h-16">
         <div className="flex items-center gap-2">
            <img src="/rehlasticky.png" className="w-8 h-8 object-contain" alt="Logo" />
            <span className="font-bold text-[#3a0519]">Travel Rehla</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-40 p-4 space-y-2">
             {menuItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${pathname === item.href ? 'bg-[#3a0519] text-white' : 'text-gray-500'}`}>
                    {item.icon} {item.name}
                </Link>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600">
                <LogOut size={20}/> Logout
            </button>
        </div>
      )}

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-16">
        {children} 
      </main>
    </div>
  );
}