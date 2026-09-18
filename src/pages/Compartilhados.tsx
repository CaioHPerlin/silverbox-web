import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";

// ---- Tipos ----
type FileType = "pdf" | "image" | "doc" | "sheet" | "zip" | "other";

interface SharedFile {
  id: string;
  name: string;
  type: FileType;
  sharedBy: string;
  date: string;
}

interface SearchForm {
  query: string;
}

// ---- Dados de exemplo (substituir pela chamada à API) ----
const mockSharedFiles: SharedFile[] = [
  { id: "1", name: "planilha_custos_2026.pdf", type: "pdf", sharedBy: "maria.souza", date: "10/09/2026" },
  { id: "2", name: "apresentacao-parceria.pdf", type: "pdf", sharedBy: "joao.lima", date: "07/09/2026" },
  { id: "3", name: "foto-evento.png", type: "image", sharedBy: "maria.souza", date: "01/09/2026" },
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
    <svg className={`w-5 h-5 ${colors[type]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function Compartilhados() {
  const { register, watch } = useForm<SearchForm>({ defaultValues: { query: "" } });
  const query = watch("query");

  const filtered = mockSharedFiles.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Compartilhados</h1>

        {/* Busca */}
        <form className="relative mb-6 max-w-md" onSubmit={(e) => e.preventDefault()}>
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            {...register("query")}
            placeholder="Buscar arquivo compartilhado..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </form>

        {/* Lista de compartilhados */}
        <div className="border border-white/10 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_180px_120px] px-4 py-3 text-xs uppercase tracking-wide text-gray-500 border-b border-white/10">
            <span>Nome</span>
            <span>Compartilhado por</span>
            <span>Data</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-gray-500 text-sm">
              Nenhum arquivo compartilhado com você ainda.
            </div>
          ) : (
            filtered.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-[1fr_180px_120px] items-center px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <FileIcon type={file.type} />
                  <span className="truncate text-sm">{file.name}</span>
                </div>
                <span className="text-sm text-gray-400">{file.sharedBy}</span>
                <span className="text-sm text-gray-400">{file.date}</span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}