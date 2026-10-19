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
  {
    id: "1",
    name: "planilha_custos_2026.pdf",
    type: "pdf",
    sharedBy: "maria.souza",
    date: "10/09/2026",
  },
  {
    id: "2",
    name: "apresentacao-parceria.pdf",
    type: "pdf",
    sharedBy: "joao.lima",
    date: "07/09/2026",
  },
  {
    id: "3",
    name: "foto-evento.png",
    type: "image",
    sharedBy: "maria.souza",
    date: "01/09/2026",
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
      className={`h-5 w-5 shrink-0 ${colors[type]}`}
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

export default function Compartilhados() {
  const { register, watch } = useForm<SearchForm>({
    defaultValues: { query: "" },
  });
  const query = watch("query").toLowerCase();

  const filtered = mockSharedFiles.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-2xl font-semibold">Compartilhados</h1>

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
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </form>

        {/* Tabela: computador e telas maiores */}
        <div className="hidden overflow-hidden rounded-xl border border-white/10 sm:block">
          <div className="grid grid-cols-[minmax(0,1fr)_180px_120px] gap-3 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-wide text-gray-500">
            <span>Nome</span>
            <span>Compartilhado por</span>
            <span>Data</span>
          </div>

          {filtered.map((file) => (
            <div
              key={file.id}
              className="grid grid-cols-[minmax(0,1fr)_180px_120px] items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0 hover:bg-white/5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileIcon type={file.type} />
                <span className="truncate text-sm">{file.name}</span>
              </div>
              <span className="truncate text-sm text-gray-400">
                {file.sharedBy}
              </span>
              <span className="text-sm text-gray-400">{file.date}</span>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-gray-500">
              Nenhum arquivo compartilhado encontrado.
            </p>
          )}
        </div>

        {/* Cards: celular */}
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
                  <p className="mt-2 text-xs text-gray-400">
                    Compartilhado por: {file.sharedBy}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{file.date}</p>
                </div>
              </div>
            </article>
          ))}

          {filtered.length === 0 && (
            <p className="rounded-xl border border-white/10 px-4 py-10 text-center text-sm text-gray-500">
              Nenhum arquivo compartilhado encontrado.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
