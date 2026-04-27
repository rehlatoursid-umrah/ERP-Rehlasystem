// ============================================
// DATABASE SEED SCRIPT
// Run: node prisma/seed.js
// ============================================

const { PrismaClient } = require('../node_modules/.prisma/client/index.js');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const adapter = new PrismaBetterSqlite3({
  url: path.resolve(__dirname, '..', 'dev.db'),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Default Admin User
  const hashedPassword = await bcrypt.hash('rehla123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rehlatours.id' },
    update: {},
    create: {
      email: 'admin@rehlatours.id',
      name: 'Admin Rehla',
      password: hashedPassword,
      role: 'SUPERADMIN',
      phone: '6283197321658',
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // 2. Create Default CashFlow Categories
  const categories = [
    // PENDAPATAN (Revenue)
    { name: 'Pendaftaran Umrah', type: 'INCOME', isDefault: true },
    { name: 'DP Jamaah', type: 'INCOME', isDefault: true },
    { name: 'Pelunasan Jamaah', type: 'INCOME', isDefault: true },
    { name: 'Upgrade Paket', type: 'INCOME', isDefault: false },
    { name: 'Komisi Agen', type: 'INCOME', isDefault: false },
    { name: 'Pendapatan Lainnya', type: 'INCOME', isDefault: false },
    // HPP / COGS (Harga Pokok Penjualan)
    { name: 'Tiket Pesawat', type: 'EXPENSE', isDefault: true },
    { name: 'Hotel Makkah & Madinah', type: 'EXPENSE', isDefault: true },
    { name: 'Visa & Dokumen', type: 'EXPENSE', isDefault: true },
    { name: 'Transportasi Darat', type: 'EXPENSE', isDefault: true },
    { name: 'Handling & Muthowwif', type: 'EXPENSE', isDefault: true },
    { name: 'Konsumsi / Katering', type: 'EXPENSE', isDefault: false },
    { name: 'Perlengkapan Jamaah', type: 'EXPENSE', isDefault: false },
    // BIAYA OPERASIONAL (OpEx)
    { name: 'Gaji Karyawan', type: 'EXPENSE', isDefault: false },
    { name: 'Sewa Kantor', type: 'EXPENSE', isDefault: false },
    { name: 'Listrik, Air, Internet', type: 'EXPENSE', isDefault: false },
    { name: 'Marketing & Iklan', type: 'EXPENSE', isDefault: false },
    { name: 'Perlengkapan Kantor', type: 'EXPENSE', isDefault: false },
    { name: 'Biaya Perjalanan Dinas', type: 'EXPENSE', isDefault: false },
    { name: 'Biaya Administrasi', type: 'EXPENSE', isDefault: false },
    { name: 'Operasional Lainnya', type: 'EXPENSE', isDefault: false },
  ];

  for (const cat of categories) {
    await prisma.cashFlowCategory.create({ data: cat });
  }
  console.log(`✅ ${categories.length} cash flow categories created`);

  // 3. Create Default Settings
  const settings = [
    { key: 'company_name', value: 'REHLA INDONESIA', group: 'branding' },
    { key: 'company_tagline', value: 'PPIU SK No. 03010220049160002', group: 'branding' },
    { key: 'company_address', value: 'Komplek Permata Biru Bandung Jawa Barat', group: 'branding' },
    { key: 'company_phone', value: '6283197321658', group: 'branding' },
    { key: 'company_website', value: 'rehlatours.id', group: 'branding' },
    { key: 'markup_percent', value: '20', group: 'finance' },
    { key: 'default_currency', value: 'IDR', group: 'finance' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`✅ ${settings.length} settings created`);

  console.log('\n🎉 Seed completed!');
  console.log('📧 Login: admin@rehlatours.id');
  console.log('🔑 Password: rehla123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
