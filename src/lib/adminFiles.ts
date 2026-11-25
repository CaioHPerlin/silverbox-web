// Regras puras da tela administrativa de arquivos (sem React nem fetch), testadas em test/admin-files.test.ts.

export type VisaoArquivosAdmin = "ativos" | "lixeira";

export const POR_PAGINA_ADMIN = 50;
export const TAMANHO_MAXIMO_BUSCA_ADMIN = 155; // limite de q em GET /admin/files

export type FiltroArquivosAdmin = {
  visao: VisaoArquivosAdmin;
  busca: string;
  pagina: number;
};

// Lê visão, busca e página da URL; valores inválidos voltam ao padrão.
export function lerFiltro(search: string | URLSearchParams): FiltroArquivosAdmin {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const pagina = Number(params.get("pagina"));
  return {
    visao: params.get("visao") === "lixeira" ? "lixeira" : "ativos",
    busca: (params.get("q") ?? "").trim().slice(0, TAMANHO_MAXIMO_BUSCA_ADMIN),
    pagina: Number.isInteger(pagina) && pagina >= 1 && pagina <= 10_000 ? pagina : 1,
  };
}

// Grava só o que difere do padrão, para a URL ficar limpa (?visao=lixeira&q=...&pagina=2).
export function escreverFiltro(filtro: FiltroArquivosAdmin): URLSearchParams {
  const params = new URLSearchParams();
  if (filtro.visao === "lixeira") params.set("visao", "lixeira");
  const busca = filtro.busca.trim().slice(0, TAMANHO_MAXIMO_BUSCA_ADMIN);
  if (busca) params.set("q", busca);
  if (filtro.pagina > 1) params.set("pagina", String(filtro.pagina));
  return params;
}

// Caminho de GET /admin/files. A API busca o termo no nome do arquivo e no nome/e-mail do dono.
export function caminhoListagem(filtro: FiltroArquivosAdmin, porPagina = POR_PAGINA_ADMIN): string {
  const params = new URLSearchParams({
    page: String(filtro.pagina),
    limit: String(porPagina),
    trash: filtro.visao === "lixeira" ? "true" : "false",
  });
  const busca = filtro.busca.trim().slice(0, TAMANHO_MAXIMO_BUSCA_ADMIN);
  if (busca) params.set("q", busca);
  return `/admin/files?${params}`;
}

export function totalDePaginas(total: number, porPagina = POR_PAGINA_ADMIN): number {
  return Math.max(1, Math.ceil(total / porPagina));
}

// O expurgo só é liberado quando o admin digita o nome exato do arquivo.
export function confirmacaoDeExpurgo(digitado: string, nomeDoArquivo: string): boolean {
  return digitado.trim() !== "" && digitado.trim() === nomeDoArquivo.trim();
}

// DELETE /admin/files/{id}/permanent responde 204 (apagado) ou 202 { status: "deleting" }.
export function resultadoDoExpurgo(resposta: unknown): "apagado" | "em-andamento" {
  return typeof resposta === "object" &&
    resposta !== null &&
    (resposta as { status?: unknown }).status === "deleting"
    ? "em-andamento"
    : "apagado";
}
