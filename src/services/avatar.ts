import { API_URL } from "../config/api";
import { erroDaResposta } from "./apiClient";

type AvatarResponse = {
  image: string;
  sizeBytes: string;
};

// Salvar ou substituir a foto
export async function salvarAvatar(file: File): Promise<AvatarResponse> {
  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) throw await erroDaResposta(response, "Não foi possível salvar a foto.");

  return response.json();
}

// Buscar a foto do usuário
export async function buscarAvatar(): Promise<Blob | null> {
  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Não foi possível carregar a foto.");
  }

  return response.blob();
}

// Remover a foto
export async function removerAvatar(): Promise<void> {
  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível remover a foto.");
  }
}
