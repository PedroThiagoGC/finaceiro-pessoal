# PWR Finanças — Guia de execução local e com Docker

Este documento descreve passo a passo como subir a aplicação completa (backend + frontend) localmente usando npm e também como subir via Docker Compose.

## Requisitos
- Node.js >= 18.x
- npm >= 9.x
- Docker & Docker Compose (para execução via containers)
- Git (opcional)

> Se for Windows: use PowerShell ou cmd para executar os comandos. Nos exemplos a seguir uso ambos formatos quando necessário.


## 1) Executar localmente com npm (desenvolvimento)

1. Clonar o repositório e entrar na raiz do projeto:

```powershell
git clone <repo-url>
cd finaceiro-pessoal
```

2. Instalar dependências na raiz (workspace) e nos pacotes:

```powershell
# na raiz do repo
npm install
```

3. Subir todos os serviços em modo dev (API + Web) simultaneamente:

```powershell
# na raiz do repo
npm run dev
```

Isso usa `concurrently` para iniciar `@pwr/api` e `@pwr/web` em paralelo.

Notas e passos manuais alternativos:
- Se preferir rodar apenas o frontend:

```powershell
cd apps/web
npm install
npm run dev
```

- Para rodar apenas o backend:

```powershell
cd apps/api
npm install
npm run dev
```

### Banco de dados (local com PostgreSQL)
- A aplicação espera um PostgreSQL disponível para a API. Se preferir não usar Docker, instale o PostgreSQL localmente e configure a variável `DATABASE_URL` apontando para o DB.

- Para criar/migrar o schema localmente (quando a API estiver configurada):

```powershell
# na raiz do repo
npm run db:generate
npm run db:migrate
npm run db:seed
```

> Os scripts de migração usam o pacote `@pwr/api` (prisma) internamente.

### Variáveis de ambiente importantes
- `NEXT_PUBLIC_API_URL` — URL pública do backend (ex: `http://localhost:4000`) para o frontend.
- `DATABASE_URL` — string de conexão do banco para a API.
- `JWT_SECRET` — secret do JWT para a API.

Você pode definir variáveis em um `.env` local ou passar no ambiente quando iniciar.


## 2) Executar com Docker Compose (recomendado para reproduzir ambiente)

1. Certifique-se de ter Docker e Docker Compose instalados.
2. Na raiz do projeto, rode:

```powershell
# Inicia containers em background (postgres, redis, minio, api, web)
npm run docker:up

# Ou diretamente:
# docker-compose -f infra/docker-compose.yaml up -d
```

3. Verifique logs:

```powershell
npm run docker:logs
# ou
# docker-compose -f infra/docker-compose.yaml logs -f
```

4. Parar e remover:

```powershell
npm run docker:down
# ou
# docker-compose -f infra/docker-compose.yaml down
```

### Observações sobre docker-compose
- O `docker-compose.yaml` já expõe as portas 3000 (frontend) e 4000 (backend).
- As variáveis de ambiente sensíveis (JWT secret, credentials do Postgres, etc.) estão definidas no compose para desenvolvimento. Em produção, substitua por secrets/variáveis seguras.


## 3) Problemas comuns e resolução
- Erro `Network Error` no login do frontend:
  - Verifique se o backend (`@pwr/api`) está em execução e escutando em `http://localhost:4000`.
  - Confirme que `NEXT_PUBLIC_API_URL` está apontando para `http://localhost:4000` (no docker-compose já está configurado para o container web).
  - Verifique CORS na API — a API deve aceitar requisições do frontend (origem `http://localhost:3000`). No `infra/docker-compose.yaml` a variável `FRONTEND_URL` está definida para `http://localhost:3000`.

- Problemas de types/paths (import `@/...` não resolvido):
  - O projeto usa `tsconfig.paths` e workspaces. Se tiver problemas no editor, carregue o workspace na raiz do repositório para que o editor entenda os paths.


## 4) Comandos úteis (resumo)
- Instalar tudo na raiz (workspaces):

```powershell
npm install
```

- Rodar frontend apenas:

```powershell
cd apps/web
npm run dev
```

- Rodar backend apenas:

```powershell
cd apps/api
npm run dev
```

- Rodar ambos (desenvolvimento) na raiz:

```powershell
npm run dev
```

- Docker compose:

```powershell
npm run docker:up
npm run docker:logs
npm run docker:down
```

## 5) Notas finais
- Em Windows, prefira PowerShell ou Git Bash para rodar os comandos; os exemplos no README usam PowerShell.
- Se precisar, eu posso:
  - Adicionar um `.env.example` e instruções para criar `.env` por serviço.
  - Adicionar scripts para facilitar a inicialização (ex.: `start:local` que roda postgres via Docker Compose e api/web via npm).

---

