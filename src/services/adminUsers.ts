import { api, ApiError } from "./apiClient";

export type UsuarioAdmin = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  deletionPending: boolean;
  quotaLimitBytes: string; // BigInt em texto: converter com Number()
  createdAt: string;
};

export type ListaUsuarios = {
  users: UsuarioAdmin[];
  page: number;
  limit: number;
  total: number;
};

export type NovoUsuario = {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
};

export function listarUsuarios(
  q: string,
  page: number,
  limit: number,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set("q", q); // AJUSTAR: nome do parâmetro de busca
  return api.get<ListaUsuarios>(`/admin/users?${params}`, { signal });
}

// AJUSTAR: confirmar rota, método e formato da resposta
export function criarUsuario(dados: NovoUsuario) {
  return api.post<{ user: UsuarioAdmin }>("/admin/users", dados);
}

export type EdicaoUsuario = {
  role?: "user" | "admin";
  banned?: boolean;
  quotaLimitBytes?: string; // BigInt em texto
};

export function editarUsuario(id: string, dados: EdicaoUsuario) {
  return api.patch<{ user: UsuarioAdmin }>(`/admin/users/${id}`, dados);
}

// A tela trabalha em GB; a API quer bytes em texto
export function gbParaBytes(gb: number): string {
  return BigInt(Math.round(gb * 1024 ** 3)).toString();
}

export function paraBytes(v: string | null | undefined): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function mensagemAdmin(err: unknown): string {
  if (err instanceof ApiError) {
    const m = err.message.toLowerCase();
    if (err.status === 409) {
      if (m.includes("admin")) return "Não é possível: esta é a única conta administradora.";
      if (m.includes("quota") || m.includes("cota"))
        return "A cota não pode ser menor que o espaço já usado.";
      if (m.includes("delet") || m.includes("exclu"))
        return "Esta conta já está sendo excluída.";
      return "Conflito: a operação não pôde ser concluída.";
    }
    if (err.status === 422) return "Já existe uma conta com esse e-mail.";
    if (err.status === 403) return "Você não tem permissão para esta operação.";
    if (err.status === 404) return "Usuário não encontrado. A lista foi atualizada.";
    if (err.status === 400) return err.message;
  }
  return "Não foi possível concluir a operação.";
}