import { useState } from "react";
import { BriefcaseBusiness, Check, Minus, Plus, Rocket, Sparkles, Users } from "lucide-react";
import { formatMoney, monthlyEquivalent, normalizeSeats, totalPrice } from "../../lib/pricing";
import type { BillingCycle, PricingPlan } from "../../types/billing";

interface PlanCardProps {
  plan: PricingPlan;
  cycle: BillingCycle;
  onSelect: (plan: PricingPlan, seats: number) => void;
}

const icons = { free: Sparkles, pro: Rocket, team: Users, business: BriefcaseBusiness };

export default function PlanCard({ plan, cycle, onSelect }: PlanCardProps) {
  const [seats, setSeats] = useState(plan.seatMin);
  const Icon = icons[plan.code];
  const paid = plan.monthlyPriceCents > 0;
  const comingSoon = plan.status === "coming-soon";

  return (
    <article className={`relative flex min-w-0 flex-col rounded-2xl border p-6 ${plan.featured ? "border-blue-400/60 bg-blue-500/5" : "border-white/10 bg-white/[0.025]"}`}>
      {plan.featured && <span className="absolute -top-3 right-5 rounded-full bg-blue-400 px-3 py-1 text-xs font-semibold text-zinc-950">Em destaque</span>}
      <header>
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400"><Icon size={21} aria-hidden="true" /></span>
          {comingSoon && <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-400">Em breve</span>}
        </div>
        <p className="text-xs font-medium tracking-wide text-zinc-400">{plan.audience}</p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight">{plan.name}</h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">{plan.description}</p>
      </header>

      <div className="mt-6 min-h-28 border-y border-white/10 py-5">
        <p><span className="text-3xl font-semibold tracking-tight">{paid ? formatMoney(monthlyEquivalent(plan, cycle)) : "Grátis"}</span>
          {paid && <span className="ml-1 text-xs text-zinc-400">/mês{plan.perSeat ? " por pessoa" : ""}</span>}</p>
        <p className="mt-2 text-xs leading-5 text-zinc-400">
          {!paid ? "Sem cartão para começar." : cycle === "year" ? `${formatMoney(plan.yearlyPriceCents)}/ano${plan.perSeat ? " por pessoa" : ""}, no lançamento.` : "Preço proposto para o lançamento."}
        </p>
      </div>

      <ul className="my-6 space-y-3 text-sm leading-5 text-zinc-300">
        {plan.highlights.map((feature) => <li key={feature} className="flex items-start gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-blue-400" aria-hidden="true" />{feature}</li>)}
      </ul>

      <div className="mt-auto">
        {plan.perSeat && <div className="mb-4 rounded-lg border border-white/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">Pessoas · mínimo {plan.seatMin}</span>
            <div className="flex items-center gap-3">
              <button type="button" aria-label={`Remover pessoa do ${plan.name}`} disabled={seats <= plan.seatMin} onClick={() => setSeats((value) => normalizeSeats(plan, value - 1))} className="rounded-md border border-white/15 p-1.5 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-30"><Minus size={14} /></button>
              <output aria-live="polite" className="min-w-4 text-center text-sm">{seats}</output>
              <button type="button" aria-label={`Adicionar pessoa ao ${plan.name}`} disabled={seats >= 100} onClick={() => setSeats((value) => normalizeSeats(plan, value + 1))} className="rounded-md border border-white/15 p-1.5 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-30"><Plus size={14} /></button>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-400">Total proposto: {formatMoney(totalPrice(plan, cycle, seats))}/{cycle === "year" ? "ano" : "mês"}</p>
        </div>}
        <button type="button" onClick={() => onSelect(plan, seats)} className={`flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 ${plan.featured ? "border-blue-400 bg-blue-400 text-zinc-950 hover:bg-blue-300" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}`}>
          {comingSoon ? `Conhecer o ${plan.name}` : "Começar grátis"}
        </button>
      </div>
    </article>
  );
}
