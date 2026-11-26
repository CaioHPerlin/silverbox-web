import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminMetricsChart, AdminMetricsSection } from "../../components/AdminMetrics";
import AdminSidebar from "../../components/AdminSidebar";
import { useAdminMetrics } from "../../hooks/useAdminMetrics";
import { useCota } from "../../hooks/useCota";
import { formatBytes, formatDecimalBytes } from "../../lib/format";
import type { AdminMetricsPeriod } from "../../services/adminMetrics";

function progressColor(percent: number) {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 70) return "bg-amber-500";
  return "bg-blue-500";
}

function formatCount(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function StatCard({
  label,
  value,
  to,
}: {
  label: string;
  value: string;
  to?: string;
}) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </>
  );
  const classes = "rounded-xl border border-white/10 bg-white/[0.03] p-4";

  return to ? (
    <Link
      to={to}
      className={`${classes} transition-colors hover:border-white/20 hover:bg-white/6`}
    >
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

export default function DashboardAdmin() {
  const [period, setPeriod] = useState<AdminMetricsPeriod>(7);
  const { metrics, error, loading, atualizar } = useAdminMetrics(period);
  const { cota, carregandoCota, erroCota, atualizar: atualizarCota } = useCota();
  const usedPercent =
    cota && cota.limitBytes > 0
      ? Math.min(Math.round((cota.usedBytes / cota.limitBytes) * 100), 100)
      : 0;

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-xl font-semibold sm:text-2xl">Dashboard</h1>

        <AdminMetricsSection
          title="Métricas globais"
          description="Os cartões mostram os totais atuais. O período se aplica ao gráfico de atividade diária (UTC)."
          period={period}
          onPeriodChange={setPeriod}
          loading={loading}
          error={error}
          onRetry={() => { void atualizar(); }}
        >
          {metrics && (
            <div className="space-y-6">
              {metrics.users.blocked > 0 && (
                <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-amber-200">
                    <strong>{formatCount(metrics.users.blocked)}</strong>{" "}
                    {metrics.users.blocked === 1
                      ? "conta está bloqueada."
                      : "contas estão bloqueadas."}
                  </p>
                  <Link
                    to="/admin/usuarios"
                    className="shrink-0 rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/15"
                  >
                    Ver usuários
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                  label="Usuários"
                  value={formatCount(metrics.users.total)}
                  to="/admin/usuarios"
                />
                <StatCard
                  label="Administradores"
                  value={formatCount(metrics.users.admins)}
                  to="/admin/usuarios"
                />
                <StatCard
                  label="Bloqueados"
                  value={formatCount(metrics.users.blocked)}
                  to="/admin/usuarios"
                />
                <StatCard
                  label="Arquivos ativos"
                  value={formatCount(metrics.files.active)}
                  to="/admin/arquivos"
                />
                <StatCard
                  label="Armazenamento global"
                  value={formatDecimalBytes(metrics.storage.usedBytes)}
                  to="/admin/sistema"
                />
              </div>

              <AdminMetricsChart
                title="Transferências diárias"
                traffic={metrics.traffic}
                firstValue="uploads"
                secondValue="downloads"
                firstLabel="Uploads"
                secondLabel="Downloads e prévias públicas"
              />
            </div>
          )}
        </AdminMetricsSection>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:max-w-2xl" aria-busy={carregandoCota}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-200">Minha cota</h2>
            <span className="text-xs text-gray-400">{cota ? `${usedPercent}%` : ""}</span>
          </div>

          {cota ? (
            <>
              <div
                className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={usedPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Minha cota utilizada"
              >
                <div
                  className={`h-full rounded-full transition-all ${progressColor(usedPercent)}`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-gray-400">
                {formatBytes(cota.usedBytes)} de {formatBytes(cota.limitBytes)} usados
              </p>
            </>
          ) : erroCota ? (
            <div className="mt-3 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between" role="alert">
              <span className="text-red-300">Não foi possível carregar sua cota.</span>
              <button
                type="button"
                onClick={() => { void atualizarCota(); }}
                className="min-h-9 rounded-lg border border-white/15 px-3 text-gray-200 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-blue-400"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-400" role={carregandoCota ? "status" : undefined}>
              {carregandoCota ? "Carregando cota..." : "Cota indisponível."}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
