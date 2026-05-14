import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/db'

// GET all testimonials (admin)
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, testimonials })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 })
  }
}

// POST create new testimonial
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, location, rating, content, avatarUrl, packageName, isActive, sortOrder } = body

    if (!name || !location || !content) {
      return NextResponse.json({ success: false, error: 'Nama, lokasi, dan konten wajib diisi' }, { status: 400 })
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        location,
        rating: rating || 5,
        content,
        avatarUrl: avatarUrl || null,
        packageName: packageName || null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json({ success: true, testimonial })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 })
  }
}
