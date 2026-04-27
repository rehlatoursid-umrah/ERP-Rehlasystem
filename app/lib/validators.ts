import { z } from 'zod';

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

// --- Auth ---
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// --- Customer / Jamaah ---
export const customerSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  nickname: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  nik: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  passportIssued: z.string().optional(),
  bloodType: z.string().optional(),
  healthNotes: z.string().optional(),
  vaccineMeningitis: z.boolean().optional(),
  vaccineDate: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  notes: z.string().optional(),
});

// --- Jamaah inline (for quotation forms) ---
export const jemaahInlineSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  passport: z.string().optional(),
});

// --- Visa Quotation ---
export const visaQuotationSchema = z.object({
  refNumber: z.string(),
  customerWhatsapp: z.string().min(8, 'Nomor WhatsApp wajib diisi'),
  customers: z.array(jemaahInlineSchema).min(1, 'Minimal 1 jamaah'),
  visaType: z.string(),
  entryType: z.string(),
  provider: z.string().optional(),
  duration: z.string(),
  processingTime: z.string(),
  paxQuantity: z.number().int().positive(),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  currency: z.enum(['IDR', 'SAR', 'USD']),
  checklist: z.string().optional(),
  notes: z.string().optional(),
});

// --- Hotel Quotation ---
export const hotelItemSchema = z.object({
  city: z.string(),
  name: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  nights: z.number(),
  mapsUrl: z.string().optional(),
  image1: z.string().optional(),
  image2: z.string().optional(),
});

export const roomItemSchema = z.object({
  type: z.string(),
  qty: z.number().int().positive(),
  pricePerNight: z.number().min(0),
  nights: z.number().int().min(0),
});

export const hotelQuotationSchema = z.object({
  customers: z.array(jemaahInlineSchema).min(1),
  customerWhatsapp: z.string().min(8),
  currency: z.enum(['IDR', 'SAR', 'USD']),
  hotels: z.array(hotelItemSchema).min(1),
  rooms: z.array(roomItemSchema).min(1),
  notes: z.string().optional(),
  snapshotRate: z.number(),
});

// --- Flight ---
export const flightSegmentSchema = z.object({
  airline: z.string(),
  flightNumber: z.string(),
  origin: z.string(),
  destination: z.string(),
  transit: z.string().optional(),
  departTime: z.string(),
  arriveTime: z.string(),
  baggage: z.string(),
  cabinBaggage: z.string(),
  classType: z.string(),
});

export const flightQuotationSchema = z.object({
  customers: z.array(z.object({
    name: z.string().min(1),
    passport: z.string().optional(),
    ticketNumber: z.string().optional(),
  })).min(1),
  customerWhatsapp: z.string().min(8),
  pnrCode: z.string().optional(),
  currency: z.enum(['IDR', 'SAR', 'USD']),
  routes: z.array(flightSegmentSchema).min(1),
  pricing: z.object({
    adultQty: z.number().int().min(0),
    adultPrice: z.number().min(0),
    childQty: z.number().int().min(0),
    childPrice: z.number().min(0),
    infantQty: z.number().int().min(0),
    infantPrice: z.number().min(0),
  }),
  notes: z.string().optional(),
  snapshotRate: z.number(),
});

// --- Booking ---
export const bookingSchema = z.object({
  customerId: z.string().uuid(),
  packageId: z.string().uuid().optional(),
  departureId: z.string().uuid().optional(),
  roomType: z.enum(['QUAD', 'TRIPLE', 'DOUBLE', 'SINGLE']).optional(),
  priceTotal: z.number().min(0),
  currency: z.string().default('IDR'),
  notes: z.string().optional(),
});

// --- Payment ---
export const paymentSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive('Jumlah harus lebih dari 0'),
  currency: z.string().default('IDR'),
  method: z.enum(['TRANSFER', 'CASH', 'CARD', 'QRIS']).optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  referenceNumber: z.string().optional(),
  paidAt: z.string().optional(),
  notes: z.string().optional(),
});

// --- CashFlow ---
export const cashFlowSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().optional(),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  amount: z.number().positive('Jumlah harus positif'),
  currency: z.string().default('IDR'),
  bankName: z.string().optional(),
  referenceNumber: z.string().optional(),
  transactionDate: z.string(),
  notes: z.string().optional(),
});

// --- Supplier ---
export const supplierSchema = z.object({
  name: z.string().min(2, 'Nama supplier wajib diisi'),
  type: z.enum(['HOTEL', 'AIRLINE', 'VISA_PROVIDER', 'TRANSPORT', 'CATERING', 'OTHER']),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  country: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  notes: z.string().optional(),
});

// --- Itinerary ---
export const itineraryDaySchema = z.object({
  date: z.string(),
  city: z.string(),
  activity: z.string(),
  time: z.string(),
  vehicle: z.string(),
  meals: z.object({
    b: z.boolean(),
    l: z.boolean(),
    d: z.boolean(),
  }),
});

export const itinerarySchema = z.object({
  packageName: z.string().min(1, 'Nama paket wajib diisi'),
  programTitle: z.string(),
  programDesc: z.string(),
  coverImage: z.string().optional(),
  guideName: z.string().optional(),
  guideEdu: z.string().optional(),
  guideExp: z.string().optional(),
  guideLang: z.string().optional(),
  guidePhoto: z.string().optional(),
  airline: z.string().optional(),
  flightRoute: z.string().optional(),
  pnr: z.string().optional(),
  departFlight: z.string().optional(),
  departDate: z.string().optional(),
  departTime: z.string().optional(),
  airportOrigin: z.string().optional(),
  arrivalDate: z.string().optional(),
  arrivalTime: z.string().optional(),
  airportDest: z.string().optional(),
  visaProvider: z.string().optional(),
  visaType: z.string().optional(),
  visaDuration: z.string().optional(),
  muassasah: z.string().optional(),
  visaIssueDate: z.string().optional(),
  visaExpiryDate: z.string().optional(),
  hotelMakkah: z.string().optional(),
  hotelMakkahRating: z.string().optional(),
  hotelMakkahLoc: z.string().optional(),
  hotelMakkahImg: z.string().optional(),
  hotelMakkahCheckIn: z.string().optional(),
  hotelMakkahCheckOut: z.string().optional(),
  hotelMadinah: z.string().optional(),
  hotelMadinahRating: z.string().optional(),
  hotelMadinahLoc: z.string().optional(),
  hotelMadinahImg: z.string().optional(),
  hotelMadinahCheckIn: z.string().optional(),
  hotelMadinahCheckOut: z.string().optional(),
  days: z.array(itineraryDaySchema),
  currency: z.string(),
  costFlight: z.number().min(0),
  costHotel: z.number().min(0),
  costVisa: z.number().min(0),
  costHandling: z.number().min(0),
  margin: z.number().min(0),
  includes: z.string().optional(),
  excludes: z.string().optional(),
});

// Type Exports
export type LoginInput = z.infer<typeof loginSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type VisaQuotationInput = z.infer<typeof visaQuotationSchema>;
export type HotelQuotationInput = z.infer<typeof hotelQuotationSchema>;
export type FlightQuotationInput = z.infer<typeof flightQuotationSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type CashFlowInput = z.infer<typeof cashFlowSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type ItineraryInput = z.infer<typeof itinerarySchema>;
