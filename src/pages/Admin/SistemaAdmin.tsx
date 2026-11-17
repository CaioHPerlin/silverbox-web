import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { API_URL } from "../../config/api";
import { useCota } from "../../hooks/useCota";
import { formatBytes } from "../../lib/format";
import LoadingSkeleton from "../../components/LoadingSkeleton";

type EstadoApi = "verificando" | "ok" | "indisponivel" | "inacessivel";

// A barra muda de cor conforme a cota vai acabando
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

const textoEstado: Record<EstadoApi, { texto: string; cor: string }> = {
  verificando: { texto: "Verificando...", cor: "text-gray-400" },
  ok: { texto: "Operacional (banco e armazenamento)", cor: "text-emerald-400" },
  indisponivel: {
    texto: "Dependência indisponível (banco ou armazenamento)",
    cor: "text-red-400",
  },
  inacessivel: { texto: "API inacessível", cor: "text-red-400" },
};

export default function SistemaAdmin() {
  const { cota, carregandoCota, atualizar } = useCota();
  const [estado, setEstado] = useState<EstadoApi>("verificando");
  const [verificadoEm, setVerificadoEm] = useState<Date | null>(null);

  const verificar = useCallback(async () => {
    setEstado("verificando");
    try {
      const res = await fetch(`${API_URL}/health/ready`);
      setEstado(res.ok ? "ok" : "indisponivel");
    } catch {
      setEstado("inacessivel");
    }
    setVerificadoEm(new Date());
  }, []);

  useEffect(() => {
    let ativo = true;
    void Promise.resolve().then(() => { if (ativo) return verificar(); });
    return () => { ativo = false; };
  }, [verificar]);

  const percent = cota
    ? Math.min(Math.round((cota.usedBytes / cota.limitBytes) * 100), 100)
    : 0;

  const estadoAtual = textoEstado[estado];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {(carregandoCota || estado === "verificando") && (
          <LoadingSkeleton mensagem="Carregando informações do sistema..." />
        )}

        {!carregandoCota && estado !== "verificando" && (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl">Sistema</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Estado da API e uso de armazenamento da sua conta
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  verificar();
                  atualizar();
                }}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm transition-colors hover:bg-white/5"
              >
                Atualizar
              </button>
            </div>

            {/* Status da API */}
            <section className="mb-8 rounded-xl border border-white/10 bg-black px-5 py-4">
              <p className="text-xs text-gray-400">Status da API</p>
              <p className={`mt-1 text-sm font-medium ${estadoAtual.cor}`}>
                {estadoAtual.texto}
              </p>
              {verificadoEm && (
                <p className="mt-1 text-xs text-gray-500">
                  Verificado às {verificadoEm.toLocaleTimeString("pt-BR")}
                </p>
              )}
            </section>

            {/* Uso da conta logada */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <StatCard
                label="Espaço usado"
                value={cota ? formatBytes(cota.usedBytes) : "..."}
                suffix={cota ? `/ ${formatBytes(cota.limitBytes)}` : undefined}
              />
              <StatCard
                label="Espaço livre"
                value={cota ? formatBytes(cota.availableBytes) : "..."}
                suffix={cota ? `/ ${formatBytes(cota.limitBytes)}` : undefined}
              />
              <StatCard label="Arquivos" value="—" suffix="indisponível" />
            </div>

            <section className="mt-8">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-300">Cota utilizada</span>
                <span className="text-gray-400">
                  {cota ? `${percent}%` : "..."}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Cota utilizada"
                className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
              >
                <div
                  className={`h-full rounded-full transition-all ${progressColor(percent)}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                A cota inclui arquivos na lixeira e versões antigas.
              </p>
            </section>

            {/* Pendências do back */}
            <section className="mt-10 rounded-xl border border-dashed border-white/15 px-5 py-4">
              <h2 className="text-sm text-gray-300">
                Métricas globais (pendentes)
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Total de arquivos, uso do disco do servidor e uploads dos
                últimos 7 dias dependem de um endpoint administrativo que ainda
                não existe na API.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
