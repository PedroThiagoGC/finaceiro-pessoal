# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-01-16

### Adicionado
- Sistema completo de gestão financeira pessoal mobile-first
- Autenticação JWT com e-mail/senha
- Multi-tenant com isolamento completo de dados por usuário
- CRUD completo de contas bancárias
- CRUD completo de cartões de crédito
- CRUD completo de categorias de receitas/despesas
- CRUD completo de transações financeiras
- Sistema de orçamentos mensais/trimestrais/anuais
- Dashboard com visão geral (receitas, despesas, saldo)
- Analytics por categoria com gráficos
- Analytics por cartão de crédito
- Cashflow diário do mês
- Status "no vermelho" (saldo negativo, orçamento estourado)
- Consulta de fatura de cartão por período
- PWA instalável com manifest.json
- Service Worker com Workbox para cache
- IndexedDB (Dexie) para funcionamento offline
- Background Sync para sincronização automática
- Upload de arquivos com MinIO (S3-compatible)
- Infraestrutura Docker Compose (Postgres, Redis, MinIO)
- Seed de dados iniciais (usuário demo, categorias, transações)
- Documentação Swagger da API
- README completo com guia de instalação
- Guia de início rápido (QUICKSTART.md)

### Tecnologias
- Backend: NestJS 10, Prisma 5, PostgreSQL, Redis, BullMQ
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS
- PWA: Workbox, Dexie.js, Background Sync API
- Infra: Docker Compose, MinIO, pnpm workspaces

### Segurança
- Senhas hasheadas com bcryptjs (salt rounds: 10)
- JWT com expiração de 7 dias
- Multi-tenant estrito em todas as queries
- Validação de input com Zod (frontend e backend)
- CORS configurado

---

## [Futuro] - Planejado

### A implementar
- [ ] OCR funcional com Tesseract.js para extração de dados de recibos
- [ ] Worker BullMQ para processar OCR em background
- [ ] Regras recorrentes automáticas (assinaturas, contas fixas)
- [ ] Worker para gerar transações planejadas de recorrências
- [ ] Conciliação automática de transações
- [ ] Empréstimos e cálculo de saldo devedor
- [ ] Fechamento e pagamento de fatura de cartão
- [ ] Snapshots diários de saldos
- [ ] Export CSV/PDF de transações e relatórios
- [ ] Push notifications para lembretes de faturas
- [ ] Câmera para captura de recibos (getUserMedia)
- [ ] Compressão client-side de imagens
- [ ] Bottom navigation bar completa (5 abas)
- [ ] FAB (Floating Action Button) para nova transação
- [ ] Gráficos Recharts completos nos dashboards
- [ ] Swipe gestures e pull-to-refresh
- [ ] Skeletons de carregamento
- [ ] Testes Jest (unitários backend)
- [ ] Testes Cypress (E2E frontend)
- [ ] CI/CD com GitHub Actions
- [ ] Deploy automatizado
- [ ] Lighthouse score ≥ 90

### Melhorias futuras
- [ ] Login via magic link (sem senha)
- [ ] OCR via Google Vision API (alternativa ao Tesseract)
- [ ] Internacionalização (i18n) multi-idioma
- [ ] Dark mode persistente
- [ ] Temas customizáveis
- [ ] Relatórios avançados com filtros complexos
- [ ] Metas financeiras
- [ ] Comparação de períodos (mês vs mês)
- [ ] Previsão de gastos com IA
- [ ] Integração com open banking
- [ ] Import de OFX/CSV de bancos
- [ ] Compartilhamento de orçamento familiar
- [ ] Suporte a múltiplas moedas
- [ ] Taxa de câmbio automática
