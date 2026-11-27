export type PlanCode = "free" | "pro" | "team" | "business";
export type BillingCycle = "month" | "year";
export type PaymentMethod = "credit_card" | "pix" | "boleto";
export type BillingEnvironment = "sandbox" | "production";
export type BillingMode = "disabled" | BillingEnvironment;

export interface PricingPlan {
  code: PlanCode;
  name: string;
  audience: string;
  description: string;
  status: "available" | "coming-soon";
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  perSeat: boolean;
  seatMin: number;
  seatMax: number;
  checkoutEnabled: boolean;
  featured?: boolean;
  storageBytes: number;
  egressBytes: number | null;
  maxFileBytes: number;
  versionDays: number | null;
  trashDays: number | null;
  highlights: readonly string[];
}

export interface PlanCatalog {
  currency: "BRL";
  billingMode: BillingMode;
  paymentMethods: PaymentMethod[];
  plans: PricingPlan[];
}

export interface PlanSelection {
  planCode: PlanCode;
  cycle: BillingCycle;
  seats: number;
}

export interface PaidPlanSelection extends PlanSelection {
  planCode: Exclude<PlanCode, "free">;
}

export interface CheckoutSelection extends PaidPlanSelection {
  method: PaymentMethod;
  billingEnvironment?: BillingEnvironment;
  payerCpf?: string;
}

export type PurchaseStatus =
  | "preparing" | "pending" | "processing" | "overdue" | "paid" | "expired"
  | "cancelled" | "refunded" | "disputed" | "review" | "failed";

interface PurchaseBase extends PaidPlanSelection {
  id: string;
  environment?: BillingEnvironment;
  currency: "BRL";
  amountCents: number;
  status: PurchaseStatus;
}

export type PlanPurchase = PurchaseBase & (
  | { method: "credit_card"; paymentInstructions?: { url: string } }
  | { method: "pix"; paymentInstructions?: { qrCodeBase64: string; copyPaste: string; expiresAt: string } }
  | { method: "boleto"; paymentInstructions?: { url: string; digitableLine: string; dueDate: string } }
);
