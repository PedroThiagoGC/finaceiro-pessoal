# Contribuindo para PWR Finanças

Obrigado por considerar contribuir com o PWR Finanças! 🎉

## Como contribuir

### Reportar bugs

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/seu-usuario/pwr-financas/issues)
2. Se não, crie uma nova issue com:
   - Título descritivo
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Ambiente (SO, navegador, versão do Node)

### Sugerir features

1. Verifique se já existe uma issue para a feature
2. Crie uma issue com tag `enhancement` descrevendo:
   - Problema que a feature resolve
   - Solução proposta
   - Alternativas consideradas
   - Mockups/exemplos (se aplicável)

### Enviar Pull Requests

1. Fork o projeto
2. Crie uma branch:
   ```bash
   git checkout -b feature/minha-feature
   # ou
   git checkout -b fix/meu-bugfix
   ```
3. Faça suas alterações seguindo o estilo de código
4. Adicione testes (se aplicável)
5. Commit com mensagens descritivas:
   ```bash
   git commit -m "feat: adiciona dashboard de investimentos"
   git commit -m "fix: corrige cálculo de saldo"
   ```
6. Push para sua branch:
   ```bash
   git push origin feature/minha-feature
   ```
7. Abra um Pull Request

### Padrão de commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Apenas documentação
- `style:` Formatação (não afeta lógica)
- `refactor:` Refatoração de código
- `test:` Adiciona/corrige testes
- `chore:` Tarefas de build, CI, dependências

Exemplos:
```
feat(auth): adiciona login via Google
fix(transactions): corrige filtro por data
docs(readme): atualiza guia de instalação
```

### Estilo de código

- **TypeScript**: Tipagem estrita, evite `any`
- **Prettier**: Formatação automática (`pnpm format`)
- **ESLint**: Sem warnings (`pnpm lint`)
- **Nomes**: camelCase para variáveis, PascalCase para componentes/classes

### Testes

```bash
# Backend (Jest)
cd apps/api
pnpm test

# Frontend (Cypress)
cd apps/web
pnpm test:e2e
```

Toda nova feature deve incluir testes.

### Documentação

- Atualize o README se adicionar features
- Documente funções complexas com JSDoc
- Adicione comentários explicativos quando necessário

## Code Review

Pull Requests passarão por revisão. Feedback construtivo é sempre bem-vindo!

### Checklist do PR

- [ ] Código segue o estilo do projeto
- [ ] Testes passam localmente
- [ ] Nova feature tem testes
- [ ] Documentação atualizada
- [ ] Sem conflitos com `main`
- [ ] Commits seguem Conventional Commits

## Comunidade

- Seja respeitoso e inclusivo
- Discussões construtivas são encorajadas
- Reporte comportamento inadequado

## Dúvidas?

Abra uma issue com a tag `question` ou entre em contato por e-mail.

---

**Obrigado por contribuir! 🚀**
