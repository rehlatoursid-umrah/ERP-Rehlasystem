// Seed script: Import all website packages into ERP database
// Run: node prisma/seed-packages.js

require('dotenv').config();
const { PrismaClient } = require('../node_modules/.prisma/client/index.js');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const packages = [
  {
    name: 'Umrah Subsidi Uang Saku',
    slug: 'ekonomi-9-hari',
    type: 'REGULAR',
    status: 'ACTIVE',
    description: 'Paket umrah 7 malam 6 hari dengan subsidi uang saku Rp 4.000.000 per jamaah. Standar PPIU Kemenag, bimbingan mutawwif berpengalaman, dan ziarah ke tempat-tempat bersejarah di Makkah dan Madinah.',
    priceQuad: 27000000, priceTriple: 29000000, priceDouble: 31000000, priceSingle: 35000000,
    priceOriginal: 28000000,
    durationDays: 9, durationNights: 7,
    hotelMakkah: 'Hotel Bintang 4 / Setaraf', hotelMadinah: 'Hotel Bintang 4 / Setaraf',
    airline: null,
    coverImage: '/subsidi.jpg',
    badge: 'Hemat',
    highlights: 'Hotel dekat Masjidil Haram (walking distance)\nMakan 3x sehari buffet halal berkualitas\nBimbingan manasik lengkap sebelum keberangkatan\nTransportasi AC yang nyaman selama di Arab Saudi\nGrup maksimal 45 orang untuk pengalaman yang lebih personal\nVisa umroh dan asuransi perjalanan basic',
    includes: 'Tiket pesawat PP & visa Saudi\nMakan 3x sehari (buffet halal)\nTransfer bandara + city tour Makkah & Madinah\nMutawwif / mutawwifah, panduan & manasik online\nVisa umroh, Asuransi Perjalanan\nPakaian pengenal, kain Ihram, tanda pengenal, Buku doa, Air zam-zam 5L',
    rating: 4.5, reviewCount: 89,
    isPopular: true, isBestSeller: false,
    groupSizeMin: 15, groupSizeMax: 45,
  },
  {
    name: 'Umrah Plus Mesir',
    slug: 'reguler-12-hari',
    type: 'REGULAR',
    status: 'ACTIVE',
    description: 'Paket umroh lengkap dengan fasilitas terbaik dan city tour yang menarik. Ideal untuk jamaah yang menginginkan pengalaman spiritual yang berkesan dengan kenyamanan maksimal.',
    priceQuad: 23500000, priceTriple: 25500000, priceDouble: 28000000, priceSingle: 33000000,
    priceOriginal: 25500000,
    durationDays: 12, durationNights: 10,
    hotelMakkah: 'Hotel Bintang 4 dekat Masjidil Haram', hotelMadinah: 'Hotel Bintang 4 dekat Masjid Nabawi',
    airline: null,
    coverImage: '/umrahmesir.jpg',
    badge: 'Terpopuler',
    highlights: 'Hotel bintang 4 lokasi strategis dekat Masjidil Haram\nCity tour Madinah & Makkah dengan guide berpengalaman\nGrup maksimal 35 orang untuk pelayanan personal\nFree upgrade kamar (subject to availability)\nAsuransi perjalanan comprehensive\nBimbingan manasik lengkap sebelum keberangkatan',
    includes: 'Hotel bintang 4 dekat Masjidil Haram & Masjid Nabawi\nMakan 3x sehari + snack sore (buffet halal)\nBus VIP AC, pesawat ekonomi class\nPembimbing senior & ceramah harian\nVisa umroh, asuransi perjalanan\nTas koper premium, Mukena/sarung, Air zam-zam 10L, City tour',
    rating: 4.8, reviewCount: 156,
    isPopular: false, isBestSeller: true,
    groupSizeMin: 25, groupSizeMax: 35,
  },
  {
    name: 'Umroh Premium Exclusive',
    slug: 'premium-14-hari',
    type: 'VIP',
    status: 'ACTIVE',
    description: 'Pengalaman umroh mewah dengan hotel bintang 5 dan fasilitas premium. Nikmati kenyamanan ekstra dengan pelayanan VIP dan akses eksklusif.',
    priceQuad: 32000000, priceTriple: 35000000, priceDouble: 38000000, priceSingle: 44000000,
    priceOriginal: 35000000,
    durationDays: 14, durationNights: 12,
    hotelMakkah: 'Hotel Bintang 5 Premium View Haram', hotelMadinah: 'Hotel Bintang 5 Premium',
    airline: null,
    coverImage: null,
    badge: 'Premium',
    highlights: 'Hotel bintang 5 premium view Masjidil Haram\nPrivate transportation untuk kenyamanan maksimal\nExclusive dining experience dengan menu pilihan\nPersonal assistant selama perjalanan\nSpa dan wellness treatment\nShopping tour dengan personal shopper',
    includes: 'Hotel bintang 5 premium view Haram\nFine dining 3x sehari + afternoon tea\nPrivate bus, business class flight\nUstadz senior & spiritual counselor\nFast track visa, premium insurance\nLuggage premium set, Prayer kit deluxe, Air zam-zam 20L, Spa treatment',
    rating: 4.9, reviewCount: 73,
    isPopular: true, isBestSeller: false,
    groupSizeMin: 15, groupSizeMax: 25,
  },
  {
    name: 'Umrah Plus Turki',
    slug: 'premium-14-hari-turki',
    type: 'VIP',
    status: 'ACTIVE',
    description: 'Paket umroh + Turki dengan fasilitas premium. Cocok untuk jamaah yang ingin ibadah sekaligus wisata sejarah Turki.',
    priceQuad: 32000000, priceTriple: 35000000, priceDouble: 38000000, priceSingle: 44000000,
    priceOriginal: 35000000,
    durationDays: 14, durationNights: 12,
    hotelMakkah: 'Hotel nyaman & lokasi strategis', hotelMadinah: 'Hotel nyaman & lokasi strategis',
    airline: null,
    coverImage: '/umrahturki.jpg',
    badge: 'Premium',
    highlights: 'Hotel nyaman & lokasi strategis\nProgram umroh lengkap (Makkah & Madinah)\nItinerary Turki (Istanbul dan sekitarnya)\nGrup kecil untuk pelayanan lebih personal\nPembimbing ibadah & tour leader berpengalaman\nDokumentasi dan pendampingan perjalanan',
    includes: 'Hotel selama umroh & Turki (sesuai program)\nMakan sesuai program\nTransportasi program (bus) + penerbangan sesuai itinerary\nPembimbing ibadah + tour leader\nVisa umroh & asuransi\nAir zam-zam, Perlengkapan (sesuai program)',
    rating: 4.9, reviewCount: 18,
    isPopular: true, isBestSeller: false,
    groupSizeMin: 15, groupSizeMax: 25,
  },
  {
    name: 'Umroh VIP Deluxe',
    slug: 'vip-16-hari',
    type: 'VVIP',
    status: 'ACTIVE',
    description: 'Paket umroh paling eksklusif dengan layanan VIP dan fasilitas terlengkap. Pengalaman spiritual yang tak terlupakan dengan kemewahan yang luar biasa.',
    priceQuad: 45000000, priceTriple: 48000000, priceDouble: 52000000, priceSingle: 60000000,
    priceOriginal: 48000000,
    durationDays: 16, durationNights: 14,
    hotelMakkah: 'Hotel Mewah Suite Room View Haram', hotelMadinah: 'Hotel Mewah Suite Room',
    airline: 'First Class',
    coverImage: null,
    badge: 'VIP',
    highlights: 'Hotel mewah dengan suite room dan balkon view Haram\nFirst class flight experience untuk kenyamanan perjalanan\nPrivate guide & driver personal sepanjang perjalanan\nAkses VIP ke area khusus di Masjidil Haram\nPersonal shopper untuk kebutuhan shopping\nHelicopter tour untuk pengalaman tak terlupakan',
    includes: 'Hotel mewah suite room dengan balkon view Haram\nFine dining & private chef service\nFirst class flight, luxury private car\nExclusive ustadz & spiritual mentor\nVIP visa processing, comprehensive insurance\nDesigner luggage set, Gold prayer accessories, Air zam-zam 50L, Personal shopper',
    rating: 5.0, reviewCount: 42,
    isPopular: false, isBestSeller: false,
    groupSizeMin: 8, groupSizeMax: 15,
  },
];

async function main() {
  console.log('🌱 Seeding packages to ERP database...\n');

  for (const pkg of packages) {
    // Check if slug already exists
    const existing = await db.package.findUnique({ where: { slug: pkg.slug } });
    if (existing) {
      console.log(`⏭️  Skip: "${pkg.name}" (slug "${pkg.slug}" sudah ada)`);
      continue;
    }

    await db.package.create({ data: pkg });
    console.log(`✅ Created: "${pkg.name}" (${pkg.type}, ${pkg.status})`);
  }

  console.log('\n🎉 Seed selesai!');
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => db.$disconnect());
