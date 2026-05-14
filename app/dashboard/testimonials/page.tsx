'use client'

import React, { useState, useEffect } from 'react'
import { Star, Plus, Pencil, Trash2, Save, X, Eye, EyeOff, MessageSquareQuote, MapPin, Loader2 } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  content: string
  avatarUrl: string | null
  packageName: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
}

const emptyForm = {
  name: '', location: '', rating: 5, content: '', avatarUrl: '', packageName: '', isActive: true, sortOrder: 0
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/testimonials')
      const data = await res.json()
      if (data.success) setTestimonials(data.testimonials)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    if (!form.name || !form.location || !form.content) return alert('Nama, lokasi, dan konten wajib diisi')
    setSaving(true)
    try {
      const url = editing ? `/api/testimonials/${editing}` : '/api/testimonials'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        fetchData()
        setShowForm(false)
        setEditing(null)
        setForm(emptyForm)
      }
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  const handleEdit = (t: Testimonial) => {
    setForm({
      name: t.name, location: t.location, rating: t.rating, content: t.content,
      avatarUrl: t.avatarUrl || '', packageName: t.packageName || '',
      isActive: t.isActive, sortOrder: t.sortOrder,
    })
    setEditing(t.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus testimoni ini?')) return
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const toggleActive = async (t: Testimonial) => {
    await fetch(`/api/testimonials/${t.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !t.isActive }),
    })
    fetchData()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquareQuote className="w-7 h-7 text-[#3a0519]" />
            Cerita Jamaah (Testimoni)
          </h1>
          <p className="text-gray-500 mt-1">Kelola testimoni jamaah yang tampil di website utama</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-[#3a0519] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#5a0826] transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" /> Tambah Testimoni
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-[#3a0519] p-5 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">{editing ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-white/60 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nama Jamaah *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#3a0519] focus:outline-none" placeholder="Nama lengkap" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Lokasi *</label>
                  <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#3a0519] focus:outline-none" placeholder="Kota/Provinsi" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Testimoni / Cerita *</label>
                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#3a0519] focus:outline-none resize-none" placeholder="Cerita pengalaman jamaah..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setForm({...form, rating: s})} className="p-0.5">
                        <Star className={`w-6 h-6 ${s <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Urutan</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: parseInt(e.target.value) || 0})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#3a0519] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nama Paket</label>
                <input value={form.packageName} onChange={e => setForm({...form, packageName: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#3a0519] focus:outline-none" placeholder="Paket Umroh Reguler 9 Hari" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">URL Foto Avatar (opsional)</label>
                <input value={form.avatarUrl} onChange={e => setForm({...form, avatarUrl: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#3a0519] focus:outline-none" placeholder="https://..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-[#3a0519]" />
                <span className="text-sm font-medium text-gray-700">Tampilkan di website</span>
              </label>
            </div>
            <div className="p-5 border-t bg-gray-50 flex gap-3 justify-end">
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="px-5 py-2.5 text-sm font-bold text-gray-500 border border-gray-300 rounded-xl hover:bg-gray-100">Batal</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 text-sm font-bold text-white bg-[#3a0519] rounded-xl hover:bg-[#5a0826] flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#3a0519]" /></div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageSquareQuote className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Belum ada testimoni</p>
          <p className="text-sm">Klik "Tambah Testimoni" untuk menambahkan cerita jamaah</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${t.isActive ? 'border-gray-200' : 'border-red-200 opacity-60'}`}>
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#3a0519]/10 flex items-center justify-center text-[#3a0519] font-bold text-lg overflow-hidden">
                      {t.avatarUrl ? <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" /> : t.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{t.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-4">"{t.content}"</p>

                {/* Package */}
                {t.packageName && (
                  <span className="inline-block bg-[#3a0519]/10 text-[#3a0519] text-xs font-medium px-2.5 py-1 rounded-full mb-3">{t.packageName}</span>
                )}

                {/* Status */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.isActive ? '✓ Aktif' : '✗ Nonaktif'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => toggleActive(t)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title={t.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                      {t.isActive ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-green-600" />}
                    </button>
                    <button onClick={() => handleEdit(t)} className="p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Edit">
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Hapus">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
