# Silverbox Web

## Rodar local com Docker

Com a API já disponível, execute neste repositório:

```sh
docker compose up --build -d --wait
```

Web: http://localhost:5173. API padrão: http://localhost:8000. Para subir a API e PostgreSQL, execute `docker compose up --build -d --wait` na pasta `app/` do repositório `silverbox-api`. Nenhum Node, pnpm, Oracle ou Google OAuth é necessário na máquina.

Logs: `docker compose logs -f web`. Parar: `docker compose down`. O web não guarda dados em volumes. A limpeza dos dados da API deve ser feita explicitamente no repositório da API.

Para apontar o contêiner a outra API: `API_URL=https://api.seudominio docker compose up -d --force-recreate`. Não reconstruir a imagem para mudar a origem: `/runtime-config.js` é gerado no início, sem cache. Usar origens HTTP(S), sem caminho ou barra final. Autorizar a origem do web no CORS/Better Auth da API.

## Desenvolvimento

Node 24 e pnpm 11:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm lint
pnpm test
```

Copiar `.env.example` para `.env` se precisar mudar `VITE_API_URL` no Vite. npm continua suportado: `npm ci`, `npm run dev`, `npm run build`. Os dois lockfiles são versionados e devem ser atualizados juntos. Testes são TypeScript; `pnpm test` usa Docker e porta 5173 livre.

A imagem final serve SPA com Nginx sem root (UID101), healthcheck `/health`, assets imutáveis e configuração de API em runtime. Não publica `.env` no build.

CI/CD e preparação da Oracle: [deploy/README.md](deploy/README.md).

**Estado funcional:** autenticação está conectada ao Better Auth. Telas de gerenciamento de arquivos ainda têm mocks; publicar este web não conclui a integração dessas telas com a API.

## Instância Oracle

Web: https://silverbox.perlin.com.br. API: https://api.silverbox.perlin.com.br. Google desabilitado por enquanto; login por senha habilitado. Consulte [dados/producao-2026-10-22.md](dados/producao-2026-10-22.md) para resultados e limites da validação.
