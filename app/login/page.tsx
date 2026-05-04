"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Toaster, toast } from 'sonner';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shaking, setShaking] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password wajib diisi!");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
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
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
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

  // Enter key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        btnRef.current?.click();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="login-root">
        <Toaster position="top-center" richColors />

        {/* ══════════════ LEFT PANEL ══════════════ */}
        <div className="login-left">

          {/* Geometric SVG background */}
          <svg className="login-geo-bg" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="none" stroke="#C9A84C" strokeWidth="0.8" />
                <polygon points="40,10 70,25 70,55 40,70 10,55 10,25" fill="none" stroke="#C9A84C" strokeWidth="0.3" />
                <circle cx="40" cy="40" r="4" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geo)" />
          </svg>

          {/* Glow orbs */}
          <div className="login-orb login-orb-1" />
          <div className="login-orb login-orb-2" />
          <div className="login-orb login-orb-3" />

          {/* Top brand */}
          <div className="login-left-top">
            <div className="login-brand-mark">
              <div className="login-brand-icon">
                <img src="/rehlasticky.png" alt="Rehla" />
              </div>
              <div className="login-brand-name">
                Travel Rehla
                <span>Internal ERP System</span>
              </div>
            </div>
          </div>

          {/* Hero text */}
          <div className="login-hero-text">
            <div className="login-hero-eyebrow">
              <span className="login-eyebrow-dot" />
              Sistem Manajemen Operasional
              <span className="login-eyebrow-dot" />
            </div>
            <h1 className="login-hero-h1">
              Kelola<br />
              Perjalanan<br />
              <em>Umrah</em> dengan<br />
              Presisi
            </h1>
            <p className="login-hero-desc">
              Platform ERP internal terpadu untuk manajemen jamaah, keuangan, visa, dan operasional travel Umrah Anda.
            </p>
          </div>

          {/* Stats */}
          <div className="login-stats-row">
            <div className="login-stat-item">
              <div className="login-stat-num">10K+</div>
              <div className="login-stat-label">Jamaah Terkelola</div>
            </div>
            <div className="login-stat-item">
              <div className="login-stat-num">99.9%</div>
              <div className="login-stat-label">Uptime Sistem</div>
            </div>
            <div className="login-stat-item">
              <div className="login-stat-num">8+</div>
              <div className="login-stat-label">Modul Aktif</div>
            </div>
          </div>

          {/* Floating card */}
          <div className="login-floating-card">
            <div className="login-card-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4" stroke="#3D0416" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="#3D0416" strokeWidth="2" />
              </svg>
            </div>
            <div className="login-card-title">Keberangkatan Aktif</div>
            <div className="login-card-sub">3 grup · 247 jamaah</div>
          </div>

        </div>

        {/* ══════════════ RIGHT PANEL ══════════════ */}
        <div className="login-right">
          <div className="login-form-container">

            <div className="login-form-header">
              <div className="login-form-eyebrow">Selamat Datang</div>
              <h2 className="login-form-title">
                Masuk ke<br />Dashboard
              </h2>
              <p className="login-form-subtitle">
                Gunakan akun resmi Anda untuk mengakses sistem manajemen internal.
              </p>
            </div>

            <form onSubmit={handleLogin} autoComplete="off">
              {/* Email */}
              <div className="login-field-group">
                <label htmlFor="login-email">Email</label>
                <div className="login-input-wrapper">
                  <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type="email"
                    id="login-email"
                    className="login-input"
                    placeholder="nama@rehlatours.id"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field-group">
                <label htmlFor="login-password">Password</label>
                <div className="login-input-wrapper">
                  <svg className="login-input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    className="login-input"
                    placeholder="Masukkan password Anda"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: '46px' }}
                    required
                  />
                  <button
                    type="button"
                    className="login-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Tampilkan password"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.94 17.94A10.5 10.5 0 0112 20C5 20 1 12 1 12a18.8 18.8 0 015.06-5.94M9.9 4.24A9.4 9.4 0 0112 4c7 0 11 8 11 8a18.8 18.8 0 01-2.16 3.19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="login-forgot-link">
                  <a href="#">Lupa password?</a>
                </div>
              </div>

              {/* Submit */}
              <button
                ref={btnRef}
                type="submit"
                className={`login-btn ${shaking ? 'login-shake' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="login-btn-spinner" />
                ) : (
                  <>
                    <span className="login-btn-text">Masuk Dashboard</span>
                    <div className="login-btn-arrow">
                      <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 5h6M5 2l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">Sistem Terenkripsi & Aman</span>
              <div className="login-divider-line" />
            </div>

            {/* Security badge */}
            <div className="login-security-badge">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" stroke="currentColor" strokeWidth="1.5" fill="rgba(201,168,76,0.1)" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Dilindungi enkripsi SSL 256-bit · Akses hanya untuk staf resmi
            </div>

            {/* Footer */}
            <div className="login-form-footer">
              © {new Date().getFullYear()} Travel Rehla Internal System · All rights reserved
            </div>

          </div>
        </div>

      </div>
    </>
  );
}