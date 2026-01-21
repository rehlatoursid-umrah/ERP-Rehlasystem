import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// --- 1. STYLING (CSS Khusus PDF) ---
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333', lineHeight: 1.5 },
  
  // Header Section
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#d4af37', paddingBottom: 10 },
  logoText: { fontSize: 24, fontWeight: 'bold', color: '#d4af37' }, // Warna Emas
  companyInfo: { textAlign: 'right', fontSize: 9, color: '#666' },
  
  // Title & Reference
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, backgroundColor: '#f8f9fa', padding: 10, borderRadius: 4 },
  docTitle: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  refText: { fontSize: 10, fontWeight: 'bold' },

  // Grid Layout (2 Kolom Info)
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  column: { width: '48%' },
  sectionHeader: { fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#d4af37', borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowLabel: { fontSize: 9, color: '#888' },
  rowValue: { fontSize: 10, fontWeight: 'bold', marginBottom: 6 },

  // Table Pricing
  table: { width: 'auto', borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
  tableHead: { flexDirection: 'row', backgroundColor: '#d4af37', color: '#fff', padding: 8, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', padding: 8 },
  colDesc: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '35%', textAlign: 'right' },

  // Total Section
  totalContainer: { alignItems: 'flex-end', marginBottom: 20 },
  totalLabel: { fontSize: 10, color: '#888' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#d4af37' },

  // Footer / Terms Box
  termsBox: { padding: 10, backgroundColor: '#fdfdfd', borderWidth: 1, borderColor: '#eee', borderRadius: 4 },
  termTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  termText: { fontSize: 9, color: '#555', marginBottom: 2 },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#aaa', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }
});

// --- 2. STRUKTUR DATA (Interface) ---
export interface VisaData {
  refNumber: string;
  customerName: string;
  passportNo: string;
  visaType: string;
  provider: string;       // Kolom Provider / Muassasah
  entryType: string;
  processingTime: string;
  validity: string;
  pax: number;
  price: number;
  currency: string;
  requirements: string;
  notes: string;
}

// Helper: Format Uang (Rp 1.000.000 / $ 100)
const formatCurrency = (amount: number, currency: string) => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

// --- 3. DOKUMEN PDF ---
export const VisaPdfDocument = ({ data }: { data: VisaData }) => {
  const totalPrice = data.price * data.pax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View><Text style={styles.logoText}>TRAVEL REHLA</Text></View>
          <View style={styles.companyInfo}>
            <Text>PPIU SK No. 123/2026</Text>
            <Text>Jl. Menuju Baitullah No. 1, Jakarta</Text>
            <Text>support@travelrehla.com</Text>
          </View>
        </View>

        {/* TITLE & REF */}
        <View style={styles.metaContainer}>
          <Text style={styles.docTitle}>Quotation Visa</Text>
          <Text style={styles.refText}>Ref: {data.refNumber}</Text>
        </View>

        {/* 2 COLUMN INFO GRID */}
        <View style={styles.gridContainer}>
          {/* Kiri: Data Client */}
          <View style={styles.column}>
            <Text style={styles.sectionHeader}>Informasi Klien</Text>
            <Text style={styles.rowLabel}>Nama Jemaah / Group:</Text>
            <Text style={styles.rowValue}>{data.customerName}</Text>
            
            <Text style={styles.rowLabel}>No. Paspor / ID:</Text>
            <Text style={styles.rowValue}>{data.passportNo || '-'}</Text>
          </View>

          {/* Kanan: Data Visa */}
          <View style={styles.column}>
            <Text style={styles.sectionHeader}>Spesifikasi Visa</Text>
            <Text style={styles.rowLabel}>Jenis & Entry:</Text>
            <Text style={styles.rowValue}>{data.visaType} ({data.entryType})</Text>

            <Text style={styles.rowLabel}>Provider / Muassasah:</Text>
            <Text style={styles.rowValue}>{data.provider || 'All Provider'}</Text>

            <Text style={styles.rowLabel}>Masa Berlaku & Proses:</Text>
            <Text style={styles.rowValue}>{data.validity} Hari | Proses {data.processingTime}</Text>
          </View>
        </View>

        {/* TABEL RINCIAN HARGA */}
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={styles.colDesc}>Deskripsi Layanan</Text>
            <Text style={styles.colQty}>Pax</Text>
            <Text style={styles.colPrice}>Harga Satuan</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>
              Biaya Visa {data.visaType} & Processing
              {'\n'}
              <Text style={{fontSize: 8, color: '#888'}}>Include: Gov Fee, Tasheel, Insurance & Handling Fee.</Text>
            </Text>
            <Text style={styles.colQty}>{data.pax}</Text>
            <Text style={styles.colPrice}>{formatCurrency(data.price, data.currency)}</Text>
          </View>
        </View>

        {/* GRAND TOTAL */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Estimasi Biaya</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalPrice, data.currency)}</Text>
        </View>

        {/* LIST DOKUMEN FISIK & NOTES */}
        <View style={styles.termsBox}>
          <Text style={styles.termTitle}>Checklist Dokumen Fisik (Wajib Dikirim):</Text>
          <Text style={styles.termText}>{data.requirements}</Text>
          
          <Text style={[styles.termTitle, { marginTop: 10 }]}>Catatan Penting:</Text>
          <Text style={styles.termText}>{data.notes}</Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Generated by System - Harga dapat berubah sewaktu-waktu mengikuti kurs dan regulasi KSA.</Text>
        </View>

      </Page>
    </Document>
  );
};