import { api } from "./apiClient";
import { paymentMethodLabels, readPurchaseId } from "../lib/billing";
import type { CheckoutSelection, PlanCatalog, PlanPurchase } from "../types/billing";

export async function getPlanCatalog(): Promise<PlanCatalog> {
  const catalog = await api.get<Omit<PlanCatalog, "billingMode"> & { billingMode?: unknown }>("/plans");
  if (catalog?.currency !== "BRL" || !Array.isArray(catalog.plans) || !catalog.plans.length || !Array.isArray(catalog.paymentMethods)) {
    throw new Error("Catálogo de planos indisponível.");
  }
  const billingMode = catalog.billingMode ??
    (catalog.plans.some((plan) => plan.checkoutEnabled) ? "sandbox" : "disabled");
  if (billingMode !== "sandbox" && billingMode !== "production" && billingMode !== "disabled") {
    throw new Error("Modo de cobrança indisponível.");
  }
  return { ...catalog, billingMode, paymentMethods: catalog.paymentMethods.filter((method) => Object.hasOwn(paymentMethodLabels, method)) };
}

export async function startCheckout(selection: CheckoutSelection, idempotencyKey: string, signal: AbortSignal) {
  const purchase = await api.post<PlanPurchase>("/plans/checkout", selection, {
    headers: { "Idempotency-Key": idempotencyKey },
    signal,
  });
  if (!readPurchaseId(purchase?.id ?? null)) throw new Error("Resposta de checkout inválida.");
  return purchase;
}

export function getPurchase(id: string, signal: AbortSignal) {
  return api.get<PlanPurchase>(`/plans/purchases/${encodeURIComponent(id)}`, { signal });
}
