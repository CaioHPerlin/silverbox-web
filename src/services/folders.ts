import { api } from "./apiClient";

export type PastaApi = {
  id: number;
  parentFolderId: number | null;
  name: string;
  createdAt: string;
};

export async function listarPastas(parentFolderId?: number | null) {
  const qs = parentFolderId != null ? `?parentFolderId=${parentFolderId}` : "";
  const { folders } = await api.get<{ folders: PastaApi[] }>(`/folders${qs}`);
  return folders;
}

export async function criarPasta(name: string, parentFolderId: number | null) {
  const { folder } = await api.post<{ folder: PastaApi }>("/folders", { name, parentFolderId });
  return folder;
}

export async function renomearPasta(id: number, name: string) {
  const { folder } = await api.patch<{ folder: PastaApi }>(`/folders/${id}`, { name });
  return folder;
}

export function excluirPasta(id: number) {
  return api.delete<void>(`/folders/${id}`); // 409 se tiver conteúdo
}