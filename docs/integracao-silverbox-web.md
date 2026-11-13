# Integração da página de planos

Destino: [CaioHPerlin/silverbox-web](https://github.com/CaioHPerlin/silverbox-web). Para criar a branch, selecionar arquivos, validar e abrir o pull request, siga o [README de envio da página de vendas](README-envio-pagina-vendas.md).

## Base da integração e patch atualizado

A aplicação local foi inicialmente adaptada ao commit `183b726b867ad264b08fd18ffe81c1383dce6e19`. Em 12/11/2026, o guia, o manifesto e o patch de transporte foram atualizados para a `main` `ee3581917acb8daea5afdcabc8a108b2ad497624`, após os merges dos PRs #2 e #7 e a proteção das rotas administrativas. A entrega incorpora a troca do nome exibido para Silverbox.

`docs/silverbox-web-planos.patch` contém as alterações dos 26 caminhos em [arquivos-para-branch.txt](arquivos-para-branch.txt). É um artefato para aplicar no clone de destino; o envio ao GitHub seleciona os arquivos resultantes, não o próprio patch. Os comandos de aplicação estão no README de envio.

O patch anterior incluía ajustes em hooks de arquivos/cota/lixeira e em modais. A `main` agora tem correções mais recentes nesses pontos, incluindo `useAsyncData`. O patch atualizado preserva essas versões do destino, a identidade e proteção administrativas, a atualização da sessão após autenticação e o acesso à API publicada. Também preserva Docker, testes de contêiner e CI/CD. Não leve esses hooks e modais da pasta local por cima do repositório atual.

## Arquitetura e arquivos

- Página pública: `src/pages/Planos.tsx`, registrada em `/planos` no `src/App.tsx`.
- Apresentação: `src/components/pricing/`, usando Tailwind, Lucide e a logo existentes.
- Catálogo: `src/data/plans.ts`; tipos em `src/types/billing.ts`; cálculo e seleção em `src/lib/pricing.ts`.
- Navegação de autenticação: `src/lib/authNavigation.ts`, reutilizada por login, cadastro e proteção das rotas da conta.
- Integração: sidebar e perfil oferecem acesso aos planos; o perfil consulta a cota pelo hook existente.
- Testes: `test/pricing.test.ts`, com o script adicional `test:pricing` em `package.json`.
- Marca: cabeçalhos, menus, telas de acesso, descrição do site e campo de busca exibem Silverbox.

A página reutiliza os clientes existentes de API e Better Auth, com sessão por cookie, e não adiciona dependências. Preserve os dois lockfiles e o carregamento de `/runtime-config.js`.

## Fluxo implementado

1. `/planos` exibe o Free disponível e as propostas dos planos pagos sem exigir login.
2. Escolher uma oferta abre o resumo com plano, ciclo, pessoas e total.
3. O resumo oferece criar uma conta gratuita ou entrar, mantendo a seleção em um `returnTo` interno.
4. Login e cadastro retornam à seleção restaurada. Sem `returnTo`, mantêm o destino padrão `/`.
5. A raiz e as telas da conta ficam protegidas pela sessão. Sidebar e perfil permitem retornar aos planos.

O Free corresponde ao padrão da API analisada: 1 GiB de armazenamento e limite de arquivo de 1 GiB. Versões e lixeira também ocupam a cota. Os planos pagos continuam como propostas `coming-soon`; contratação, confirmação de pagamento e ativação de assinatura dependem da implementação comercial do backend.

## Validação

Execute os comandos do README de envio no clone atualizado: lint, build, testes de preços/navegação, suíte Docker e build por npm. O CI atual executa testes de contêiner e os hooks da `main` devem permanecer na versão já validada pelo repositório.

Confira no navegador acesso público, ciclos, resumo e marca. Para testar login/cadastro e cota reais, disponibilize o `silverbox-api`, configure a origem da API e autorize a origem do navegador no backend.

Validação antes do envio, em worktree baseada na `main` `ee35819`, com Node 24.20.0:

- `npm run build`: passou com TypeScript e Vite.
- `npm run lint`: passou com zero erros e cinco avisos nas telas existentes.
- `npm run test:pricing`: cinco testes passaram.
- `npm test`: o teste do proxy da API e os cinco testes de preços passaram; o teste Docker falhou por falta de permissão no socket `/var/run/docker.sock`, mesmo fora da sandbox. A validação Docker precisa ser concluída pelo CI ou em ambiente com acesso ao daemon.

As proteções administrativas, a atualização da sessão em login/cadastro e os arquivos do proxy/API da `main` foram preservados na integração. Os relatórios anteriores em `docs/analise-*` registram revisões antigas.
