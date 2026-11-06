import Sidebar from "../components/Sidebar";
import { useLixeira } from "../hooks/useLixeira";
import { formatBytes } from "../lib/format";

// ---- Tipos ----
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

// ---- Ícone por tipo de arquivo (SVG inline, sem dependência externa) ----
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
      className={`w-5 h-5 ${colors[type]}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export default function Lixeira() {
  const { arquivos, carregando, erro, restaurar, excluir, esvaziar } =
    useLixeira();

  function handleExcluir(id: number, nome: string) {
    if (
      window.confirm(
        `Excluir "${nome}" definitivamente? Esta ação não pode ser desfeita.`,
      )
    )
      excluir(id);
  }

  function handleEsvaziar() {
    if (
      window.confirm(
        `Excluir definitivamente ${arquivos.length} arquivo(s)? Esta ação não pode ser desfeita.`,
      )
    )
      esvaziar();
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold sm:text-2xl">Lixeira</h1>

          {arquivos.length > 0 && (
            <button
              type="button"
              onClick={handleEsvaziar}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 sm:w-auto sm:py-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                />
              </svg>
              Esvaziar lixeira
            </button>
          )}
        </div>

        <p className="mb-6 mt-3 text-sm text-gray-500">
          Arquivos na lixeira ainda ocupam espaço na sua cota
        </p>

        {erro && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {erro}
          </div>
        )}

        {carregando && (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            Carregando...
          </div>
        )}

        {!carregando && arquivos.length === 0 && (
          <div className="rounded-xl border border-white/10 px-4 py-10 text-center text-sm text-gray-500">
            A lixeira está vazia.
          </div>
        )}

        {!carregando && arquivos.length > 0 && (
          <div className="flex flex-col gap-3">
            {arquivos.map((file) => (
              <div
                key={file.id}
                className="flex min-w-0 flex-col gap-4 rounded-xl border border-white/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <FileIcon
                    type={tipoDoArquivo(file.originalName, file.mimeType)}
                  />
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium">
                      {file.originalName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatBytes(file.sizeBytes)}
                      {file.deletedAt &&
                        ` · excluído em ${new Date(file.deletedAt).toLocaleDateString("pt-BR")}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => restaurar(file.id)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Restaurar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExcluir(file.id, file.originalName)}
                    aria-label={`Excluir definitivamente ${file.originalName}`}
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}