import { useCallback, useState } from "react";
import {
  enviarArquivo, listarArquivos, mensagemDeErro, moverArquivo, moverParaLixeira,
  renomearArquivo, type ArquivoApi,
} from "../services/files";
import {
  criarPasta, excluirPasta, listarPastas, moverPasta, renomearPasta, type PastaApi,
} from "../services/folders";

import { useAsyncData } from "./useAsyncData";

export const POR_PAGINA = 20;

export function useArquivos(folderId: number | null) {
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState<{ folderId: number | null; message: string | null } | null>(null);
  const setErro = (message: string | null) => setErroAcao({ folderId, message });

  // a página volta para 1 sozinha quando troca de pasta
  const [estadoPagina, setEstadoPagina] = useState({ folderId, pagina: 1 });
  const pagina = estadoPagina.folderId === folderId ? estadoPagina.pagina : 1;
  const setPagina = (p: number) => setEstadoPagina({ folderId, pagina: p });

  const carregar = useCallback(async () => {
    const [lista, pastas] = await Promise.all([
      listarArquivos(folderId, pagina, POR_PAGINA), listarPastas(folderId),
    ]);
    return { lista, pastas };
  }, [folderId, pagina]);
  const { value: dados, error, loading: carregando, reload: recarregar } = useAsyncData(carregar, null);
  const arquivos: ArquivoApi[] = dados?.lista.files ?? [];
  const pastas: PastaApi[] = dados?.pastas ?? [];
  const total = dados?.lista.total ?? 0;
  const erro = (erroAcao?.folderId === folderId ? erroAcao.message : null) ?? (error ? mensagemDeErro(error) : null);
  if (!carregando && dados && arquivos.length === 0 && pagina > 1) {
    setEstadoPagina({ folderId, pagina: pagina - 1 });
  }

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
    arquivos, pastas, total, pagina, setPagina,
    totalPaginas: Math.max(1, Math.ceil(total / POR_PAGINA)),
    carregando, enviando, erro,
    recarregar, enviar,
    novaPasta: (nome: string) => executar(() => criarPasta(nome, folderId)),
    renomear: (id: number, nome: string) => executar(() => renomearArquivo(id, nome)),
    mover: (id: number, destino: number | null) => executar(() => moverArquivo(id, destino)),
    lixeira: (id: number) => executar(() => moverParaLixeira(id)),
    renomearPasta: (id: number, nome: string) => executar(() => renomearPasta(id, nome)),
    moverPasta: (id: number, destino: number | null) => executar(() => moverPasta(id, destino)),
    apagarPasta: (id: number) => executar(() => excluirPasta(id)),
  };
}