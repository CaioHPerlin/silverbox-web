import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FileText, Users } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import { ApiError } from "../../services/apiClient";
import { mensagemDeErro } from "../../services/files";
import {
  exportarAuditoria,
  listarAuditoria,
  type AuditLog,
  type FiltrosAuditoria,
} from "../../services/adminAudit";

const POR_PAGINA = 50;
const SEM_FILTROS: FiltrosAuditoria = {
  inicio: "",
  fim: "",
  usuario: "",
  acao: "",
};
const CAMPO_FILTRO =
  "w-full rounded-lg border border-white/15 bg-[#18181b] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none";

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

export default function AuditoriaAdmin() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [campos, setCampos] = useState(SEM_FILTROS);
  const [consulta, setConsulta] = useState({ pagina: 1, filtros: SEM_FILTROS });
  const { pagina, filtros } = consulta;
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
  const [erroExportacao, setErroExportacao] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    listarAuditoria(
      consulta.filtros,
      consulta.pagina,
      POR_PAGINA,
      controller.signal,
    )
      .then((r) => {
        if (controller.signal.aborted) return;
        setLogs(r?.logs ?? []);
        setTotal(r?.total ?? 0);
        setPendente(false);
        setErro(null);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setLogs([]);
        setTotal(0);
        setPendente(false);
        if (e instanceof ApiError && e.status === 404) setPendente(true);
        else if (e instanceof ApiError && e.status === 403)
          setErro("Você não tem permissão para ver a auditoria.");
        else setErro(mensagemDeErro(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });

    return () => controller.abort();
  }, [consulta]);

  function carregar(novosFiltros: FiltrosAuditoria, novaPagina: number) {
    setCarregando(true);
    setErro(null);
    setPendente(false);
    setErroExportacao(null);
    setConsulta({ filtros: novosFiltros, pagina: novaPagina });
  }

  function aplicarFiltros(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    carregar(campos, 1);
  }

  function limparFiltros() {
    setCampos(SEM_FILTROS);
    carregar(SEM_FILTROS, 1);
  }

  async function handleExport() {
    setExportando(true);
    setErroExportacao(null);
    try {
      const url = URL.createObjectURL(await exportarAuditoria(filtros));
      const link = document.createElement("a");
      link.href = url;
      link.download = "auditoria-silverbox.csv";
      link.click();
      // O navegador pode iniciar o download depois do evento de clique.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setErroExportacao(mensagemDeErro(error));
    } finally {
      setExportando(false);
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const cor = (l: AuditLog) =>
    ehDestrutiva(l) ? "text-red-500" : "text-white";
  return (
    <div className="min-h-screen overflow-x-clip bg-[#0d0d0d] text-white md:flex">
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
              disabled={total === 0 || carregando || exportando}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/80 bg-transparent px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <FileText className="h-4 w-4" />
              {exportando ? "Exportando..." : "Exportar relatório (CSV)"}
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

        <form
          onSubmit={aplicarFiltros}
          aria-label="Filtros de auditoria"
          className="mb-4 grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <label className="space-y-1 text-sm text-gray-300">
            <span>Data inicial</span>
            <input
              className={CAMPO_FILTRO}
              type="date"
              value={campos.inicio}
              max={campos.fim || undefined}
              onChange={(event) =>
                setCampos({ ...campos, inicio: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm text-gray-300">
            <span>Data final</span>
            <input
              className={CAMPO_FILTRO}
              type="date"
              value={campos.fim}
              min={campos.inicio || undefined}
              onChange={(event) =>
                setCampos({ ...campos, fim: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm text-gray-300">
            <span>ID do usuário</span>
            <input
              className={CAMPO_FILTRO}
              inputMode="numeric"
              pattern="[1-9][0-9]*"
              maxLength={10}
              value={campos.usuario}
              onChange={(event) =>
                setCampos({ ...campos, usuario: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm text-gray-300">
            <span>Ação</span>
            <input
              className={CAMPO_FILTRO}
              list="acoes-auditoria"
              maxLength={80}
              value={campos.acao}
              onChange={(event) =>
                setCampos({ ...campos, acao: event.target.value })
              }
            />
            <datalist id="acoes-auditoria">
              {Object.entries(ACOES).map(([codigo, texto]) => (
                <option key={codigo} value={codigo} label={texto} />
              ))}
            </datalist>
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2 xl:col-span-4">
            <button
              type="submit"
              disabled={exportando}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium hover:bg-blue-600 disabled:opacity-40"
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              disabled={exportando}
              onClick={limparFiltros}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-40"
            >
              Limpar filtros
            </button>
          </div>
        </form>

        {erro && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {erro}
            <button
              type="button"
              className="ml-3 underline"
              onClick={() => carregar(filtros, pagina)}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {erroExportacao && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            Falha ao exportar: {erroExportacao}
          </p>
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
                        {l.requestId && (
                          <span
                            title={l.requestId}
                            className="block truncate text-xs text-gray-400"
                          >
                            Requisição {l.requestId}
                          </span>
                        )}
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
                      {l.requestId && (
                        <p className="mt-1 break-all text-xs text-gray-400">
                          Requisição {l.requestId}
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
                      onClick={() => carregar(filtros, pagina - 1)}
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
                      onClick={() => carregar(filtros, pagina + 1)}
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
