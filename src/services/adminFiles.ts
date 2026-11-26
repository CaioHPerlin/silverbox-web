import { API_URL } from "../config/api";
import { caminhoListagem, resultadoDoExpurgo, type FiltroArquivosAdmin } from "../lib/adminFiles";
import { api } from "./apiClient";

// Contrato de GET /admin/files (arquivo + dono).
export interface ArquivoAdmin {
  id: number;
  folderId: number | null;
  originalName: string;
  sizeBytes: number;
  mimeType: string | null;
  checksum?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: number;
  ownerName: string | null;
  ownerEmail: string | null;
}

export interface PaginaArquivosAdmin {
  files: ArquivoAdmin[];
  page: number;
  limit: number;
  total: number;
}

export function listarArquivosAdmin(filtro: FiltroArquivosAdmin, signal?: AbortSignal) {
  return api.get<PaginaArquivosAdmin>(caminhoListagem(filtro), { signal });
}

// Move para a lixeira do dono e revoga os links de compartilhamento. O dono pode restaurar.
export function moverParaLixeiraAdmin(id: number) {
  return api.delete<void>(`/admin/files/${id}`);
}

// Exclui de vez um arquivo que já está na lixeira, com todas as versões, e libera a cota.
export async function expurgarArquivoAdmin(id: number) {
  return resultadoDoExpurgo(await api.delete<unknown>(`/admin/files/${id}/permanent`));
}

// Download com registro de auditoria. Arquivos na lixeira não podem ser baixados.
export function urlDownloadAdmin(id: number) {
  return `${API_URL}/admin/files/${id}/download`;
}
