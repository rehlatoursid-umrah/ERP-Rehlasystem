import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image as PdfImage, Font } from '@react-pdf/renderer';

// ============================================
// REGISTRATION CONFIRMATION PDF
// Professional PDF sent to customer via WhatsApp
// Contains: all registration data + full S&K
// ============================================

const BRAND_COLOR = '#3a0519';
const GOLD = '#a77a0b';

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#333' },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: `3px solid ${BRAND_COLOR}`, paddingBottom: 12, marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 50, height: 50, marginRight: 10, objectFit: 'contain' },
  companyName: { fontSize: 16, fontWeight: 'bold', color: BRAND_COLOR },
  companySub: { fontSize: 8, color: '#666', marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  docTitle: { fontSize: 14, fontWeight: 'bold', color: BRAND_COLOR },
  docSub: { fontSize: 8, color: '#888', marginTop: 3 },
  // Divider
  divider: { borderBottom: `1px solid #e5e5e5`, marginVertical: 12 },
  doubleLine: { borderBottom: `3px double ${BRAND_COLOR}`, marginBottom: 2 },
  // Section
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: BRAND_COLOR, marginTop: 16, marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${BRAND_COLOR}`, textTransform: 'uppercase', letterSpacing: 1 },
  sectionTitleBar: { backgroundColor: '#f8f4f5', padding: 6, paddingLeft: 10, marginTop: 14, marginBottom: 8, borderLeft: `4px solid ${BRAND_COLOR}` },
  sectionTitleBarText: { fontSize: 10, fontWeight: 'bold', color: BRAND_COLOR, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Table
  table: { marginBottom: 4 },
  row: { flexDirection: 'row', borderBottom: '1px solid #f0f0f0', minHeight: 22, alignItems: 'center' },
  rowAlt: { backgroundColor: '#faf8f9' },
  cellLabel: { width: '40%', fontSize: 9, color: '#666', paddingVertical: 5, paddingHorizontal: 8, fontWeight: 'bold' },
  cellValue: { width: '60%', fontSize: 9, color: '#222', paddingVertical: 5, paddingHorizontal: 8, fontWeight: 'bold' },
  // Booking box
  bookingBox: { backgroundColor: BRAND_COLOR, borderRadius: 6, padding: 14, marginTop: 14 },
  bookingTitle: { fontSize: 10, color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  bookingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  bookingLabel: { fontSize: 9, color: '#ddd' },
  bookingValue: { fontSize: 11, color: '#fff', fontWeight: 'bold' },
  // S&K
  skTitle: { fontSize: 12, fontWeight: 'bold', color: BRAND_COLOR, marginTop: 10, marginBottom: 6 },
  skSection: { fontSize: 10, fontWeight: 'bold', color: BRAND_COLOR, marginTop: 10, marginBottom: 4 },
  skText: { fontSize: 8.5, color: '#444', lineHeight: 1.5, marginBottom: 3, marginLeft: 12 },
  skParagraph: { fontSize: 8.5, color: '#444', lineHeight: 1.5, marginBottom: 6 },
  // Footer
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, textAlign: 'center', fontSize: 7.5, color: '#aaa', borderTop: '1px solid #e5e5e5', paddingTop: 8 },
  // Stamp
  stampBox: { borderWidth: 2, borderColor: BRAND_COLOR, borderStyle: 'solid', borderRadius: 8, padding: 10, marginTop: 20, alignItems: 'center' },
  stampText: { fontSize: 10, color: BRAND_COLOR, fontWeight: 'bold', textAlign: 'center' },
  stampDate: { fontSize: 8, color: '#888', marginTop: 4, textAlign: 'center' },
  // Registration ID
  regId: { backgroundColor: '#f8f4f5', border: `1px solid ${BRAND_COLOR}`, borderRadius: 4, padding: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  regIdLabel: { fontSize: 8, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  regIdValue: { fontSize: 12, fontWeight: 'bold', color: BRAND_COLOR, letterSpacing: 1 },
});

function DataRow({ label, value, alt }: { label: string; value: string; alt?: boolean }) {
  return (
    <View style={[s.row, alt ? s.rowAlt : {}]}>
      <Text style={s.cellLabel}>{label}</Text>
      <Text style={s.cellValue}>{value || '-'}</Text>
    </View>
  );
}

function SectionBar({ title }: { title: string }) {
  return (
    <View style={s.sectionTitleBar}>
      <Text style={s.sectionTitleBarText}>{title}</Text>
    </View>
  );
}

export interface RegistrationPdfData {
  // Personal
  fullName: string;
  nik?: string;
  birthPlace?: string;
  birthDate?: string;
  fatherName?: string;
  motherName?: string;
  gender?: string;
  maritalStatus?: string;
  occupation?: string;
  // Contact
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  // Passport
  passportNumber?: string;
  passportIssued?: string;
  passportExpiry?: string;
  passportPlace?: string;
  // Health
  hasDiseases?: boolean;
  diseaseNotes?: string;
  specialNeeds?: boolean;
  wheelchair?: boolean;
  previousUmrah?: boolean;
  previousHajj?: boolean;
  // Booking
  bookingCode?: string;
  packageName?: string;
  packageType?: string;
  roomType?: string;
  priceTotal?: number;
  currency?: string;
  // Meta
  registrationDate: string;
  customerId: string;
}

const formatDate = (d?: string) => {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return d; }
};

const formatCurrency = (n?: number) => n ? `Rp ${n.toLocaleString('id-ID')}` : '-';

const genderLabel = (g?: string) => g === 'MALE' ? 'Laki-laki' : g === 'FEMALE' ? 'Perempuan' : '-';
const maritalLabel = (m?: string) => {
  const map: Record<string, string> = { SINGLE: 'Belum Menikah', MARRIED: 'Menikah', DIVORCED: 'Cerai', WIDOWED: 'Janda/Duda' };
  return map[m || ''] || '-';
};
const relationLabel = (r?: string) => {
  const map: Record<string, string> = { SPOUSE: 'Suami/Istri', PARENT: 'Orang Tua', CHILD: 'Anak', SIBLING: 'Saudara', OTHER: 'Lainnya' };
  return map[r || ''] || r || '-';
};

const LOGO_URL = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://erp.rehlatours.id') + '/rehlasticky.png';

export function RegistrationConfirmationPdf({ data }: { data: RegistrationPdfData }) {
  return (
    <Document>
      {/* PAGE 1: Registration Data */}
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <PdfImage src={LOGO_URL} style={s.logo} />
            <View>
              <Text style={s.companyName}>REHLA INDONESIA</Text>
              <Text style={s.companySub}>PPIU SK No. 498/2017</Text>
              <Text style={s.companySub}>Komplek Permata Biru, Blok L2 no 68</Text>
              <Text style={s.companySub}>Cileunyi, Kab. Bandung Jawa Barat</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Text style={s.docTitle}>TRAVEL CONFIRMATION</Text>
            <Text style={s.docSub}>Email: info@rehlatours.id</Text>
            <Text style={s.docSub}>Website: www.rehlatours.id</Text>
            <Text style={s.docSub}>Travel Hotline: +6283197321658</Text>
          </View>
        </View>
        <View style={s.doubleLine} />

        {/* Registration ID */}
        <View style={s.regId}>
          <View>
            <Text style={s.regIdLabel}>Tanggal Pendaftaran</Text>
            <Text style={{ fontSize: 9, color: '#555', marginTop: 2, fontWeight: 'bold' }}>{data.registrationDate}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.regIdLabel}>Registration ID</Text>
            <Text style={s.regIdValue}>{data.customerId.slice(0, 8).toUpperCase()}</Text>
          </View>
        </View>

        {/* Data Diri */}
        <SectionBar title="A. Data Diri Pribadi" />
        <View style={s.table}>
          <DataRow label="Nama Lengkap" value={data.fullName} />
          <DataRow label="NIK" value={data.nik || '-'} alt />
          <DataRow label="Tempat, Tanggal Lahir" value={`${data.birthPlace || '-'}, ${formatDate(data.birthDate)}`} />
          <DataRow label="Jenis Kelamin" value={genderLabel(data.gender)} alt />
          <DataRow label="Nama Ayah" value={data.fatherName || '-'} />
          <DataRow label="Nama Ibu" value={data.motherName || '-'} alt />
          <DataRow label="Status Pernikahan" value={maritalLabel(data.maritalStatus)} />
          <DataRow label="Pekerjaan" value={data.occupation || '-'} alt />
        </View>

        {/* Kontak */}
        <SectionBar title="B. Informasi Kontak" />
        <View style={s.table}>
          <DataRow label="Nomor Telepon" value={data.phone} />
          <DataRow label="WhatsApp" value={data.whatsapp || '-'} alt />
          <DataRow label="Email" value={data.email || '-'} />
          <DataRow label="Alamat" value={data.address || '-'} alt />
          <DataRow label="Kota" value={data.city || '-'} />
          <DataRow label="Provinsi" value={data.province || '-'} alt />
          <DataRow label="Kode Pos" value={data.postalCode || '-'} />
        </View>

        {/* Emergency */}
        <SectionBar title="C. Kontak Darurat" />
        <View style={s.table}>
          <DataRow label="Nama Kontak Darurat" value={data.emergencyName || '-'} />
          <DataRow label="Hubungan" value={relationLabel(data.emergencyRelation)} alt />
          <DataRow label="Nomor Telepon" value={data.emergencyPhone || '-'} />
        </View>

        {/* Passport */}
        <SectionBar title="D. Informasi Paspor" />
        <View style={s.table}>
          <DataRow label="Nomor Paspor" value={data.passportNumber || '-'} />
          <DataRow label="Tanggal Penerbitan" value={formatDate(data.passportIssued)} alt />
          <DataRow label="Tanggal Kadaluarsa" value={formatDate(data.passportExpiry)} />
          <DataRow label="Tempat Penerbitan" value={data.passportPlace || '-'} alt />
        </View>

        {/* Health */}
        <SectionBar title="E. Kesehatan & Pengalaman Ibadah" />
        <View style={s.table}>
          <DataRow label="Penyakit Tertentu" value={data.hasDiseases ? (data.diseaseNotes || 'Ya') : 'Tidak ada'} />
          <DataRow label="Kebutuhan Khusus" value={data.specialNeeds ? 'Ya' : 'Tidak'} alt />
          <DataRow label="Kursi Roda" value={data.wheelchair ? 'Ya' : 'Tidak'} />
          <DataRow label="Pengalaman Umrah" value={data.previousUmrah ? 'Pernah' : 'Belum Pernah'} alt />
          <DataRow label="Pengalaman Haji" value={data.previousHajj ? 'Pernah' : 'Belum Pernah'} />
        </View>

        {/* Booking */}
        {data.bookingCode && (
          <View style={s.bookingBox}>
            <Text style={s.bookingTitle}>✦ Paket Umrah Terpilih</Text>
            <View style={s.bookingRow}>
              <Text style={s.bookingLabel}>Kode Booking</Text>
              <Text style={s.bookingValue}>{data.bookingCode}</Text>
            </View>
            <View style={s.bookingRow}>
              <Text style={s.bookingLabel}>Paket</Text>
              <Text style={s.bookingValue}>{data.packageName || '-'} ({data.packageType || '-'})</Text>
            </View>
            <View style={s.bookingRow}>
              <Text style={s.bookingLabel}>Tipe Kamar</Text>
              <Text style={s.bookingValue}>{data.roomType || '-'}</Text>
            </View>
            <View style={s.bookingRow}>
              <Text style={s.bookingLabel}>Total Biaya</Text>
              <Text style={{ ...s.bookingValue, fontSize: 14 }}>{formatCurrency(data.priceTotal)}</Text>
            </View>
          </View>
        )}

        {/* Official stamp */}
        <View style={s.stampBox}>
          <Text style={s.stampText}>PENDAFTARAN BERHASIL ✓</Text>
          <Text style={s.stampDate}>Terdaftar pada {data.registrationDate}</Text>
          <Text style={{ fontSize: 7, color: '#aaa', marginTop: 2 }}>Dokumen ini digenerate secara otomatis oleh sistem Rehlatours.id</Text>
        </View>

        <Text style={s.footer}>
          Rehla Indonesia • PPIU SK No. 498/2017 • www.rehlatours.id • +6283197321658
        </Text>
      </Page>

      {/* PAGE 2+: Syarat & Ketentuan */}
      <Page size="A4" style={s.page}>
        {/* Mini header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottom: `2px solid ${BRAND_COLOR}`, paddingBottom: 8, marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: BRAND_COLOR }}>SYARAT & KETENTUAN</Text>
          <Text style={{ fontSize: 8, color: '#888' }}>Rehla Indonesia • rehlatours.id</Text>
        </View>

        <Text style={s.skSection}>A. PENDAFTARAN</Text>
        <Text style={s.skText}>1. Calon jamaah wajib mengisi formulir pendaftaran dengan data yang benar, lengkap, dan sesuai identitas resmi (KTP/Paspor). Segala akibat hukum yang timbul dari kesalahan data adalah tanggung jawab pendaftar.</Text>
        <Text style={s.skText}>2. Pendaftaran dinyatakan sah dan mengikat setelah calon jamaah membayar Down Payment (DP) minimal sesuai ketentuan paket yang dipilih dan dikonfirmasi secara tertulis oleh Rehlatours Indonesia.</Text>
        <Text style={s.skText}>3. Pendaftaran yang dilakukan tanpa DP bersifat tidak mengikat dan tidak menjamin slot keberangkatan.</Text>
        <Text style={s.skText}>4. Pelunasan wajib dilakukan paling lambat 45 (empat puluh lima) hari sebelum tanggal keberangkatan.</Text>
        <Text style={s.skText}>5. Pendaftaran yang dilakukan kurang dari 45 hari sebelum keberangkatan wajib membayar lunas pada saat pendaftaran.</Text>
        <Text style={s.skText}>6. Segala biaya dan risiko yang timbul akibat keterlambatan pembayaran atau pengumpulan dokumen sepenuhnya menjadi tanggung jawab jamaah.</Text>

        <Text style={s.skSection}>B. DOKUMEN</Text>
        <Text style={s.skParagraph}>Calon jamaah wajib menyerahkan dokumen berikut selambat-lambatnya 60 hari sebelum keberangkatan:</Text>
        <Text style={s.skText}>1. Paspor asli yang masih berlaku minimal 8 (delapan) bulan dari tanggal keberangkatan, dengan nama minimal 2 (dua) suku kata.</Text>
        <Text style={s.skText}>2. E-KTP yang masih berlaku.</Text>
        <Text style={s.skText}>3. Pas foto terbaru berwarna berlatar belakang putih, ukuran 4×6 dan 3×4 (masing-masing 3 lembar).</Text>
        <Text style={s.skText}>4. Sertifikat Vaksinasi Meningitis beserta kartu kuning yang diterbitkan oleh Kantor Kesehatan Pelabuhan (KKP) yang sah.</Text>
        <Text style={s.skText}>5. Buku Nikah (untuk jamaah suami-istri yang berangkat bersama).</Text>
        <Text style={s.skText}>6. Dokumen tambahan lainnya sesuai ketentuan Kemenag RI dan pemerintah Arab Saudi yang berlaku.</Text>

        <Text style={s.skSection}>C. PEMBATALAN & PENGEMBALIAN DANA (REFUND)</Text>
        <Text style={s.skText}>1. Pengajuan pengembalian dana (refund) dilakukan maksimal dalam 90 (sembilan puluh) hari kerja sejak pendaftaran.</Text>
        <Text style={s.skText}>2. Refund akan ditransfer ke rekening atas nama jamaah yang bersangkutan.</Text>
        <Text style={s.skText}>3. Pembatalan yang disebabkan oleh penolakan visa dari pemerintah Arab Saudi bukan merupakan kesalahan Rehlatours.</Text>

        <Text style={s.skSection}>D. PENGGANTIAN JAMAAH</Text>
        <Text style={s.skText}>1. Jamaah yang berhalangan berangkat dapat digantikan oleh anggota keluarga atau pihak lain atas persetujuan tertulis dari Rehlatours Indonesia maksimal 60 hari kerja sebelum keberangkatan.</Text>
        <Text style={s.skText}>2. Penggantian jamaah dikenakan biaya administrasi dan wajib memenuhi seluruh persyaratan dokumen.</Text>
        <Text style={s.skText}>3. Penggantian jamaah akibat meninggal dunia dapat diproses dengan pengembalian dana 100% (maksimal 90 hari kerja) dengan melampirkan Surat Keterangan Kematian resmi.</Text>

        <Text style={s.skSection}>E. PERUBAHAN JADWAL & FASILITAS</Text>
        <Text style={s.skText}>1. Harga paket dapat berubah sewaktu-waktu menyesuaikan nilai tukar Rupiah terhadap USD, kebijakan maskapai, dan kondisi di luar kendali perusahaan.</Text>
        <Text style={s.skText}>2. Jadwal keberangkatan dan kepulangan mengacu pada ketentuan maskapai.</Text>
        <Text style={s.skText}>3. Itinerary, fasilitas, dan jadwal kegiatan dapat berubah sewaktu-waktu tanpa mengurangi kualitas layanan secara signifikan.</Text>
        <Text style={s.skText}>4. Penggantian hotel dengan kelas setara atau lebih baik dapat dilakukan tanpa pemberitahuan terlebih dahulu.</Text>

        <Text style={s.footer}>
          Rehla Indonesia • PPIU SK No. 498/2017 • www.rehlatours.id • Halaman 2
        </Text>
      </Page>

      {/* PAGE 3: S&K lanjutan */}
      <Page size="A4" style={s.page}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottom: `2px solid ${BRAND_COLOR}`, paddingBottom: 8, marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: BRAND_COLOR }}>SYARAT & KETENTUAN (LANJUTAN)</Text>
          <Text style={{ fontSize: 8, color: '#888' }}>Rehla Indonesia • rehlatours.id</Text>
        </View>

        <Text style={s.skSection}>F. KESEHATAN & KELAIKAN BERANGKAT</Text>
        <Text style={s.skText}>1. Jamaah wajib dalam kondisi sehat jasmani dan rohani yang layak untuk melakukan perjalanan ibadah.</Text>
        <Text style={s.skText}>2. Jamaah dengan kondisi medis khusus (hipertensi, diabetes, jantung, kehamilan, dsb.) wajib menginformasikan kepada Rehlatours sebelum pendaftaran dan melampirkan surat keterangan dokter.</Text>
        <Text style={s.skText}>3. Jamaah yang tidak memenuhi syarat kesehatan untuk terbang tidak dapat diizinkan berangkat dan pembatalan mengikuti ketentuan poin C.</Text>
        <Text style={s.skText}>4. Rehlatours tidak menanggung biaya pengobatan di luar cakupan asuransi perjalanan yang telah disediakan.</Text>
        <Text style={s.skText}>5. Jamaah wajib memiliki vaksin meningitis yang valid sesuai ketentuan pemerintah Arab Saudi.</Text>

        <Text style={s.skSection}>G. TANGGUNG JAWAB & BATASAN KEWAJIBAN</Text>
        <Text style={s.skText}>1. Rehlatours Indonesia tidak bertanggung jawab atas kerugian yang disebabkan oleh force majeure, perubahan kebijakan pemerintah RI/Arab Saudi, pembatalan maskapai, penolakan visa, atau kelalaian jamaah sendiri.</Text>
        <Text style={s.skText}>2. Rehlatours bertanggung jawab penuh atas layanan yang tertera dalam paket dan invoice resmi.</Text>
        <Text style={s.skText}>3. Setiap kehilangan barang bawaan pribadi selama perjalanan bukan merupakan tanggung jawab Rehlatours.</Text>

        <Text style={s.skSection}>H. KEPATUHAN & TATA TERTIB</Text>
        <Text style={s.skText}>1. Jamaah wajib mematuhi seluruh instruksi dari pembimbing, mutawwif, dan petugas Rehlatours selama perjalanan.</Text>
        <Text style={s.skText}>2. Jamaah dilarang membawa barang-barang yang dilarang oleh peraturan penerbangan, kepabeanan Indonesia, maupun Arab Saudi.</Text>
        <Text style={s.skText}>3. Jamaah yang melanggar aturan atau mengganggu ketertiban rombongan dapat dikenakan tindakan tegas termasuk pemulangan lebih awal dengan biaya ditanggung sendiri.</Text>
        <Text style={s.skText}>4. Setiap perselisihan diselesaikan secara musyawarah. Apabila tidak tercapai kesepakatan, melalui jalur hukum yang berlaku di Indonesia.</Text>

        <Text style={s.skSection}>I. PERLINDUNGAN DATA PRIBADI</Text>
        <Text style={s.skText}>1. Data pribadi jamaah digunakan semata-mata untuk keperluan administrasi perjalanan ibadah.</Text>
        <Text style={s.skText}>2. Rehlatours berkomitmen menjaga kerahasiaan data sesuai UU No. 27 Tahun 2022 tentang PDP.</Text>
        <Text style={s.skText}>3. Data jamaah tidak akan disebarluaskan kepada pihak ketiga tanpa izin, kecuali untuk pemrosesan visa, hotel, dan maskapai.</Text>

        <Text style={s.skSection}>J. PERSETUJUAN</Text>
        <Text style={s.skParagraph}>Dengan menyelesaikan proses pendaftaran, jamaah dinyatakan telah:</Text>
        <Text style={s.skText}>1. Membaca dan memahami seluruh Syarat & Ketentuan ini.</Text>
        <Text style={s.skText}>2. Menyetujui semua ketentuan yang berlaku.</Text>
        <Text style={s.skText}>3. Memberikan kuasa kepada Rehlatours Indonesia untuk memproses seluruh dokumen perjalanan ibadah.</Text>

        {/* Signature area */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
          <View style={{ width: '45%', alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: '#555', fontWeight: 'bold' }}>Calon Jamaah,</Text>
            <View style={{ height: 50 }} />
            <Text style={{ fontSize: 9, color: BRAND_COLOR, fontWeight: 'bold', borderTop: `1px solid ${BRAND_COLOR}`, paddingTop: 4 }}>{data.fullName}</Text>
          </View>
          <View style={{ width: '45%', alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: '#555', fontWeight: 'bold' }}>Rehla Indonesia,</Text>
            <View style={{ height: 50 }} />
            <Text style={{ fontSize: 9, color: BRAND_COLOR, fontWeight: 'bold', borderTop: `1px solid ${BRAND_COLOR}`, paddingTop: 4 }}>Management</Text>
          </View>
        </View>

        <Text style={s.footer}>
          Rehla Indonesia • PPIU SK No. 498/2017 • www.rehlatours.id • Halaman 3
        </Text>
      </Page>
    </Document>
  );
}
