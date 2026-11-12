# Validação de CI/CD — 2026-11-12

## Referência anterior

- Front: 23 runs consecutivas reprovadas antes da correção, 21–102s. Não comparar essas falhas com um deploy completo aprovado.
- Referência do fluxo completo aprovado: 133–179s. Run 39878247881: total 179s, CI pnpm 45s, deploy 124s.
- Nessa run: publicação 41s, startup/rollback ARM64 17s, ensaio Oracle 34s, aplicação 15s e HTTPS 1s.
- A suíte Oracle saiu do fluxo automático; o custo observado era 33–34s nas duas runs inspecionadas.

## Validação após merge

Registrar três pushes equivalentes em main com CI e deploy bem-sucedidos. A primeira execução aquece o novo cache; comparar as seguintes separadamente. Como CI e deploy agora são workflows distintos, medir a latência entre o push e o fim do deploy, incluindo a espera entre workflows. Não somar jobs paralelos.

| Amostra | SHA | URL CI | Fila CI | Execução CI | URL deploy | Espera até deploy | Execução deploy | Total |
|---|---|---|---|---|---|---|---|---|
| 1 — cache inicial | pendente | | | | | | | |
| 2 — cache aquecido | pendente | | | | | | | |
| 3 — cache aquecido | pendente | | | | | | | |

Conferir: fonte sem mudança de dependências dispensa npm; lockfile executa npm; CI reprovado/cancelado/PR não publica; SHA ultrapassado não aplica; manual com deploy=false testa Oracle sem trocar current; novo push cancela CI antigo sem cancelar deploy ativo. Não há promessa de ganho exato antes dessas medições.

## Evidências executadas nesta branch

Runs manuais do CI no GitHub, todas aprovadas. Estes tempos incluem fila e CI, **sem publicação nem deploy**. As primeiras três usam o mesmo SHA; a quarta do front valida também a correção de preservação de dados e escopo de erros. Não comparar diretamente com os totais anteriores de CI + deploy.

| Amostra | SHA | Run | Fila inicial | CI após início do primeiro job | Total | Build Docker | Teste Docker |
|---|---|---|---|---|---|---|---|
| 1 — cache inicial | `1ae7282` | [43289719854](https://github.com/CaioHPerlin/silverbox-web/actions/runs/43289719854) | 4s | 110s | 114s | 62s | 7s |
| 2 — cache aquecido | `1ae7282` | [43290142982](https://github.com/CaioHPerlin/silverbox-web/actions/runs/43290142982) | 4s | 66s | 71s | 9s | 7s |
| 3 — cache aquecido | `1ae7282` | [43290382355](https://github.com/CaioHPerlin/silverbox-web/actions/runs/43290382355) | 4s | 50s | 54s | 7s | 8s |
| 4 — correção final do front | `1f12ba2` | [43290662538](https://github.com/CaioHPerlin/silverbox-web/actions/runs/43290662538) | 4s | 74s | 79s | 22s | 7s |

O custo inicial de exportação do cache GHA foi 44s no front. A construção aquecida ficou mais rápida, mas ainda há custo de provisionamento do runner, Buildx, importação da imagem e instalação npm. A validação npm foi executada nas amostras porque são disparos manuais.

Verificações locais: `actionlint` nos dois workflows e sete testes Node da seleção npm/autorização de releases aprovados. Confirmado no GitHub que main não possui branch protection nem regras de checks obrigatórios; nenhuma configuração do repositório foi alterada. Ambos os lockfiles permaneceram intactos.

Front: build, lint (zero erros, cinco avisos preexistentes) e teste Docker aprovados. Quatro cenários de carregamento React foram verificados em harness temporário: respostas fora de ordem/reload obsoleto, erro/desmontagem, troca de pasta/paginação vazia e preservação de dados em falha de refresh. Nenhuma dependência de teste foi adicionada ao projeto.

A autorização de publicação foi exercitada com testes de lógica (SHA exato, CI falho/cancelado, PR, repositório externo, revisão ultrapassada e disparo manual sem CI). A integração real entre `workflow_run`, publicação ARM64, aplicação e ensaio Oracle manual permanece para depois do merge, pois a política permite releases somente da main aprovada. Não houve alteração da release pública nesta validação.
