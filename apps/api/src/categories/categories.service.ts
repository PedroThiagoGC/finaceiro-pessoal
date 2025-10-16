import { Injectable } from '@nestjs/common';
import type { CreateCategoryInput } from '@pwr/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, input: CreateCategoryInput) {
    return this.prisma.category.create({
      data: {
        userId,
        name: input.name,
        type: input.type,
        color: input.color,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.category.findFirst({
      where: { id, userId },
    });
  }

  async update(userId: string, id: string, input: Partial<CreateCategoryInput>) {
    const existing = await this.findOne(userId, id);
    if (!existing) throw new Error('Categoria não encontrada');

    return this.prisma.category.update({
      where: { id },
      data: input,
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);
    if (!existing) throw new Error('Categoria não encontrada');

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
