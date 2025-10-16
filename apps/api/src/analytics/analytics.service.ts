import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId, reconciled: true };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await this.prisma.transaction.findMany({ where });

    const totalIncome = transactions
      .filter(t => t.flow === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.flow === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalBalance = totalIncome - totalExpense;

    // Check "no vermelho" status
    const isInRed = totalBalance < 0;
    const reasons: string[] = [];
    if (totalBalance < 0) {
      reasons.push('Saldo total negativo');
    }

    return {
      totalIncome,
      totalExpense,
      totalBalance,
      isInRed,
      reasons,
    };
  }

  async getByCategory(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId, reconciled: true };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { category: true },
    });

    const byCategory = new Map<string, { categoryId: string; categoryName: string; expense: number; income: number }>();

    for (const tx of transactions) {
      const key = tx.categoryId;
      if (!byCategory.has(key)) {
        byCategory.set(key, {
          categoryId: tx.categoryId,
          categoryName: tx.category.name,
          expense: 0,
          income: 0,
        });
      }

      const entry = byCategory.get(key)!;
      if (tx.flow === 'expense') entry.expense += tx.amount;
      if (tx.flow === 'income') entry.income += tx.amount;
    }

    return Array.from(byCategory.values());
  }

  async getByCard(userId: string, month?: string) {
    const where: any = { userId, flow: 'expense', cardId: { not: null } };
    
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 1);
      where.date = { gte: startDate, lt: endDate };
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { card: true },
    });

    const byCard = new Map<string, { cardId: string; cardNickname: string; spend: number }>();

    for (const tx of transactions) {
      if (!tx.cardId || !tx.card) continue;
      
      const key = tx.cardId;
      if (!byCard.has(key)) {
        byCard.set(key, {
          cardId: tx.cardId,
          cardNickname: tx.card.nickname,
          spend: 0,
        });
      }

      byCard.get(key)!.spend += tx.amount;
    }

    return Array.from(byCard.values());
  }

  async getCashflow(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        reconciled: true,
        date: { gte: startDate, lt: endDate },
      },
      orderBy: { date: 'asc' },
    });

    const dailyCashflow = new Map<string, { date: string; income: number; expense: number; balance: number }>();

    for (const tx of transactions) {
      const dateKey = tx.date.toISOString().split('T')[0];
      if (!dailyCashflow.has(dateKey)) {
        dailyCashflow.set(dateKey, { date: dateKey, income: 0, expense: 0, balance: 0 });
      }

      const entry = dailyCashflow.get(dateKey)!;
      if (tx.flow === 'income') entry.income += tx.amount;
      if (tx.flow === 'expense') entry.expense += tx.amount;
    }

    const result = Array.from(dailyCashflow.values());
    let runningBalance = 0;
    for (const entry of result) {
      runningBalance += entry.income - entry.expense;
      entry.balance = runningBalance;
    }

    return result;
  }
}
