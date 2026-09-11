import Sidebar from "../components/Sidebar";

// ---- Tipos ----
type FileType = "pdf" | "image" | "doc" | "sheet" | "zip" | "other";

interface TrashedFile {
  id: string;
  name: string;
  type: FileType;
  deletedAt: string;
  daysLeft: number;
}

// ---- Dados de exemplo (substituir pela chamada à API) ----
const mockTrashedFiles: TrashedFile[] = [
  { id: "1", name: "contrato_antigo.pdf", type: "pdf", deletedAt: "15/08", daysLeft: 27 },
  { id: "2", name: "foto_rascunho.png", type: "image", deletedAt: "18/08", daysLeft: 30 },
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

export default function Lixeira() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-semibold">Lixeira</h1>
          <button className="flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
            </svg>
            Esvaziar lixeira
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Itens excluídos são apagados definitivamente após 30 dias
        </p>

        {mockTrashedFiles.length === 0 ? (
          <div className="border border-white/10 rounded-xl px-4 py-10 text-center text-gray-500 text-sm">
            A lixeira está vazia.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mockTrashedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between border border-white/10 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileIcon type={file.type} />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      excluído em {file.deletedAt} · restam {file.daysLeft} dias
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 border border-white/15 hover:bg-white/5 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Restaurar
                  </button>
                  <button className="text-gray-500 hover:text-white transition-colors p-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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