import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

import { packagesData, itineraryData, reviewsData } from './Official-Website-Rehlatours.id/src/data/packages';

async function main() {
  console.log('🔄 Memulai sinkronisasi data website ke ERP...');

  const itineraryJson = JSON.stringify(itineraryData);
  const reviewsJson = JSON.stringify(reviewsData);

  for (const slug of Object.keys(packagesData)) {
    const pkg = packagesData[slug];
    
    // Convert Type
    let erpType = 'REGULAR';
    if (pkg.type === 'ekonomi') erpType = 'ECONOMY';
    if (pkg.type === 'premium') erpType = 'PREMIUM';
    if (pkg.type === 'vip' || pkg.type === 'executive') erpType = 'VIP';

    let hotelMakkahDesc = '';
    let hotelMadinahDesc = '';
    let flightDesc = '';
    let busDesc = '';
    
    if (pkg.type === 'vip') {
      hotelMakkahDesc = 'Hotel mewah 5 bintang dengan suite room';
      hotelMadinahDesc = 'Hotel mewah dekat Masjid Nabawi';
      flightDesc = 'First class flight';
      busDesc = 'Luxury private car';
    } else if (pkg.type === 'premium') {
      hotelMakkahDesc = 'Hotel bintang 5 dengan view Haram';
      hotelMadinahDesc = 'Hotel bintang 5 premium';
      flightDesc = 'Business class flight';
      busDesc = 'Private bus AC';
    } else if (pkg.type === 'reguler') {
      hotelMakkahDesc = 'Hotel bintang 4 lokasi strategis';
      hotelMadinahDesc = 'Hotel bintang 4 nyaman';
      flightDesc = 'Economy class flight dengan maskapai terpercaya';
      busDesc = 'Bus VIP AC';
    } else {
      hotelMakkahDesc = 'Hotel bintang 3 dekat Masjidil Haram';
      hotelMadinahDesc = 'Hotel bintang 3 dekat Masjid Nabawi';
      flightDesc = 'Economy class flight dengan maskapai terpercaya';
      busDesc = 'Bus AC yang nyaman';
    }

    const includesString = pkg.features.filter(f => f.included).map(f => f.name).join('\n');
    const excludesString = pkg.features.filter(f => !f.included).map(f => f.name).join('\n');

    const updateData = {
      name: pkg.name,
      type: erpType,
      description: pkg.description,
      priceQuad: pkg.price.discounted || pkg.price.original,
      priceOriginal: pkg.price.original,
      currency: pkg.price.currency,
      durationDays: pkg.duration,
      durationNights: pkg.duration - 2, // approximation
      badge: pkg.badge || null,
      coverImage: pkg.image,
      highlights: pkg.highlights.join('\n'),
      includes: includesString,
      excludes: excludesString,
      meals: pkg.included.meals,
      transportation: pkg.included.transportation,
      guidance: pkg.included.guidance,
      documentation: pkg.included.documentation,
      hotelMakkahDesc,
      hotelMadinahDesc,
      flightDesc,
      busDesc,
      itinerary: itineraryJson,
      reviews: reviewsJson,
      rating: pkg.rating,
      reviewCount: pkg.reviewCount,
      isPopular: pkg.isPopular || false,
      isBestSeller: pkg.isBestSeller || false,
      groupSizeMin: pkg.groupSize.min,
      groupSizeMax: pkg.groupSize.max,
    };

    console.log(`Updating package: ${slug}`);

    // Update existing or skip
    const existing = await db.package.findUnique({ where: { slug } });
    if (existing) {
      await db.package.update({
        where: { slug },
        data: updateData
      });
      console.log(`✅ Updated: ${pkg.name}`);
    } else {
      await db.package.create({
        data: {
          slug,
          ...updateData
        }
      });
      console.log(`✅ Created: ${pkg.name}`);
    }
  }

  console.log('🎉 Sinkronisasi selesai!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
