import { API_URL } from "../config/api";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    // manda o cookie de sessão do Better Auth em toda chamada
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const body = await response.json();
      message = body.message ?? body.error ?? message;
    } catch {
      // resposta sem corpo JSON, mantém a mensagem padrão
    }
    throw new ApiError(message, response.status);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "DELETE" }),

  // upload cru: bytes no corpo e dados do arquivo em cabeçalhos (sem FormData)
  upload: <T>(path: string, file: File, folderId?: number): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
      "X-File-Name": encodeURIComponent(file.name),
      "X-File-Size": String(file.size),
    };
    if (file.type) headers["X-File-Mime"] = file.type;
    if (folderId !== undefined) headers["X-Folder-Id"] = String(folderId);

    return request<T>(path, { method: "POST", headers, body: file });
  },
};

export { ApiError };
