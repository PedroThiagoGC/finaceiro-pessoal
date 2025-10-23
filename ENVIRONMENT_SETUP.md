# 🌍 Configuração de Variáveis de Ambiente

## 📋 Visão Geral

Este monorepo utiliza um arquivo `.env` centralizado na raiz para gerenciar todas as variáveis de ambiente do backend (API) e frontend (Web). Isso simplifica o desenvolvimento e garante consistência.

## 🗂️ Estrutura de Arquivos

```
finaceiro-pessoal-1/
├── .env                 # ✅ Variáveis de ambiente (NÃO COMMITAR)
├── .env.example         # ✅ Template com todas as variáveis
├── apps/
│   ├── api/
│   │   └── .env        # ⚠️ OPCIONAL - Pode sobrescrever valores do root
│   └── web/
│       └── .env.local  # ⚠️ OPCIONAL - Pode sobrescrever valores do root
└── package.json        # Scripts configurados com dotenv-cli
```

## 🔧 Como Funciona

### 1. Arquivo `.env` na Raiz

O arquivo `.env` na raiz contém **todas** as variáveis de ambiente:

```bash
# Backend (API)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pwrfinancas?schema=public"
JWT_SECRET="dev-secret-change-in-production-12345678"
PORT=4000
NODE_ENV="development"

# Frontend (Web)
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_USE_SSL=false
MINIO_BUCKET_NAME="pwr-financas"

# SMTP (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@pwrfinancas.com"

# CORS
FRONTEND_URL="http://localhost:3000"
```

### 2. Scripts Configurados

Os scripts no `package.json` da raiz usam `dotenv-cli` para carregar as variáveis:

```json
{
  "scripts": {
    "dev": "dotenv -e .env -- concurrently ...",
    "dev:api": "dotenv -e .env -- npm run -w @pwr/api dev",
    "dev:web": "dotenv -e .env -- npm run -w @pwr/web dev",
    "db:migrate": "dotenv -e .env -- npm run -w @pwr/api prisma:migrate",
    "db:seed": "dotenv -e .env -- npm run -w @pwr/api prisma:seed"
  }
}
```

### 3. Ordem de Precedência

As variáveis são carregadas na seguinte ordem (última sobrescreve a anterior):

1. **`.env` na raiz** - Base para todos os workspaces
2. **`apps/api/.env`** - Sobrescreve valores específicos do backend (opcional)
3. **`apps/web/.env.local`** - Sobrescreve valores específicos do frontend (opcional)
4. **Variáveis do sistema** - Sobrescreve tudo

## 🚀 Uso no Desenvolvimento

### Iniciar Todo o Monorepo

```bash
npm run dev
```

Este comando:
- Carrega variáveis do `.env` da raiz
- Inicia o backend (API) na porta 4000
- Inicia o frontend (Web) na porta 3000

### Iniciar Apenas o Backend

```bash
npm run dev:api
```

### Iniciar Apenas o Frontend

```bash
npm run dev:web
```

### Executar Migrações do Prisma

```bash
npm run db:migrate
```

### Executar Seed do Banco

```bash
npm run db:seed
```

## 📝 Configuração Inicial

### 1. Copiar Template

```bash
copy .env.example .env
```

### 2. Ajustar Valores

Edite o arquivo `.env` e ajuste os valores conforme necessário:

```bash
# Altere o JWT_SECRET para produção!
JWT_SECRET="seu-secret-super-seguro-aqui"

# Ajuste a URL do banco de dados se necessário
DATABASE_URL="postgresql://usuario:senha@host:5432/database?schema=public"

# Configure SMTP se quiser enviar e-mails
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-app"
```

### 3. Iniciar Infraestrutura

```bash
# Inicia PostgreSQL, Redis e MinIO via Docker
npm run docker:up

# Verifica logs
npm run docker:logs
```

### 4. Executar Migrações

```bash
# Gera Prisma Client
npm run db:generate

# Aplica migrações no banco
npm run db:migrate

# Popula banco com dados iniciais
npm run db:seed
```

### 5. Iniciar Aplicação

```bash
npm run dev
```

## 🔒 Segurança

### ⚠️ IMPORTANTE - NÃO COMMITE DADOS SENSÍVEIS

Certifique-se de que o `.env` está no `.gitignore`:

```gitignore
# Environment
.env
.env.local
.env.*.local
```

### 🔑 Variáveis Sensíveis

Nunca commite:
- `DATABASE_URL` com credenciais reais
- `JWT_SECRET` de produção
- `SMTP_USER` e `SMTP_PASS`
- `MINIO_ACCESS_KEY` e `MINIO_SECRET_KEY` de produção

### ✅ Variáveis Públicas

No Next.js, apenas variáveis com prefixo `NEXT_PUBLIC_` são expostas ao browser:

```bash
# ✅ Disponível no browser
NEXT_PUBLIC_API_URL="http://localhost:4000"

# ❌ NÃO disponível no browser
DATABASE_URL="..."
JWT_SECRET="..."
```

## 🐛 Troubleshooting

### Backend não conecta ao banco

```bash
# Verifique se o PostgreSQL está rodando
npm run docker:logs

# Teste a conexão
psql "postgresql://postgres:postgres@localhost:5432/pwrfinancas"
```

### Frontend não conecta ao backend

```bash
# Verifique se NEXT_PUBLIC_API_URL está correto no .env
# Deve apontar para http://localhost:4000

# Reinicie o frontend
npm run dev:web
```

### Variáveis não estão sendo carregadas

```bash
# Certifique-se de que dotenv-cli está instalado
npm list dotenv-cli

# Se não estiver, instale novamente
npm install -D dotenv-cli cross-env

# Verifique se o arquivo .env existe na raiz
dir .env
```

### Porta 4000 já está em uso

```bash
# No Windows, mate processos node
taskkill /F /IM node.exe

# Ou altere a porta no .env
PORT=4001
```

## 📚 Referências

- [dotenv-cli](https://github.com/entropitor/dotenv-cli) - Carregador de variáveis de ambiente
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Prisma Environment Variables](https://www.prisma.io/docs/guides/development-environment/environment-variables)

## 🎯 Próximos Passos

Após configurar as variáveis de ambiente:

1. ✅ Execute `npm run dev` para iniciar o desenvolvimento
2. ✅ Acesse `http://localhost:3000` para o frontend
3. ✅ Acesse `http://localhost:4000` para a API
4. ✅ Use `npm run db:studio` para visualizar o banco de dados

---

**Dica:** Mantenha o `.env.example` sempre atualizado com novas variáveis adicionadas ao projeto!
