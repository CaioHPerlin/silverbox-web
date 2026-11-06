import { useCallback, useEffect, useState } from "react";
import { EVENTO_COTA } from "../lib/cotaEvents";
import { consultarCota, type Cota } from "../services/storage";

export function useCota() {
  const [cota, setCota] = useState<Cota | null>(null);

  const atualizar = useCallback(async () => {
    try {
      setCota(await consultarCota());
    } catch {
      setCota(null); // a tela continua funcionando se a cota falhar
    }
  }, []);

  useEffect(() => {
    atualizar();
    window.addEventListener(EVENTO_COTA, atualizar);
    return () => window.removeEventListener(EVENTO_COTA, atualizar);
  }, [atualizar]);

  return { cota, atualizar };
}