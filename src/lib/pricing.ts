import type { BillingCycle, PlanSelection, PricingPlan } from "../types/billing";

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function formatStorage(bytes: number): string {
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  if (bytes <= 0) return "0 B";
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${units[index]}`;
}

export function normalizeSeats(plan: PricingPlan, seats: number): number {
  if (!plan.perSeat) return 1;
  return Number.isSafeInteger(seats) ? Math.min(100, Math.max(plan.seatMin, seats)) : plan.seatMin;
}

export function cyclePrice(plan: PricingPlan, cycle: BillingCycle): number {
  return cycle === "year" ? plan.yearlyPriceCents : plan.monthlyPriceCents;
}

export function monthlyEquivalent(plan: PricingPlan, cycle: BillingCycle): number {
  return cycle === "year" ? Math.round(plan.yearlyPriceCents / 12) : plan.monthlyPriceCents;
}

export function totalPrice(plan: PricingPlan, cycle: BillingCycle, seats: number): number {
  return cyclePrice(plan, cycle) * normalizeSeats(plan, seats);
}

export function planUrl(selection: PlanSelection): string {
  const params = new URLSearchParams({
    plan: selection.planCode, cycle: selection.cycle, seats: String(selection.seats),
  });
  return `/planos?${params}`;
}

export function readPlanSelection(search: string, plans: readonly PricingPlan[]): PlanSelection | null {
  const params = new URLSearchParams(search);
  const plan = plans.find((item) => item.code === params.get("plan"));
  if (!plan) return null;
  return {
    planCode: plan.code,
    cycle: params.get("cycle") === "year" ? "year" : "month",
    seats: normalizeSeats(plan, Number(params.get("seats") ?? plan.seatMin)),
  };
}
