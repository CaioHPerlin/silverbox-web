import { useEffect } from "react";
import { EVENTO_COTA } from "../lib/cotaEvents";
import { consultarCota, type Cota } from "../services/storage";
import { useAsyncData } from "./useAsyncData";

export function useCota() {
  const { value, error, reload: atualizar } = useAsyncData<Cota | null>(consultarCota, null);
  useEffect(() => {
    window.addEventListener(EVENTO_COTA, atualizar);
    return () => window.removeEventListener(EVENTO_COTA, atualizar);
  }, [atualizar]);
  return { cota: error ? null : value, atualizar };
}
