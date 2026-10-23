import { Link } from "react-router-dom";
import AdminSidebar from "../../components/Adminsidebar";

// ---- Dados de exemplo (substituir pela chamada à API com fetch) ----
const stats = [
  { label: "Usuários ativos", value: "128", to: "/admin/usuarios" },
  { label: "Armazenamento usado", value: "412 GB", to: "/admin/sistema" },
  { label: "Arquivos enviados", value: "3.482", to: "/admin/sistema" },
  { label: "Uploads recusados (cota)", value: "6", to: "/admin/auditoria" },
];

// cota geral do sistema (soma de todos os usuários)
const quota = {
  usedGb: 412,
  totalGb: 500,
};
const quotaPercent = Math.round((quota.usedGb / quota.totalGb) * 100);

// usuários perto de estourar a própria cota individual
const usersNearLimit = 3;
const uploadsRecusados = 6;

type ActivityType = "upload" | "delete" | "share" | "user" | "block";

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  user: string;
  date: string;
}

const recentActivity: Activity[] = [
  {
    id: "1",
    type: "upload",
    description: "enviou relatorio-tecnico.pdf",
    user: "Ana Souza",
    date: "há 12 min",
  },
  {
    id: "2",
    type: "block",
    description: "teve upload recusado por falta de espaço",
    user: "Carlos Dias",
    date: "há 34 min",
  },
  {
    id: "3",
    type: "share",
    description: "compartilhou planilha-custos.xlsx",
    user: "Maria Lima",
    date: "há 1 h",
  },
  {
    id: "4",
    type: "user",
    description: "criou uma nova conta",
    user: "Pedro Alves",
    date: "há 2 h",
  },
  {
    id: "5",
    type: "delete",
    description: "excluiu backup-config.zip",
    user: "Ana Souza",
    date: "há 3 h",
  },
];

function ActivityIcon({ type }: { type: ActivityType }) {
  const styles: Record<ActivityType, string> = {
    upload: "bg-blue-500/15 text-blue-400",
    delete: "bg-red-500/15 text-red-400",
    share: "bg-emerald-500/15 text-emerald-400",
    user: "bg-violet-500/15 text-violet-400",
    block: "bg-amber-500/15 text-amber-400",
  };
  const paths: Record<ActivityType, string> = {
    upload: "M12 4v12m0 0l-4-4m4 4l4-4M4 20h16",
    delete:
      "M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v12a1 1 0 001 1h6a1 1 0 001-1V7",
    share:
      "M8.6 13.5l6.8 3.9m0-10.8l-6.8 3.9M18 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zm10 6a2 2 0 11-4 0 2 2 0 014 0z",
    user: "M12 12a4 4 0 100-8 4 4 0 000 8zm-6 8a6 6 0 1112 0H6z",
    block:
      "M12 9v4m0 4h.01M4.93 19h14.14a1 1 0 00.87-1.5L12.87 4a1 1 0 00-1.74 0L4.06 17.5A1 1 0 004.93 19z",
  };
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${styles[type]}`}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={paths[type]} />
      </svg>
    </span>
  );
}

export default function AdminDashboard() {
  const showAlert = uploadsRecusados > 0 || usersNearLimit > 0;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-xl font-semibold sm:text-2xl">Dashboard</h1>

        {/* Alerta — só aparece quando há algo que precisa de atenção */}
        {showAlert && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M4.93 19h14.14a1 1 0 00.87-1.5L12.87 4a1 1 0 00-1.74 0L4.06 17.5A1 1 0 004.93 19z"
                />
              </svg>
              <p className="text-sm text-amber-200">
                {usersNearLimit > 0 && (
                  <>
                    <strong>{usersNearLimit} usuários</strong> estão com mais de
                    90% da cota utilizada.{" "}
                  </>
                )}
                {uploadsRecusados > 0 && (
                  <>
                    <strong>{uploadsRecusados} uploads</strong> foram recusados
                    por falta de espaço nas últimas 24 h.
                  </>
                )}
              </p>
            </div>
            <Link
              to="/admin/usuarios"
              className="shrink-0 rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/15"
            >
              Ver usuários
            </Link>
          </div>
        )}

        {/* Cartões de métricas — clicáveis, levam à tela correspondente */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.to}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
            >
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Cota geral do sistema */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Armazenamento total
              </p>
              <span className="text-xs text-gray-500">{quotaPercent}%</span>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all ${
                  quotaPercent >= 90
                    ? "bg-red-500"
                    : quotaPercent >= 70
                      ? "bg-amber-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${Math.min(quotaPercent, 100)}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-gray-400">
              {quota.usedGb} GB de {quota.totalGb} GB usados por todos os
              usuários
            </p>
          </div>

          {/* Últimas ações — resumo da auditoria */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Últimas ações
              </p>
            </div>

            <ul className="flex flex-col divide-y divide-white/5">
              {recentActivity.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <ActivityIcon type={activity.type} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      <span className="font-medium text-gray-200">
                        {activity.user}
                      </span>{" "}
                      <span className="text-gray-400">
                        {activity.description}
                      </span>
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">
                    {activity.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
