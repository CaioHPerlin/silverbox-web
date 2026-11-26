import { api } from "./apiClient";
import { paymentMethodLabels, readPurchaseId } from "../lib/billing";
import type { CheckoutSelection, PlanCatalog, PlanPurchase } from "../types/billing";

export async function getPlanCatalog(): Promise<PlanCatalog> {
  const catalog = await api.get<PlanCatalog>("/plans");
  if (catalog?.currency !== "BRL" || !Array.isArray(catalog.plans) || !catalog.plans.length || !Array.isArray(catalog.paymentMethods)) {
    throw new Error("Catálogo de planos indisponível.");
  }
  return { ...catalog, paymentMethods: catalog.paymentMethods.filter((method) => Object.hasOwn(paymentMethodLabels, method)) };
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
