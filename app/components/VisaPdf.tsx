import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// 1. Export Type (Wajib ada kata 'export')
export type VisaData = {
  customerName: string;
  customerPassport: string;
  provider: string;
  visaType: string;
  entryType: string;
  duration: string;
  processingTime: string;
  paxQuantity: number;
  price: number;
  currency: string;
  notes: string;
};

// Styles
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 12 },
  header: { marginBottom: 20, borderBottom: '2px solid #3a0519', paddingBottom: 10 },
  title: { fontSize: 24, color: '#3a0519', fontWeight: 'bold' },
  section: { marginBottom: 15, padding: 10, backgroundColor: '#fcfcfc', border: '1px solid #eee' },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: '40%', fontSize: 10, color: '#888' },
  value: { width: '60%', fontSize: 10, fontWeight: 'bold' },
  total: { marginTop: 10, padding: 10, backgroundColor: '#fdf8e8', fontWeight: 'bold', textAlign: 'right' }
});

// 2. Export Component (Wajib ada kata 'export')
export const VisaPdfDocument = ({ data }: { data: VisaData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}><Text style={styles.title}>VISA QUOTATION</Text></View>
      
      <View style={styles.section}>
        <View style={styles.row}><Text style={styles.label}>Nama:</Text><Text style={styles.value}>{data.customerName}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Paspor:</Text><Text style={styles.value}>{data.customerPassport}</Text></View>
      </View>

      <View style={styles.section}>
        <View style={styles.row}><Text style={styles.label}>Visa:</Text><Text style={styles.value}>{data.visaType}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Durasi:</Text><Text style={styles.value}>{data.duration} Hari</Text></View>
        <View style={styles.row}><Text style={styles.label}>Provider:</Text><Text style={styles.value}>{data.provider}</Text></View>
      </View>

      <View style={styles.total}>
        <Text>Total Estimasi: {data.currency} {(data.price * data.paxQuantity).toLocaleString()}</Text>
      </View>
    </Page>
  </Document>
);