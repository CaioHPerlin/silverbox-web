import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";
import { FileActionsMenu } from "../components/FileActionsMenu";
import { ShareModal } from "../components/ShareModal";
import { RenameModal } from "../components/RenameModal";
import { MoveModal } from "../components/MoveModal";
import { useArquivos } from "../hooks/useArquivos";
import { formatBytes } from "../lib/format";
import { moverArquivo, urlDownload, type ArquivoApi } from "../services/files";

// ---- Tipos ----
type FileType = "pdf" | "image" | "doc" | "sheet" | "zip" | "other";

interface StoredFile {
  id: string;
  name: string;
  type: FileType;
  size: string;
  date: string;
  folderId: string | null;
}

interface SearchForm {
  query: string;
}

// ---- Conversão API -> formato da tela ----
function tipoDoArquivo(nome: string, mime: string | null): FileType {
  const ext = nome.split(".").pop()?.toLowerCase() ?? "";
  if (mime?.startsWith("image/")) return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (["doc", "docx", "odt", "txt", "rtf"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) return "sheet";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "zip";
  return "other";
}

function paraTela(a: ArquivoApi): StoredFile {
  return {
    id: String(a.id),
    name: a.originalName,
    type: tipoDoArquivo(a.originalName, a.mimeType),
    size: formatBytes(a.sizeBytes),
    date: new Date(a.createdAt).toLocaleDateString("pt-BR"),
    folderId: a.folderId == null ? null : String(a.folderId),
  };
}

// ---- Ícone por tipo de arquivo ----
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
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a2 2 0 01.707.293l4.414 4.414a2 2 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-yellow-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      />
    </svg>
  );
}

