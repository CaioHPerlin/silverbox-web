export type PlanCode = "free" | "pro" | "team" | "business";
export type BillingCycle = "month" | "year";

// Modelo de apresentação. Os planos pagos só serão contratáveis após a API comercial existir.
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
  featured?: boolean;
  storageBytes: number;
  egressBytes: number | null;
  maxFileBytes: number;
  versionDays: number | null;
  trashDays: number | null;
  highlights: readonly string[];
}

export interface PlanSelection {
  planCode: PlanCode;
  cycle: BillingCycle;
  seats: number;
}
