"# 💰 PWR Finanças - Sistema de Gestão Financeira Pessoal

Sistema web mobile-first + PWA completo para gestão financeira pessoal com multi-tenant, autenticação por e-mail/senha, upload/câmera com OCR, funcionamento offline com sincronização automática, dashboards completos e status "no vermelho".

## 🚀 Tecnologias

### Backend
- **NestJS** - Framework Node.js robusto e escalável
- **Prisma ORM** - Modelagem de dados type-safe com PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **Redis + BullMQ** - Filas para processamento assíncrono
- **MinIO** - Storage S3-compatible para arquivos
- **Tesseract.js** - OCR para extração de dados de recibos/notas
- **JWT** - Autenticação stateless
- **Swagger** - Documentação automática da API

### Frontend
- **Next.js 14** - React framework com App Router
- **TypeScript** - Type safety em todo o projeto
- **Tailwind CSS** - Estilização utility-first
- **React Query** - Gerenciamento de estado servidor
- **Dexie.js** - IndexedDB para cache offline
- **Workbox** - Service Worker para PWA
- **Recharts** - Gráficos e dashboards
- **Zod** - Validação de schemas

### Infraestrutura
- **Docker Compose** - Orquestração de containers
- **pnpm** - Gerenciador de pacotes eficiente
- **ESLint + Prettier** - Qualidade de código
- **Jest + Cypress** - Testes unitários e E2E

## 📁 Estrutura do Projeto

```
pwr-financas/
├── apps/
│   ├── web/                 # Frontend Next.js 14
│   │   ├── src/
│   │   │   ├── app/        # App Router (páginas)
│   │   │   ├── components/ # Componentes React
│   │   │   └── lib/        # Utilidades (API, DB, Auth)
│   │   ├── public/         # Assets estáticos + PWA
│   │   └── package.json
│   │
│   └── api/                # Backend NestJS
│       ├── src/
│       │   ├── auth/       # Autenticação JWT
│       │   ├── accounts/   # Contas bancárias
│       │   ├── cards/      # Cartões de crédito
│       │   ├── transactions/ # Transações
│       │   ├── analytics/  # Dashboards e relatórios
│       │   ├── ocr/        # Processamento OCR
│       │   └── prisma/     # Cliente Prisma
│       ├── prisma/
│       │   ├── schema.prisma # Modelo de dados
│       │   └── seed.ts       # Dados iniciais
│       └── package.json
│
├── packages/
│   ├── types/              # Schemas Zod + tipos TS compartilhados
│   └── ui/                 # Componentes UI reutilizáveis (futuro)
│
├── infra/
│   └── docker-compose.yaml # Postgres + Redis + MinIO
│
├── package.json            # Scripts raiz do monorepo
├── pnpm-workspace.yaml     # Configuração workspace
└── README.md
```

## 🛠️ Setup e Instalação

### Pré-requisitos

