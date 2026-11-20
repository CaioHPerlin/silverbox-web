import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";
import { formatBytes } from "../lib/format";
import { ApiError } from "../services/apiClient";
import { mensagemDeErro } from "../services/files";
import LoadingSkeleton from "../components/LoadingSkeleton";
import {
  listarMeusLinks,
  revogarLinkCompartilhado,
  statusDoLink,
  type LinkApi,
  type StatusLink,
} from "../services/shares";

type FileType = "pdf" | "image" | "doc" | "sheet" | "zip" | "other";

interface SearchForm {
  query: string;
}

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

const estiloStatus: Record<StatusLink, string> = {
  ativo: "bg-emerald-500/20 text-emerald-400",
  expirado: "bg-amber-500/20 text-amber-400",
  revogado: "bg-red-500/20 text-red-400",
};

function StatusBadge({ status }: { status: StatusLink }) {
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${estiloStatus[status]}`}
    >
      {status === "ativo"
        ? "Ativo"
        : status === "expirado"
          ? "Expirado"
          : "Revogado"}
    </span>
  );
}

function validade(l: LinkApi, status: StatusLink) {
  if (status === "revogado" && l.revokedAt)
    return `revogado em ${new Date(l.revokedAt).toLocaleDateString("pt-BR")}`;
  const data = new Date(l.expiresAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return status === "ativo" ? `expira em ${data}` : `expirou em ${data}`;
}

export default function Compartilhados() {
  const { register, watch } = useForm<SearchForm>({
    defaultValues: { query: "" },
  });
  const query = watch("query").toLowerCase();

  const [links, setLinks] = useState<LinkApi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setLinks(await listarMeusLinks());
      setPendente(false);
      setErro(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setPendente(true);
      else setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleRevogar(l: LinkApi) {
    if (
      !window.confirm(
        `Revogar o link de "${l.fileName}"? Quem tem o link perde o acesso.`,
      )
    )
      return;
    try {
      await revogarLinkCompartilhado(l.fileId, l.id);
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
    await carregar();
  }

const filtered = links.filter((l) =>
  (l.fileName ?? "").toLowerCase().includes(query),
);

  function Acao({ l, status }: { l: LinkApi; status: StatusLink }) {
    return status === "ativo" ? (
      <button
        type="button"
        onClick={() => handleRevogar(l)}
        className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10"
      >
        Revogar
      </button>
    ) : (
      <span />
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-semibold">Compartilhados</h1>
        <p className="mb-6 mt-1 text-sm text-gray-500">
          Links temporários que você criou. Quem tem o link baixa o arquivo sem
          precisar de login.
        </p>

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
            <h2 className="text-sm text-gray-300">Listagem indisponível</h2>
            <p className="mt-1 text-sm text-gray-500">
              A API ainda não tem a rota <code>GET /shares</code> para listar
              todos os seus links. Por enquanto, crie e revogue links pelo menu
              de cada arquivo em Meus arquivos.
            </p>
          </div>
        ) : (
          <>
            <form
              className="relative mb-6 w-full sm:max-w-md"
              onSubmit={(e) => e.preventDefault()}
            >
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
                {...register("query")}
                placeholder="Buscar arquivo compartilhado..."
                aria-label="Buscar arquivo compartilhado"
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>

            {carregando ? (
              <LoadingSkeleton mensagem="Carregando compartilhamentos..." />
            ) : filtered.length === 0 ? (
              <p className="rounded-xl border border-white/10 px-4 py-10 text-center text-sm text-gray-500">
                Nenhum link encontrado.
              </p>
            ) : (
              <>
                {/* Tabela: computador e telas maiores */}
                <div className="hidden overflow-hidden rounded-xl border border-white/10 sm:block">
                  <div className="grid grid-cols-[minmax(0,1fr)_90px_190px_90px_90px] gap-3 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-wide text-gray-500">
                    <span>Arquivo</span>
                    <span>Tamanho</span>
                    <span>Validade</span>
                    <span>Status</span>
                    <span />
                  </div>
                  {filtered.map((l) => {
                    const status = statusDoLink(l);
                    return (
                      <div
                        key={l.id}
                        className="grid grid-cols-[minmax(0,1fr)_90px_190px_90px_90px] items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0 hover:bg-white/5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileIcon
                            type={tipoDoArquivo(l.fileName, l.mimeType)}
                          />
                          <span className="truncate text-sm">{l.fileName}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatBytes(l.sizeBytes)}
                        </span>
                        <span className="text-sm text-gray-400">
                          {validade(l, status)}
                        </span>
                        <StatusBadge status={status} />
                        <Acao l={l} status={status} />
                      </div>
                    );
                  })}
                </div>

                {/* Cartões: celular */}
                <div className="space-y-3 sm:hidden">
                  {filtered.map((l) => {
                    const status = statusDoLink(l);
                    return (
                      <article
                        key={l.id}
                        className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <FileIcon
                            type={tipoDoArquivo(l.fileName, l.mimeType)}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-medium">
                              {l.fileName}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {formatBytes(l.sizeBytes)} · {validade(l, status)}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <StatusBadge status={status} />
                              <Acao l={l} status={status} />
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
