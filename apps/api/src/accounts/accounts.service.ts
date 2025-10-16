import { Injectable } from '@nestjs/common';
import type { CreateAccountInput } from '@pwr/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, input: CreateAccountInput) {
    return this.prisma.account.create({
      data: {
        userId,
        name: input.name,
        type: input.type,
        openingBalance: input.openingBalance,
        currency: input.currency,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.account.findFirst({
      where: { id, userId },
    });
  }

  async update(userId: string, id: string, input: Partial<CreateAccountInput>) {
    const existing = await this.findOne(userId, id);
    if (!existing) throw new Error('Conta não encontrada');

    return this.prisma.account.update({
      where: { id },
      data: input,
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);
    if (!existing) throw new Error('Conta não encontrada');

    return this.prisma.account.delete({
      where: { id },
    });
  }

  async getBalance(userId: string, accountId: string) {
    const account = await this.findOne(userId, accountId);
    if (!account) throw new Error('Conta não encontrada');

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, accountId, reconciled: true },
    });

    const balance = transactions.reduce((acc, tx) => {
      if (tx.flow === 'income') return acc + tx.amount;
      if (tx.flow === 'expense') return acc - tx.amount;
      return acc;
    }, account.openingBalance);

    return { accountId, balance };
  }
}
