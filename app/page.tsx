"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulasi Cek Password Sederhana
    // Nanti bisa diganti dengan Database check
    if (username === 'admin' && password === 'rehla123') {
      // Set Cookie 'auth_token' agar middleware tahu kita sudah login
      document.cookie = "auth_token=true; path=/";
      
      toast.success("Login Berhasil! Mengalihkan...");
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      toast.error("Username atau Password salah!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
      <Toaster position="top-center" />
      
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4" style={{ borderColor: '#a77a0b' }}>
        <div className="text-center mb-8">
            <img src="/rehlasticky.png" className="w-20 h-20 mx-auto object-contain mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Travel Rehla System</h1>
            <p className="text-sm text-gray-500">Silakan login untuk akses dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a77a0b]"
                        placeholder="Masukkan username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a77a0b]"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-[#3a0519] text-white rounded-lg font-bold hover:opacity-90 transition flex justify-center items-center gap-2"
            >
                {loading ? 'Memproses...' : <>Masuk Dashboard <ArrowRight size={18}/></>}
            </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">&copy; 2026 Travel Rehla Internal System</p>
      </div>
    </div>
  );
}