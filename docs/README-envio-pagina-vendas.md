# Envio da página de vendas do Silverbox ao GitHub

Este guia explica como criar a branch, levar os arquivos da página pública `/planos` e abrir um pull request no [CaioHPerlin/silverbox-web](https://github.com/CaioHPerlin/silverbox-web). A entrega inclui a atualização do nome para **Silverbox** nas telas existentes.

## Padrão conferido no repositório

Consulta realizada em 12/11/2026, com a `main` no commit [`ee3581917acb8daea5afdcabc8a108b2ad497624`](https://github.com/CaioHPerlin/silverbox-web/commit/ee3581917acb8daea5afdcabc8a108b2ad497624), após os merges dos [PRs #2](https://github.com/CaioHPerlin/silverbox-web/pull/2) e [#7](https://github.com/CaioHPerlin/silverbox-web/pull/7), incluindo a proteção administrativa.

| Item | Padrão observado e aplicação nesta entrega |
| --- | --- |
| Branches | Existem `feature/ci-cd`, `ci/optimize-web-ci-cd`, `feature-setup-github-actions` e `temp-me`. Usar `feature/pagina-vendas`, seguindo o formato com prefixo e barra. |
| Commits | O histórico recente usa `ci(web): ...`, `fix(web): ...` e `docs(ci): ...`. Para esta entrega: `feat(web): adiciona pagina de vendas do Silverbox`. |
| Integração | Branch própria e pull request para `main`, como no PR #2. |
| Estrutura | React + TypeScript, páginas em `src/pages`, componentes em `src/components` e testes em `test`. |
| Validação | Node 24, pnpm 11, lint, build e testes Docker; há um job npm condicional. |

Não foi encontrado `CONTRIBUTING.md` nem template de pull request na revisão consultada. Os nomes seguem o histórico observado; não representam uma regra formal de nomes imposta pelo GitHub.

## 1. Abrir o clone correto e criar a branch

A pasta `/home/kaique/Documentos/minha-nuvem-pagarme/frontend` já contém `.git` e tem `origin` apontando para o **silverbox-web**. Execute os comandos em um clone ou worktree limpo; confira o status antes de integrar a entrega.

Se ainda não tiver o clone:

```sh
cd /home/kaique/Documentos
git clone https://github.com/CaioHPerlin/silverbox-web.git
cd silverbox-web
```

Se já tiver o clone, entre na raiz dele. Confira a origem e o trabalho pendente:

```sh
git remote -v
git status --short
```

O `origin` deve apontar para `CaioHPerlin/silverbox-web`. Se o status listar alterações suas, conclua ou guarde esse trabalho antes de trocar de branch. Depois:

```sh
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c feature/pagina-vendas
```

Se houver alterações locais que você precisa preservar, crie a branch em uma worktree separada, a partir de `origin/main`, em vez de trocar a branch da pasta em uso:

```sh
git worktree add -b feature/pagina-vendas /tmp/silverbox-web-pagina-vendas origin/main
cd /tmp/silverbox-web-pagina-vendas
```

Use uma das alternativas de criação da branch. A branch existe localmente. O `git push -u` da etapa 5 criará a branch no GitHub. Se ela já existir, use `git switch feature/pagina-vendas` para continuar o trabalho existente.

## 2. Aplicar os arquivos da entrega

O patch atualizado está na pasta de origem e foi preparado contra a `main` `ee35819`. Inclui página, integração, marca Silverbox e estes documentos, preservando o CI do PR #2, a proteção administrativa e a integração com a API do PR #7.

Dentro do clone ou worktree limpo, na branch `feature/pagina-vendas`, execute:

```sh
git apply --check /home/kaique/Documentos/minha-nuvem-pagarme/frontend/docs/silverbox-web-planos.patch
git apply /home/kaique/Documentos/minha-nuvem-pagarme/frontend/docs/silverbox-web-planos.patch
git diff --check
git status --short
```

Só execute o segundo comando se o `--check` terminar com sucesso. Se a `main` tiver mudado e o check falhar, compare os arquivos e adapte os trechos à revisão atual. A lista abaixo também serve para integração manual: copie os arquivos novos para os mesmos caminhos e incorpore as mudanças nos arquivos existentes.

## 3. Quais arquivos subir

O manifesto [arquivos-para-branch.txt](arquivos-para-branch.txt) contém os **26 caminhos** desta entrega, relativos à raiz do `silverbox-web`. Mantenha essa estrutura, sem criar uma pasta `frontend/` dentro do repositório.

### Arquivos novos da página e dos testes

| Arquivo | Função |
| --- | --- |
| `src/pages/Planos.tsx` | Página pública de vendas em `/planos`. |
| `src/components/pricing/PlanCard.tsx` | Cartões e seleção de pessoas. |
| `src/components/pricing/PlanSummary.tsx` | Resumo e acesso ao cadastro/login. |
| `src/components/pricing/PlansComparison.tsx` | Comparação dos planos. |
| `src/components/pricing/PricingBrand.tsx` | Marca Silverbox no cabeçalho e rodapé. |
| `src/data/plans.ts` | Catálogo e disponibilidade dos planos. |
| `src/types/billing.ts` | Tipos de planos, ciclos e seleção. |
| `src/lib/pricing.ts` | Preços, limites de pessoas e seleção na URL. |
| `src/lib/authNavigation.ts` | Retorno interno após login/cadastro. |
| `test/pricing.test.ts` | Testes do catálogo, cálculos e navegação. |

### Arquivos existentes com alterações de integração

| Arquivo | Alteração a incorporar |
| --- | --- |
| `src/App.tsx` | Registrar `/planos` como rota pública e manter as proteções da conta e das rotas administrativas. |
| `src/components/ProtectedRoute.tsx` | Preservar o destino interno ao encaminhar para o login. |
| `src/components/Sidebar.tsx` | Link para planos e marca Silverbox no desktop e celular. |
| `src/pages/Login.tsx` | Preservar `returnTo` e a atualização da sessão, oferecer acesso aos planos e atualizar a marca. |
| `src/pages/Cadastro.tsx` | Preservar `returnTo` e a atualização da sessão, atualizar a marca e o texto do plano gratuito. |
| `src/pages/Perfil.tsx` | Link para planos e consulta da cota pelo hook existente. |
| `index.html` | Idioma `pt-BR` e descrição Silverbox, mantendo o título e `/runtime-config.js`. |
| `package.json` | Adicionar somente o script `test:pricing`; preservar os demais scripts e dependências. |

O script adicional de `package.json` é:

```json
"test:pricing": "node --test --test-isolation=none test/pricing.test.ts"
```

### Arquivos existentes com a troca do nome para Silverbox

| Arquivo | Alteração |
| --- | --- |
| `src/components/Adminsidebar.tsx` | Nome do site, preservando identidade, papel e logout reais do menu administrativo. |
| `src/pages/Home.tsx` | Texto de busca: “Buscar no Silverbox”. |
| `src/pages/NotFound.tsx` | Nome do site na página de rota inexistente. |
| `src/pages/RecuperarAcesso.tsx` | Nome do site na recuperação de acesso. |
| `src/pages/NovaSenha.tsx` | Nome do site na redefinição de senha. |

Esses cinco arquivos completam a troca de nome já solicitada. Os demais textos de marca estão nos arquivos de integração e componentes listados acima.

### Documentação a incluir

| Arquivo | Função |
| --- | --- |
| `docs/README-envio-pagina-vendas.md` | Este passo a passo de envio. |
| `docs/integracao-silverbox-web.md` | Contexto técnico e comportamento da integração. |
| `docs/arquivos-para-branch.txt` | Lista exata usada no `git add`. |

### Arquivos que permanecem na versão atual do repositório

A `main` recebeu correções posteriores à base inicial desta página. Preserve as versões atuais de `src/hooks/useArquivos.ts`, `src/hooks/useCota.ts`, `src/hooks/useLixeira.ts`, `src/hooks/useAsyncData.ts`, `src/components/FolderPickerModal.tsx` e `src/components/VersionsModal.tsx`. Esses arquivos não fazem parte do patch atualizado.

Reutilize autenticação, serviços de API, estilos, `public/minha-nuvem-logo.png`, `public/favicon.svg` e `public/runtime-config.js` existentes. O nome do arquivo da logo continua válido após a troca do nome exibido.

Preserve também `AdminRoute`, `roles.ts`, os clientes e hooks de autenticação atuais e o proxy de desenvolvimento `dev/api-proxy.ts`.

Preserve `.github/`, `deploy/`, `Dockerfile`, `docker-compose.yml`, `test/docker.test.ts` e as configurações TypeScript/Vite/Tailwind. A página não adiciona dependências; `package-lock.json` e `pnpm-lock.yaml` permanecem como estão. Se acrescentar dependências depois, atualize os dois lockfiles conforme o README do repositório.

Preserve também o README principal do clone, que documenta Docker e produção. Para destacar a página nele, acrescente um link para `docs/README-envio-pagina-vendas.md`, sem substituí-lo pelo README desta pasta de origem.

Não inclua `.env`, `node_modules/`, `dist/`, relatórios locais de pesquisa ou a pasta inteira de origem. `docs/silverbox-web-planos.patch` é o arquivo de transporte: o commit deve conter os arquivos resultantes da aplicação, listados no manifesto.

## 4. Validar no clone antes do commit

Use Node 24 e pnpm 11, conforme o [CI do repositório](https://github.com/CaioHPerlin/silverbox-web/blob/ee3581917acb8daea5afdcabc8a108b2ad497624/.github/workflows/ci.yml):

```sh
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm run test:pricing
```

Para executar também a suíte completa usada pelo CI, com Docker ativo e porta 5173 livre:

```sh
docker build -t silverbox-web-test:pagina-vendas .
TEST_IMAGE=silverbox-web-test:pagina-vendas pnpm test
```

Como a entrega altera `package.json`, o detector atual do CI também habilita o job npm. Valide:

```sh
npm ci
npm run build
```

Para conferir a interface, execute `pnpm dev` e abra `http://localhost:5173/planos`. Verifique a página sem login, troca mensal/anual, resumo e marca Silverbox. Com a API disponível, confira o retorno à seleção após login/cadastro e os links do menu/perfil.

Os planos pagos aparecem como propostas “em breve”. Esta entrega não implementa checkout, cobrança ou ativação de assinatura paga.

## 5. Adicionar somente a entrega, fazer commit e push

Ainda na raiz do clone:

```sh
git add --pathspec-from-file=docs/arquivos-para-branch.txt
git diff --cached --check
git diff --cached --stat
git diff --cached
git status --short
```

Confira os arquivos preparados antes de continuar. O manifesto seleciona os caminhos da entrega; alterações que já estavam preparadas antes continuam no índice e precisam ser revisadas também. Quando o conteúdo estiver correto:

```sh
git commit -m "feat(web): adiciona pagina de vendas do Silverbox"
git push -u origin feature/pagina-vendas
```

O push publica a branch no GitHub. Para ajustes posteriores, use novos commits e `git push` nessa mesma branch.

## 6. Abrir o pull request

Abra a [comparação de `main` com `feature/pagina-vendas`](https://github.com/CaioHPerlin/silverbox-web/compare/main...feature/pagina-vendas?expand=1) depois do push e crie o pull request com:

- **Base:** `main`.
- **Compare:** `feature/pagina-vendas`.
- **Título:** `feat(web): adiciona pagina de vendas do Silverbox`.

Modelo de descrição:

```markdown
A página pública /planos apresenta o catálogo do Silverbox, compara os planos e
preserva a seleção ao encaminhar para login e cadastro. Menus e telas de acesso
passam a exibir Silverbox. Os planos pagos continuam como propostas em breve.

Reutiliza autenticação, cota e configuração de API existentes. Preserva as
correções de CI/CD, carregamento de dados, proteção administrativa e acesso à
API publicada já integradas à main.

Validação: registrar os resultados reais de pnpm lint, pnpm build,
pnpm run test:pricing, pnpm test com Docker, npm ci e npm run build.
Informar os cenários de interface conferidos e qualquer check pendente.
```

Na revisão consultada, pushes em `feature/pagina-vendas` não acionam o CI automaticamente; o pull request para `main` aciona as validações. Acompanhe os checks e corrija falhas antes do merge. Não use `[skip ci]` no commit desta funcionalidade.

O [workflow de publicação](https://github.com/CaioHPerlin/silverbox-web/blob/ee3581917acb8daea5afdcabc8a108b2ad497624/.github/workflows/deploy.yml) reage ao CI bem-sucedido de um push na `main`, com suas condições de release e ambiente. Abrir o PR valida a branch; o merge segue o fluxo de publicação já configurado no repositório.
