import { API_URL } from "../config/api";
import { api } from "./apiClient";

export type VersaoApi = {
  id: number;
  versionNumber: number;
  sizeBytes: number;
  mimeType: string | null;
  createdAt: string;
};

export async function listarVersoes(fileId: number) {
  const { versions } = await api.get<{ versions: VersaoApi[] }>(`/files/${fileId}/versions`);
  return versions; // da mais nova para a mais antiga
}

export async function enviarVersao(fileId: number, file: File) {
  // upload cru; sem folderId
  const { version } = await api.upload<{ version: VersaoApi }>(`/files/${fileId}/versions`, file);
  return version;
}

export async function restaurarVersao(fileId: number, versionId: number) {
  const { version } = await api.post<{ version: VersaoApi }>(
    `/files/${fileId}/versions/${versionId}/restore`,
  );
  return version; // copia a versão escolhida como uma nova
}

export function urlDownloadVersao(fileId: number, versionId: number) {
  return `${API_URL}/files/${fileId}/versions/${versionId}/download`;
}