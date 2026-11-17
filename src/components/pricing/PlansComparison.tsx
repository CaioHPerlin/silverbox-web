import { formatStorage } from "../../lib/pricing";
import type { PricingPlan } from "../../types/billing";

interface ComparisonRow {
  label: string;
  value: (plan: PricingPlan) => string;
}

const rows: ComparisonRow[] = [
  { label: "Armazenamento", value: (plan) => `${formatStorage(plan.storageBytes)}${plan.perSeat ? " compartilhados" : ""}` },
  { label: "Downloads por ciclo", value: (plan) => plan.egressBytes === null ? "Sem franquia comercial definida" : formatStorage(plan.egressBytes) },
  { label: "Tamanho por arquivo", value: (plan) => formatStorage(plan.maxFileBytes) },
  { label: "Histórico de versões", value: (plan) => plan.versionDays === null ? "Sem prazo comercial definido" : `${plan.versionDays} dias previstos` },
  { label: "Recuperação da lixeira", value: (plan) => plan.trashDays === null ? "Até exclusão definitiva" : `${plan.trashDays} dias previstos` },
  { label: "Pessoas", value: (plan) => plan.perSeat ? `A partir de ${plan.seatMin}, cobradas individualmente` : "1 pessoa" },
];

export default function PlansComparison({ plans }: { plans: readonly PricingPlan[] }) {
  return (
    <section id="comparacao" aria-labelledby="comparison-title" className="scroll-mt-8 py-16 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Compare os recursos</p>
      <h2 id="comparison-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Veja cada detalhe</h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">O Free está disponível. Capacidades, valores e recursos dos planos pagos são propostas para o lançamento.</p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10" tabIndex={0} role="region" aria-label="Tabela comparativa dos planos">
        <table className="w-full min-w-210 border-collapse text-left text-sm">
          <caption className="sr-only">Recursos do Free e propostas dos planos pagos</caption>
          <thead className="bg-white/5"><tr><th scope="col" className="px-5 py-5 font-medium text-zinc-400">Recurso</th>{plans.map((plan) => <th scope="col" key={plan.code} className="px-5 py-5 font-semibold">{plan.name}<span className="mt-1 block text-xs font-normal text-zinc-400">{plan.status === "available" ? "Disponível" : "Em breve · proposta"}</span></th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr key={row.label} className="border-t border-white/10"><th scope="row" className="px-5 py-4 font-medium text-zinc-300">{row.label}</th>{plans.map((plan) => <td key={plan.code} className="max-w-48 px-5 py-4 text-zinc-400">{row.value(plan)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-5 text-zinc-500">GiB e TiB usam base 1024. Versões anteriores e arquivos na lixeira também ocupam o espaço da conta.</p>
    </section>
  );
}
