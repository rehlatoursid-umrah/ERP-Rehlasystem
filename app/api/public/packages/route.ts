"use server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Public API: Get active packages for customer booking form
export async function GET() {
  try {
    const packages = await db.package.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        description: true,
        priceQuad: true,
        priceTriple: true,
        priceDouble: true,
        priceSingle: true,
        priceOriginal: true,
        currency: true,
        durationDays: true,
        durationNights: true,
        includes: true,
        excludes: true,
        hotelMakkah: true,
        hotelMadinah: true,
        airline: true,
        coverImage: true,
        badge: true,
        highlights: true,
        rating: true,
        reviewCount: true,
        isPopular: true,
        isBestSeller: true,
        groupSizeMin: true,
        groupSizeMax: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, packages }, { headers: corsHeaders });
  } catch (error) {
    console.error('Public packages API error:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat data paket' }, { status: 500, headers: corsHeaders });
  }
}
