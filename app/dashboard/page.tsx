"use client";

import Link from 'next/link';
import { FileText, Building2, Plane, MapPin, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const modules = [
    {
      title: 'Visa Generator',
      description: 'Buat penawaran visa Umrah/Turis, hitung pax, dan generate PDF.',
      icon: <FileText size={32} className="text-[#3a0519]" />,
      href: '/dashboard/visa',
      color: 'bg-red-50',
      borderColor: 'border-red-100'
    },
    {
      title: 'Hotel Quotation',
      description: 'Buat penawaran LA/Hotel, hitung durasi malam, dan multi-kota.',
      icon: <Building2 size={32} className="text-[#a77a0b]" />,
      href: '/dashboard/hotel',
      color: 'bg-yellow-50',
      borderColor: 'border-yellow-100'
    },
    {
      title: 'Flight Generator',
      description: 'Buat tiket pesawat, PNR, Manifest penumpang, dan E-Ticket.',
      icon: <Plane size={32} className="text-blue-700" />,
      href: '/dashboard/flight',
      color: 'bg-blue-50',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Itinerary Builder',
      description: 'Buat Booklet Umrah Premium, jadwal perjalanan, dan rincian harga.',
      icon: <MapPin size={32} className="text-green-700" />,
      href: '/dashboard/itinerary',
      color: 'bg-green-50',
      borderColor: 'border-green-100'
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#3a0519]">Selamat Datang, Admin!</h1>
        <p className="text-gray-500">Silakan pilih modul generator di bawah ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {modules.map((item, idx) => (
          <Link 
            key={idx} 
            href={item.href}
            className="group block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-[#3a0519]"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${item.color} ${item.borderColor} border`}>
                {item.icon}
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-[#3a0519] transition-colors" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-800 group-hover:text-[#3a0519] transition-colors">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}