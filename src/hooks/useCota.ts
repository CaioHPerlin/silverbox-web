import { useCallback, useEffect, useState } from "react";
import { consultarCota, type Cota } from "../services/storage";

export function useCota() {
  const [cota, setCota] = useState<Cota | null>(null);

  const atualizar = useCallback(async () => {
    try {
      setCota(await consultarCota());
    } catch {
      setCota(null); // mantém a tela funcionando se a cota falhar
    }
  }, []);

  useEffect(() => { atualizar(); }, [atualizar]);

  return { cota, atualizar };
}