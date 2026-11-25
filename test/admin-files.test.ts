import assert from "node:assert/strict";
import { test } from "node:test";
import {
  caminhoListagem,
  confirmacaoDeExpurgo,
  escreverFiltro,
  lerFiltro,
  resultadoDoExpurgo,
  totalDePaginas,
} from "../src/lib/adminFiles.ts";

test("visão, busca e página sobrevivem ao recarregar pela URL", () => {
  const filtro = { visao: "lixeira", busca: "relatório", pagina: 3 } as const;
  const url = escreverFiltro(filtro).toString();
  assert.equal(url, "visao=lixeira&q=relat%C3%B3rio&pagina=3");
  assert.deepEqual(lerFiltro(`?${url}`), filtro);
});

test("URL vazia ou inválida volta ao padrão", () => {
  assert.deepEqual(lerFiltro(""), { visao: "ativos", busca: "", pagina: 1 });
  for (const pagina of ["0", "-1", "1.5", "abc", "10001"])
    assert.equal(lerFiltro(`?pagina=${pagina}`).pagina, 1, pagina);
  assert.equal(lerFiltro("?visao=qualquer").visao, "ativos");
  assert.equal(escreverFiltro({ visao: "ativos", busca: "  ", pagina: 1 }).toString(), "");
});

test("listagem usa o contrato de GET /admin/files", () => {
  assert.equal(
    caminhoListagem({ visao: "ativos", busca: "", pagina: 1 }),
    "/admin/files?page=1&limit=50&trash=false",
  );
  assert.equal(
    caminhoListagem({ visao: "lixeira", busca: " ana@example.com ", pagina: 2 }),
    "/admin/files?page=2&limit=50&trash=true&q=ana%40example.com",
  );
  const longa = caminhoListagem({ visao: "ativos", busca: "x".repeat(200), pagina: 1 });
  assert.equal(new URL(longa, "https://api.test").searchParams.get("q")?.length, 155);
});

test("total de páginas nunca é zero", () => {
  assert.equal(totalDePaginas(0), 1);
  assert.equal(totalDePaginas(50), 1);
  assert.equal(totalDePaginas(51), 2);
});

test("expurgo só é liberado com o nome exato do arquivo", () => {
  assert.equal(confirmacaoDeExpurgo("", "a.txt"), false);
  assert.equal(confirmacaoDeExpurgo("A.txt", "a.txt"), false);
  assert.equal(confirmacaoDeExpurgo("a", "a.txt"), false);
  assert.equal(confirmacaoDeExpurgo(" a.txt ", "a.txt"), true);
  assert.equal(confirmacaoDeExpurgo("Relatório final.pdf", "Relatório final.pdf"), true);
});

test("expurgo distingue 204 de 202 { status: deleting }", () => {
  assert.equal(resultadoDoExpurgo(undefined), "apagado");
  assert.equal(resultadoDoExpurgo({ status: "deleting" }), "em-andamento");
  assert.equal(resultadoDoExpurgo({ status: "outro" }), "apagado");
});
