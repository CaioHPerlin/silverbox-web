import { Link } from "react-router-dom";
import { authUrl } from "../../lib/authNavigation";
import { formatMoney, formatStorage, planUrl, totalPrice } from "../../lib/pricing";
import type { BillingMode, PaymentMethod, PlanSelection, PricingPlan } from "../../types/billing";
import CheckoutForm from "./CheckoutForm";
import PricingDialog from "./PricingDialog";

interface PlanSummaryProps {
  plan: PricingPlan;
  selection: PlanSelection;
  buyerId: string | null;
  sessionPending: boolean;
  catalogLoading: boolean;
  paymentMethods: readonly PaymentMethod[];
  billingMode: BillingMode;
  onCreated: (purchaseId: string) => void;
  onClose: () => void;
}

export default function PlanSummary({
  plan, selection, buyerId, sessionPending, catalogLoading, paymentMethods, billingMode, onCreated, onClose,
}: PlanSummaryProps) {
  const returnTo = planUrl(selection);
  const { planCode } = selection;
  const paid = planCode !== "free";
  const checkoutEnabled = paid && billingMode !== "disabled" && plan.checkoutEnabled && paymentMethods.length > 0;
  const production = checkoutEnabled && billingMode === "production";
  const checkingAvailability = paid && !checkoutEnabled && catalogLoading;
  const description = checkoutEnabled
    ? production ? "Pagamento avulso pelo Asaas, sem renovação automática." : "Pagamento avulso simulado no Asaas Sandbox."
    : paid
      ? checkingAvailability ? undefined : "A contratação deste plano está indisponível no momento."
      : "Organize seus arquivos e compartilhe por link. Crie sua conta sem cartão.";
  const actionClassName = "flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-blue-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-400";

  return (
    <PricingDialog title={`Plano ${plan.name}`} description={description} onClose={onClose}>
      <dl className="my-6 divide-y divide-white/10 rounded-xl border border-white/10 px-4 text-sm">
        <div className="flex justify-between gap-4 py-4"><dt className="text-zinc-400">Armazenamento{paid && !production ? " previsto" : ""}</dt><dd className="text-right">{formatStorage(plan.storageBytes)}{plan.perSeat ? " compartilhados" : ""}</dd></div>
        {paid && <div className="flex justify-between gap-4 py-4"><dt className="text-zinc-400">Ciclo</dt><dd>{selection.cycle === "year" ? "Anual" : "Mensal"}</dd></div>}
        {plan.perSeat && <div className="flex justify-between gap-4 py-4"><dt className="text-zinc-400">Pessoas</dt><dd>{selection.seats}</dd></div>}
        <div className="flex justify-between gap-4 py-4 font-semibold"><dt>{paid && !checkoutEnabled ? "Total proposto" : "Valor"}</dt><dd>{paid ? formatMoney(totalPrice(plan, selection.cycle, selection.seats)) : "Grátis"}</dd></div>
      </dl>
      {checkoutEnabled ? (
        sessionPending ? <p role="status" className="text-sm text-zinc-400">Verificando sessão…</p> : buyerId ? (
          <CheckoutForm key={`${billingMode}:${buyerId}:${paymentMethods.join(",")}`} billingEnvironment={billingMode} buyerId={buyerId} selection={{ ...selection, planCode }} methods={paymentMethods} onCreated={onCreated} />
        ) : (
          <>
            <p className="mb-4 text-sm text-zinc-400">Entre na sua conta para escolher a forma de pagamento.</p>
            <Link to={authUrl("login", returnTo)} className={actionClassName}>Contratar plano</Link>
            <p className="mt-4 text-center text-sm"><Link to={authUrl("cadastro", returnTo)} className="text-blue-400 hover:underline">Criar conta</Link></p>
          </>
        )
      ) : paid ? (
        <>
          {checkingAvailability && <p role="status" className="mb-4 text-sm text-zinc-400">Consultando a disponibilidade do checkout…</p>}
          <button type="button" className={actionClassName} disabled>Contratar plano</button>
          <button type="button" className="mt-4 block min-h-11 w-full text-sm font-medium text-blue-400 hover:underline focus-visible:outline-2 focus-visible:outline-blue-400" onClick={onClose}>Voltar aos planos</button>
        </>
      ) : (
        <>
          <Link to={buyerId ? "/home" : authUrl("cadastro", returnTo)} className={actionClassName}>{buyerId ? "Acessar minha conta" : "Criar conta gratuita"}</Link>
          {!buyerId && <p className="mt-4 text-center text-sm text-zinc-400">Já tem uma conta? <Link to={authUrl("login", returnTo)} className="font-medium text-blue-400 hover:underline">Entrar</Link></p>}
        </>
      )}
    </PricingDialog>
  );
}
