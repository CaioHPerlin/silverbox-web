import type { PaymentMethod } from "../types/billing";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  credit_card: "Cartão de crédito",
  pix: "Pix",
  boleto: "Boleto",
};

export function readPurchaseId(value: string | null): string | null {
  return value && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(value) ? value : null;
}

export function sandboxPaymentUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.origin === "https://sandbox.asaas.com" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
