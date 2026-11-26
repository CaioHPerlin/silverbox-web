import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authUrl } from "../../lib/authNavigation";
import { paymentMethodLabels } from "../../lib/billing";
import { planUrl } from "../../lib/pricing";
import { ApiError } from "../../services/apiClient";
import { startCheckout } from "../../services/billing";
import type { PaidPlanSelection, PaymentMethod } from "../../types/billing";

interface CheckoutFormProps {
  buyerId: string;
  selection: PaidPlanSelection;
  methods: readonly PaymentMethod[];
  onCreated: (purchaseId: string) => void;
}

export default function CheckoutForm({ buyerId, selection, methods, onCreated }: CheckoutFormProps) {
  const methodId = useId();
  const cpfId = useId();
  const [method, setMethod] = useState<PaymentMethod>(methods[0]);
  const [payerCpf, setPayerCpf] = useState("");
  const [error, setError] = useState<unknown>();
  const [submitting, setSubmitting] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeRequest.current) return;
    const request = new AbortController();
    const storageKey = `silverbox:checkout:${buyerId}:${selection.planCode}:${selection.cycle}:${selection.seats}:${method}`;
    activeRequest.current = request;
    setError(undefined);
    setSubmitting(true);

    try {
      // Mantém a intenção quando a requisição falha ou a aba é recarregada antes de receber o ID.
      const key = sessionStorage.getItem(storageKey) ?? crypto.randomUUID();
      sessionStorage.setItem(storageKey, key);
      const cpf = method === "credit_card" ? "" : payerCpf.trim();
      const purchase = await startCheckout({ ...selection, method, ...(cpf ? { payerCpf: cpf } : {}) }, key, request.signal);
      if (request.signal.aborted) return;
      sessionStorage.removeItem(storageKey);
      onCreated(purchase.id);
    } catch (failure) {
      if (!request.signal.aborted) setError(failure);
    } finally {
      activeRequest.current = null;
      if (!request.signal.aborted) setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor={methodId} className="mb-2 block text-sm font-medium">Forma de pagamento</label>
        <select id={methodId} value={method} onChange={(event) => setMethod(event.currentTarget.value as PaymentMethod)} disabled={submitting} className="min-h-11 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-blue-400">
          {methods.map((option) => <option key={option} value={option}>{paymentMethodLabels[option]}</option>)}
        </select>
      </div>
      {method !== "credit_card" && (
        <div>
          <label htmlFor={cpfId} className="mb-2 block text-sm font-medium">CPF de homologação</label>
          <input id={cpfId} value={payerCpf} onChange={(event) => setPayerCpf(event.currentTarget.value)} disabled={submitting} inputMode="numeric" autoComplete="off" maxLength={14} placeholder="000.000.000-00" aria-describedby={`${cpfId}-help`} className="min-h-11 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-blue-400" />
          <p id={`${cpfId}-help`} className="mt-2 text-xs leading-5 text-zinc-400">Informe na primeira compra por Pix ou boleto desta conta.</p>
        </div>
      )}
      {error instanceof ApiError && error.status === 401 ? (
        <p role="alert" className="text-sm text-red-300">Sua sessão expirou. <Link to={authUrl("login", planUrl(selection))} className="font-medium underline">Entrar novamente</Link></p>
      ) : Boolean(error) && (
        <p role="alert" className="text-sm text-red-300">{error instanceof ApiError ? error.message : "Falha ao enviar a compra. Tente novamente para recuperar a mesma tentativa."}</p>
      )}
      <button type="submit" disabled={submitting} className="min-h-11 w-full rounded-lg bg-blue-400 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:opacity-50">
        {submitting ? "Criando cobrança…" : "Gerar cobrança"}
      </button>
    </form>
  );
}
