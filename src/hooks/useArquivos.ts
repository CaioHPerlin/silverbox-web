import { useCallback, useEffect, useState } from "react";
import {
  enviarArquivo, listarArquivos, mensagemDeErro, moverParaLixeira,
  renomearArquivo, type ArquivoApi,
} from "../services/files";
import { criarPasta, excluirPasta, listarPastas, type PastaApi } from "../services/folders";

export function useArquivos(folderId: number | null) {
  const [arquivos, setArquivos] = useState<ArquivoApi[]>([]);
  const [pastas, setPastas] = useState<PastaApi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [lista, subpastas] = await Promise.all([
        listarArquivos(folderId),
        listarPastas(folderId),
      ]);
      setArquivos(lista.files);
      setPastas(subpastas);
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, [folderId]);

  useEffect(() => { recarregar(); }, [recarregar]);

  // executa uma ação, mostra o erro se falhar e atualiza a lista
  async function executar(acao: () => Promise<unknown>) {
    try {
      setErro(null);
      await acao();
      await recarregar();
    } catch (e) {
      setErro(mensagemDeErro(e));
      if ((e as { status?: number }).status === 404) await recarregar();
    }
  }

  async function enviar(files: File[]) {
    setEnviando(true);
    setErro(null);
    try {
      for (const f of files) await enviarArquivo(f, folderId); // um por vez
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setEnviando(false);
      await recarregar();
    }
  }

  return {
    arquivos, pastas, carregando, enviando, erro,
    recarregar,
    enviar,
    novaPasta: (nome: string) => executar(() => criarPasta(nome, folderId)),
    renomear: (id: number, nome: string) => executar(() => renomearArquivo(id, nome)),
    lixeira: (id: number) => executar(() => moverParaLixeira(id)),
    apagarPasta: (id: number) => executar(() => excluirPasta(id)),
  };
}