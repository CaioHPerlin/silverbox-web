import AdminSidebar from "../../components/Adminsidebar";

// ---- Tipos ----
interface Upload {
  id: string;
  label: string; // ex.: "20/08"
  sizeMb: number;
}

interface Usage {
  usedGb: number;
  quotaGb: number;
  filesCount: number;
}

// ---- Dados de exemplo (substituir pela chamada à API com fetch) ----
const mockUsage: Usage = {
  usedGb: 3.2,
  quotaGb: 5,
  filesCount: 128,
};

const mockUploads: Upload[] = [
  { id: "1", label: "16/08", sizeMb: 250 },
  { id: "2", label: "17/08", sizeMb: 370 },
  { id: "3", label: "18/08", sizeMb: 280 },
  { id: "4", label: "19/08", sizeMb: 520 },
  { id: "5", label: "20/08", sizeMb: 290 },
  { id: "6", label: "21/08", sizeMb: 520 },
  { id: "7", label: "22/08", sizeMb: 290 },
];

// ---- Helpers ----
function formatGb(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

// A barra muda de cor conforme a cota vai acabando
function progressColor(percent: number) {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 75) return "bg-amber-400";
  return "bg-[#5b93e8]";
}

// ---- Componentes ----
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

export default function AdminSistema() {
  // Quando tiver API: useState + fetch no useEffect para usage e uploads
  const usage = mockUsage;
  const uploads = mockUploads;

  const percent = Math.round((usage.usedGb / usage.quotaGb) * 100);
  const freeGb = Math.max(usage.quotaGb - usage.usedGb, 0);
  const maxSize = Math.max(...uploads.map((u) => u.sizeMb), 1);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold sm:text-2xl">Uso da conta</h1>
          <p className="mt-1 text-sm text-gray-500">
            Consumo calculado em tempo real a partir dos objetos armazenados
          </p>
        </div>

        <div>
          {/* ---- Cartões de resumo ---- */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <StatCard
              label="Espaço usado"
              value={`${formatGb(usage.usedGb)} GB`}
              suffix={`/ ${usage.quotaGb} GB`}
            />
            <StatCard
              label="Espaço livre"
              value={`${formatGb(freeGb)} GB`}
              suffix={`/ ${usage.quotaGb} GB`}
            />
            <StatCard
              label="Arquivos"
              value={usage.filesCount.toLocaleString("pt-BR")}
            />
          </div>

          {/* ---- Cota utilizada ---- */}
          <section className="mt-8">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-300">Cota utilizada</span>
              <span className="text-gray-400">{percent}%</span>
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
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </section>

          {/* ---- Últimos uploads ---- */}
          <section className="mt-10">
            <h2 className="mb-4 text-sm text-gray-300">
              Uploads dos ultimos 7 dias.
            </h2>

            {uploads.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhum upload recente. Os envios aparecem aqui assim que forem
                feitos.
              </p>
            ) : (
              <div
                className="flex h-44 items-end gap-3 sm:gap-4"
                role="img"
                aria-label="Gráfico de barras com o tamanho dos últimos uploads"
              >
                {uploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                  >
                    <span className="text-xs text-gray-400">
                      {upload.sizeMb} MB
                    </span>
                    <div
                      className="w-full rounded-t-md bg-[#5b93e8]"
                      style={{ height: `${(upload.sizeMb / maxSize) * 70}%` }}
                      title={`${upload.label}: ${upload.sizeMb} MB`}
                    />
                    <span className="text-xs text-gray-500">
                      {upload.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
