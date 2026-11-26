import { api, ApiError } from "./apiClient";

// ---- Tipos ----

export type UsuarioAdmin = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  deletionPending: boolean;
  quotaLimitBytes: string; // BigInt em texto: converter com paraBytes()
  usedBytes?: string; // BigInt em texto; opcional até confirmar no deploy
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

// Resposta do POST /admin/users: não traz banned, deletionPending nem quotaLimitBytes.
// Depois de criar, recarregue a lista em vez de montar a linha com este objeto.
export type UsuarioCriado = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
};

// O PATCH é estrito: aceita só estes campos (não aceita name) e exige ao menos um
export type EdicaoUsuario = {
  role?: "user" | "admin";
  banned?: boolean;
  quotaLimitBytes?: string; // BigInt em texto, de 1 até 9223372036854775807
};

// "removido": a API apagou na hora (204). "pendente": exclusão assíncrona (202).
export type ResultadoExclusao = "removido" | "pendente";

// ---- Chamadas à API ----

const LIMITE_MAX = 100; // máximo aceito pela API
const BUSCA_MAX = 155; // tamanho máximo do parâmetro q

export function listarUsuarios(
  q: string,
  page: number,
  limit: number,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(limit, LIMITE_MAX)),
  });
  if (q) params.set("q", q.slice(0, BUSCA_MAX));
  return api.get<ListaUsuarios>(`/admin/users?${params}`, { signal });
}

export function criarUsuario(dados: NovoUsuario) {
  return api.post<{ user: UsuarioCriado }>("/admin/users", dados);
}

export function editarUsuario(id: string, dados: EdicaoUsuario) {
  return api.patch<{ user: UsuarioAdmin }>(`/admin/users/${id}`, dados);
}

export function alterarPapel(id: string, role: "user" | "admin") {
  return editarUsuario(id, { role });
}

export function definirBloqueio(id: string, banned: boolean) {
  return editarUsuario(id, { banned });
}

export async function excluirUsuario(id: string): Promise<ResultadoExclusao> {
  const r = await api.delete<{ status?: string } | undefined>(`/admin/users/${id}`);
  return r?.status === "deleting" ? "pendente" : "removido";
}

// ---- Conversões e formatação ----

const COTA_MAX = 9223372036854775807n;

// A tela trabalha em GB; a API quer bytes em texto
export function gbParaBytes(gb: number): string {
  if (!Number.isFinite(gb)) throw new Error("Cota inválida");
  const bytes = BigInt(Math.round(gb * 1024 ** 3));
  if (bytes < 1n || bytes > COTA_MAX) throw new Error("Cota inválida");
  return bytes.toString();
}

export function paraBytes(v: string | null | undefined): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function formatarBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const unidades = ["KB", "MB", "GB", "TB"];
  let valor = bytes / 1024;
  let i = 0;
  while (valor >= 1024 && i < unidades.length - 1) {
    valor /= 1024;
    i++;
  }
  return `${valor.toFixed(1).replace(".", ",")} ${unidades[i]}`;
}

// ---- Mensagens de erro ----
export function mensagemAdmin(err: unknown): string {
  if (!(err instanceof ApiError)) return "Não foi possível concluir a operação.";
  if (err.status === 404) return "Usuário não encontrado. A lista foi atualizada.";
  return err.message;
}
