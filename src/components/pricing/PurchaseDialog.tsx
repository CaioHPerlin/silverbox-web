import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { authUrl } from "../../lib/authNavigation";
import { asaasPaymentUrl, paymentMethodLabels } from "../../lib/billing";
import { formatMoney } from "../../lib/pricing";
import { ApiError } from "../../services/apiClient";
import { getPurchase } from "../../services/billing";
import type { PlanPurchase, PricingPlan, PurchaseStatus } from "../../types/billing";
import PricingDialog from "./PricingDialog";

const statusLabels: Record<PurchaseStatus, string> = {
  preparing: "Preparando cobrança",
  pending: "Aguardando pagamento",
  processing: "Aguardando confirmação do Asaas",
  overdue: "Cobrança vencida",
  paid: "Pagamento confirmado",
  expired: "Cobrança expirada",
  cancelled: "Cobrança cancelada",
  refunded: "Pagamento estornado",
  disputed: "Pagamento em disputa",
  review: "Pagamento em análise",
  failed: "Falha ao criar a cobrança",
};

const monitoredStatuses = new Set<PurchaseStatus>(["preparing", "pending", "processing", "overdue"]);
const paymentLinkClassName = "inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";

interface PurchaseDialogProps {
  purchaseId: string;
  plans: readonly PricingPlan[];
  authenticated: boolean;
  sessionPending: boolean;
  onClose: () => void;
}

function PaymentCode({ label, value }: { label: string; value: string }) {
  const inputId = useId();
  const [feedback, setFeedback] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback("Código copiado.");
    } catch {
      setFeedback("Selecione o código para copiar manualmente.");
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium">{label}</label>
      <div className="flex min-w-0 gap-2">
        <input id={inputId} value={value} readOnly onFocus={(event) => event.currentTarget.select()} className="min-w-0 flex-1 rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-blue-400" />
        <button type="button" onClick={copy} className="rounded-lg border border-white/15 px-3 py-2 text-sm font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-blue-400">Copiar</button>
      </div>
      {feedback && <p role="status" className="mt-2 text-xs text-zinc-300">{feedback}</p>}
    </div>
  );
}

function PurchaseInstructions({ purchase }: { purchase: PlanPurchase }) {
  const { method, paymentInstructions } = purchase;
  if (!paymentInstructions) return null;

  if (method === "pix") {
    return (
      <div className="space-y-4">
        <img width={192} height={192} className="mx-auto rounded-lg bg-white p-2" src={`data:image/png;base64,${paymentInstructions.qrCodeBase64}`} alt="QR Code Pix" />
        <PaymentCode label="Pix copia e cola" value={paymentInstructions.copyPaste} />
        <p className="text-xs text-zinc-400">Expira em {new Date(paymentInstructions.expiresAt).toLocaleString("pt-BR")}.</p>
      </div>
    );
  }

  const environment = purchase.environment ?? "sandbox";
  const url = asaasPaymentUrl(paymentInstructions.url, environment);
  if (!url) return <p role="alert" className="text-sm text-red-300">O endereço do pagamento está indisponível.</p>;
  const provider = environment === "sandbox" ? "Asaas Sandbox" : "Asaas";

  if (method === "credit_card") {
    return <a href={url} className={paymentLinkClassName}>Abrir checkout no {provider}</a>;
  }

  return (
    <div className="space-y-4">
      <PaymentCode label="Linha digitável" value={paymentInstructions.digitableLine} />
      <p className="text-xs text-zinc-400">Vencimento {new Date(`${paymentInstructions.dueDate}T00:00:00`).toLocaleDateString("pt-BR")}.</p>
      <a href={url} className={paymentLinkClassName} target="_blank" rel="noopener noreferrer">Abrir boleto no {provider}</a>
    </div>
  );
}

export default function PurchaseDialog({ purchaseId, plans, authenticated, sessionPending, onClose }: PurchaseDialogProps) {
  const [purchase, setPurchase] = useState<PlanPurchase | null>(null);
  const [error, setError] = useState<unknown>();
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!authenticated || sessionPending) return;
    const request = new AbortController();
    let timer: number | undefined;

    async function load() {
      try {
        const current = await getPurchase(purchaseId, request.signal);
        if (request.signal.aborted) return;
        setPurchase(current);
        setError(undefined);
        if (monitoredStatuses.has(current.status)) timer = window.setTimeout(load, 5000);
      } catch (failure) {
        if (request.signal.aborted) return;
        if (failure instanceof ApiError && [401, 404].includes(failure.status)) setPurchase(null);
        setError(failure);
      }
    }

    void load();
    return () => {
      request.abort();
      window.clearTimeout(timer);
    };
  }, [authenticated, sessionPending, purchaseId, refresh]);

  const plan = purchase && plans.find((item) => item.code === purchase.planCode);
  const returnTo = `/planos?${new URLSearchParams({ purchaseId })}`;
  const needsLogin = !authenticated || (error instanceof ApiError && error.status === 401);

  return (
    <PricingDialog title={plan ? `Pagamento do ${plan.name}` : "Acompanhar pagamento"} onClose={onClose}>
      {sessionPending ? (
        <p role="status" className="mt-4 text-sm text-zinc-400">Verificando sessão…</p>
      ) : needsLogin ? (
        <Link to={authUrl("login", returnTo)} className={`${paymentLinkClassName} mt-5`}>Entrar para acompanhar a compra</Link>
      ) : (
        <div className="mt-5 space-y-5">
          {purchase && (
            <>
              <div className="rounded-xl border border-white/10 p-4">
                <p role="status" className={purchase.status === "paid" ? "text-sm font-semibold text-emerald-300" : "text-sm font-semibold text-zinc-200"}>{statusLabels[purchase.status]}</p>
                <p className="mt-2 text-2xl font-semibold">{formatMoney(purchase.amountCents)}</p>
                <p className="mt-1 text-sm text-zinc-400">{paymentMethodLabels[purchase.method]} · {purchase.cycle === "year" ? "Anual" : "Mensal"}{purchase.seats > 1 && ` · ${purchase.seats} pessoas`}</p>
              </div>
              <PurchaseInstructions purchase={purchase} />
            </>
          )}
          {!purchase && !error && <p role="status" className="text-sm text-zinc-400">Consultando compra…</p>}
          {Boolean(error) && <p role="alert" className="text-sm text-red-300">{error instanceof ApiError ? error.message : "Não foi possível consultar a compra."}</p>}
          <button type="button" onClick={() => { setError(undefined); setRefresh((count) => count + 1); }} className="min-h-11 w-full rounded-lg border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-blue-400">Atualizar status</button>
        </div>
      )}
    </PricingDialog>
  );
}
