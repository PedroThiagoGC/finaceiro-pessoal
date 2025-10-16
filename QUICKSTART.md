# 🚀 Guia Rápido de Início

## Instalação em 5 minutos

### 1. Pré-requisitos
```bash
# Instale Node.js 18+ (https://nodejs.org)
# Instale pnpm
npm install -g pnpm

# Instale Docker Desktop (https://www.docker.com/products/docker-desktop)
```

### 2. Clone e instale
```bash
git clone https://github.com/seu-usuario/pwr-financas.git
cd pwr-financas
pnpm install
```

### 3. Configure o ambiente
```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > apps/web/.env.local
```

### 4. Inicie a infraestrutura
```bash
pnpm docker:up
```

Aguarde alguns segundos até todos os containers estarem prontos (Postgres, Redis, MinIO).

### 5. Prepare o banco de dados
```bash
pnpm db:migrate
pnpm db:seed
```

### 6. Inicie o app
```bash
pnpm dev
```

Pronto! Acesse:
- **App:** http://localhost:3000
- **API:** http://localhost:4000
- **Docs:** http://localhost:4000/api/docs
- **MinIO Console:** http://localhost:9001

### 7. Login
- **E-mail:** demo@pwrfinancas.com
- **Senha:** demo123456

---

## Estrutura de comandos

```bash
# Desenvolvimento
pnpm dev              # Inicia tudo
pnpm docker:up        # Só a infra (Postgres, Redis, MinIO)

# Banco de dados
pnpm db:migrate       # Aplica migrações
pnpm db:seed          # Dados iniciais
pnpm db:studio        # Interface visual (Prisma Studio)

# Testes
pnpm test             # Testes unitários
pnpm test:e2e         # Testes E2E (Cypress)

# Produção
pnpm build            # Build de tudo
pnpm start            # Inicia versão de produção
```

---

## Troubleshooting rápido

### Erro: "Cannot connect to database"
```bash
# Reinicie os containers
pnpm docker:down
pnpm docker:up

# Aguarde 10 segundos e tente novamente
```

### Erro: "Port 5432 already in use"
Você tem um Postgres rodando localmente. Pare-o ou mude a porta em `infra/docker-compose.yaml`.

### Erro: "Module not found"
```bash
pnpm install
cd apps/api && pnpm prisma generate
```

### PWA não instala
- Use HTTPS ou localhost
- Limpe cache do navegador
- Verifique Service Worker no DevTools → Application

---

## Próximos passos

1. **Explore o Dashboard** - Veja gastos por categoria e cartão
2. **Crie transações** - Clique no botão "+" flutuante
3. **Teste offline** - Desconecte a internet e continue usando
4. **Instale como PWA** - Menu do navegador → "Instalar app"
5. **Veja os gráficos** - Analise seu cashflow e orçamentos

---

## Recursos

- [Documentação completa](./README.md)
- [API Docs (Swagger)](http://localhost:4000/api/docs)
- [Prisma Studio](http://localhost:5555) (execute `pnpm db:studio`)
- [Issues](https://github.com/seu-usuario/pwr-financas/issues)