export default function Arquivos() {
  const { register, watch } = useForm<SearchForm>({
    defaultValues: { query: "" },
  });
  const query = watch("query");

  // navegação entre pastas: pilha com o caminho até a pasta atual
  const [caminho, setCaminho] = useState<{ id: number; name: string }[]>([]);
  const folderId = caminho.length > 0 ? caminho[caminho.length - 1].id : null;

  const {
    arquivos,
    pastas,
    carregando,
    enviando,
    erro,
    enviar,
    novaPasta,
    renomear,
    lixeira,
    apagarPasta,
  } = useArquivos(folderId);

  const inputRef = useRef<HTMLInputElement>(null);

  const [sharingFile, setSharingFile] = useState<StoredFile | null>(null);
  const [renamingFile, setRenamingFile] = useState<StoredFile | null>(null);
  const [movingFile, setMovingFile] = useState<StoredFile | null>(null);

  const files = arquivos.map(paraTela);
  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase()),
  );

  function handleSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const selecionados = Array.from(e.target.files ?? []);
    e.target.value = ""; // permite escolher o mesmo arquivo de novo
    if (selecionados.length > 0) enviar(selecionados);
  }

  function handleNovaPasta() {
    const nome = window.prompt("Nome da nova pasta:")?.trim();
    if (nome) novaPasta(nome);
  }

  function handleBaixar(id: string) {
    // o cookie de sessão vai junto; a API responde com attachment
    window.location.href = urlDownload(Number(id));
  }

  const itemVazio = !carregando && pastas.length === 0 && filtered.length === 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold sm:text-2xl">Meus arquivos</h1>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleNovaPasta}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-sm transition-colors hover:bg-white/5 sm:w-auto sm:py-2"
            >
              Nova pasta
            </button>

            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={handleSelecionar}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={enviando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium transition-colors hover:bg-blue-600 disabled:opacity-50 sm:w-auto sm:py-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {enviando ? "Enviando..." : "Enviar arquivo"}
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav
          aria-label="Caminho"
          className="mb-4 flex flex-wrap items-center gap-1 text-sm text-gray-400"
        >
          <button
            type="button"
            onClick={() => setCaminho([])}
            className={caminho.length === 0 ? "text-white" : "hover:text-white"}
          >
            Meus arquivos
          </button>
          {caminho.map((p, i) => (
            <span key={p.id} className="flex items-center gap-1">
              <span aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => setCaminho(caminho.slice(0, i + 1))}
                className={
                  i === caminho.length - 1 ? "text-white" : "hover:text-white"
                }
              >
                {p.name}
              </button>
            </span>
          ))}
        </nav>

        {erro && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {erro}
          </div>
        )}

        <form
          className="relative mb-6 w-full sm:max-w-md"
          onSubmit={(event) => event.preventDefault()}
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
            placeholder="Buscar arquivo..."
            aria-label="Buscar arquivo"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-9 pr-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:py-2"
          />
        </form>

        {/* Pastas */}
        {pastas.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pastas.map((pasta) => (
              <div
                key={pasta.id}
                className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-3 transition-colors hover:bg-white/5"
              >
                <button
                  type="button"
                  onClick={() =>
                    setCaminho([...caminho, { id: pasta.id, name: pasta.name }])
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <FolderIcon />
                  <span className="truncate text-sm">{pasta.name}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Excluir pasta ${pasta.name}`}
                  onClick={() => {
                    if (window.confirm(`Excluir a pasta "${pasta.name}"? Só funciona se estiver vazia.`))
                      apagarPasta(pasta.id);
                  }}
                  className="shrink-0 text-gray-500 transition-colors hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {carregando && (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            Carregando...
          </div>
        )}

        {itemVazio && (
          <div className="rounded-xl border border-white/10 px-4 py-10 text-center text-sm text-gray-500">
            Nenhum arquivo encontrado.
          </div>
        )}

        {/* Tabela para telas médias e grandes */}
        {!carregando && filtered.length > 0 && (
          <div className="hidden overflow-visible rounded-xl border border-white/10 sm:block">
            <div className="grid grid-cols-[minmax(0,1fr)_90px_110px_40px] items-center gap-2 border-b border-white/10 px-3 py-3 text-xs uppercase tracking-wide text-gray-500 md:grid-cols-[minmax(0,1fr)_120px_140px_40px] md:px-4">
              <span>Nome</span>
              <span>Tamanho</span>
              <span>Enviado em</span>
              <span aria-label="Ações" />
            </div>

            {filtered.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-[minmax(0,1fr)_90px_110px_40px] items-center gap-2 border-b border-white/5 px-3 py-3 transition-colors last:border-b-0 hover:bg-white/5 md:grid-cols-[minmax(0,1fr)_120px_140px_40px] md:px-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileIcon type={file.type} />
                  <span className="truncate text-sm">{file.name}</span>
                </div>

                <span className="text-sm text-gray-400">{file.size}</span>
                <span className="text-sm text-gray-400">{file.date}</span>

                <FileActionsMenu
                  onShare={() => setSharingFile(file)}
                  onRename={() => setRenamingFile(file)}
                  onDownload={() => handleBaixar(file.id)}
                  onMove={() => setMovingFile(file)}
                  onDelete={() => lixeira(Number(file.id))}
                />
              </div>
            ))}
          </div>
        )}

        {/* Cartões para celulares */}
        {!carregando && filtered.length > 0 && (
          <div className="space-y-3 sm:hidden">
            {filtered.map((file) => (
              <article
                key={file.id}
                className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <FileIcon type={file.type} />

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium">{file.name}</p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span>{file.size}</span>
                      <span>{file.date}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <FileActionsMenu
                      onShare={() => setSharingFile(file)}
                      onRename={() => setRenamingFile(file)}
                      onDownload={() => handleBaixar(file.id)}
                      onMove={() => setMovingFile(file)}
                      onDelete={() => lixeira(Number(file.id))}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <ShareModal file={sharingFile} onClose={() => setSharingFile(null)} />

        <RenameModal
          file={renamingFile}
          onClose={() => setRenamingFile(null)}
          onRenamed={(id, newName) => {
            renomear(Number(id), newName);
          }}
        />

        <MoveModal
          file={movingFile}
          onClose={() => setMovingFile(null)}
          onMoved={async (id, destino) => {
            await moverArquivo(Number(id), destino == null ? null : Number(destino));
            setCaminho((c) => [...c]); // força nova renderização; veja a nota abaixo
          }}
        />
      </main>
    </div>
  );
}