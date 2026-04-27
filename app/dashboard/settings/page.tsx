"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Settings, Save, Building2, Phone, Globe, DollarSign, Loader2, MessageSquare } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { getSettings, updateSettings } from '@/app/actions/admin';
import { Input, Textarea } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { PageHeader } from '@/app/components/layout/PageHeader';

type SettingItem = { id: string; key: string; value: string; group: string };

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('branding');

  // Local form state derived from settings
  const [form, setForm] = useState<Record<string, string>>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
      const map: Record<string, string> = {};
      data.forEach(s => { map[s.key] = s.value; });
      setForm(map);
    } catch { toast.error("Gagal memuat pengaturan"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = () => {
    startTransition(async () => {
      try {
        const items = Object.entries(form).map(([key, value]) => {
          const existing = settings.find(s => s.key === key);
          return { key, value, group: existing?.group || 'general' };
        });
        await updateSettings(items);
        toast.success("Pengaturan berhasil disimpan!");
        loadData();
      } catch { toast.error("Gagal menyimpan"); }
    });
  };

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'branding', label: 'Perusahaan', icon: <Building2 size={16}/> },
    { id: 'finance', label: 'Keuangan', icon: <DollarSign size={16}/> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare size={16}/> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[#a77a0b] mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <Toaster position="top-center" richColors />
      <PageHeader title="Pengaturan Sistem" description="Konfigurasi profil perusahaan dan integrasi." icon={<Settings className="text-[#a77a0b]" size={28}/>}
        actions={<Button onClick={handleSave} loading={isPending} icon={<Save size={16}/>}>Simpan Perubahan</Button>}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition ${activeTab === t.id ? 'bg-[#3a0519] text-white border-[#3a0519] shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Branding */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#fdf8e8] rounded-lg"><Building2 size={20} className="text-[#a77a0b]"/></div>
            <div>
              <h3 className="font-bold text-gray-800">Profil Perusahaan</h3>
              <p className="text-xs text-gray-400">Informasi yang ditampilkan di PDF, invoice, dan komunikasi.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nama Perusahaan" value={form.company_name || ''} onChange={e => updateField('company_name', e.target.value)} placeholder="REHLA INDONESIA" icon={<Building2 size={14}/>} />
            <Input label="Tagline / SK PPIU" value={form.company_tagline || ''} onChange={e => updateField('company_tagline', e.target.value)} placeholder="PPIU SK No. ..." />
            <div className="md:col-span-2">
              <Input label="Alamat Kantor" value={form.company_address || ''} onChange={e => updateField('company_address', e.target.value)} placeholder="Komplek Permata Biru Bandung" />
            </div>
            <Input label="No. Telepon" value={form.company_phone || ''} onChange={e => updateField('company_phone', e.target.value)} icon={<Phone size={14}/>} placeholder="6283xxxxxxxxx" />
            <Input label="Website" value={form.company_website || ''} onChange={e => updateField('company_website', e.target.value)} icon={<Globe size={14}/>} placeholder="rehlatours.id" />
          </div>
        </div>
      )}

      {/* Finance */}
      {activeTab === 'finance' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-green-50 rounded-lg"><DollarSign size={20} className="text-green-600"/></div>
            <div>
              <h3 className="font-bold text-gray-800">Pengaturan Keuangan</h3>
              <p className="text-xs text-gray-400">Markup default dan mata uang.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Markup Default (%)" type="number" value={form.markup_percent || '20'} onChange={e => updateField('markup_percent', e.target.value)} className="text-right" />
            <Input label="Mata Uang Default" value={form.default_currency || 'IDR'} onChange={e => updateField('default_currency', e.target.value)} />
            <Input label="Nama Bank Perusahaan" value={form.bank_name || ''} onChange={e => updateField('bank_name', e.target.value)} placeholder="Bank BCA" />
            <Input label="No. Rekening" value={form.bank_account || ''} onChange={e => updateField('bank_account', e.target.value)} placeholder="123-456-7890" />
            <Input label="Atas Nama" value={form.bank_holder || ''} onChange={e => updateField('bank_holder', e.target.value)} placeholder="PT Rehla Indonesia" />
          </div>
        </div>
      )}

      {/* WhatsApp */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-green-50 rounded-lg"><MessageSquare size={20} className="text-green-600"/></div>
            <div>
              <h3 className="font-bold text-gray-800">Integrasi WhatsApp</h3>
              <p className="text-xs text-gray-400">Konfigurasi API WhatsApp untuk pengiriman dokumen.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input label="API URL" value={form.wa_api_url || ''} onChange={e => updateField('wa_api_url', e.target.value)} placeholder="https://api.gowa.ai/..." />
            <Input label="API Key / Token" value={form.wa_api_key || ''} onChange={e => updateField('wa_api_key', e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx" />
            <Input label="Sender Number" value={form.wa_sender || ''} onChange={e => updateField('wa_sender', e.target.value)} icon={<Phone size={14}/>} placeholder="6283xxxxxxxxx" />
          </div>

          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 font-medium">
              ⚠️ Pastikan API WhatsApp aktif dan terhubung sebelum mengirim dokumen ke jamaah.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
