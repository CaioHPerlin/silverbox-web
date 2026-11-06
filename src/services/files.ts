import { API_URL } from "../config/api";
import { api, ApiError } from "./apiClient";

export type ArquivoApi = {
  id: number;
  folderId: number | null;
  originalName: string;
  sizeBytes: number;
  mimeType: string | null;
  isDeleted: boolean;
  deletedAt?: string | null; // pode não existir
  createdAt: string;
};

export type ListaArquivos = {
  files: ArquivoApi[];
  page: number;
  limit: number;
  total: number;
};

export function listarArquivos(folderId?: number | null, page = 1, limit = 50) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (folderId != null) params.set("folderId", String(folderId));
  return api.get<ListaArquivos>(`/files?${params}`);
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function enviarArquivo(file: File, folderId?: number | null): Promise<ArquivoApi> {
  // 429 = mais de 2 envios simultâneos: espera 1 s e tenta de novo
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      const { file: criado } = await api.upload<{ file: ArquivoApi }>(
        "/files",
        file,
        folderId ?? undefined
      );
      return criado;
    } catch (err) {
      if (err instanceof ApiError && err.status === 429 && tentativa < 2) {
        await esperar(1000);
        continue;
      }
      throw err;
    }
  }
  throw new Error("Não foi possível enviar o arquivo");
}

export function urlDownload(id: number) {
  return `${API_URL}/files/${id}/download`;
}

export async function renomearArquivo(id: number, originalName: string) {
  const { file } = await api.patch<{ file: ArquivoApi }>(`/files/${id}`, { originalName });
  return file;
}

export async function moverArquivo(id: number, folderId: number | null) {
  const { file } = await api.patch<{ file: ArquivoApi }>(`/files/${id}`, { folderId });
  return file;
}

export function moverParaLixeira(id: number) {
  return api.delete<void>(`/files/${id}`);
}

export function mensagemDeErro(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 401: return "Sua sessão expirou. Entre de novo.";
      case 404: return "Item não encontrado. A lista foi atualizada.";
      case 409: return "Operação não permitida para este item.";
      case 413: return "Arquivo grande demais (máx. 1 GiB) ou espaço esgotado. Esvazie a lixeira.";
      case 503:
      case 507: return "Serviço temporariamente indisponível.";
      default: return err.message;
    }
  }
  return "Falha de conexão. Tente novamente.";
}