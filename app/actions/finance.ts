"use server";

import { db } from '@/app/lib/db';
import { ACCOUNT_CLASSES } from '@/app/lib/accounting';
import type { AnnualReport } from '@/app/lib/accounting';

// --- GET CASHFLOWS ---
export async function getCashFlows(filters?: {
  type?: string;
  startDate?: string;
  endDate?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.type) where.type = filters.type;
  if (filters?.startDate || filters?.endDate) {
    where.transactionDate = {};
    if (filters?.startDate) (where.transactionDate as Record<string, unknown>).gte = new Date(filters.startDate);
    if (filters?.endDate) (where.transactionDate as Record<string, unknown>).lte = new Date(filters.endDate);
  }

  return db.cashFlow.findMany({
    where,
    include: {
      category: { select: { name: true, type: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { transactionDate: 'desc' },
  });
}

// --- CREATE CASHFLOW ---
export async function createCashFlow(data: {
  type: string;
  categoryId?: string;
  description: string;
  amount: number;
  currency?: string;
  bankName?: string;
  referenceNumber?: string;
  transactionDate: string;
  notes?: string;
}) {
  return db.cashFlow.create({
    data: {
      type: data.type,
      categoryId: data.categoryId || null,
      description: data.description,
      amount: data.amount,
      currency: data.currency || 'IDR',
      bankName: data.bankName || null,
      referenceNumber: data.referenceNumber || null,
      transactionDate: new Date(data.transactionDate),
      notes: data.notes || null,
    }
  });
}

// --- DELETE CASHFLOW ---
export async function deleteCashFlow(id: string) {
  await db.cashFlow.delete({ where: { id } });
  return { success: true };
}

// --- GET CATEGORIES ---
export async function getCashFlowCategories() {
  return db.cashFlowCategory.findMany({ orderBy: { name: 'asc' } });
}

// --- CREATE CATEGORY ---
export async function createCashFlowCategory(data: { name: string; type: string }) {
  return db.cashFlowCategory.create({ data });
}

// ============================================
// LAPORAN KEUANGAN TAHUNAN (12 BULAN)
// ============================================

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

export async function getAnnualReport(year: number): Promise<AnnualReport> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const allFlows = await db.cashFlow.findMany({
    where: { transactionDate: { gte: startDate, lte: endDate } },
    include: { category: { select: { name: true, type: true } } },
    orderBy: { transactionDate: 'asc' },
  });

  // Build lookup: category name → account class
  const categoryClassMap: Record<string, 'REVENUE' | 'COGS' | 'OPEX'> = {};
  for (const [cls, config] of Object.entries(ACCOUNT_CLASSES)) {
    for (const acc of config.accounts) {
      categoryClassMap[acc] = cls as 'REVENUE' | 'COGS' | 'OPEX';
    }
  }

  // Initialize 12 months
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    monthLabel: MONTH_LABELS[i],
    revenue: 0, cogs: 0, grossProfit: 0, opex: 0, netProfit: 0,
    revenueDetails: {} as Record<string, number>,
    cogsDetails: {} as Record<string, number>,
    opexDetails: {} as Record<string, number>,
    transactionCount: 0,
  }));

  const revenueTotals: Record<string, number> = {};
  const cogsTotals: Record<string, number> = {};
  const opexTotals: Record<string, number> = {};

  for (const flow of allFlows) {
    const monthIdx = new Date(flow.transactionDate).getMonth();
    const m = months[monthIdx];
    const catName = flow.category?.name || 'Lainnya';
    const amount = flow.amount;

    m.transactionCount++;

    const accountClass = categoryClassMap[catName];

    if (flow.type === 'INCOME' || accountClass === 'REVENUE') {
      m.revenue += amount;
      m.revenueDetails[catName] = (m.revenueDetails[catName] || 0) + amount;
      revenueTotals[catName] = (revenueTotals[catName] || 0) + amount;
    } else if (accountClass === 'COGS') {
      m.cogs += amount;
      m.cogsDetails[catName] = (m.cogsDetails[catName] || 0) + amount;
      cogsTotals[catName] = (cogsTotals[catName] || 0) + amount;
    } else {
      m.opex += amount;
      m.opexDetails[catName] = (m.opexDetails[catName] || 0) + amount;
      opexTotals[catName] = (opexTotals[catName] || 0) + amount;
    }
  }

  for (const m of months) {
    m.grossProfit = m.revenue - m.cogs;
    m.netProfit = m.grossProfit - m.opex;
  }

  const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
  const totalCogs = months.reduce((s, m) => s + m.cogs, 0);
  const totalGrossProfit = totalRevenue - totalCogs;
  const totalOpex = months.reduce((s, m) => s + m.opex, 0);
  const totalNetProfit = totalGrossProfit - totalOpex;

  return {
    year, months,
    totalRevenue, totalCogs, totalGrossProfit, totalOpex, totalNetProfit,
    grossMarginPct: totalRevenue > 0 ? Math.round((totalGrossProfit / totalRevenue) * 100) : 0,
    netMarginPct: totalRevenue > 0 ? Math.round((totalNetProfit / totalRevenue) * 100) : 0,
    revenueTotals, cogsTotals, opexTotals,
  };
}

// --- GET FINANCE SUMMARY (for dashboard compat) ---
export async function getFinanceSummary() {
  const allFlows = await db.cashFlow.findMany();
  const totalIncome = allFlows.filter(f => f.type === 'INCOME').reduce((s, f) => s + f.amount, 0);
  const totalExpense = allFlows.filter(f => f.type === 'EXPENSE').reduce((s, f) => s + f.amount, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentFlows = allFlows.filter(f => new Date(f.transactionDate) >= sixMonthsAgo);

  const monthlyData: Record<string, { income: number; expense: number }> = {};
  recentFlows.forEach(f => {
    const key = new Date(f.transactionDate).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0 };
    if (f.type === 'INCOME') monthlyData[key].income += f.amount;
    else monthlyData[key].expense += f.amount;
  });

  return {
    totalIncome, totalExpense, balance: totalIncome - totalExpense,
    totalTransactions: allFlows.length,
    monthlyData: Object.entries(monthlyData).map(([month, data]) => ({ month, ...data })),
  };
}
