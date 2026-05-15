"use client";

import { useState } from 'react';
import './install.css';

type DeviceTab = 'iphone' | 'android' | 'mac' | 'windows';

const DEVICE_TABS: { id: DeviceTab; label: string; icon: JSX.Element }[] = [
  {
    id: 'iphone', label: 'iPhone / iPad',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="2" width="12" height="20" rx="3"/><line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2" strokeLinecap="round"/></svg>
  },
  {
    id: 'android', label: 'Android',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="8" width="14" height="12" rx="2"/><path d="M7 8V6a5 5 0 0110 0v2" strokeLinecap="round"/><circle cx="9" cy="5" r="0.5" fill="currentColor"/><circle cx="15" cy="5" r="0.5" fill="currentColor"/><line x1="4" y1="12" x2="4" y2="16" strokeLinecap="round" strokeWidth="2"/><line x1="20" y1="12" x2="20" y2="16" strokeLinecap="round" strokeWidth="2"/></svg>
  },
  {
    id: 'mac', label: 'Mac / Safari',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="7" x2="22" y2="7"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
  },
  {
    id: 'windows', label: 'Windows / Chrome',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="14" rx="2"/><line x1="3" y1="8" x2="21" y2="8"/><polyline points="7 22 12 18 17 22"/></svg>
  },
];

const GUIDES: Record<DeviceTab, { title: string; subtitle: string; steps: { title: string; desc: string; highlight?: string }[] }> = {
  iphone: {
    title: 'iPhone & iPad',
    subtitle: 'Instal via Safari Browser',
    steps: [
      { title: 'Buka Safari', desc: 'Buka aplikasi <strong>Safari</strong> di iPhone atau iPad Anda. Pastikan menggunakan Safari, bukan Chrome atau browser lain.', highlight: 'Fitur Add to Home Screen hanya tersedia di Safari pada iOS.' },
      { title: 'Kunjungi ERP', desc: 'Ketik alamat <strong>erp.rehlatours.id</strong> di address bar Safari, lalu login dengan akun Anda seperti biasa.' },
      { title: 'Tap Tombol Share', desc: 'Tap ikon <strong>Share</strong> (kotak dengan panah ke atas) yang ada di bagian bawah layar Safari.' },
      { title: 'Pilih "Add to Home Screen"', desc: 'Scroll ke bawah pada menu yang muncul, lalu pilih <strong>"Add to Home Screen"</strong> atau <strong>"Tambah ke Layar Utama"</strong>.' },
      { title: 'Konfirmasi & Simpan', desc: 'Beri nama aplikasi (default: <strong>Rehla ERP</strong>), lalu tap <strong>"Add"</strong> di pojok kanan atas. Ikon akan muncul di home screen Anda.' },
      { title: 'Selesai! 🎉', desc: 'Buka aplikasi dari home screen. ERP akan tampil fullscreen seperti aplikasi native tanpa address bar Safari.' },
    ],
  },
  android: {
    title: 'Android',
    subtitle: 'Instal via Chrome / Browser Bawaan',
    steps: [
      { title: 'Buka Chrome', desc: 'Buka <strong>Google Chrome</strong> atau browser bawaan di HP Android Anda.' },
      { title: 'Kunjungi ERP', desc: 'Buka alamat <strong>erp.rehlatours.id</strong> dan login dengan akun Anda.' },
      { title: 'Tap Menu ⋮', desc: 'Tap ikon <strong>tiga titik vertikal (⋮)</strong> di pojok kanan atas Chrome.' },
      { title: 'Pilih "Install App" atau "Add to Home Screen"', desc: 'Pilih opsi <strong>"Install app"</strong> atau <strong>"Tambahkan ke layar utama"</strong> dari menu yang muncul.', highlight: 'Jika muncul popup banner "Add Rehla ERP to Home screen", tap langsung saja!' },
      { title: 'Konfirmasi Instalasi', desc: 'Tap <strong>"Install"</strong> pada dialog konfirmasi. Aplikasi akan otomatis terunduh dan ditambahkan ke home screen.' },
      { title: 'Selesai! 🎉', desc: 'Cari ikon <strong>Rehla ERP</strong> di home screen atau app drawer Anda. Buka dan nikmati pengalaman seperti aplikasi native.' },
    ],
  },
  mac: {
    title: 'MacBook / iMac',
    subtitle: 'Instal via Safari atau Chrome',
    steps: [
      { title: 'Buka Safari atau Chrome', desc: 'Buka browser <strong>Safari</strong> atau <strong>Google Chrome</strong> di Mac Anda.' },
      { title: 'Kunjungi ERP', desc: 'Buka <strong>erp.rehlatours.id</strong> dan login seperti biasa.' },
      { title: 'Instal via Chrome', desc: 'Di Chrome: klik ikon <strong>Install (⊕)</strong> di sisi kanan address bar, atau buka menu <strong>⋮ → "Install Rehla ERP..."</strong>', highlight: 'Di Safari: buka menu File → "Add to Dock" (macOS Sonoma+).' },
      { title: 'Konfirmasi', desc: 'Klik <strong>"Install"</strong> pada dialog yang muncul. Aplikasi akan muncul di <strong>Dock</strong> dan <strong>Launchpad</strong> Mac Anda.' },
      { title: 'Selesai! 🎉', desc: 'Buka Rehla ERP langsung dari Dock atau Launchpad. Aplikasi akan berjalan di window terpisah tanpa tab browser.' },
    ],
  },
  windows: {
    title: 'Windows PC / Laptop',
    subtitle: 'Instal via Chrome atau Edge',
    steps: [
      { title: 'Buka Chrome atau Edge', desc: 'Buka <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong> di laptop/PC Windows Anda.' },
      { title: 'Kunjungi ERP', desc: 'Buka <strong>erp.rehlatours.id</strong> dan login dengan akun Anda.' },
      { title: 'Klik Tombol Install', desc: 'Di Chrome: klik ikon <strong>Install (⊕)</strong> di address bar. Di Edge: klik ikon <strong>App available</strong> atau buka menu <strong>⋯ → Apps → "Install this site as an app"</strong>.', highlight: 'Pastikan Anda menggunakan Chrome versi 70+ atau Edge versi 79+.' },
      { title: 'Konfirmasi Instalasi', desc: 'Klik <strong>"Install"</strong> pada popup konfirmasi. Aplikasi otomatis terpasang.' },
      { title: 'Selesai! 🎉', desc: 'Rehla ERP akan muncul di <strong>Start Menu</strong>, <strong>Desktop</strong>, dan <strong>Taskbar</strong>. Buka kapan saja tanpa perlu membuka browser.' },
    ],
  },
};

