# 🚀 Deploy na Vercel - Guia Rápido Monorepo

## ⚙️ Configurações na Interface da Vercel

Quando você importar o repositório do GitHub, configure assim:

### 1️⃣ **Framework Preset**
- Selecione: **Next.js**

### 2️⃣ **Root Directory**
- **DEIXE EM BRANCO** ou coloque: `./`
- ⚠️ **NÃO coloque `apps/web` ou `apps/api`**

### 3️⃣ **Build and Output Settings**

Expanda a seção **"Build and Output Settings"** e configure:

| Campo | Valor |
|-------|-------|
| **Build Command** | `npm run build` |
| **Output Directory** | `apps/web/.next` |
| **Install Command** | `npm install` |

### 4️⃣ **Environment Variables**

Clique em **"Environment Variables"** e adicione (veja `.env.production.example`):

#### Essenciais para funcionar:
```bash
# Supabase Database (Connection Pooling)
DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# Supabase Auth & Storage
NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_STORAGE_BUCKET=pwr-attachments

# JWT
JWT_SECRET=seu-secret-aqui-minimo-32-chars
JWT_EXPIRES_IN=7d

# URLs (ajuste depois do primeiro deploy)
FRONTEND_URL=https://seu-projeto.vercel.app
NEXT_PUBLIC_API_URL=https://seu-projeto.vercel.app/api

# Node
NODE_ENV=production
```

#### Como obter as credenciais Supabase:

1. **DATABASE_URL**
   - Supabase → Settings → Database → Connection string → **Transaction pooler**
   - Substitua `[YOUR-PASSWORD]` pela senha do projeto

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Supabase → Settings → API → Project URL

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Supabase → Settings → API → Project API keys → `anon` `public`

4. **SUPABASE_SERVICE_ROLE_KEY**
   - Supabase → Settings → API → Project API keys → `service_role` ⚠️ **Secreta**

5. **JWT_SECRET**
   - Gere uma string aleatória segura:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 5️⃣ **Node.js Version**
- Deixe como padrão (18.x ou 20.x)

---

## 📦 Como o build funciona

Quando você clicar em **Deploy**, a Vercel vai:

1. ✅ Clonar o repositório
2. ✅ Rodar `npm install` na raiz (instala todos os workspaces)
3. ✅ Rodar `npm run build` que executa:
   - Build da API (`apps/api`) → gera Prisma Client
   - Build do Web (`apps/web`) → gera `.next`
4. ✅ Fazer deploy do Next.js (`apps/web/.next`)

---

## ⚠️ Importante: A API NestJS não vai rodar na Vercel

**Problema:** 
- Vercel é serverless, NestJS precisa de servidor rodando 24/7

**Solução (escolha uma):**

### Opção A: Migrar API para Next.js API Routes (Recomendado)
- Converter controllers do NestJS → `apps/web/src/app/api/*/route.ts`
- Manter Prisma e lógica de negócio
- Tudo roda na Vercel
- **Eu posso fazer isso pra você!**

### Opção B: Hospedar API separadamente
1. Deploy da API em:
   - [Railway](https://railway.app) - Free tier com $5/mês
   - [Render](https://render.com) - Free tier (hiberna após inatividade)
   - [Fly.io](https://fly.io) - Free tier pequeno
2. Atualizar `NEXT_PUBLIC_API_URL` para apontar pro servidor da API

### Opção C: Apenas o Web por enquanto
- Fazer deploy só do frontend
- Rodar API localmente durante desenvolvimento
- Migrar depois

---

## 🎯 Passos finais após o primeiro deploy

1. ✅ Deploy concluído → Vercel te dá uma URL: `https://seu-projeto.vercel.app`
2. ✅ Volte nas **Environment Variables** e atualize:
   ```bash
   FRONTEND_URL=https://seu-projeto.vercel.app
   NEXT_PUBLIC_API_URL=https://seu-projeto.vercel.app/api
   ```
3. ✅ Clique em **Redeploy** (botão no topo) para aplicar as mudanças

---

## 🔧 Troubleshooting

### Erro: "Command 'npm run build' failed"
- Verifique se as variáveis de ambiente estão corretas
- Especialmente `DATABASE_URL` e credenciais Supabase

### Erro: "Cannot find module '@pwr/types'"
- Normal no primeiro deploy (npm workspaces)
- A Vercel resolve automaticamente

### Erro: "API routes not working"
- Se você não migrou a API ainda, os endpoints `/api/*` não vão existir
- Escolha uma das opções acima

---

## 📝 Checklist Deploy

- [ ] Projeto Supabase criado
- [ ] Migrations rodadas no Supabase (`npx prisma migrate deploy`)
- [ ] Bucket `pwr-attachments` criado no Storage
- [ ] Repositório conectado na Vercel
- [ ] Root Directory = **vazio** ou `./`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `apps/web/.next`
- [ ] Todas as env vars configuradas
- [ ] Deploy concluído
- [ ] URLs finais atualizadas nas env vars
- [ ] Redeploy feito

---

## 🚀 Quer que eu migre a API para Next.js API Routes?

Posso converter todos os controllers/services do NestJS para API Routes do Next.js, mantendo toda a lógica. Isso deixa tudo funcionando 100% na Vercel sem custos adicionais.

Quer que eu faça isso agora? 🤔
