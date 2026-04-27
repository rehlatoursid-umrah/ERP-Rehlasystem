"use server";

import { db } from '@/app/lib/db';

export async function getDashboardStats() {
  // Count totals
  const totalCustomers = await db.customer.count();
  const totalBookings = await db.booking.count();
  const totalQuotations = await db.quotation.count();

  // Financial overview
  const allCashFlows = await db.cashFlow.findMany();
  const totalIncome = allCashFlows.filter(f => f.type === 'INCOME').reduce((s, f) => s + f.amount, 0);
  const totalExpense = allCashFlows.filter(f => f.type === 'EXPENSE').reduce((s, f) => s + f.amount, 0);
  const balance = totalIncome - totalExpense;

  // Pending payments
  const pendingBookings = await db.booking.count({
    where: { status: { in: ['PENDING', 'DP_PAID'] } }
  });

  // Recent customers
  const recentCustomers = await db.customer.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, fullName: true, city: true, phone: true, createdAt: true }
  });

  // Recent cash flows
  const recentCashFlows = await db.cashFlow.findMany({
    orderBy: { transactionDate: 'desc' },
    take: 5,
    include: { category: { select: { name: true } } }
  });

  // Passport expiry alerts (within next 6 months)
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  const expiringPassports = await db.customer.findMany({
    where: {
      passportExpiry: {
        not: null,
        lte: sixMonthsFromNow
      }
    },
    select: { id: true, fullName: true, passportExpiry: true, passportNumber: true },
    orderBy: { passportExpiry: 'asc' },
    take: 5
  });

  // Monthly cashflow for chart (last 6 months)
  const monthlyData: Record<string, { income: number; expense: number }> = {};
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  allCashFlows
    .filter(f => new Date(f.transactionDate) >= sixMonthsAgo)
    .forEach(f => {
      const key = new Date(f.transactionDate).toLocaleDateString('id-ID', { month: 'short' });
      if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0 };
      if (f.type === 'INCOME') monthlyData[key].income += f.amount;
      else monthlyData[key].expense += f.amount;
    });

  return {
    totalCustomers,
    totalBookings,
    totalQuotations,
    totalIncome,
    totalExpense,
    balance,
    pendingBookings,
    recentCustomers,
    recentCashFlows,
    expiringPassports,
    chartData: Object.entries(monthlyData).map(([month, data]) => ({ month, ...data })),
  };
}
