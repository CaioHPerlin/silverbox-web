import { useState } from "react";
import { mensagemDeErro, type ArquivoApi } from "../services/files";
import { excluirDefinitivamente, listarLixeira, restaurarArquivo } from "../services/trash";

import { useAsyncData } from "./useAsyncData";

export function useLixeira() {
  const { value: arquivos, loading: carregando, error, reload: recarregar } = useAsyncData<ArquivoApi[]>(listarLixeira, []);
  const [erroAcao, setErro] = useState<string | null>(null);
  const erro = erroAcao ?? (error ? mensagemDeErro(error) : null);

  async function executar(acao: () => Promise<unknown>) {
    try {
      setErro(null);
      await acao();
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      await recarregar();
    }
  }

  return {
    arquivos, carregando, erro,
    restaurar: (id: number) => executar(() => restaurarArquivo(id)),
    excluir: (id: number) => executar(() => excluirDefinitivamente(id)),
    esvaziar: () =>
      executar(async () => {
        // um por vez, para não estourar o limite de requisições
        for (const a of arquivos) await excluirDefinitivamente(a.id);
      }),
  };
}