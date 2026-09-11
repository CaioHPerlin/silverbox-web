import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";

// ---- Tipos ----
type ItemType = "pdf" | "image" | "sheet" | "folder";

interface RecentItem {
  id: string;
  name: string;
  type: ItemType;
  meta: string; // "aberto há 2h", "12 arquivos", etc.
}

interface SuggestedItem {
  id: string;
  name: string;
  type: ItemType;
  sharedBy: string;
}

interface SearchForm {
  query: string;
}

// ---- Dados de exemplo (substituir pela chamada à API) ----
const user = { name: "Rafael", usedGb: 3.2, totalGb: 5 };

const recentItems: RecentItem[] = [
  { id: "1", name: "relatorio_v3.pdf", type: "pdf", meta: "aberto há 2h" },
  { id: "2", name: "grafico.png", type: "image", meta: "aberto ontem" },
  { id: "3", name: "custos.xlsx", type: "sheet", meta: "aberto ontem" },
  { id: "4", name: "contratos", type: "folder", meta: "12 arquivos" },
];

const suggestedItems: SuggestedItem[] = [
  { id: "1", name: "planilha_custos_2026.pdf", type: "pdf", sharedBy: "maria.souza" },
];

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

// ---- Ícone por tipo (SVG inline, sem dependência externa) ----
function ItemIcon({ type }: { type: ItemType }) {
  if (type === "folder") {
    return (
      <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    );
  }
  if (type === "image") {
    return (
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 13l2.5-2.5L13 13l3-3 4 4" />
        <circle cx="8.5" cy="8.5" r="1.5" />
      </svg>
    );
  }
  if (type === "sheet") {
    return (
      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  // pdf
  return (
    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ItemIconSmall({ type }: { type: ItemType }) {
  const colors: Record<ItemType, string> = {
    pdf: "text-red-400",
    image: "text-emerald-400",
    sheet: "text-green-400",
    folder: "text-blue-400",
  };
  return (
    <svg className={`w-5 h-5 ${colors[type]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Home() {
  const { register } = useForm<SearchForm>({ defaultValues: { query: "" } });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      <Sidebar usedGb={user.usedGb} totalGb={user.totalGb} />

      <main className="flex-1 p-8">
        {/* Busca + avatar */}
        <form
          className="flex items-center gap-3 mb-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative flex-1">
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              {...register("query")}
              placeholder="Buscar na minha nuvem"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-3 py-2.5 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-semibold text-sm shrink-0">
            {getInitials(user.name)}
          </div>
        </form>

        {/* Saudação */}
        <h1 className="text-xl font-semibold mb-1">{greeting()}, {user.name}</h1>
        <p className="text-sm text-gray-500 mb-4">Acessados recentemente</p>

        {/* Grid de blocos recentes */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {recentItems.map((item) => (
            <button
              key={item.id}
              className="flex flex-col items-start gap-4 bg-white/5 border border-white/10 hover:border-white/20 transition-colors rounded-xl p-4 text-left"
            >
              <ItemIcon type={item.type} />
              <div>
                <p className="text-sm font-medium truncate w-full">{item.name}</p>
                <p className="text-xs text-gray-500">{item.meta}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Sugeridos */}
        <p className="text-sm text-gray-400 mb-3">Sugeridos para você</p>
        <div className="border border-white/10 rounded-xl overflow-hidden">
          {suggestedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ItemIconSmall type={item.type} />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm text-gray-500">compartilhado por {item.sharedBy}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}