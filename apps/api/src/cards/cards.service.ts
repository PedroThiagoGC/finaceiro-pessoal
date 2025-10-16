import { Injectable } from '@nestjs/common';
import type { CreateCardInput } from '@pwr/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, input: CreateCardInput) {
    return this.prisma.card.create({
      data: {
        userId,
        accountId: input.accountId || null,
        brand: input.brand,
        nickname: input.nickname,
        creditLimit: input.creditLimit,
        billingDay: input.billingDay,
        dueDay: input.dueDay,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.card.findMany({
      where: { userId },
      include: { account: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.card.findFirst({
      where: { id, userId },
      include: { account: true },
    });
  }

  async update(userId: string, id: string, input: Partial<CreateCardInput>) {
    const existing = await this.findOne(userId, id);
    if (!existing) throw new Error('Cartão não encontrado');

    return this.prisma.card.update({
      where: { id },
      data: input,
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);
    if (!existing) throw new Error('Cartão não encontrado');

    return this.prisma.card.delete({
      where: { id },
    });
  }

  async getInvoice(userId: string, cardId: string, month: string) {
    const card = await this.findOne(userId, cardId);
    if (!card) throw new Error('Cartão não encontrado');

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, card.billingDay);
    const endDate = new Date(year, monthNum, card.billingDay);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        cardId,
        date: {
          gte: startDate,
          lt: endDate,
        },
        flow: 'expense',
      },
      include: { category: true },
    });

    const total = transactions.reduce((acc, tx) => acc + tx.amount, 0);

    return {
      card,
      month,
      transactions,
      total,
      dueDate: new Date(year, monthNum - 1, card.dueDay),
    };
  }
}
