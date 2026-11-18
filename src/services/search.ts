import { api } from "./apiClient";

export type ItemBusca = {
  kind: "file" | "folder";
  id: number;
  name: string;
  folderId: number | null;
  path: { id: number; name: string }[];
  sizeBytes: number | null;
  mimeType: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

// all: todas as pastas do usuário; folder: a pasta atual e suas subpastas
export type EscopoBusca = "all" | "folder";

export type RespostaBusca = {
  items: ItemBusca[];
  page: number;
  limit: number;
  total: number;
};

export const TAMANHO_MAX_BUSCA = 100;

export function buscar(
  q: string,
  escopo: EscopoBusca,
  folderId: number | null,
  page: number,
  limit: number,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    q: q.slice(0, TAMANHO_MAX_BUSCA),
    scope: escopo,
    page: String(page),
    limit: String(limit),
  });
  // folderId só vale com scope=folder; sem ele, a API usa a raiz
  if (escopo === "folder" && folderId != null) {
    params.set("folderId", String(folderId));
  }
  return api.get<RespostaBusca>(`/search?${params}`, { signal });
}

// "Meus arquivos / Projeto / 2026" a partir do path
export function textoDoLocal(path: { name: string }[]) {
  return ["Meus arquivos", ...path.map((p) => p.name)].join(" / ");
}