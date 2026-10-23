import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import AdminSidebar from "../../components/Adminsidebar";

// ---- Tipos ----
type FileType = "pdf" | "image" | "doc" | "sheet" | "zip" | "other";

interface StoredFile {
  id: string;
  name: string;
  owner: string;
  type: FileType;
  size: string;
  date: string;
}

// ---- Dados de exemplo (substituir pela chamada à API com fetch) ----
const mockFiles: StoredFile[] = [
  {
    id: "1",
    name: "relatorio-tecnico.pdf",
    owner: "Ana Souza",
    type: "pdf",
    size: "2,1 MB",
    date: "08/09/2026",
  },
  {
    id: "2",
    name: "diagrama-arquitetura.png",
    owner: "Carlos Dias",
    type: "image",
    size: "540 KB",
    date: "05/09/2026",
  },
  {
    id: "3",
    name: "planilha-custos.xlsx",
    owner: "Maria Lima",
    type: "sheet",
    size: "128 KB",
    date: "01/09/2026",
  },
  {
    id: "4",
    name: "apresentacao-final.pdf",
    owner: "Ana Souza",
    type: "pdf",
    size: "4,8 MB",
    date: "29/08/2026",
  },
  {
    id: "5",
    name: "backup-config.zip",
    owner: "Pedro Alves",
    type: "zip",
    size: "12,3 MB",
    date: "20/08/2026",
  },
  {
    id: "6",
    name: "notas-projeto.docx",
    owner: "Carlos Dias",
    type: "doc",
    size: "34 KB",
    date: "18/08/2026",
  },
];

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
      className={`w-5 h-5 shrink-0 ${colors[type]}`}
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

export default function AdminArquivos() {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<StoredFile[]>(mockFiles);

  const filtered = files.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.owner.toLowerCase().includes(query.toLowerCase()),
  );

  function handleDelete(id: string) {
    // TODO: quando tiver API, chamar o endpoint de exclusão e depois refazer o fetch
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-xl font-semibold sm:text-2xl">Arquivos</h1>

        {/* Busca */}
        <div className="relative mb-6 max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
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
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-white/10 px-4 py-10 text-center text-sm text-gray-500">
            Nenhum arquivo encontrado.
          </div>
        ) : (
          <>
            {/* ---- Tabela: tablet (md) e desktop ---- */}
            <div className="hidden overflow-hidden rounded-xl border border-white/10 md:block">
              <div className="grid grid-cols-[1fr_140px_100px_120px_70px] px-4 py-3 text-xs uppercase tracking-wide text-gray-500 border-b border-white/10">
                <span>Nome</span>
                <span>Usuário</span>
                <span>Tamanho</span>
                <span>Enviado em</span>
                <span></span>
              </div>
              {filtered.map((file) => (
                <div
                  key={file.id}
                  className="grid grid-cols-[1fr_140px_100px_120px_70px] items-center border-b border-white/5 px-4 py-3 transition-colors last:border-b-0 hover:bg-white/5"
                >
                  <div className="flex items-center gap-3 truncate">
                    <FileIcon type={file.type} />
                    <span className="truncate text-sm">{file.name}</span>
                  </div>
                  <span className="truncate text-sm text-gray-400">
                    {file.owner}
                  </span>
                  <span className="text-sm text-gray-400">{file.size}</span>
                  <span className="text-sm text-gray-400">{file.date}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => console.log("baixar", file.id)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                      aria-label="Baixar"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(file.id)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-500/15 hover:text-red-400"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ---- Cartões: celular, abaixo do md ---- */}
            <div className="flex flex-col gap-2 md:hidden">
              {filtered.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3"
                >
                  <FileIcon type={file.type} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {file.owner} · {file.size} · {file.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => console.log("baixar", file.id)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                      aria-label="Baixar"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(file.id)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-500/15 hover:text-red-400"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
