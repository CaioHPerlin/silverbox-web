import { FileText, UserPlus } from "lucide-react";
import AdminSidebar from "../../components/Adminsidebar";

// ---- Tipos ----
type Severity = "normal" | "erro";

interface AuditLog {
  id: string;
  dateTime: string; // ex.: "20/08 14:12"
  name: string;
  email: string;
  action: string;
  ip: string;
  severity: Severity; // "erro" destaca a ação em vermelho (ex.: upload recusado)
}

// ---- Dados de exemplo (substituir pela chamada à API com fetch) ----
const mockLogs: AuditLog[] = [
  {
    id: "1",
    dateTime: "20/08 14:12",
    name: "João Silva",
    email: "joao.silva@ifms.edu.br",
    action: "Upload de arquivo",
    ip: "200.98.44.12",
    severity: "normal",
  },
  {
    id: "2",
    dateTime: "20/08 13:58",
    name: "Maria Souza",
    email: "maria.souza@ifms.edu.br",
    action: "Alterou papel de usuário",
    ip: "200.98.44.02",
    severity: "normal",
  },
  {
    id: "3",
    dateTime: "20/08 13:45",
    name: "Rafael Borges",
    email: "rafael.borges@ifms.edu.br",
    action: "Upload recusado (cota excedida)",
    ip: "177.32.10.90",
    severity: "erro",
  },
  {
    id: "4",
    dateTime: "20/08 09:55",
    name: "João Silva",
    email: "joao.silva@ifms.edu.br",
    action: "Excluiu arquivo",
    ip: "200.98.44.12",
    severity: "normal",
  },
  {
    id: "5",
    dateTime: "19/08 23:59",
    name: "Henrique Morais",
    email: "henrique.morais@ifms.edu.br",
    action: "Alterou arquivo",
    ip: "200.98.80.12",
    severity: "normal",
  },
];

export default function AdminAuditoria() {
  // Quando tiver API: const [logs, setLogs] = useState<AuditLog[]>([]) + fetch no useEffect
  const logs = mockLogs;

  function handleExport() {
    // TODO: quando tiver API, chamar o endpoint que gera o relatório (CSV/PDF)
    console.log("Exportar relatório de auditoria");
  }

  function handleNewUser() {
    // TODO: abrir modal ou navegar para a tela de cadastro de usuário
    console.log("Novo usuário");
  }

  function actionColor(severity: Severity) {
    return severity === "erro" ? "text-red-500" : "text-white";
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {/* Cabeçalho */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Auditoria</h1>
            <p className="mt-1 text-sm text-gray-500">
              Quem fez o quê, quando e de qual endereço
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/80 bg-transparent px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10"
            >
              <FileText className="h-4 w-4" />
              Exportar Relatório
            </button>
            <button
              type="button"
              onClick={handleNewUser}
              className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200"
            >
              <UserPlus className="h-4 w-4" />
              Novo Usuário
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
          {/* ---- Tabela: desktop (lg) ---- */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-[1fr_1.2fr_1.3fr_120px_140px] gap-3 border-b border-white/10 px-2 py-3 text-xs uppercase tracking-wide text-gray-500">
              <span>Nome</span>
              <span>E-mail</span>
              <span>Ação</span>
              <span>Data/Hora</span>
              <span>Endereço IP</span>
            </div>
            {logs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-[1fr_1.2fr_1.3fr_120px_140px] items-center gap-3 border-b border-white/5 px-2 py-4 transition-colors last:border-b-0 hover:bg-white/5"
              >
                <span className="truncate text-sm font-medium">{log.name}</span>
                <span className="truncate text-sm text-gray-300">
                  {log.email}
                </span>
                <span
                  className={`text-sm font-medium ${actionColor(log.severity)}`}
                >
                  {log.action}
                </span>
                <span className="truncate text-sm text-gray-300">
                  {log.dateTime}
                </span>
                <span className="text-sm text-gray-500">{log.ip}</span>
              </div>
            ))}
          </div>

          {/* ---- Cartões: celular e tablet, abaixo do lg (só o nome, sem e-mail) ---- */}
          <div className="flex flex-col gap-2 lg:hidden">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-white/10 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium">{log.name}</p>
                  <span className="shrink-0 text-xs text-gray-500">
                    {log.dateTime}
                  </span>
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${actionColor(log.severity)}`}
                >
                  {log.action}
                </p>
                <p className="mt-1 text-xs text-gray-500">{log.ip}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
