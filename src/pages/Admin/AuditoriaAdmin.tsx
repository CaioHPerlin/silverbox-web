import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Users } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import { api, ApiError } from "../../services/apiClient";
import { mensagemDeErro } from "../../services/files";

// ---- Contrato de GET /admin/audit ----
interface AuditLog {
  id: number;
  createdAt: string;
  userId: number | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  ipAddress: string | null;
  requestId: string | null;
  details: string | null;
}

interface AuditResponse {
  logs: AuditLog[];
  page: number;
  limit: number;
  total: number;
}

const POR_PAGINA = 50;

const ACOES: Record<string, string> = {
  upload: "Enviou arquivo",
  file_update: "Alterou arquivo",
  trash: "Moveu arquivo para a lixeira",
  restore: "Restaurou arquivo",
  permanent_delete: "Excluiu arquivo definitivamente",
  avatar_update: "Atualizou a foto de perfil",
  avatar_delete: "Removeu a foto de perfil",
  folder_create: "Criou pasta",
  folder_update: "Alterou pasta",
  folder_delete: "Excluiu pasta",
  admin_user_create: "Criou usuário",
  admin_user_delete: "Excluiu usuário",
  admin_user_deletion_started: "Iniciou exclusão de usuário",
  admin_user_ban: "Bloqueou usuário",
  admin_user_unban: "Desbloqueou usuário",
  admin_user_role: "Alterou papel de usuário",
};

function textoDaAcao(action: string) {
  return ACOES[action] ?? action;
}

// A API não tem campo de resultado: destaca ações destrutivas
const DESTRUTIVAS = new Set([
  "permanent_delete",
  "admin_user_delete",
  "admin_user_ban",
  "folder_delete",
]);

function ehDestrutiva(l: AuditLog) {
  return DESTRUTIVAS.has(l.action);
}

// "file:21;owner:15" -> "arquivo #21 · dono #15"
function alvo(details: string | null) {
  if (!details) return "";
  const nomes: Record<string, string> = {
    file: "arquivo",
    user: "usuário",
    folder: "pasta",
    owner: "dono",
  };
  return details
    .split(";")
    .map((p) => {
      const [k, v] = p.split(":");
      return `${nomes[k] ?? k} #${v}`;
    })
    .join(" · ");
}

function dataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function csvCell(v: string | null | undefined) {
  let s = v ?? "";
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutraliza fórmulas
  return `"${s.replace(/"/g, '""')}"`;
}

export default function AuditoriaAdmin() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Busca os logs sempre que a página muda.
  // Todos os setState ficam dentro de callbacks (.then/.catch/.finally),
  // que rodam depois da resposta: é o que o lint aceita dentro de um effect.
  useEffect(() => {
    let cancelado = false;

    api
      .get<AuditResponse>(`/admin/audit?page=${pagina}&limit=${POR_PAGINA}`)
      .then((r) => {
        if (cancelado) return;
        setLogs(r?.logs ?? []);
        setTotal(r?.total ?? 0);
        setPendente(false);
        setErro(null);
      })
      .catch((e) => {
        if (cancelado) return;
        setLogs([]);
        setTotal(0);
        if (e instanceof ApiError && e.status === 404) setPendente(true);
        else if (e instanceof ApiError && e.status === 403)
          setErro("Você não tem permissão para ver a auditoria.");
        else setErro(mensagemDeErro(e));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    // se a página mudar antes da resposta chegar, ignora a resposta antiga
    return () => {
      cancelado = true;
    };
  }, [pagina]);

  // Handler de clique pode chamar setState à vontade
  function irParaPagina(nova: number) {
    setCarregando(true);
    setPagina(nova);
  }

  function handleExport() {
    const linhas = [
      [
        "Data/Hora",
        "Nome",
        "E-mail",
        "Ação",
        "IP",
        "Detalhes",
        "Request ID",
      ].join(";"),
      ...logs.map((l) =>
        [
          csvCell(new Date(l.createdAt).toLocaleString("pt-BR")),
          csvCell(l.actorName),
          csvCell(l.actorEmail),
          csvCell(textoDaAcao(l.action)),
          csvCell(l.ipAddress),
          csvCell(l.details),
          csvCell(l.requestId),
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
  const cor = (l: AuditLog) =>
    ehDestrutiva(l) ? "text-red-500" : "text-white";
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
              A API não respondeu em <code>GET /admin/audit</code>.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/2 p-4 sm:p-6">
            {carregando ? (
              <p className="py-10 text-center text-sm text-gray-500">
                Carregando...
              </p>
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
                  {logs.map((l) => (
                    <div
                      key={l.id}
                      className="grid grid-cols-[1fr_1.2fr_1.3fr_120px_140px] items-center gap-3 border-b border-white/5 px-2 py-4 transition-colors last:border-b-0 hover:bg-white/5"
                    >
                      <span className="truncate text-sm font-medium">
                        {l.actorName ?? "—"}
                      </span>
                      <span className="truncate text-sm text-gray-300">
                        {l.actorEmail ?? "—"}
                      </span>

                      {/* coluna Ação: substitui o <span ... title=...> antigo */}
                      <span className="min-w-0">
                        <span
                          className={`block truncate text-sm font-medium ${cor(l)}`}
                        >
                          {textoDaAcao(l.action)}
                        </span>
                        <span className="block truncate text-xs text-gray-500">
                          {alvo(l.details)}
                        </span>
                      </span>

                      <span className="truncate text-sm text-gray-300">
                        {dataHora(l.createdAt)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {l.ipAddress ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cartões: celular e tablet */}
                <div className="flex flex-col gap-2 lg:hidden">
                  {logs.map((l) => (
                    <div
                      key={l.id}
                      className="rounded-xl border border-white/10 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium">
                          {l.actorName ?? "—"}
                        </p>
                        <span className="shrink-0 text-xs text-gray-500">
                          {dataHora(l.createdAt)}
                        </span>
                      </div>
                      <p className={`mt-2 text-sm font-medium ${cor(l)}`}>
                        {textoDaAcao(l.action)}
                      </p>
                      {l.details && (
                        <p className="mt-1 break-words text-xs text-gray-400">
                          {alvo(l.details)}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {l.ipAddress ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>

                {totalPaginas > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-400">
                    <button
                      type="button"
                      disabled={pagina <= 1}
                      onClick={() => irParaPagina(pagina - 1)}
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
                      onClick={() => irParaPagina(pagina + 1)}
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
