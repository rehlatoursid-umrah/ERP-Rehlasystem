"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Email atau Password salah!");
        setLoading(false);
      } else {
        // Also set old cookie for backward compatibility
        document.cookie = "auth_token=true; path=/";
        
        toast.success("Login Berhasil! Mengalihkan...");
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
      <Toaster position="top-center" richColors />
      
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-[#3a0519]">
        <div className="text-center mb-8">
            <img src="/rehlasticky.png" alt="Rehla Logo" className="w-20 h-20 mx-auto object-contain mb-4" />
            <h1 className="text-2xl font-bold text-[#3a0519]">Travel Rehla System</h1>
            <p className="text-sm text-gray-500 mt-1">Sistem Manajemen ERP Internal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wide">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="email" 
                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#fdf8e8] focus:border-[#a77a0b] transition"
                        placeholder="admin@rehlatours.id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wide">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#fdf8e8] focus:border-[#a77a0b] transition"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-[#3a0519] text-white rounded-lg font-bold hover:bg-[#5a0826] transition flex justify-center items-center gap-2 shadow-md disabled:opacity-70"
            >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Masuk Dashboard <ArrowRight size={18}/></>
                )}
            </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-8">&copy; {new Date().getFullYear()} Travel Rehla Internal System</p>
      </div>
    </div>
  );
}