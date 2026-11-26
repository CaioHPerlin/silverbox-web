import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Trash2, TriangleAlert } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { formatBytes } from "../../lib/format";
import {
  TAMANHO_MAXIMO_BUSCA_ADMIN,
  caminhoListagem,
  confirmacaoDeExpurgo,
  escreverFiltro,
  lerFiltro,
  totalDePaginas,
  type FiltroArquivosAdmin,
  type VisaoArquivosAdmin,
} from "../../lib/adminFiles";
import { ApiError } from "../../services/apiClient";
import {
  expurgarArquivoAdmin,
  listarArquivosAdmin,
  moverParaLixeiraAdmin,
  urlDownloadAdmin,
  type ArquivoAdmin,
  type PaginaArquivosAdmin,
} from "../../services/adminFiles";

type FileType = "pdf" | "image" | "doc" | "sheet" | "zip" | "other";

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

function mensagemDeErro(e: unknown, padrao: string): string {
  if (e instanceof ApiError && e.status === 403) return "Você não tem permissão de administrador para esta ação.";
  if (e instanceof ApiError && e.status === 404) return "O arquivo não existe mais. A lista foi atualizada.";
  if (e instanceof ApiError && e.status === 409) return `${e.message}. A lista foi atualizada.`;
  return e instanceof Error ? e.message : padrao;
}

const dono = (f: ArquivoAdmin) => f.ownerName ?? f.ownerEmail ?? `usuário #${f.ownerId}`;
const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

// ---- Confirmação: mover para a lixeira (reversível pelo dono) ----
function ConfirmarLixeira({
  arquivo,
  onCancelar,
  onConfirmar,
}: {
  arquivo: ArquivoAdmin;
  onCancelar: () => void;
  onConfirmar: () => Promise<void>;
}) {
  const [executando, setExecutando] = useState(false);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-lixeira"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => !executando && onCancelar()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-3 rounded-xl border border-white/10 bg-[#161616] p-5"
      >
        <h2 id="titulo-lixeira" className="text-lg font-semibold">
          Mover para a lixeira?
        </h2>
        <p className="text-sm text-gray-300">
          <span className="break-all font-medium text-white">{arquivo.originalName}</span>, de {dono(arquivo)}
          {arquivo.ownerEmail && arquivo.ownerName ? ` (${arquivo.ownerEmail})` : ""}, sai da lista do usuário e
          os links de compartilhamento dele são revogados.
        </p>
        <p className="text-sm text-gray-400">
          O dono ainda pode restaurar o arquivo pela própria lixeira. Nada é apagado do armazenamento agora.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancelar}
            disabled={executando}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={executando}
            onClick={async () => {
              setExecutando(true);
              await onConfirmar();
            }}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {executando ? "Movendo..." : "Mover para a lixeira"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Confirmação: expurgo (irreversível), exige digitar o nome do arquivo ----
function ConfirmarExpurgo({
  arquivo,
  onCancelar,
  onConfirmar,
}: {
  arquivo: ArquivoAdmin;
  onCancelar: () => void;
  onConfirmar: () => Promise<void>;
}) {
  const [digitado, setDigitado] = useState("");
  const [executando, setExecutando] = useState(false);
  const liberado = confirmacaoDeExpurgo(digitado, arquivo.originalName);
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="titulo-expurgo"
      aria-describedby="descricao-expurgo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => !executando && onCancelar()}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!liberado || executando) return;
          setExecutando(true);
          await onConfirmar();
        }}
        className="w-full max-w-md space-y-3 rounded-xl border border-red-500/40 bg-[#161616] p-5"
      >
        <h2 id="titulo-expurgo" className="flex items-center gap-2 text-lg font-semibold text-red-300">
          <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          Excluir definitivamente?
        </h2>
        <div id="descricao-expurgo" className="space-y-2 text-sm text-gray-300">
          <p>
            <span className="break-all font-medium text-white">{arquivo.originalName}</span>, de {dono(arquivo)}
            {arquivo.ownerEmail && arquivo.ownerName ? ` (${arquivo.ownerEmail})` : ""}, será apagado do
            armazenamento com todas as versões, e o espaço volta para a cota do usuário.
          </p>
          <p className="font-medium text-red-300">Esta ação não pode ser desfeita: nem o dono nem um admin poderá recuperar o arquivo.</p>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="text-gray-400">
            Para confirmar, digite o nome do arquivo: <span className="break-all text-gray-200">{arquivo.originalName}</span>
          </span>
          <input
            autoFocus
            value={digitado}
            onChange={(e) => setDigitado(e.target.value)}
            disabled={executando}
            aria-label="Nome do arquivo para confirmar o expurgo"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancelar}
            disabled={executando}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!liberado || executando}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-40"
          >
            {executando ? "Excluindo..." : "Excluir definitivamente"}
          </button>
        </div>
      </form>
    </div>
  );
}

type Resposta = {
  consulta: string; // caminho de GET /admin/files que gerou esta resposta
  recarga: number;
  dados?: PaginaArquivosAdmin;
  erro?: string;
};

