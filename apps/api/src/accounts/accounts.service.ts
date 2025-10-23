import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateAccountInput } from '@pwr/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, input: CreateAccountInput) {
    // Verificar se já existe uma conta com o mesmo nome para o usuário
    const existing = await this.prisma.account.findFirst({
      where: {
        userId,
        name: input.name.trim(),
      },
    });

    if (existing) {
      throw new ConflictException('Já existe uma conta com esse nome');
    }

    // Validar valor inicial
    if (input.openingBalance < 0) {
      throw new BadRequestException('O saldo inicial não pode ser negativo');
    }

    return this.prisma.account.create({
      data: {
        userId,
        name: input.name.trim(),
        type: input.type,
        openingBalance: input.openingBalance,
        currency: input.currency || 'BRL',
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            transactions: true,
            cards: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
      include: {
        cards: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    return account;
  }

  async update(userId: string, id: string, input: Partial<CreateAccountInput>) {
    const existing = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Conta não encontrada');
    }

    // Se está alterando o nome, verificar se não há conflito
    if (input.name && input.name.trim() !== existing.name) {
      const duplicate = await this.prisma.account.findFirst({
        where: {
          userId,
          name: input.name.trim(),
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException('Já existe uma conta com esse nome');
      }
    }

    // Validar saldo inicial se fornecido
    if (input.openingBalance !== undefined && input.openingBalance < 0) {
      throw new BadRequestException('O saldo inicial não pode ser negativo');
    }

    return this.prisma.account.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name.trim() }),
        ...(input.type && { type: input.type }),
        ...(input.openingBalance !== undefined && { openingBalance: input.openingBalance }),
        ...(input.currency && { currency: input.currency }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.account.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            transactions: true,
            cards: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Conta não encontrada');
    }

    // Verificar se a conta tem transações ou cartões associados
    if (existing._count.transactions > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma conta com transações associadas. Exclua as transações primeiro.',
      );
    }

    if (existing._count.cards > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma conta com cartões associados. Remova ou transfira os cartões primeiro.',
      );
    }

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
