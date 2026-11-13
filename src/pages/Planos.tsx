import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Cloud, ShieldCheck } from "lucide-react";
import { useSession } from "../lib/authClient";
import { authUrl } from "../lib/authNavigation";
import { normalizeSeats, planUrl, readPlanSelection } from "../lib/pricing";
import { PLANS } from "../data/plans";
import PlanCard from "../components/pricing/PlanCard";
import PlanSummary from "../components/pricing/PlanSummary";
import PlansComparison from "../components/pricing/PlansComparison";
import PricingBrand from "../components/pricing/PricingBrand";
import type { BillingCycle, PricingPlan } from "../types/billing";

export default function Planos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: session } = useSession();
  const selection = readPlanSelection(searchParams.toString(), PLANS);
  const selectedPlan = PLANS.find((plan) => plan.code === selection?.planCode);
  const cycle: BillingCycle = searchParams.get("cycle") === "year" ? "year" : "month";
  const freeUrl = planUrl({ planCode: "free", cycle: "month", seats: 1 });
  const createAccountUrl = session ? "/" : authUrl("cadastro", freeUrl);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Planos | Silverbox";
    return () => { document.title = previousTitle; };
  }, []);

  function changeCycle(value: BillingCycle) {
    const params = new URLSearchParams(searchParams);
    params.set("cycle", value);
    setSearchParams(params, { replace: true });
  }

  function selectPlan(plan: PricingPlan, seats: number) {
    const url = planUrl({ planCode: plan.code, cycle, seats: normalizeSeats(plan, seats) });
    setSearchParams(url.split("?")[1], { preventScrollReset: true });
  }

  function closeSummary() {
    const params = new URLSearchParams(searchParams);
    params.delete("plan");
    params.delete("seats");
    setSearchParams(params, { replace: true, preventScrollReset: true });
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] font-sans text-white selection:bg-blue-400/30">
      <a href="#conteudo-planos" className="sr-only z-50 rounded-lg bg-white p-3 text-black focus:not-sr-only focus:fixed focus:top-4 focus:left-4">Pular para o conteúdo</a>
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-8">
        <PricingBrand />
        <nav aria-label="Navegação da página de planos" className="flex items-center gap-5 text-sm sm:gap-7">
          <a href="#ofertas" className="hidden text-zinc-400 transition hover:text-white sm:inline">Planos</a>
          <a href="#comparacao" className="text-zinc-400 transition hover:text-white">Comparar</a>
          <Link to={session ? "/" : authUrl("login", "/planos")} className="rounded-lg border border-white/15 px-4 py-2 font-medium transition hover:bg-white/5">{session ? "Minha conta" : "Entrar"}</Link>
        </nav>
      </header>

      <main id="conteudo-planos" className="mx-auto max-w-7xl px-5 sm:px-8">
        <section aria-labelledby="pricing-title" className="relative flex min-h-115 flex-col items-center justify-center py-20 text-center sm:py-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-8 mx-auto h-72 max-w-3xl rounded-full bg-blue-500/10 blur-3xl" />
          <span className="relative inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-200"><ShieldCheck size={15} aria-hidden="true" />Seu espaço, do seu jeito</span>
          <h1 id="pricing-title" className="relative mt-7 max-w-4xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">Espaço para tudo<br className="hidden sm:block" /> o que importa.</h1>
          <p className="relative mt-6 max-w-xl text-base leading-7 text-balance text-zinc-400 sm:text-lg">Guarde, organize e compartilhe seus arquivos. Comece gratuitamente e conheça o que estamos preparando para os próximos passos.</p>
          <Link to={createAccountUrl} className="relative mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-blue-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400">{session ? "Acessar minha conta" : "Começar grátis"}<ArrowRight size={17} aria-hidden="true" /></Link>
        </section>

        <section id="ofertas" aria-labelledby="plans-title" className="scroll-mt-8 py-12 sm:py-16">
          <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div><p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Planos e preços</p><h2 id="plans-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Encontre o seu espaço</h2><p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">O Free está disponível para começar. Conheça também as propostas dos planos pagos, que chegam em breve.</p></div>
            <div className="inline-flex w-fit rounded-xl border border-white/10 bg-white/[0.025] p-1" role="group" aria-label="Período da proposta de cobrança">
              <button type="button" aria-pressed={cycle === "month"} onClick={() => changeCycle("month")} className={`min-h-10 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-blue-400 ${cycle === "month" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"}`}>Mensal</button>
              <button type="button" aria-pressed={cycle === "year"} onClick={() => changeCycle("year")} className={`min-h-10 rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-blue-400 ${cycle === "year" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"}`}>Anual</button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">{PLANS.map((plan) => <PlanCard key={plan.code} plan={plan} cycle={cycle} onSelect={selectPlan} />)}</div>
          <p className="mt-6 max-w-3xl text-xs leading-6 text-zinc-500">Os valores e recursos dos planos pagos estão sujeitos à confirmação no lançamento. A contratação paga ainda não está disponível. Nos planos de equipe propostos, o espaço é compartilhado e a cobrança é por pessoa.</p>
        </section>

        <PlansComparison plans={PLANS} />

        <section aria-labelledby="pricing-cta-title" className="mb-20 flex flex-col justify-between gap-7 rounded-2xl border border-blue-400/20 bg-blue-500/5 p-7 sm:p-10 lg:flex-row lg:items-center">
          <div><Cloud size={25} className="mb-4 text-blue-400" aria-hidden="true" /><h2 id="pricing-cta-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">Seu primeiro espaço começa aqui.</h2><p className="mt-3 text-sm leading-6 text-zinc-400">Crie sua conta gratuita e comece a organizar seus arquivos.</p></div>
          <Link to={createAccountUrl} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-400 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-blue-300">{session ? "Acessar minha conta" : "Criar conta gratuita"}<ArrowRight size={17} aria-hidden="true" /></Link>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col justify-between gap-5 border-t border-white/10 px-5 py-8 sm:flex-row sm:items-center sm:px-8"><PricingBrand /><p className="text-xs text-zinc-500">Um lugar para os seus arquivos.</p></footer>
      {selection && selectedPlan && <PlanSummary key={selectedPlan.code} plan={selectedPlan} selection={selection} authenticated={Boolean(session)} onClose={closeSummary} />}
    </div>
  );
}
