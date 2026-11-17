import { useCallback, useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import { API_URL } from "../../config/api";
import { formatBytes } from "../../lib/format";
import { api, ApiError } from "../../services/apiClient";
import LoadingSkeleton from "../../components/LoadingSkeleton";

// ---- Contrato esperado de GET /admin/files ----
interface AdminFile {
  id: number;
  originalName: string;
  sizeBytes: number;
  mimeType: string | null;
  createdAt: string;
  ownerName: string | null;
  ownerEmail: string | null;
}

interface AdminFilesResponse {
  files: AdminFile[];
  page: number;
  limit: number;
  total: number;
}

type FileType = "pdf" | "image" | "doc" | "sheet" | "zip" | "other";

const POR_PAGINA = 50;

function tipoDoArquivo(nome: string, mime: string | null): FileType {
  const ext = nome.split(".").pop()?.toLowerCase() ?? "";
  if (mime?.startsWith("image/")) return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (["doc", "docx", "odt", "txt", "rtf"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) return "sheet";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "zip";
  return "other";
}

function FileIcon({ type }: { type: FileType }) {
  const colors: Record<FileType, string> = {
    pdf: "text-red-400",
    image: "text-emerald-400",
    doc: "text-blue-400",
    sheet: "text-green-400",
    zip: "text-amber-400",
    other: "text-gray-400",
  };
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${colors[type]}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export default function ArquivosAdmin() {
  const [query, setQuery] = useState("");
  const [busca, setBusca] = useState(""); // valor já com atraso, usado na API
  const [pagina, setPagina] = useState(1);
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // espera o admin parar de digitar antes de consultar
  useEffect(() => {
    const t = setTimeout(() => {
      setBusca(query.trim());
      setPagina(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({
        page: String(pagina),
        limit: String(POR_PAGINA),
      });
      if (busca) params.set("q", busca);
      const r = await api.get<AdminFilesResponse>(`/admin/files?${params}`);
      setFiles(r.files);
      setTotal(r.total);
      setPendente(false);
      setErro(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setPendente(true);
      else if (e instanceof ApiError && e.status === 403)
        setErro("Você não tem permissão para ver os arquivos de todos.");
      else
        setErro(
          e instanceof Error ? e.message : "Falha ao carregar os arquivos.",
        );
    } finally {
      setCarregando(false);
    }
  }, [pagina, busca]);

  useEffect(() => {
    let ativo = true;
    void Promise.resolve().then(() => { if (ativo) return carregar(); });
    return () => { ativo = false; };
  }, [carregar]);

  function handleBaixar(id: number) {
    window.location.href = `${API_URL}/admin/files/${id}/download`;
  }

  async function handleExcluir(f: AdminFile) {
    if (
      !window.confirm(
        `Mover "${f.originalName}" de ${f.ownerName ?? f.ownerEmail ?? "usuário"} para a lixeira?`,
      )
    )
      return;
    try {
      await api.delete(`/admin/files/${f.id}`);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível excluir.");
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  function Acoes({ f }: { f: AdminFile }) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleBaixar(f.id)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          aria-label={`Baixar ${f.originalName}`}
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleExcluir(f)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-red-500/15 hover:text-red-400"
          aria-label={`Excluir ${f.originalName}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-xl font-semibold sm:text-2xl">Arquivos</h1>

        <div className="relative mb-6 max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por arquivo ou usuário..."
            aria-label="Buscar por arquivo ou usuário"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {erro && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {erro}
          </div>
        )}

        {pendente ? (
          <div className="rounded-xl border border-dashed border-white/15 px-5 py-6">
            <h2 className="text-sm text-gray-300">
              Listagem global indisponível
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              A API ainda não tem a rota <code>GET /admin/files</code>. Hoje
              cada usuário só enxerga os próprios arquivos.
            </p>
          </div>
        ) : carregando ? (
          <LoadingSkeleton mensagem="Carregando seus arquivos..." />
        ) : files.length === 0 ? (
          <div className="rounded-xl border border-white/10 px-4 py-10 text-center text-sm text-gray-500">
            Nenhum arquivo encontrado.
          </div>
        ) : (
          <>
            {/* Tabela: tablet e desktop */}
            <div className="hidden overflow-hidden rounded-xl border border-white/10 md:block">
              <div className="grid grid-cols-[1fr_160px_100px_120px_80px] border-b border-white/10 px-4 py-3 text-xs uppercase tracking-wide text-gray-500">
                <span>Nome</span>
                <span>Usuário</span>
                <span>Tamanho</span>
                <span>Enviado em</span>
                <span />
              </div>
              {files.map((f) => (
                <div
                  key={f.id}
                  className="grid grid-cols-[1fr_160px_100px_120px_80px] items-center border-b border-white/5 px-4 py-3 transition-colors last:border-b-0 hover:bg-white/5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIcon
                      type={tipoDoArquivo(f.originalName, f.mimeType)}
                    />
                    <span className="truncate text-sm">{f.originalName}</span>
                  </div>
                  <span
                    className="truncate text-sm text-gray-400"
                    title={f.ownerEmail ?? ""}
                  >
                    {f.ownerName ?? f.ownerEmail ?? "—"}
                  </span>
                  <span className="text-sm text-gray-400">
                    {formatBytes(f.sizeBytes)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(f.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <Acoes f={f} />
                </div>
              ))}
            </div>

            {/* Cartões: celular */}
            <div className="flex flex-col gap-2 md:hidden">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3"
                >
                  <FileIcon type={tipoDoArquivo(f.originalName, f.mimeType)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{f.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {f.ownerName ?? f.ownerEmail ?? "—"} ·{" "}
                      {formatBytes(f.sizeBytes)} ·{" "}
                      {new Date(f.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Acoes f={f} />
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-400">
                <button
                  type="button"
                  disabled={pagina <= 1}
                  onClick={() => setPagina(pagina - 1)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/5 disabled:opacity-40"
                >
                  Anterior
                </button>
                <span>
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  type="button"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina(pagina + 1)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/5 disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
