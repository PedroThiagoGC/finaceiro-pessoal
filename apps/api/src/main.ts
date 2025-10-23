import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('PWR Finanças API')
    .setDescription(
      `API completa de gestão financeira pessoal

## Funcionalidades

- 🔐 **Autenticação**: Registro e login de usuários com JWT
- 💰 **Contas**: Gerenciamento de contas bancárias (corrente, poupança, investimento, etc.)
- 💳 **Cartões**: Controle de cartões de crédito com faturas
- 📊 **Categorias**: Organização de receitas e despesas
- 💸 **Transações**: Lançamentos de entradas, saídas e transferências
- 📈 **Analytics**: Visão geral financeira, gastos por categoria e fluxo de caixa

## Autenticação

A maioria dos endpoints requer autenticação via Bearer Token (JWT).

1. Faça login através de \`POST /auth/login\`
2. Use o token retornado no header: \`Authorization: Bearer <seu-token>\`

## Tipos de Conta

- **CHECKING**: Conta Corrente
- **SAVINGS**: Poupança
- **INVESTMENT**: Investimentos
- **CASH**: Dinheiro
- **OTHER**: Outros

## Tipos de Transação

- **INCOME**: Receita (entrada de dinheiro)
- **EXPENSE**: Despesa (saída de dinheiro)
- **TRANSFER**: Transferência entre contas
`,
    )
    .setVersion('1.0.0')
    .setContact('PWR Finanças', 'https://pwrfinancas.com', 'suporte@pwrfinancas.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Digite seu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Endpoints de autenticação (registro e login)')
    .addTag('accounts', 'Gerenciamento de contas bancárias')
    .addTag('cards', 'Gerenciamento de cartões de crédito')
    .addTag('categories', 'Gerenciamento de categorias')
    .addTag('transactions', 'Gerenciamento de transações financeiras')
    .addTag('analytics', 'Relatórios e análises financeiras')
    .addServer('http://localhost:4000', 'Desenvolvimento Local')
    .addServer('https://api.pwrfinancas.com', 'Produção')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'PWR Finanças API - Documentação',
    customfavIcon: 'https://pwrfinancas.com/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .information-container { margin: 40px 0 }
      .swagger-ui .scheme-container { background: #f7f7f7; padding: 20px; border-radius: 4px; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 API rodando em http://localhost:${port}`);
  console.log(`📚 Documentação em http://localhost:${port}/api/docs`);
}
bootstrap();
