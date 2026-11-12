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
