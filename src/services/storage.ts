import { api } from "./apiClient";

export type Cota = {
  usedBytes: number;
  limitBytes: number;
  availableBytes: number;
};

// a API devolve os números como texto, então convertemos com Number()
export async function consultarCota(): Promise<Cota> {
  const r = await api.get<{
    usedBytes: string;
    reservedBytes: string;
    limitBytes: string;
    availableBytes: string;
  }>("/storage/usage");

  return {
    usedBytes: Number(r.usedBytes),
    limitBytes: Number(r.limitBytes),
    availableBytes: Number(r.availableBytes),
  };
}