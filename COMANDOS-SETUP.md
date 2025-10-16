# 🚀 Comandos de Setup - PWR Finanças

Este arquivo contém todos os comandos necessários para colocar o projeto em funcionamento.

## ⚡ Setup Rápido (Windows CMD)

Execute estes comandos na ordem, um por vez:

```cmd
REM 1. Entre na pasta do projeto
cd "G:\Meu Drive\Pessoal\Sistema financeiro pessoal\finaceiro-pessoal"

REM 2. Instale as dependências (pode demorar alguns minutos)
pnpm install

REM 3. Copie o arquivo de ambiente do backend
copy apps\api\.env.example apps\api\.env

REM 4. Crie o arquivo de ambiente do frontend
echo NEXT_PUBLIC_API_URL=http://localhost:4000 > apps\web\.env.local

REM 5. Inicie o Docker (Postgres + Redis + MinIO)
pnpm docker:up

REM 6. Aguarde 15 segundos para os containers iniciarem completamente
timeout /t 15 /nobreak

REM 7. Gere o Prisma Client
cd apps\api
pnpm prisma generate
cd ..\..

REM 8. Execute as migrações do banco de dados
pnpm db:migrate

REM 9. Popule o banco com dados iniciais
pnpm db:seed

REM 10. Inicie o servidor de desenvolvimento
pnpm dev
```

## 📝 Passo a passo detalhado

### 1️⃣ Instalar dependências

```cmd
pnpm install
```

**O que faz:** Instala todas as dependências do monorepo (backend, frontend, packages).  
**Tempo:** 2-5 minutos  
**Tamanho:** ~500MB de node_modules

### 2️⃣ Configurar ambiente

```cmd
REM Backend
copy apps\api\.env.example apps\api\.env

REM Frontend
echo NEXT_PUBLIC_API_URL=http://localhost:4000 > apps\web\.env.local
```

**O que faz:** Cria arquivos `.env` com configurações padrão.

### 3️⃣ Iniciar infraestrutura

```cmd
pnpm docker:up
```

**O que faz:** Sobe os containers Docker:
- PostgreSQL na porta 5432
- Redis na porta 6379
- MinIO nas portas 9000 e 9001

**Importante:** Aguarde ~10-15 segundos para os healthchecks passarem.

### 4️⃣ Gerar Prisma Client

```cmd
cd apps\api
pnpm prisma generate
cd ..\..
```

**O que faz:** Gera o cliente TypeScript do Prisma baseado no schema.

### 5️⃣ Executar migrações

```cmd
pnpm db:migrate
```

**O que faz:** Cria todas as tabelas no PostgreSQL.

### 6️⃣ Popular banco de dados

```cmd
pnpm db:seed
```

**O que faz:** Insere dados iniciais:
- Usuário demo: `demo@pwrfinancas.com` / `demo123456`
- 14 categorias padrão
- Conta corrente e cartão demo
- 3 orçamentos
- Transações de exemplo

### 7️⃣ Iniciar desenvolvimento

```cmd
pnpm dev
```

**O que faz:** Inicia:
- Backend API: http://localhost:4000
- Frontend Web: http://localhost:3000

---

## ✅ Verificar se está funcionando

### Backend
```cmd
curl http://localhost:4000/api/docs
```
Deve abrir a documentação Swagger.

### Frontend
Abra http://localhost:3000 no navegador.

### Banco de dados
```cmd
pnpm db:studio
```
Abre o Prisma Studio em http://localhost:5555.

---

## 🔧 Comandos úteis

### Docker

```cmd
REM Parar containers
pnpm docker:down

REM Ver logs
pnpm docker:logs

REM Reiniciar tudo
pnpm docker:down
pnpm docker:up
```

### Banco de dados

```cmd
REM Abrir Prisma Studio
pnpm db:studio

REM Resetar banco (CUIDADO: apaga tudo!)
cd apps\api
pnpm prisma migrate reset
cd ..\..

REM Criar nova migração
cd apps\api
pnpm prisma migrate dev --name nome_da_migracao
cd ..\..
```

### Desenvolvimento

```cmd
REM Lint (verificar código)
pnpm lint

REM Formatar código
pnpm format

REM Build de produção
pnpm build

REM Testes
pnpm test
```

---

## 🐛 Troubleshooting

### Erro: "pnpm: command not found"

```cmd
npm install -g pnpm
```

### Erro: "Cannot connect to database"

```cmd
REM Reinicie o Docker
pnpm docker:down
timeout /t 5 /nobreak
pnpm docker:up
timeout /t 15 /nobreak
pnpm db:migrate
```

### Erro: "Port 5432 already in use"

Você tem um Postgres rodando localmente. Opções:

1. Pare o Postgres local
2. Ou mude a porta no `infra/docker-compose.yaml`:
   ```yaml
   ports:
     - '5433:5432'  # Usa porta 5433 ao invés de 5432
   ```
   E atualize `apps/api/.env`:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/pwrfinancas?schema=public"
   ```

### Erro: "Module @prisma/client not found"

```cmd
cd apps\api
pnpm prisma generate
cd ..\..
```

### Docker não inicia

Verifique se o Docker Desktop está rodando.

### PWA não instala

- Use **localhost** ou **HTTPS** (obrigatório para PWA)
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Verifique Service Worker em DevTools → Application → Service Workers

---

## 📦 Estrutura de portas

| Serviço | Porta | URL |
|---------|-------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 4000 | http://localhost:4000 |
| API Docs | 4000 | http://localhost:4000/api/docs |
| PostgreSQL | 5432 | postgresql://localhost:5432 |
| Redis | 6379 | redis://localhost:6379 |
| MinIO API | 9000 | http://localhost:9000 |
| MinIO Console | 9001 | http://localhost:9001 |
| Prisma Studio | 5555 | http://localhost:5555 |

---

## 🎯 Próximos passos

Após executar todos os comandos acima:

1. ✅ Acesse http://localhost:3000
2. ✅ Faça login com: `demo@pwrfinancas.com` / `demo123456`
3. ✅ Explore o sistema!

**Pronto para desenvolver!** 🚀

---

## 📚 Documentação adicional

- [README.md](./README.md) - Documentação completa
- [QUICKSTART.md](./QUICKSTART.md) - Guia rápido
- [PROJETO-COMPLETO.md](./PROJETO-COMPLETO.md) - Resumo do que foi criado
- [API Docs](http://localhost:4000/api/docs) - Swagger (após iniciar)