type Aviso = { tipo: "ok" | "erro"; texto: string };

export default function ArquivosAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filtro = lerFiltro(searchParams);
  const { visao, busca, pagina } = filtro;
  const consulta = caminhoListagem(filtro);

  const [texto, setTexto] = useState(busca);
  const [recargas, setRecargas] = useState(0);
  const [resposta, setResposta] = useState<Resposta | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [acao, setAcao] = useState<{ tipo: "lixeira" | "expurgo"; arquivo: ArquivoAdmin } | null>(null);

  function mudarFiltro(parcial: Partial<FiltroArquivosAdmin>, opcoes?: { replace?: boolean }) {
    setSearchParams(escreverFiltro({ ...filtro, ...parcial }), opcoes);
  }

  // espera o admin parar de digitar; a busca nova volta para a página 1
  useEffect(() => {
    if (texto.trim() === busca) return;
    const espera = setTimeout(() => {
      setSearchParams(escreverFiltro({ visao, busca: texto, pagina: 1 }), { replace: true });
    }, 350);
    return () => clearTimeout(espera);
  }, [texto, busca, visao, setSearchParams]);

  // carrega a página; uma resposta atrasada de outro filtro é descartada
  useEffect(() => {
    const controle = new AbortController();
    const recarga = recargas;
    listarArquivosAdmin({ visao, busca, pagina }, controle.signal).then(
      (dados) => {
        if (!controle.signal.aborted) setResposta({ consulta, recarga, dados });
      },
      (e) => {
        if (!controle.signal.aborted)
          setResposta({ consulta, recarga, erro: mensagemDeErro(e, "Falha ao carregar os arquivos.") });
      },
    );
    return () => controle.abort();
  }, [consulta, visao, busca, pagina, recargas]);

  const atual = resposta?.consulta === consulta ? resposta : null;
  const carregando = !atual;
  const atualizando = atual !== null && atual.recarga !== recargas;
  const files = atual?.dados?.files ?? [];
  const total = atual?.dados?.total ?? 0;
  const paginas = totalDePaginas(total);

  // a página ficou vazia (ex.: último item expurgado): volta para a última página que existe
  useEffect(() => {
    if (atual?.dados && atual.dados.files.length === 0 && pagina > 1 && !atualizando)
      setSearchParams(escreverFiltro({ visao, busca, pagina: totalDePaginas(atual.dados.total) }), { replace: true });
  }, [atual, atualizando, pagina, visao, busca, setSearchParams]);

  function trocarVisao(nova: VisaoArquivosAdmin) {
    if (nova === visao) return;
    setAviso(null);
    mudarFiltro({ visao: nova, pagina: 1 });
  }

  async function confirmarLixeira(arquivo: ArquivoAdmin) {
    try {
      await moverParaLixeiraAdmin(arquivo.id);
      setAviso({ tipo: "ok", texto: `“${arquivo.originalName}” foi para a lixeira de ${dono(arquivo)}.` });
    } catch (e) {
      setAviso({ tipo: "erro", texto: mensagemDeErro(e, "Não foi possível mover para a lixeira.") });
    }
    setAcao(null);
    setRecargas((n) => n + 1);
  }

  async function confirmarExpurgo(arquivo: ArquivoAdmin) {
    try {
      const resultado = await expurgarArquivoAdmin(arquivo.id);
      setAviso({
        tipo: "ok",
        texto:
          resultado === "em-andamento"
            ? `“${arquivo.originalName}” foi excluído. O servidor está terminando de liberar o espaço.`
            : `“${arquivo.originalName}” foi excluído definitivamente.`,
      });
    } catch (e) {
      setAviso({ tipo: "erro", texto: mensagemDeErro(e, "Não foi possível excluir definitivamente.") });
    }
    setAcao(null);
    setRecargas((n) => n + 1);
  }

  function acoesDe(f: ArquivoAdmin) {
    if (visao === "lixeira") {
      return (
        <button
          type="button"
          onClick={() => setAcao({ tipo: "expurgo", arquivo: f })}
          className="rounded-md px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/15"
          aria-label={`Excluir definitivamente ${f.originalName}`}
        >
          Excluir de vez
        </button>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <a
          href={urlDownloadAdmin(f.id)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          aria-label={`Baixar ${f.originalName}`}
        >
          <Download className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={() => setAcao({ tipo: "lixeira", arquivo: f })}
          className="rounded-md p-1.5 text-gray-400 hover:bg-red-500/15 hover:text-red-400"
          aria-label={`Mover ${f.originalName} para a lixeira`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const colunaData = visao === "lixeira" ? "Na lixeira desde" : "Enviado em";
  const dataDe = (f: ArquivoAdmin) => data(visao === "lixeira" ? f.updatedAt : f.createdAt);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-xl font-semibold sm:text-2xl">Arquivos</h1>

        <div role="tablist" aria-label="Situação dos arquivos" className="mb-4 flex gap-1 border-b border-white/10">
          {(
            [
              ["ativos", "Ativos"],
              ["lixeira", "Lixeira"],
            ] as const
          ).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              role="tab"
              aria-selected={visao === valor}
              onClick={() => trocarVisao(valor)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
                visao === valor ? "border-white text-white" : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
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
              type="search"
              value={texto}
              maxLength={TAMANHO_MAXIMO_BUSCA_ADMIN}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por arquivo, dono ou e-mail..."
              aria-label="Buscar por arquivo, dono ou e-mail"
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {!carregando && !atual?.erro && (
            <p className="text-sm text-gray-500" aria-live="polite">
              {total === 1 ? "1 arquivo" : `${total} arquivos`}
              {visao === "lixeira" ? " na lixeira" : ""}
              {busca ? ` para “${busca}”` : ""}
            </p>
          )}
        </div>

        {visao === "lixeira" && (
          <p className="mb-4 text-sm text-gray-500">
            Arquivos na lixeira não podem ser baixados. O dono pode restaurá-los pela lixeira dele; a exclusão
            definitiva apaga o arquivo e as versões e não pode ser desfeita.
          </p>
        )}

        {aviso && (
          <div
            role={aviso.tipo === "erro" ? "alert" : "status"}
            className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
              aviso.tipo === "erro"
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            <span>{aviso.texto}</span>
            <button type="button" onClick={() => setAviso(null)} aria-label="Fechar aviso" className="opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {atual?.erro ? (
          <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {atual.erro}{" "}
            <button type="button" onClick={() => setRecargas((n) => n + 1)} className="underline">
              Tentar de novo
            </button>
          </div>
        ) : carregando ? (
          <LoadingSkeleton mensagem="Carregando arquivos..." />
        ) : files.length === 0 ? (
          <div className="rounded-xl border border-white/10 px-4 py-10 text-center text-sm text-gray-500">
            {busca
              ? "Nenhum arquivo encontrado para essa busca."
              : visao === "lixeira"
                ? "A lixeira está vazia."
                : "Nenhum arquivo enviado ainda."}
          </div>
        ) : (
          <div aria-busy={atualizando} className={atualizando ? "opacity-60 transition-opacity" : undefined}>
            {/* Tabela: tablet e desktop */}
            <div className="hidden overflow-hidden rounded-xl border border-white/10 md:block">
              <div className="grid grid-cols-[1fr_200px_100px_130px_110px] border-b border-white/10 px-4 py-3 text-xs uppercase tracking-wide text-gray-500">
                <span>Nome</span>
                <span>Dono</span>
                <span>Tamanho</span>
                <span>{colunaData}</span>
                <span />
              </div>
              {files.map((f) => (
                <div
                  key={f.id}
                  className="grid grid-cols-[1fr_200px_100px_130px_110px] items-center border-b border-white/5 px-4 py-3 transition-colors last:border-b-0 hover:bg-white/5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileIcon type={tipoDoArquivo(f.originalName, f.mimeType)} />
                    <span className="truncate text-sm" title={f.originalName}>
                      {f.originalName}
                    </span>
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-sm text-gray-300">{dono(f)}</p>
                    {f.ownerEmail && f.ownerName && <p className="truncate text-xs text-gray-500">{f.ownerEmail}</p>}
                  </div>
                  <span className="text-sm text-gray-400">{formatBytes(f.sizeBytes)}</span>
                  <span className="text-sm text-gray-400">{dataDe(f)}</span>
                  <div className="flex justify-end">
                    {acoesDe(f)}
                  </div>
                </div>
              ))}
            </div>

            {/* Cartões: celular */}
            <div className="flex flex-col gap-2 md:hidden">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3">
                  <FileIcon type={tipoDoArquivo(f.originalName, f.mimeType)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{f.originalName}</p>
                    <p className="truncate text-xs text-gray-500">
                      {dono(f)}
                      {f.ownerEmail && f.ownerName ? ` · ${f.ownerEmail}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(f.sizeBytes)} · {dataDe(f)}
                    </p>
                  </div>
                  {acoesDe(f)}
                </div>
              ))}
            </div>

            {paginas > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-400">
                <button
                  type="button"
                  disabled={pagina <= 1}
                  onClick={() => mudarFiltro({ pagina: pagina - 1 })}
                  className="rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/5 disabled:opacity-40"
                >
                  Anterior
                </button>
                <span>
                  Página {Math.min(pagina, paginas)} de {paginas}
                </span>
                <button
                  type="button"
                  disabled={pagina >= paginas}
                  onClick={() => mudarFiltro({ pagina: pagina + 1 })}
                  className="rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/5 disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}

        {acao?.tipo === "lixeira" && (
          <ConfirmarLixeira
            arquivo={acao.arquivo}
            onCancelar={() => setAcao(null)}
            onConfirmar={() => confirmarLixeira(acao.arquivo)}
          />
        )}
        {acao?.tipo === "expurgo" && (
          <ConfirmarExpurgo
            arquivo={acao.arquivo}
            onCancelar={() => setAcao(null)}
            onConfirmar={() => confirmarExpurgo(acao.arquivo)}
          />
        )}
      </main>
    </div>
  );
}
