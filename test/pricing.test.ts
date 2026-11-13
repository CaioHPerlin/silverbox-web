import assert from "node:assert/strict";
import { test } from "node:test";
import { PLANS } from "../src/data/plans.ts";
import { authUrl, safeReturnTo } from "../src/lib/authNavigation.ts";
import { monthlyEquivalent, normalizeSeats, planUrl, readPlanSelection, totalPrice } from "../src/lib/pricing.ts";

test("escolha de equipe e ciclo sobrevivem à navegação de autenticação", () => {
  const selection = { planCode: "team", cycle: "year", seats: 7 } as const;
  const returnTo = planUrl(selection);
  const login = new URL(authUrl("login", returnTo), "https://silverbox.test");
  const cadastro = new URL(authUrl("cadastro", login.searchParams.get("returnTo")!), login.origin);
  const restored = safeReturnTo(cadastro.searchParams.get("returnTo"));
  assert.equal(restored, returnTo);
  assert.deepEqual(readPlanSelection(new URL(restored, login.origin).search, PLANS), selection);
});

test("returnTo aceita rotas internas e rejeita destinos externos e loops", () => {
  assert.equal(safeReturnTo("/arquivos?folder=5#lista"), "/arquivos?folder=5#lista");
  for (const value of [null, "https://example.com", "//example.com", "/\\example.com", "/%2f%2fexample.com", "/login", "/cadastro/", "/foo/../login", "/%6cogin", "/\nexample.com", "/%zz"]) {
    assert.equal(safeReturnTo(value), "/", String(value));
  }
});

test("seleção inválida não cria uma oferta e quantidades respeitam os limites", () => {
  assert.equal(readPlanSelection("?plan=inexistente", PLANS), null);
  const team = PLANS.find((plan) => plan.code === "team")!;
  assert.equal(normalizeSeats(team, 1), 3);
  assert.equal(normalizeSeats(team, 2.5), 3);
  assert.equal(normalizeSeats(team, Infinity), 3);
  assert.equal(normalizeSeats(team, 999), 100);
  assert.deepEqual(readPlanSelection("?plan=team&cycle=invalid&seats=-5", PLANS), { planCode: "team", cycle: "month", seats: 3 });
  assert.deepEqual(readPlanSelection("?plan=pro&cycle=year&seats=10", PLANS), { planCode: "pro", cycle: "year", seats: 1 });
});

test("total anual usa a cobrança integral, sem multiplicar o equivalente mensal arredondado", () => {
  const team = PLANS.find((plan) => plan.code === "team")!;
  assert.equal(monthlyEquivalent(team, "year"), 4158);
  assert.equal(totalPrice(team, "year", 3), 149700);
  assert.equal(totalPrice(team, "month", 3), 14970);
});

test("catálogo disponível corresponde à cota padrão e não habilita cobrança futura", () => {
  assert.deepEqual(PLANS.filter((plan) => plan.status === "available").map((plan) => plan.code), ["free"]);
  assert.equal(PLANS[0].storageBytes, 1073741824);
  assert.equal(PLANS[0].maxFileBytes, 1073741824);
  assert.equal(PLANS[0].monthlyPriceCents, 0);
});
