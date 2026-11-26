import { api } from "./apiClient";

export type FiltrosAuditoria = {
  inicio: string;
  fim: string;
  usuario: string;
  acao: string;
};

export type AuditLog = {
  id: number;
  createdAt: string;
  userId: number | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  ipAddress: string | null;
  requestId: string | null;
  details: string | null;
};

type AuditResponse = { logs: AuditLog[]; page: number; limit: number; total: number };

function parametros(filtros: FiltrosAuditoria): URLSearchParams {
  const params = new URLSearchParams();

  if (filtros.inicio) {
    params.set("since", new Date(`${filtros.inicio}T00:00:00`).toISOString());
  }
  if (filtros.fim) {
    // O limite superior da API é exclusivo. Incluir o dia final no fuso local.
    const fim = new Date(`${filtros.fim}T00:00:00`);
    fim.setDate(fim.getDate() + 1);
    params.set("until", fim.toISOString());
  }
  if (filtros.usuario.trim()) params.set("userId", filtros.usuario.trim());
  if (filtros.acao.trim()) params.set("action", filtros.acao.trim());

  return params;
}

export function listarAuditoria(
  filtros: FiltrosAuditoria,
  pagina: number,
  limite: number,
  signal: AbortSignal,
) {
  const params = parametros(filtros);
  params.set("page", String(pagina));
  params.set("limit", String(limite));
  return api.get<AuditResponse>(`/admin/audit?${params}`, { signal });
}

export function exportarAuditoria(filtros: FiltrosAuditoria) {
  const params = parametros(filtros);
  const query = params.size ? `?${params}` : "";
  return api.getBlob(`/admin/audit/export${query}`);
}