const FAQS = [
  { q: 'Apakah aplikasi ini gratis?', a: 'Ya, instalasi PWA (Progressive Web App) sepenuhnya gratis. Tidak ada biaya tambahan dan tidak perlu download dari App Store atau Play Store.' },
  { q: 'Apakah data saya aman?', a: 'Absolut. Aplikasi ini menggunakan enkripsi SSL 256-bit dan semua data tersimpan di server yang aman. Instalasi PWA tidak menyimpan data sensitif di perangkat Anda.' },
  { q: 'Apa bedanya dengan buka di browser biasa?', a: 'Dengan instalasi PWA, ERP akan tampil fullscreen tanpa address bar, lebih cepat dimuat, mendukung notifikasi, dan terasa seperti aplikasi native di perangkat Anda.' },
  { q: 'Apakah perlu update manual?', a: 'Tidak! PWA akan otomatis update setiap kali Anda membukanya. Anda selalu menggunakan versi terbaru tanpa perlu ke app store.' },
  { q: 'Bagaimana jika tombol Install tidak muncul?', a: 'Pastikan Anda menggunakan browser yang didukung (Safari di iOS, Chrome/Edge di Android & Desktop). Coba clear cache browser lalu refresh halaman. Jika masih bermasalah, hubungi tim IT.' },
];

export default function InstallPage() {
  const [activeTab, setActiveTab] = useState<DeviceTab>('iphone');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const guide = GUIDES[activeTab];

  return (
    <div className="install-root">
      {/* ══════ Hero ══════ */}
      <div className="install-hero">
        <div className="install-hero-grid" />
        <div className="install-hero-content">
          <div className="install-hero-badge">
            <span className="dot" />
            Panduan Instalasi
          </div>
          <h1>
            Pasang <em>Rehla ERP</em><br />di Perangkat Anda
          </h1>
          <p className="install-hero-desc">
            Instal sistem ERP sebagai aplikasi di smartphone, tablet, atau komputer Anda.
            Akses cepat tanpa perlu membuka browser.
          </p>
          <div className="install-hero-devices">
            {DEVICE_TABS.map(d => (
              <button key={d.id} className="install-device-chip" onClick={() => { setActiveTab(d.id); document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
                {d.icon} {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════ Main ══════ */}
      <div className="install-main" id="guide-section">
        {/* Tabs */}
        <div className="install-tabs">
          {DEVICE_TABS.map(d => (
            <button key={d.id} className={`install-tab ${activeTab === d.id ? 'active' : ''}`} onClick={() => setActiveTab(d.id)}>
              {d.icon} {d.label}
            </button>
          ))}
        </div>

        {/* Guide Card */}
        <div className="install-card" key={activeTab}>
          <div className="install-card-header">
            <div className="install-card-icon">
              {DEVICE_TABS.find(d => d.id === activeTab)?.icon}
            </div>
            <div>
              <h2>{guide.title}</h2>
              <p>{guide.subtitle}</p>
            </div>
          </div>
          <div className="install-card-body">
            <div className="install-steps">
              {guide.steps.map((s, i) => (
                <div className="install-step" key={i}>
                  <div className="install-step-line">
                    <div className="install-step-num">{i + 1}</div>
                    <div className="install-step-connector" />
                  </div>
                  <div className="install-step-content">
                    <h3 className="install-step-title">{s.title}</h3>
                    <p className="install-step-desc" dangerouslySetInnerHTML={{ __html: s.desc }} />
                    {s.highlight && (
                      <div className="install-highlight">💡 {s.highlight}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="install-tips">
              <div className="install-tips-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.5-1.5 4.5-3 6v2H8v-2c-1.5-1.5-3-3.5-3-6a7 7 0 017-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
                Tips Penting
              </div>
              <ul>
                <li>Pastikan koneksi internet stabil saat proses instalasi</li>
                <li>Login terlebih dahulu sebelum menginstal untuk pengalaman terbaik</li>
                <li>Aplikasi akan menerima update otomatis tanpa perlu reinstall</li>
                <li>Anda bisa menghapus aplikasi kapan saja seperti aplikasi biasa</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="install-faq">
          <h2 className="install-faq-title">Pertanyaan Umum</h2>
          {FAQS.map((f, i) => (
            <div className={`install-faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
              <button className="install-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div className="install-faq-a">
                <div className="install-faq-a-inner">{f.a}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="install-footer">
          <p>© {new Date().getFullYear()} <a href="/login">Travel Rehla</a> · Internal ERP System</p>
          <p style={{ marginTop: 8 }}>Butuh bantuan? Hubungi tim IT di WhatsApp</p>
        </div>
      </div>
    </div>
  );
}
