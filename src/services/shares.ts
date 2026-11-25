import { api, ApiError } from "./apiClient";

// Tipos
export type ShareApi = {
  id: number;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
};

export type CriarShareResponse = {
  id: number;
  url: string;
  expiresAt: string;
};

export type ListaSharesResponse = {
  shares: ShareApi[];
};

// Validade permitida pela API
export const EXPIRACAO_SHARE = {
  UMA_HORA: 3600,
  UM_DIA: 86400,
  SETE_DIAS: 604800,
} as const;

// Criar link temporário
export async function criarLinkCompartilhamento(
  fileId: number,
  expiresInSeconds: number = EXPIRACAO_SHARE.UM_DIA,
): Promise<CriarShareResponse> {
  if (
    !Number.isInteger(expiresInSeconds) ||
    expiresInSeconds < 60 ||
    expiresInSeconds > EXPIRACAO_SHARE.SETE_DIAS
  ) {
    throw new Error("O prazo deve ser entre 1 minuto e 7 dias.");
  }

  return api.post<CriarShareResponse>(`/files/${fileId}/shares`, {
    expiresInSeconds,
  });
}

// Listar links de um arquivo
export async function listarLinksCompartilhados(
  fileId: number,
): Promise<ShareApi[]> {
  const resposta = await api.get<ListaSharesResponse>(
    `/files/${fileId}/shares`,
  );

  return resposta.shares;
}

// Revogar link
export function revogarLinkCompartilhado(
  fileId: number,
  shareId: number,
): Promise<void> {
  return api.delete<void>(`/files/${fileId}/shares/${shareId}`);
}

// Mensagens de erro
export function mensagemErroShare(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 400:
        return "Prazo de compartilhamento inválido.";
      case 401:
        return "Sua sessão expirou. Entre novamente.";
      case 404:
        return "Arquivo ou link de compartilhamento não encontrado.";
      case 410:
        return "Este link expirou, foi revogado ou o arquivo está na lixeira.";
      default:
        return err.message;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Não foi possível realizar o compartilhamento.";
}
// ---- Para a tela Compartilhados (lista global, rota proposta GET /shares) ----
export type LinkApi = {
  id: number;
  fileId: number;
  fileName: string;
  sizeBytes: number;
  mimeType: string | null;
  permission: string;
  status: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
};

export type ListaMeusLinksResponse = {
  shares: LinkApi[];
  page: number;
  limit: number;
  total: number;
};

export type StatusLink = "ativo" | "expirado" | "revogado";

export function statusDoLink(l: {
  expiresAt: string;
  revokedAt: string | null;
}): StatusLink {
  if (l.revokedAt) return "revogado";

  return new Date(l.expiresAt).getTime() <= Date.now() ? "expirado" : "ativo";
}
type ShareListaItemApi = {
  id: number;
  permission: string;
  status: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  file: {
    id: number;
    originalName: string;
    mimeType: string | null;
    sizeBytes: number;
  };
};
type RespostaSharesApi = {
  shares: ShareListaItemApi[];
  page: number;
  limit: number;
  total: number;
};

export async function listarMeusLinks(
  page = 1,
  limit = 50,
  query = "",
): Promise<ListaMeusLinksResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (query.trim()) {
    params.set("q", query.trim());
  }

  const resposta = await api.get<RespostaSharesApi>(
    `/shares?${params.toString()}`,
  );

  return {
    shares: resposta.shares.map((share) => ({
      id: share.id,
      fileId: share.file.id,
      fileName: share.file.originalName,
      sizeBytes: share.file.sizeBytes,
      mimeType: share.file.mimeType,
      permission: share.permission,
      status: share.status,
      expiresAt: share.expiresAt,
      revokedAt: share.revokedAt,
      createdAt: share.createdAt,
    })),
    page: resposta.page,
    limit: resposta.limit,
    total: resposta.total,
  };
}
