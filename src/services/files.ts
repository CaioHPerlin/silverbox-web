import { api, ApiError } from "./apiClient";

export type ArquivoApi = {
  id: number;
  folderId: number | null;
  originalName: string;
  sizeBytes: number;
  mimeType: string | null;
  isDeleted: boolean;
  createdAt: string;
};

export function listarArquivos(folderId?: number, page = 1, limit = 50) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (folderId !== undefined) params.set("folderId", String(folderId));
  return api.get<{ files: ArquivoApi[]; page: number; limit: number; total: number }>(
    `/files?${params}`
  );
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function enviarArquivo(file: File, folderId?: number): Promise<ArquivoApi> {
  // 429 = mais de 2 envios simultâneos: espera 1 s e tenta de novo
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      const { file: criado } = await api.upload<{ file: ArquivoApi }>("/files", file, folderId);
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

export function mensagemDeErroUpload(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Sua sessão expirou. Entre de novo.";
    if (err.status === 413) return "Arquivo grande demais (máx. 1 GiB) ou espaço esgotado. Tente esvaziar a lixeira.";
    if (err.status === 503 || err.status === 507) return "Serviço temporariamente indisponível.";
    return err.message;
  }
  return "Falha no envio. Verifique sua conexão.";
}