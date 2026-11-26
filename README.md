# Silverbox Web

## Desenvolver o front usando a API publicada

Requer somente Node 24 e pnpm 11 (ou npm 11). Não precisa subir API, PostgreSQL ou storage:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abra http://localhost:5173, cadastre uma conta por e-mail/senha e use os arquivos normalmente. Sem `.env`, o destino é https://api.silverbox.perlin.com.br. Os dados e contas criados são reais nessa instância compartilhada; use arquivos de teste.

O navegador acessa `/__api` na mesma origem do Vite. Esse proxy encaminha as chamadas HTTP, Better Auth e downloads para a API publicada com TLS validado. Somente no transporte local, os cookies Better Auth recebem o prefixo `silverbox-dev.`, caminho `/__api` e perdem `Secure`/`Domain`; HttpOnly, SameSite e expiração são preservados. Ao encaminhar, os nomes originais são restaurados. A API publicada continua emitindo cookies Secure e SameSite=Lax. Outros cookies locais não são encaminhados. Logout apaga também o cookie local.

O proxy rejeita chamadas originadas em outros sites e escuta em `localhost`. Não exponha o servidor de desenvolvimento na rede. Para mudar a API, copie `.env.example` para `.env` e defina `VITE_API_URL` com uma origem HTTP(S), sem caminho/barra final; reinicie o Vite. Para desenvolver também o back, use `http://localhost:8000`.

Esse fluxo cobre autenticação por e-mail/senha. Google continua dependendo da configuração OAuth da instância e seus callbacks; não é necessário para integrar o front.

## Rodar local com Docker

Com a API já disponível, execute neste repositório:

```sh
docker compose up --build -d --wait
```

Web: http://localhost:5173. API padrão: http://localhost:8000. Para subir a API e PostgreSQL, execute `docker compose up --build -d --wait` na pasta `app/` do repositório `silverbox-api`. Nenhum Node, pnpm, Oracle ou Google OAuth é necessário na máquina.

Logs: `docker compose logs -f web`. Parar: `docker compose down`. O web não guarda dados em volumes. A limpeza dos dados da API deve ser feita explicitamente no repositório da API.

O contêiner Nginx não usa o proxy de desenvolvimento. Para apontar o contêiner a outra API: `API_URL=https://api.seudominio docker compose up -d --force-recreate`. Não reconstruir a imagem para mudar a origem: `/runtime-config.js` é gerado no início, sem cache. Usar origens HTTP(S), sem caminho ou barra final. Para sessões diretas, use web/API no mesmo site HTTPS e configure a origem no Better Auth da API; CORS sozinho não altera as regras SameSite do navegador.

## Acesso administrativo

As rotas `/admin/*` exigem sessão e papel `admin`. Anônimo é redirecionado ao
login; usuário comum vê "Acesso negado". Esconder o menu é só usabilidade: a
autorização real é feita no servidor.

Para testar: cadastre uma conta comum por `/cadastro` e peça à equipe da API
para promovê-la (veja o README do `silverbox-api`). Faça logout e login de novo
após a mudança de papel. Nunca registre e-mails, senhas ou tokens de contas
administrativas em código, issues ou tickets.

## Desenvolvimento

Node 24 e pnpm 11:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm lint
pnpm test
```

Copiar `.env.example` para `.env` se precisar mudar `VITE_API_URL` no Vite. npm continua suportado: `npm ci`, `npm run dev`, `npm run build`. Os dois lockfiles são versionados e devem ser atualizados juntos. Testes são TypeScript; `pnpm test` verifica o proxy e Docker (porta 5173 livre). Teste somente do proxy: `node --test test/api-proxy.test.ts`.

### Aceite no navegador

Para o aceite de uma entrega, use o navegador disponível. Assim o CI evita baixar e manter navegadores a cada execução. Valide a versão publicada com contas de teste de usuário comum e administrador.

1. Abra uma rota protegida sem sessão e confira o redirecionamento. Entre como usuário comum e confirme o acesso negado à área administrativa. Entre como admin e confira logout e mudança de papel.
2. Com dados de teste, crie uma pasta, envie e baixe um arquivo, confira as versões, mova um arquivo para a lixeira e restaure-o. Valide compartilhamento, busca e persistência da foto de perfil após recarregar.
3. Solicite a recuperação na caixa de teste, abra o link, troque a senha e entre com a nova. Confira as mensagens para links expirados ou reutilizados.
4. Como admin, aplique filtros de período, usuário e ação na auditoria. Confira que a paginação mantém os filtros e que o CSV inclui registros de todas as páginas filtradas.
5. Confira carregamento, estado vazio, erro e retentativa, confirmação de ações e submissão repetida. Teste acesso direto, recarregamento, página inexistente, teclado e tela estreita.

Registre no PR o commit publicado, as jornadas validadas e os cenários que ficaram pendentes.

A imagem final serve SPA com Nginx sem root (UID101), healthcheck `/health`, assets imutáveis e configuração de API em runtime. Não publica `.env` no build.

CI/CD e preparação da Oracle: [deploy/README.md](deploy/README.md).

A página pública de vendas fica em `/`, com acesso também por `/planos`. O painel da conta fica em `/home` e exige login. Login e cadastro sem destino informado retornam para `/home`; links com uma seleção de plano preservam essa seleção.

**Estado funcional:** autenticação está conectada ao Better Auth. Telas de gerenciamento de arquivos ainda têm mocks; publicar este web não conclui a integração dessas telas com a API.

## Instância Oracle

Web: https://silverbox.perlin.com.br. API: https://api.silverbox.perlin.com.br. Google desabilitado por enquanto; login por senha habilitado. Consulte [dados/producao-2026-10-22.md](dados/producao-2026-10-22.md) para resultados e limites da validação.
