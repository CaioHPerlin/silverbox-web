import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Users } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import { api, ApiError } from "../../services/apiClient";
import LoadingSkeleton from "../../components/LoadingSkeleton";

// ---- Contrato esperado de GET /admin/audit ----
interface AuditLog {
  id: number | string;
  createdAt: string; // ISO
  action: string;
  ip: string | null;
  userName: string | null;
  userEmail: string | null;
  outcome?: "ok" | "error";
}

interface AuditResponse {
  logs: AuditLog[];
  page: number;
  limit: number;
  total: number;
}

const POR_PAGINA = 50;

function dataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actionColor(outcome?: "ok" | "error") {
  return outcome === "error" ? "text-red-500" : "text-white";
}

function csvCell(v: string | null | undefined) {
  return `"${(v ?? "").replace(/"/g, '""')}"`;
}

export default function AuditoriaAdmin() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [pendente, setPendente] = useState(false); // rota ainda não existe no back
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const r = await api.get<AuditResponse>(
        `/admin/audit?page=${pagina}&limit=${POR_PAGINA}`,
      );
      setLogs(r.logs);
      setTotal(r.total);
      setPendente(false);
      setErro(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setPendente(true);
      } else if (e instanceof ApiError && e.status === 403) {
        setErro("Você não tem permissão para ver a auditoria.");
      } else {
        setErro(
          e instanceof Error ? e.message : "Falha ao carregar a auditoria.",
        );
      }
    } finally {
      setCarregando(false);
    }
  }, [pagina]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function handleExport() {
    const linhas = [
      ["Data/Hora", "Nome", "E-mail", "Ação", "IP", "Resultado"].join(";"),
      ...logs.map((l) =>
        [
          csvCell(new Date(l.createdAt).toLocaleString("pt-BR")),
          csvCell(l.userName),
          csvCell(l.userEmail),
          csvCell(l.action),
          csvCell(l.ip),
          csvCell(l.outcome === "error" ? "erro" : "ok"),
        ].join(";"),
      ),
    ];
    // BOM para o Excel abrir os acentos corretamente
    const blob = new Blob(["\uFEFF" + linhas.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria-pagina-${pagina}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Auditoria</h1>
            <p className="mt-1 text-sm text-gray-500">
              Quem fez o quê, quando e de qual endereço
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={logs.length === 0}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/80 bg-transparent px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <FileText className="h-4 w-4" />
              Exportar relatório (CSV)
            </button>
            <Link
              to="/admin/usuarios"
              className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200"
            >
              <Users className="h-4 w-4" />
              Gerenciar usuários
            </Link>
          </div>
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
            <h2 className="text-sm text-gray-300">Auditoria indisponível</h2>
            <p className="mt-1 text-sm text-gray-500">
              A tabela <code>audit_logs</code> já existe no banco, mas a API
              ainda não tem a rota <code>GET /admin/audit</code> para lê-la.
              Assim que ela existir, os registros aparecem aqui.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/2 p-4 sm:p-6">
            {carregando ? (
              <LoadingSkeleton mensagem="Carregando dados da auditoria..." />
            ) : logs.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">
                Nenhum registro de auditoria.
              </p>
            ) : (
              <>
                {/* Tabela: desktop */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-[1fr_1.2fr_1.3fr_120px_140px] gap-3 border-b border-white/10 px-2 py-3 text-xs uppercase tracking-wide text-gray-500">
                    <span>Nome</span>
                    <span>E-mail</span>
                    <span>Ação</span>
                    <span>Data/Hora</span>
                    <span>Endereço IP</span>
                  </div>
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="grid grid-cols-[1fr_1.2fr_1.3fr_120px_140px] items-center gap-3 border-b border-white/5 px-2 py-4 transition-colors last:border-b-0 hover:bg-white/5"
                    >
                      <span className="truncate text-sm font-medium">
                        {log.userName ?? "—"}
                      </span>
                      <span className="truncate text-sm text-gray-300">
                        {log.userEmail ?? "—"}
                      </span>
                      <span
                        className={`text-sm font-medium ${actionColor(log.outcome)}`}
                      >
                        {log.action}
                      </span>
                      <span className="truncate text-sm text-gray-300">
                        {dataHora(log.createdAt)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {log.ip ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cartões: celular e tablet */}
                <div className="flex flex-col gap-2 lg:hidden">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-white/10 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          {log.userName ?? "—"}
                        </p>
                        <span className="shrink-0 text-xs text-gray-500">
                          {dataHora(log.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`mt-2 text-sm font-medium ${actionColor(log.outcome)}`}
                      >
                        {log.action}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {log.ip ?? "—"}
                      </p>
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
          </div>
        )}
      </main>
    </div>
  );
}
