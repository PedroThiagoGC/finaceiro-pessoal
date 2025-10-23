import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Conectado ao banco de dados');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar ao banco de dados', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('🔌 Desconectado do banco de dados');
    } catch (error) {
      this.logger.error('❌ Erro ao desconectar do banco de dados', error);
    }
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Não é permitido limpar o banco de dados em produção');
    }

    const models = Reflect.ownKeys(this).filter(key => key[0] !== '_');
    return Promise.all(models.map(modelKey => (this[modelKey as any] as any).deleteMany()));
  }
}
