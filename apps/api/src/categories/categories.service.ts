import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateCategoryInput } from '@pwr/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, input: CreateCategoryInput) {
    // Verificar se já existe uma categoria com o mesmo nome para o usuário
    const existing = await this.prisma.category.findFirst({
      where: {
        userId,
        name: input.name.trim(),
      },
    });

    if (existing) {
      throw new ConflictException('Já existe uma categoria com esse nome');
    }

    // Validar cor (deve ser hexadecimal)
    if (input.color && !/^#[0-9A-Fa-f]{6}$/.test(input.color)) {
      throw new BadRequestException('Cor inválida. Use formato hexadecimal (#RRGGBB)');
    }

    return this.prisma.category.create({
      data: {
        userId,
        name: input.name.trim(),
        type: input.type,
        color: input.color || '#6C5CE7',
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(userId: string, id: string, input: Partial<CreateCategoryInput>) {
    const existing = await this.prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Categoria não encontrada');
    }

    // Se está alterando o nome, verificar se não há conflito
    if (input.name && input.name.trim() !== existing.name) {
      const duplicate = await this.prisma.category.findFirst({
        where: {
          userId,
          name: input.name.trim(),
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException('Já existe uma categoria com esse nome');
      }
    }

    // Validar cor se fornecida
    if (input.color && !/^#[0-9A-Fa-f]{6}$/.test(input.color)) {
      throw new BadRequestException('Cor inválida. Use formato hexadecimal (#RRGGBB)');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name.trim() }),
        ...(input.type && { type: input.type }),
        ...(input.color && { color: input.color }),
      },
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.category.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Categoria não encontrada');
    }

    // Verificar se a categoria tem transações ou orçamentos associados
    if (existing._count.transactions > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma categoria com transações associadas. Exclua ou recategorize as transações primeiro.',
      );
    }

    if (existing._count.budgets > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma categoria com orçamentos associados. Exclua os orçamentos primeiro.',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
