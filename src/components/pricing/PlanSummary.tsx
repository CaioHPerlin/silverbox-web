import { useEffect, useId, useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { authUrl } from "../../lib/authNavigation";
import { formatMoney, formatStorage, planUrl, totalPrice } from "../../lib/pricing";
import type { PlanSelection, PricingPlan } from "../../types/billing";

interface PlanSummaryProps {
  plan: PricingPlan;
  selection: PlanSelection;
  authenticated: boolean;
  onClose: () => void;
}

export default function PlanSummary({ plan, selection, authenticated, onClose }: PlanSummaryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const returnTo = planUrl(selection);
  const comingSoon = plan.status === "coming-soon";

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-zinc-900 p-0 text-white shadow-2xl backdrop:bg-black/75">
      <div className="p-6 sm:p-8" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-medium uppercase tracking-widest text-blue-400">{comingSoon ? "Proposta de lançamento" : "Seu espaço na nuvem"}</p><h2 id={titleId} className="mt-2 text-2xl font-semibold">Plano {plan.name}</h2></div>
          <button type="button" onClick={onClose} aria-label="Fechar resumo" className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-400"><X size={20} /></button>
        </div>
        <p id={descriptionId} className="mt-4 text-sm leading-6 text-zinc-400">{comingSoon ? "Este plano está em preparação. Os valores e recursos serão confirmados no lançamento. Você pode começar com uma conta gratuita." : "Organize seus arquivos e compartilhe por link. Nenhum cartão é necessário para criar sua conta."}</p>
        <dl className="my-6 divide-y divide-white/10 rounded-xl border border-white/10 px-4 text-sm">
          <div className="flex justify-between gap-4 py-4"><dt className="text-zinc-400">Armazenamento{comingSoon ? " previsto" : ""}</dt><dd className="text-right">{formatStorage(plan.storageBytes)}{plan.perSeat ? " compartilhados" : ""}</dd></div>
          {comingSoon && <div className="flex justify-between gap-4 py-4"><dt className="text-zinc-400">Periodicidade proposta</dt><dd>{selection.cycle === "year" ? "Anual" : "Mensal"}</dd></div>}
          {plan.perSeat && <div className="flex justify-between gap-4 py-4"><dt className="text-zinc-400">Pessoas</dt><dd>{selection.seats}</dd></div>}
          <div className="flex justify-between gap-4 py-4 font-semibold"><dt>{comingSoon ? "Total proposto" : "Valor"}</dt><dd>{comingSoon ? `${formatMoney(totalPrice(plan, selection.cycle, selection.seats))}/${selection.cycle === "year" ? "ano" : "mês"}` : "Grátis"}</dd></div>
        </dl>
        {comingSoon && <p className="mb-5 rounded-lg border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm leading-6 text-blue-200">A contratação dos planos pagos ainda não está disponível. Nenhuma cobrança será feita nesta página.</p>}
        <Link to={authenticated ? "/" : authUrl("cadastro", returnTo)} className="flex min-h-11 items-center justify-center rounded-lg bg-blue-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-blue-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400">{authenticated ? "Acessar minha conta" : "Criar conta gratuita"}</Link>
        {!authenticated && <p className="mt-4 text-center text-sm text-zinc-400">Já tem uma conta? <Link to={authUrl("login", returnTo)} className="font-medium text-blue-400 hover:underline">Entrar</Link></p>}
      </div>
    </dialog>
  );
}
