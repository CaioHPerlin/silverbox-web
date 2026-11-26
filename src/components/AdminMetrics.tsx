import type { ReactNode } from "react";
import type { AdminMetricDay, AdminMetricsPeriod } from "../services/adminMetrics";
import { formatDecimalBytes } from "../lib/format";

type AdminMetricsFilterProps = {
  period: AdminMetricsPeriod;
  onChange: (period: AdminMetricsPeriod) => void;
};

export function AdminMetricsFilter({
  period,
  onChange,
}: AdminMetricsFilterProps) {
  return (
    <div
      role="group"
      className="flex items-center gap-1 rounded-lg border border-white/10 p-1"
      aria-label="Período do gráfico"
    >
      {([7, 30] as const).map((days) => (
        <button
          key={days}
          type="button"
          aria-pressed={period === days}
          onClick={() => onChange(days)}
          className={`min-h-9 rounded-md px-3 text-sm transition focus-visible:outline-2 focus-visible:outline-blue-400 ${
            period === days ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          {days} dias
        </button>
      ))}
    </div>
  );
}

type AdminMetricsSectionProps = {
  title: string;
  description?: string;
  period: AdminMetricsPeriod;
  onPeriodChange: (period: AdminMetricsPeriod) => void;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  children: ReactNode;
};

export function AdminMetricsSection({
  title,
  description,
  period,
  onPeriodChange,
  loading,
  error,
  onRetry,
  children,
}: AdminMetricsSectionProps) {
  const hasError = error !== undefined && error !== null;
  const errorMessage =
    error instanceof Error
      ? error.message
      : "Não foi possível carregar as métricas.";

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5" aria-busy={loading}>
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          )}
        </div>
        <AdminMetricsFilter period={period} onChange={onPeriodChange} />
      </header>

      {loading && (
        <p className="mb-4 text-sm text-gray-400" role="status">
          {hasError ? "Atualizando métricas..." : "Carregando métricas..."}
        </p>
      )}

      {hasError && (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-9 shrink-0 rounded-lg border border-red-300/30 px-3 font-medium text-red-200 transition hover:bg-red-500/15 focus-visible:outline-2 focus-visible:outline-red-300"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {children}
    </section>
  );
}

type MetricValue = "uploads" | "downloads" | "uploadBytes" | "downloadBytes";

type AdminMetricsChartProps = {
  title: string;
  traffic: AdminMetricDay[];
  firstValue: MetricValue;
  secondValue: MetricValue;
  firstLabel: string;
  secondLabel: string;
  byteValues?: boolean;
};

function valueAsBigInt(day: AdminMetricDay, key: MetricValue) {
  return BigInt(day[key]);
}

function largerValue(first: bigint, second: bigint) {
  return first > second ? first : second;
}

function barHeight(value: bigint, maximum: bigint) {
  if (value === 0n || maximum === 0n) return "0%";
  const hundredths = (value * 10_000n) / maximum;
  return `${Math.max(3, Number(hundredths) / 100)}%`;
}

function formattedValue(value: bigint, byteValues: boolean) {
  return byteValues
    ? formatDecimalBytes(value)
    : new Intl.NumberFormat("pt-BR").format(value);
}

function shortDay(day: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00.000Z`));
}

export function AdminMetricsChart({
  title,
  traffic,
  firstValue,
  secondValue,
  firstLabel,
  secondLabel,
  byteValues = false,
}: AdminMetricsChartProps) {
  const maximum = traffic.reduce(
    (largest, day) => {
      const first = valueAsBigInt(day, firstValue);
      const second = valueAsBigInt(day, secondValue);
      return largerValue(largest, largerValue(first, second));
    },
    0n,
  );
  const noActivity = traffic.length > 0 && maximum === 0n;
  const width = Math.max(420, traffic.length * 46);
  const descriptions = traffic.map((day) => {
    const first = formattedValue(valueAsBigInt(day, firstValue), byteValues);
    const second = formattedValue(valueAsBigInt(day, secondValue), byteValues);
    return `${day.day}: ${firstLabel}, ${first}; ${secondLabel}, ${second}.`;
  });

  return (
    <figure>
      <figcaption className="mb-3 text-sm font-medium text-gray-200">{title}</figcaption>
      <ul className="mb-3 flex flex-wrap gap-4 text-xs text-gray-400" aria-label="Legenda do gráfico">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-400" />
          {firstLabel}
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm bg-violet-400" />
          {secondLabel}
        </li>
      </ul>

      {traffic.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Sem dados disponíveis para este período.</p>
      ) : (
        <>
          <div
            className="overflow-x-auto rounded-lg border border-white/5 bg-black/20 px-3 pt-4"
            role="region"
            aria-label={`Gráfico de ${title} por dia`}
            tabIndex={0}
          >
            <div
              className="grid h-44 items-end gap-2"
              style={{
                gridTemplateColumns: `repeat(${traffic.length}, minmax(34px, 1fr))`,
                minWidth: `${width}px`,
              }}
              aria-hidden="true"
            >
              {traffic.map((day) => {
                const first = valueAsBigInt(day, firstValue);
                const second = valueAsBigInt(day, secondValue);

                return (
                  <div key={day.day} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                    <div className="flex h-32 w-full items-end justify-center gap-1">
                      <span
                        className="w-2/5 rounded-t-sm bg-blue-400"
                        style={{ height: barHeight(first, maximum) }}
                        title={`${firstLabel}: ${formattedValue(first, byteValues)}`}
                      />
                      <span
                        className="w-2/5 rounded-t-sm bg-violet-400"
                        style={{ height: barHeight(second, maximum) }}
                        title={`${secondLabel}: ${formattedValue(second, byteValues)}`}
                      />
                    </div>
                    <time className="text-[10px] text-gray-500" dateTime={day.day}>
                      {shortDay(day.day)}
                    </time>
                  </div>
                );
              })}
            </div>
          </div>
          <ul className="sr-only" aria-label={`Valores diários: ${title}`}>
            {descriptions.map((description, index) => (
              <li key={traffic[index].day}>{description}</li>
            ))}
          </ul>
          {noActivity && <p className="mt-3 text-center text-sm text-gray-400">Sem atividade registrada neste período.</p>}
        </>
      )}
    </figure>
  );
}
