import type { PricingPlan } from "../types/billing";

const GiB = 1024 ** 3;
const TiB = 1024 ** 4;

// Free corresponde ao padrão do silverbox-api ec04a5b.
// Os valores dos planos pagos são a proposta anterior, ainda sem contratação.
// Substituir este catálogo por dados validados da API quando /plans for implementado.
export const PLANS: readonly PricingPlan[] = [
  {
    code: "free", name: "Free", audience: "Para começar",
    description: "Seu primeiro espaço para organizar e compartilhar arquivos.",
    status: "available", monthlyPriceCents: 0, yearlyPriceCents: 0,
    perSeat: false, seatMin: 1, storageBytes: GiB,
    egressBytes: null, maxFileBytes: GiB, versionDays: null, trashDays: null,
    highlights: ["1 GiB de armazenamento", "Arquivos de até 1 GiB", "Compartilhamento por link"],
  },
  {
    code: "pro", name: "Pro", audience: "Para uso pessoal",
    description: "Uma proposta de mais espaço para o seu dia a dia.",
    status: "coming-soon", monthlyPriceCents: 2990, yearlyPriceCents: 29900,
    perSeat: false, seatMin: 1, featured: true, storageBytes: 200 * GiB,
    egressBytes: 500 * GiB, maxFileBytes: 5 * GiB, versionDays: 30, trashDays: 30,
    highlights: ["200 GiB de armazenamento previstos", "500 GiB de downloads por ciclo previstos", "Histórico de versões por 30 dias previsto"],
  },
  {
    code: "team", name: "Team", audience: "Para equipes",
    description: "Uma proposta de colaboração para times em crescimento.",
    status: "coming-soon", monthlyPriceCents: 4990, yearlyPriceCents: 49900,
    perSeat: true, seatMin: 3, storageBytes: 2 * TiB,
    egressBytes: 4 * TiB, maxFileBytes: 5 * GiB, versionDays: 90, trashDays: 90,
    highlights: ["2 TiB compartilhados previstos", "Controles para a equipe previstos", "Histórico de versões por 90 dias previsto"],
  },
  {
    code: "business", name: "Business", audience: "Para empresas",
    description: "Uma proposta de capacidade para operações maiores.",
    status: "coming-soon", monthlyPriceCents: 8990, yearlyPriceCents: 89900,
    perSeat: true, seatMin: 5, storageBytes: 5 * TiB,
    egressBytes: 10 * TiB, maxFileBytes: 5 * GiB, versionDays: 180, trashDays: 180,
    highlights: ["5 TiB compartilhados previstos", "Atendimento prioritário previsto", "Histórico de versões por 180 dias previsto"],
  },
];