- **Node.js** >= 18.0
- **pnpm** >= 8.0 (Instale com: `npm install -g pnpm`)
- **Docker Desktop** - [Download aqui](https://www.docker.com/products/docker-desktop)

### 🚀 Início Rápido (5 minutos)

#### Windows (CMD ou PowerShell)

```cmd
# 1. Entre na pasta do projeto
cd "G:\Meu Drive\Pessoal\Sistema financeiro pessoal\finaceiro-pessoal"

# 2. Instale as dependências (pode demorar 2-5 minutos)
pnpm install

# 3. Configure os arquivos de ambiente
copy apps\api\.env.example apps\api\.env
echo NEXT_PUBLIC_API_URL=http://localhost:4000 > apps\web\.env.local

# 4. Inicie a infraestrutura Docker
pnpm docker:up

# 5. Aguarde 15 segundos para os containers iniciarem
timeout /t 15 /nobreak

# 6. Gere o cliente Prisma
cd apps\api
pnpm prisma generate
cd ..\..

# 7. Execute as migrações do banco
pnpm db:migrate

# 8. Popule o banco com dados iniciais
pnpm db:seed

# 9. Inicie o servidor de desenvolvimento
pnpm dev
```

#### Linux/Mac

```bash
# 1. Entre na pasta do projeto
cd finaceiro-pessoal

# 2. Instale as dependências
pnpm install

# 3. Configure os arquivos de ambiente
cp apps/api/.env.example apps/api/.env
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > apps/web/.env.local

# 4. Inicie a infraestrutura Docker
pnpm docker:up

# 5. Aguarde 15 segundos
sleep 15

# 6. Gere o cliente Prisma
cd apps/api && pnpm prisma generate && cd ../..

# 7. Execute as migrações
pnpm db:migrate

# 8. Popule o banco
pnpm db:seed

# 9. Inicie o desenvolvimento
pnpm dev
```

### ✅ Verificar se está funcionando

Após executar os comandos acima, você deve ter:

- ✅ **Frontend** rodando em http://localhost:3000
- ✅ **Backend API** rodando em http://localhost:4000
- ✅ **API Docs (Swagger)** em http://localhost:4000/api/docs
- ✅ **PostgreSQL** na porta 5432
- ✅ **Redis** na porta 6379
- ✅ **MinIO Console** em http://localhost:9001 (user: `minioadmin` / password: `minioadmin`)

### 🎯 Primeiro Acesso

1. Abra http://localhost:3000
2. Faça login com as credenciais demo:
   - **E-mail:** demo@pwrfinancas.com
   - **Senha:** demo123456
3. Explore o sistema!

### 🔧 Detalhamento dos Passos

<details>
<summary><strong>1. Instalar dependências</strong></summary>

```bash
pnpm install
```

**O que faz:** Instala todas as dependências do monorepo (backend, frontend, packages).  
**Tempo estimado:** 2-5 minutos  
**Tamanho:** ~500MB de node_modules
</details>

<details>
<summary><strong>2. Configurar variáveis de ambiente</strong></summary>

**Backend:**
```bash
cp apps/api/.env.example apps/api/.env
```

**Frontend:**
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > apps/web/.env.local
```

**O que faz:** Cria arquivos `.env` com configurações padrão para desenvolvimento local.
</details>

<details>
<summary><strong>3. Iniciar infraestrutura Docker</strong></summary>

```bash
pnpm docker:up
```

**O que faz:** Inicia os containers:
- PostgreSQL 15 (porta 5432)
- Redis 7 (porta 6379)
- MinIO (portas 9000 e 9001)

**Importante:** Aguarde 10-15 segundos para os healthchecks passarem antes de continuar.
</details>

<details>
<summary><strong>4. Gerar Prisma Client</strong></summary>

```bash
cd apps/api
pnpm prisma generate
cd ../..
```

**O que faz:** Gera o cliente TypeScript do Prisma baseado no schema. Este passo é necessário para que o backend possa se comunicar com o banco.
</details>

<details>
<summary><strong>5. Executar migrações</strong></summary>

```bash
pnpm db:migrate
```

**O que faz:** Cria todas as tabelas no PostgreSQL conforme o schema Prisma.
</details>

<details>
<summary><strong>6. Popular banco de dados (seed)</strong></summary>

```bash
pnpm db:seed
```

**O que faz:** Insere dados iniciais:
- Usuário demo: `demo@pwrfinancas.com` / `demo123456`
- 14 categorias padrão (Alimentação, Transporte, Saúde, etc.)
- Conta corrente demo com saldo inicial
- Cartão de crédito demo
- 3 orçamentos mensais
- Transações de exemplo
</details>

<details>
<summary><strong>7. Iniciar desenvolvimento</strong></summary>

```bash
pnpm dev
```

**O que faz:** Inicia em modo de desenvolvimento:
- Backend API em http://localhost:4000
- Frontend Web em http://localhost:3000
- Hot reload habilitado em ambos
</details>

## 🎮 Uso

### Acessar o sistema

1. Abra http://localhost:3000
2. Faça login com:
   - **E-mail:** demo@pwrfinancas.com
   - **Senha:** demo123456
3. Explore o dashboard!

### Criar nova transação

1. Clique no FAB (botão flutuante "+")
2. Preencha: valor, categoria, conta/cartão, descrição
3. (Opcional) Adicione foto do recibo via câmera ou upload
4. Salve

### Modo Offline

1. Abra o app enquanto online
2. Desconecte da internet
3. Continue criando transações (serão armazenadas localmente)
4. Ao reconectar, sincronização automática acontece via Background Sync

## 📊 Scripts Disponíveis

### Raiz do monorepo

```bash
pnpm dev          # Inicia todos os serviços em desenvolvimento
pnpm build        # Build de produção (todos os pacotes)
pnpm test         # Executa todos os testes
pnpm lint         # Verifica qualidade de código
pnpm format       # Formata código com Prettier

pnpm db:migrate   # Executa migrações Prisma
pnpm db:seed      # Popula banco com dados iniciais
pnpm db:studio    # Abre Prisma Studio (visualizador de dados)

pnpm docker:up    # Inicia containers Docker
pnpm docker:down  # Para containers Docker
pnpm docker:logs  # Visualiza logs dos containers
```

## 🧪 Testes

### Testes Unitários (Backend)

```bash
cd apps/api
pnpm test
```

### Testes E2E (Frontend)

```bash
cd apps/web
pnpm test:e2e
```

## � Troubleshooting

### Erro: "pnpm: command not found"

```bash
npm install -g pnpm
```

### Erro: "Cannot connect to database"

```bash
# Reinicie o Docker
pnpm docker:down
# Aguarde 5 segundos
pnpm docker:up
# Aguarde 15 segundos
pnpm db:migrate
```

### Erro: "Port already in use"

**Porta 5432 (PostgreSQL):**
- Você tem um Postgres local rodando
- Pare o serviço ou mude a porta no `infra/docker-compose.yaml`

**Porta 3000 (Frontend) ou 4000 (Backend):**
- Mate o processo usando a porta:
  ```cmd
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <número_do_processo> /F
  ```

### Erro: "Module @prisma/client not found"

```bash
cd apps/api
pnpm prisma generate
cd ../..
```

### Docker não inicia

- Verifique se o Docker Desktop está rodando
- No Windows, verifique se a virtualização está habilitada na BIOS
- Reinicie o Docker Desktop

### PWA não instala

- Use **localhost** ou **HTTPS** (obrigatório para PWA)
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Verifique Service Worker em DevTools → Application

### Dependências desatualizadas

```bash
pnpm install
cd apps/api && pnpm prisma generate && cd ../..
```

## �📦 Deploy

### Backend (API)

1. Configure as variáveis de ambiente para produção
2. Execute migrações:
   ```bash
   cd apps/api
   pnpm prisma migrate deploy
   ```
3. Build:
   ```bash
   pnpm build
   ```
4. Inicie:
   ```bash
   pnpm start
   ```

### Frontend (Web)

1. Configure `NEXT_PUBLIC_API_URL` para o endpoint da API em produção
2. Build:
   ```bash
   cd apps/web
   pnpm build
   ```
3. Inicie:
   ```bash
   pnpm start
   ```

## 🔒 Segurança

- **Senhas hasheadas** com bcryptjs (salt rounds: 10)
- **JWT tokens** com expiração de 7 dias
- **Multi-tenant estrito**: todas as queries filtram por `user_id`
- **Validação de input** com Zod em frontend e backend
- **CORS configurado** para aceitar apenas origem do frontend

## 📈 Histórico de Melhorias

Esta seção documenta todas as melhorias incrementais feitas no projeto após a versão inicial.

### Versão 1.0.0 - Release Inicial (16/10/2025)
- ✅ Sistema completo de gestão financeira pessoal
- ✅ Backend NestJS com Prisma + PostgreSQL
- ✅ Frontend Next.js 14 com PWA
- ✅ Autenticação JWT multi-tenant
- ✅ CRUD completo (accounts, cards, categories, transactions)
- ✅ Analytics e dashboards
- ✅ Suporte offline com IndexedDB
- ✅ Docker Compose para desenvolvimento
- ✅ Seeds com dados demo
- ✅ Documentação completa

### Melhorias Futuras
_Esta seção será atualizada conforme novas funcionalidades forem adicionadas._

**Formato de documentação:**
```markdown
### [Data] - [Título da Melhoria]
- 🎯 **Solicitação:** [O que foi pedido]
- ✅ **Implementado:** [O que foi feito]
- 📝 **Arquivos modificados:** [Lista de arquivos]
- 🚀 **Como usar:** [Instruções de uso]
```

---

## 📚 Recursos Adicionais

- 📖 [QUICKSTART.md](./QUICKSTART.md) - Guia rápido de 5 minutos
- 📋 [PROJETO-COMPLETO.md](./PROJETO-COMPLETO.md) - Resumo completo do projeto
- 🔧 [COMANDOS-SETUP.md](./COMANDOS-SETUP.md) - Todos os comandos de instalação
- 📝 [CHANGELOG.md](./CHANGELOG.md) - Histórico de versões detalhado
- 🤝 [CONTRIBUTING.md](./CONTRIBUTING.md) - Guia de contribuição
- 🌐 [API Docs](http://localhost:4000/api/docs) - Documentação Swagger (quando rodando)

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para mais detalhes.

## 📝 Licença

MIT License - Veja [LICENSE](./LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para gestão financeira inteligente**

**Versão:** 1.0.0  
**Última atualização:** 16/10/2025"  
