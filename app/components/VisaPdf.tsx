import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Style untuk PDF (Mirip CSS tapi khusus PDF)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  companyName: { fontSize: 18, fontWeight: 'bold', color: '#B49348' },
  title: { fontSize: 16, marginTop: 20, marginBottom: 10, textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold' },
  table: { width: 'auto', borderWidth: 1, borderColor: '#eee', marginTop: 10 },
  tableRow: { margin: 'auto', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', minHeight: 25, alignItems: 'center' },
  tableHeader: { backgroundColor: '#f9f9f9', fontWeight: 'bold' },
  tableColLabel: { width: '40%', borderRightWidth: 1, borderRightColor: '#eee', padding: 5 },
  tableColValue: { width: '60%', padding: 5 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#888', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }
});

export interface VisaData {
  customerName: string;
  visaType: string;
  duration: string;
  price: string;
  currency: string;
  notes: string;
}

export const VisaPdfDocument = ({ data }: { data: VisaData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View><Text style={{fontSize: 20, fontWeight:'bold'}}>TRAVEL UMRAH</Text></View>
        <View style={{textAlign: 'right'}}>
          <Text style={styles.companyName}>TRAVEL REHLA SYSTEM</Text>
          <Text>PPIU No: 123/2026</Text>
        </View>
      </View>

      <Text style={styles.title}>Quotation Visa</Text>

      {/* TABEL DATA */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={[styles.tableColLabel, styles.tableHeader]}><Text>Nama Customer</Text></View>
          <View style={styles.tableColValue}><Text>{data.customerName}</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={[styles.tableColLabel, styles.tableHeader]}><Text>Jenis Visa</Text></View>
          <View style={styles.tableColValue}><Text>{data.visaType}</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={[styles.tableColLabel, styles.tableHeader]}><Text>Durasi</Text></View>
          <View style={styles.tableColValue}><Text>{data.duration} Hari</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={[styles.tableColLabel, styles.tableHeader]}><Text>Harga</Text></View>
          <View style={styles.tableColValue}>
            <Text style={{fontWeight: 'bold'}}>{data.currency} {data.price}</Text>
          </View>
        </View>
      </View>

      <View style={{marginTop: 20, padding: 10, backgroundColor: '#f5f5f5'}}>
        <Text style={{fontWeight: 'bold'}}>Catatan:</Text>
        <Text>{data.notes}</Text>
      </View>

      <View style={styles.footer}>
        <Text>Generated System by Travel Admin - {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);
