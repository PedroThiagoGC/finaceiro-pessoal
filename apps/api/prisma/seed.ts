import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário demo
  const passwordHash = await bcrypt.hash('demo123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@pwrfinancas.com' },
    update: {},
    create: {
      name: 'Usuário Demo',
      email: 'demo@pwrfinancas.com',
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });
  console.log('✅ Usuário demo criado:', user.email);

  // Categorias padrão
  const categories = [
    { name: 'Alimentação', type: 'expense', color: '#FF6B6B' },
    { name: 'Mercado', type: 'expense', color: '#4ECDC4' },
    { name: 'Transporte', type: 'expense', color: '#45B7D1' },
    { name: 'Saúde', type: 'expense', color: '#FFA07A' },
    { name: 'Educação', type: 'expense', color: '#98D8C8' },
    { name: 'Lazer', type: 'expense', color: '#F7B801' },
    { name: 'Moradia', type: 'expense', color: '#6C5CE7' },
    { name: 'Vestuário', type: 'expense', color: '#FD79A8' },
    { name: 'Investimentos', type: 'expense', color: '#00B894' },
    { name: 'Outros', type: 'expense', color: '#A29BFE' },
    { name: 'Salário', type: 'income', color: '#00D2D3' },
    { name: 'Freelance', type: 'income', color: '#55EFC4' },
    { name: 'Investimentos', type: 'income', color: '#81ECEC' },
    { name: 'Transferência', type: 'transfer', color: '#636E72' },
  ];

  const createdCategories = await Promise.all(
    categories.map(cat =>
      prisma.category.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: cat.name,
          },
        },
        update: {},
        create: {
          userId: user.id,
          name: cat.name,
          type: cat.type as any,
          color: cat.color,
        },
      }),
    ),
  );
  console.log(`✅ ${createdCategories.length} categorias criadas`);

  // Conta corrente demo
  const account = await prisma.account.upsert({
    where: {
      userId_name: {
        userId: user.id,
        name: 'Conta Corrente',
      },
    },
    update: {},
    create: {
      userId: user.id,
      name: 'Conta Corrente',
      type: 'checking',
      openingBalance: 5000.0,
      currency: 'BRL',
    },
  });
  console.log('✅ Conta corrente criada:', account.name);

  // Cartão de crédito demo
  const card = await prisma.card.upsert({
    where: {
      userId_nickname: {
        userId: user.id,
        nickname: 'Visa Principal',
      },
    },
    update: {},
    create: {
      userId: user.id,
      accountId: account.id,
      brand: 'Visa',
      nickname: 'Visa Principal',
      creditLimit: 10000.0,
      billingDay: 10,
      dueDay: 17,
    },
  });
  console.log('✅ Cartão criado:', card.nickname);

  // Orçamentos
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const alimentacaoCategory = createdCategories.find(c => c.name === 'Alimentação');
  const mercadoCategory = createdCategories.find(c => c.name === 'Mercado');
  const transporteCategory = createdCategories.find(c => c.name === 'Transporte');

  const budgets = [
    {
      userId: user.id,
      period: 'monthly',
      year: currentYear,
      month: currentMonth,
      categoryId: alimentacaoCategory?.id,
      amount: 800.0,
    },
    {
      userId: user.id,
      period: 'monthly',
      year: currentYear,
      month: currentMonth,
      categoryId: mercadoCategory?.id,
      amount: 1200.0,
    },
    {
      userId: user.id,
      period: 'monthly',
      year: currentYear,
      month: currentMonth,
      categoryId: transporteCategory?.id,
      amount: 400.0,
    },
  ];

  await Promise.all(
    budgets.map(budget =>
      prisma.budget.create({
        data: budget as any,
      }),
    ),
  );
  console.log(`✅ ${budgets.length} orçamentos criados`);

  // Transações de exemplo
  const transactions = [
    {
      userId: user.id,
      date: new Date(),
      description: 'Salário mensal',
      categoryId: createdCategories.find(c => c.name === 'Salário')?.id!,
      flow: 'income',
      amount: 6000.0,
      accountId: account.id,
      planned: false,
      reconciled: true,
    },
    {
      userId: user.id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      description: 'Supermercado',
      categoryId: mercadoCategory?.id!,
      flow: 'expense',
      amount: 350.0,
      cardId: card.id,
      planned: false,
      reconciled: true,
    },
    {
      userId: user.id,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      description: 'Uber',
      categoryId: transporteCategory?.id!,
      flow: 'expense',
      amount: 45.0,
      cardId: card.id,
      planned: false,
      reconciled: true,
    },
  ];

  await Promise.all(
    transactions.map(tx =>
      prisma.transaction.create({
        data: tx as any,
      }),
    ),
  );
  console.log(`✅ ${transactions.length} transações criadas`);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📧 Login: demo@pwrfinancas.com');
  console.log('🔑 Senha: demo123456');
}

main()
  .catch(e => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
