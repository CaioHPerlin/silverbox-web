import { useCallback, useEffect, useState } from "react";
import { AdminMetricsChart, AdminMetricsSection } from "../../components/AdminMetrics";
import AdminSidebar from "../../components/AdminSidebar";
import { useAdminMetrics } from "../../hooks/useAdminMetrics";
import { useCota } from "../../hooks/useCota";
import { API_URL } from "../../config/api";
import { formatBytes, formatDecimalBytes } from "../../lib/format";
import type { AdminMetricsPeriod } from "../../services/adminMetrics";

type EstadoApi = "verificando" | "ok" | "indisponivel" | "inacessivel";

function progressColor(percent: number) {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 75) return "bg-amber-400";
  return "bg-[#5b93e8]";
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black px-5 py-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="text-xl font-semibold">{value}</span>
        {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
      </p>
    </div>
  );
}

const healthLabels: Record<EstadoApi, { text: string; color: string }> = {
  verificando: { text: "Verificando...", color: "text-gray-400" },
  ok: {
    text: "Operacional (banco e armazenamento)",
    color: "text-emerald-400",
  },
  indisponivel: {
    text: "Dependência indisponível (banco ou armazenamento)",
    color: "text-red-400",
  },
  inacessivel: { text: "API inacessível", color: "text-red-400" },
};

function decimalCount(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export default function SistemaAdmin() {
  const [period, setPeriod] = useState<AdminMetricsPeriod>(7);
  const { metrics, error, loading, atualizar } = useAdminMetrics(period);
  const { cota, carregandoCota, erroCota, atualizar: atualizarCota } = useCota();
  const [estado, setEstado] = useState<EstadoApi>("verificando");
  const [verifiedAt, setVerifiedAt] = useState<Date | null>(null);

  const verificar = useCallback(async () => {
    setEstado("verificando");
    try {
      const response = await fetch(`${API_URL}/health/ready`);
      setEstado(response.ok ? "ok" : "indisponivel");
    } catch {
      setEstado("inacessivel");
    }
    setVerifiedAt(new Date());
  }, []);

  useEffect(() => {
    let ativo = true;
    void Promise.resolve().then(() => {
      if (ativo) return verificar();
    });
    return () => {
      ativo = false;
    };
  }, [verificar]);

  const usedPercent =
    cota && cota.limitBytes > 0
      ? Math.min(Math.round((cota.usedBytes / cota.limitBytes) * 100), 100)
      : 0;
  const health = healthLabels[estado];

  function atualizarTudo() {
    void Promise.all([verificar(), atualizarCota(), atualizar()]);
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Sistema</h1>
            <p className="mt-1 text-sm text-gray-500">
              Estado da API, recursos globais e uso da sua conta
            </p>
          </div>
          <button
            type="button"
            onClick={atualizarTudo}
            disabled={estado === "verificando"}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm transition-colors enabled:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-50"
          >
            Atualizar
          </button>
        </div>

        <section
          className="mb-6 rounded-xl border border-white/10 bg-black px-5 py-4"
          aria-busy={estado === "verificando"}
        >
          <p className="text-xs text-gray-400">Status da API</p>
          <p
            className={`mt-1 text-sm font-medium ${health.color}`}
            role={estado === "verificando" ? "status" : undefined}
          >
            {health.text}
          </p>
          {verifiedAt && (
            <p className="mt-1 text-xs text-gray-500">
              Verificado às {verifiedAt.toLocaleTimeString("pt-BR")}
            </p>
          )}
        </section>

        <AdminMetricsSection
          title="Métricas globais"
          description="Os cartões mostram os totais atuais. O período se aplica ao gráfico de tráfego diário (UTC)."
          period={period}
          onPeriodChange={setPeriod}
          loading={loading}
          error={error}
          onRetry={() => { void atualizar(); }}
        >
          {metrics && (
            <div className="space-y-8">
              <section aria-labelledby="global-storage-title">
                <h3
                  id="global-storage-title"
                  className="mb-3 text-sm font-medium text-gray-300"
                >
                  Armazenamento e arquivos
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Espaço usado" value={formatDecimalBytes(metrics.storage.usedBytes)} />
                  <StatCard
                    label="Espaço disponível"
                    value={formatDecimalBytes(metrics.storage.availableBytes)}
                    suffix={`/ ${formatDecimalBytes(metrics.storage.limitBytes)}`}
                  />
                  <StatCard
                    label="Espaço reservado"
                    value={formatDecimalBytes(metrics.storage.reservedBytes)}
                  />
                  <StatCard
                    label="Limite de armazenamento"
                    value={formatDecimalBytes(metrics.storage.limitBytes)}
                  />
                  <StatCard
                    label="Espaço na lixeira"
                    value={formatDecimalBytes(metrics.storage.trashBytes)}
                  />
                  <StatCard
                    label="Arquivos ativos"
                    value={decimalCount(metrics.files.active)}
                  />
                  <StatCard
                    label="Arquivos na lixeira"
                    value={decimalCount(metrics.files.trash)}
                  />
                </div>
              </section>

              <section aria-labelledby="disk-capacity-title">
                <h3
                  id="disk-capacity-title"
                  className="mb-3 text-sm font-medium text-gray-300"
                >
                  Capacidade do disco
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard
                    label="Espaço disponível no disco"
                    value={formatDecimalBytes(metrics.storage.diskAvailableBytes)}
                  />
                  <StatCard
                    label="Capacidade total do disco"
                    value={formatDecimalBytes(metrics.storage.diskTotalBytes)}
                  />
                </div>
              </section>

              <AdminMetricsChart
                title="Volume diário transferido"
                traffic={metrics.traffic}
                firstValue="uploadBytes"
                secondValue="downloadBytes"
                firstLabel="Uploads"
                secondLabel="Downloads e prévias públicas"
                byteValues
              />
            </div>
          )}
        </AdminMetricsSection>

        <section
          className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
          aria-busy={carregandoCota}
        >
          <h2 className="text-sm font-medium text-gray-200">Minha cota</h2>
          {cota ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatCard
                label="Espaço usado"
                value={formatBytes(cota.usedBytes)}
                suffix={`/ ${formatBytes(cota.limitBytes)}`}
              />
              <StatCard
                label="Espaço livre"
                value={formatBytes(cota.availableBytes)}
                suffix={`/ ${formatBytes(cota.limitBytes)}`}
              />
              <div className="sm:col-span-2">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-300">Cota utilizada</span>
                  <span className="text-gray-400">{usedPercent}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={usedPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Minha cota utilizada"
                  className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
                >
                  <div
                    className={`h-full rounded-full transition-all ${progressColor(usedPercent)}`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">A cota inclui arquivos na lixeira e versões antigas.</p>
              </div>
            </div>
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
