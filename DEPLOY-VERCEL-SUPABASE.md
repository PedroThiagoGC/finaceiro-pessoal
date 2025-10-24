# Guia de Deploy: Vercel + Supabase

Este guia documenta os passos para fazer deploy do PWR Finanças na Vercel usando Supabase como backend.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Conta na [Supabase](https://supabase.com)
- Node.js 18+ instalado localmente
- Git configurado

---

## 🗄️ Parte 1: Configurar Supabase

### 1.1 Criar projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **New Project**
3. Preencha:
   - **Name**: `pwr-financas` (ou nome de sua preferência)
   - **Database Password**: Gere uma senha forte e **anote**
   - **Region**: Escolha a região mais próxima (ex: `South America (São Paulo)`)
4. Aguarde ~2 minutos para o projeto ser provisionado

### 1.2 Obter credenciais do banco de dados

1. No dashboard do projeto, vá em **Settings** > **Database**
2. Em **Connection string**, copie:
   - **Connection pooling** (pgBouncer) → será sua `DATABASE_URL`
   - **Direct connection** → será sua `DATABASE_URL_DIRECT` (para migrations)
3. Substitua `[YOUR-PASSWORD]` pela senha que você criou no passo 1.1

**Exemplo de DATABASE_URL (pooling):**
```
postgresql://postgres.abcdefgh123456:SuaSenhaAqui@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Exemplo de DATABASE_URL_DIRECT:**
```
postgresql://postgres.abcdefgh123456:SuaSenhaAqui@db.abcdefgh123456.supabase.co:5432/postgres
```

### 1.3 Obter credenciais da API

1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (em Project API keys) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (em Project API keys) → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Secreta**

### 1.4 Configurar Storage

1. No dashboard, vá em **Storage** > **Create a new bucket**
2. Configure:
   - **Name**: `pwr-attachments`
   - **Public bucket**: ✅ Marque (para permitir URLs públicas de anexos)
3. Clique em **Create bucket**

---

## 🚀 Parte 2: Rodar migrations no Supabase

### 2.1 Configurar ambiente local

1. Na raiz do projeto, copie `.env.production.example` para `.env.production`:
   ```bash
   cp .env.production.example .env.production
   ```

2. Edite `.env.production` e preencha com as credenciais obtidas:
   ```bash
   DATABASE_URL="postgresql://postgres.abcd..."  # Connection pooling
   DATABASE_URL_DIRECT="postgresql://postgres.abcd..."  # Direct
   NEXT_PUBLIC_SUPABASE_URL="https://abcd.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..."
   SUPABASE_SERVICE_ROLE_KEY="eyJhbG..."
   JWT_SECRET="change-this-to-a-secure-random-string"
   ```

### 2.2 Rodar migrations do Prisma

```bash
# 1. Gerar o Prisma Client
npm run -w @pwr/api prisma:generate

# 2. Aplicar migrations no Supabase (usa DATABASE_URL_DIRECT)
cd apps/api
npx prisma migrate deploy --schema ./prisma/schema.prisma
cd ../..

# 3. (Opcional) Rodar seed para dados iniciais
npm run -w @pwr/api prisma:seed
```

> **Nota:** Se você quiser criar uma nova migration, use `npx prisma migrate dev` localmente e depois rode `migrate deploy` no Supabase.

---

## ☁️ Parte 3: Deploy na Vercel

### 3.1 Conectar repositório

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository**
3. Selecione o repositório `finaceiro-pessoal`
4. Configure:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `apps/web` ⚠️ **IMPORTANTE**
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.2 Configurar variáveis de ambiente

1. Na página de configuração do projeto, vá em **Environment Variables**
2. Adicione todas as variáveis de `.env.production.example`:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `DATABASE_URL` | `postgresql://postgres.abcd...` (pooling) | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abcd.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Production |
| `JWT_SECRET` | `your-secure-secret` | Production |
| `SUPABASE_STORAGE_BUCKET` | `pwr-attachments` | Production |
| `NODE_ENV` | `production` | Production |

3. Clique em **Deploy**

### 3.3 Aguardar deploy

- A Vercel vai instalar dependências, buildar e fazer deploy (~2-3 min)
- Após conclusão, você receberá uma URL do tipo `https://pwr-financas.vercel.app`

### 3.4 Atualizar variáveis com URL final

1. Volte em **Settings** > **Environment Variables**
2. Adicione/Atualize:
   - `FRONTEND_URL`: `https://pwr-financas.vercel.app`
   - `NEXT_PUBLIC_API_URL`: `https://pwr-financas.vercel.app/api`
3. Clique em **Redeploy** (canto superior direito) para aplicar as mudanças

---

## 🔧 Parte 4: Ajustes no código (API Routes)

Como a Vercel não suporta NestJS diretamente em serverless, você tem duas opções:

### Opção A: Converter API para Next.js API Routes (Recomendado)
- Migrar controllers do NestJS para `apps/web/src/app/api/**/route.ts`
- Manter Prisma e lógica de negócio
- Ganho: Deploy mais simples, cold starts mais rápidos

### Opção B: Hospedar API separadamente (Railway/Render)
- Manter NestJS como está
- Fazer deploy da API em Railway/Render/Fly.io
- Atualizar `NEXT_PUBLIC_API_URL` para apontar para o servidor da API

**Para este projeto, vou implementar a Opção A (API Routes)** na próxima etapa.

---

## ✅ Checklist final

- [ ] Projeto Supabase criado
- [ ] Credenciais do banco copiadas
- [ ] Bucket `pwr-attachments` criado
- [ ] Migrations rodadas (`prisma migrate deploy`)
- [ ] Repositório conectado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído
- [ ] URL final atualizada nas envs
- [ ] Teste de login/cadastro funcionando
- [ ] Upload de anexos funcionando

---

## 🐛 Troubleshooting

### Erro: "Can't reach database server"
- Verifique se a `DATABASE_URL` está correta (use a versão **pooling**)
- Confirme que a senha não tem caracteres especiais sem encoding

### Erro: "Storage bucket not found"
- Crie o bucket `pwr-attachments` no Supabase Storage
- Marque como público se quiser URLs diretas

### Erro: "Cold start timeout"
- Em serverless, a primeira requisição pode demorar (~5-10s)
- Use **Edge Runtime** para funções críticas (opcional)

---

## 📚 Próximos passos

1. Migrar API do NestJS para Next.js API Routes
2. Adicionar Supabase Storage adapter
3. Configurar domínio customizado (opcional)
4. Configurar CI/CD com GitHub Actions (opcional)

---

**Dúvidas?** Consulte a [documentação da Vercel](https://vercel.com/docs) e [Supabase](https://supabase.com/docs).
