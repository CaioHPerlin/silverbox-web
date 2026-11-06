import { useCallback, useEffect, useState } from "react";
import { mensagemDeErro, type ArquivoApi } from "../services/files";
import { excluirDefinitivamente, listarLixeira, restaurarArquivo } from "../services/trash";

export function useLixeira() {
  const [arquivos, setArquivos] = useState<ArquivoApi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      setArquivos(await listarLixeira());
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { recarregar(); }, [recarregar]);

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