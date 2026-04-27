// ============================================
// ACCOUNTING CONSTANTS & TYPES
// Travel Umrah Agency - Chart of Accounts
// ============================================

// Klasifikasi akun berdasarkan tipe travel umrah
export const ACCOUNT_CLASSES = {
  REVENUE: {
    label: 'Pendapatan',
    color: 'green',
    accounts: [
      'Pendaftaran Umrah',
      'DP Jamaah',
      'Pelunasan Jamaah',
      'Upgrade Paket',
      'Komisi Agen',
      'Pendapatan Lainnya',
    ],
  },
  COGS: {
    label: 'Harga Pokok Penjualan (HPP)',
    color: 'orange',
    accounts: [
      'Tiket Pesawat',
      'Hotel Makkah & Madinah',
      'Visa & Dokumen',
      'Transportasi Darat',
      'Handling & Muthowwif',
      'Konsumsi / Katering',
      'Perlengkapan Jamaah',
    ],
  },
  OPEX: {
    label: 'Biaya Operasional',
    color: 'red',
    accounts: [
      'Gaji Karyawan',
      'Sewa Kantor',
      'Listrik, Air, Internet',
      'Marketing & Iklan',
      'Perlengkapan Kantor',
      'Biaya Perjalanan Dinas',
      'Biaya Administrasi',
      'Operasional Lainnya',
    ],
  },
};

export type MonthlyBreakdown = {
  month: number;
  monthLabel: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  netProfit: number;
  revenueDetails: Record<string, number>;
  cogsDetails: Record<string, number>;
  opexDetails: Record<string, number>;
  transactionCount: number;
};

export type AnnualReport = {
  year: number;
  months: MonthlyBreakdown[];
  totalRevenue: number;
  totalCogs: number;
  totalGrossProfit: number;
  totalOpex: number;
  totalNetProfit: number;
  grossMarginPct: number;
  netMarginPct: number;
  revenueTotals: Record<string, number>;
  cogsTotals: Record<string, number>;
  opexTotals: Record<string, number>;
};
