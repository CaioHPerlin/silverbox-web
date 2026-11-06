import { api } from "./apiClient";
import type { ArquivoApi } from "./files";

export async function listarLixeira() {
  const { files } = await api.get<{ files: ArquivoApi[] }>("/files/trash");
  return files;
}

export async function restaurarArquivo(id: number) {
  const { file } = await api.post<{ file: ArquivoApi }>(`/files/${id}/restore`);
  return file;
}

// 204 (apagou) ou 202 { status: "deleting" } (a API conclui sozinha): os dois são sucesso
export function excluirDefinitivamente(id: number) {
  return api.delete<void | { status: string }>(`/files/${id}/permanent`);
}