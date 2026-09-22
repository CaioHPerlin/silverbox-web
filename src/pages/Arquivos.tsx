import { useState } from "react";
import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";
import { FileActionsMenu } from "../components/FileActionsMenu";
import { ShareModal } from "../components/ShareModal";
import { RenameModal } from "../components/RenameModal";
import { MoveModal } from "../components/MoveModal";

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

// ---- Dados de exemplo (substituir pela chamada à API com fetch) ----
const mockFiles: StoredFile[] = [
  {
    id: "1",
    name: "relatorio-tecnico.pdf",
    type: "pdf",
    size: "2,1 MB",
    date: "08/09/2026",
    folderId: null,
  },
  {
    id: "2",
    name: "diagrama-arquitetura.png",
    type: "image",
    size: "540 KB",
    date: "05/09/2026",
    folderId: null,
  },
  {
    id: "3",
    name: "planilha-custos.xlsx",
    type: "sheet",
    size: "128 KB",
    date: "01/09/2026",
    folderId: null,
  },
  {
    id: "4",
    name: "apresentacao-final.pdf",
    type: "pdf",
    size: "4,8 MB",
    date: "29/08/2026",
    folderId: null,
  },
  {
    id: "5",
    name: "backup-config.zip",
    type: "zip",
    size: "12,3 MB",
    date: "20/08/2026",
    folderId: null,
  },
  {
    id: "6",
    name: "notas-projeto.docx",
    type: "doc",
    size: "34 KB",
    date: "18/08/2026",
    folderId: null,
  },
];

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

export default function Arquivos() {
  // Busca controlada com React Hook Form (mesmo padrão usado nos formulários de login/upload)
  const { register, watch } = useForm<SearchForm>({
    defaultValues: { query: "" },
  });
  const query = watch("query");

  // lista de arquivos como estado, para simular atualizações (renomear, mover, excluir etc.)
  // sem backend ainda — quando a API estiver pronta, isso vira um `useEffect` + `fetch`
  const [files, setFiles] = useState<StoredFile[]>(mockFiles);

  // arquivo atualmente aberto no modal de compartilhamento (null = modal fechado)
  const [sharingFile, setSharingFile] = useState<StoredFile | null>(null);

  // arquivo atualmente aberto no modal de renomear (null = modal fechado)
  const [renamingFile, setRenamingFile] = useState<StoredFile | null>(null);

  // arquivo atualmente aberto no modal de mover (null = modal fechado)
  const [movingFile, setMovingFile] = useState<StoredFile | null>(null);

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Meus arquivos</h1>
          <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
            <svg
              className="w-4 h-4"
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
            Enviar arquivo
          </button>
        </div>

        {/* Busca */}
        <form
          className="relative mb-6 max-w-md"
          onSubmit={(e) => e.preventDefault()}
        >
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
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
            {...register("query")}
            placeholder="Buscar arquivo..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </form>

        {/* Lista de arquivos */}
        <div className="border border-white/10 rounded-xl">
          <div className="grid grid-cols-[1fr_120px_140px_40px] px-4 py-3 text-xs uppercase tracking-wide text-gray-500 border-b border-white/10">
            <span>Nome</span>
            <span>Tamanho</span>
            <span>Enviado em</span>
            <span></span>
          </div>
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-500 text-sm">
              Nenhum arquivo encontrado.
            </div>
          ) : (
            filtered.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-[1fr_120px_140px_40px] items-center px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <FileIcon type={file.type} />
                  <span className="truncate text-sm">{file.name}</span>
                </div>
                <span className="text-sm text-gray-400">{file.size}</span>
                <span className="text-sm text-gray-400">{file.date}</span>
                <FileActionsMenu
                  onShare={() => setSharingFile(file)}
                  onRename={() => setRenamingFile(file)}
                  onDownload={() => console.log("baixar", file.id)}
                  onMove={() => setMovingFile(file)}
                  onDelete={() => console.log("excluir", file.id)}
                />
              </div>
            ))
          )}
        </div>

        <ShareModal file={sharingFile} onClose={() => setSharingFile(null)} />

        <RenameModal
          file={renamingFile}
          onClose={() => setRenamingFile(null)}
          onRenamed={(id, newName) => {
            // TODO: quando tiver API, trocar isso por um refetch da lista
            setFiles((prev) =>
              prev.map((f) => (f.id === id ? { ...f, name: newName } : f)),
            );
          }}
        />

        <MoveModal
          file={movingFile}
          onClose={() => setMovingFile(null)}
          onMoved={(id, folderId) => {
            // TODO: quando tiver API, trocar isso por um refetch da lista
            setFiles((prev) =>
              prev.map((f) => (f.id === id ? { ...f, folderId } : f)),
            );
          }}
        />
      </main>
    </div>
  );
}
