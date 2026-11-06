import { useCallback, useEffect, useState } from "react";
import {
  enviarArquivo, listarArquivos, mensagemDeErro, moverArquivo, moverParaLixeira,
  renomearArquivo, type ArquivoApi,
} from "../services/files";
import {
  criarPasta, excluirPasta, listarPastas, moverPasta, renomearPasta, type PastaApi,
} from "../services/folders";

export const POR_PAGINA = 20;

export function useArquivos(folderId: number | null) {
  const [arquivos, setArquivos] = useState<ArquivoApi[]>([]);
  const [pastas, setPastas] = useState<PastaApi[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // a página volta para 1 sozinha quando troca de pasta
  const [estadoPagina, setEstadoPagina] = useState({ folderId, pagina: 1 });
  const pagina = estadoPagina.folderId === folderId ? estadoPagina.pagina : 1;
  const setPagina = (p: number) => setEstadoPagina({ folderId, pagina: p });

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [lista, subpastas] = await Promise.all([
        listarArquivos(folderId, pagina, POR_PAGINA),
        listarPastas(folderId),
      ]);
      // apagou o último item da página: volta uma página
      if (lista.files.length === 0 && pagina > 1) {
        setEstadoPagina({ folderId, pagina: pagina - 1 });
        return;
      }
      setArquivos(lista.files);
      setTotal(lista.total);
      setPastas(subpastas);
      setErro(null);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, [folderId, pagina]);

  useEffect(() => { recarregar(); }, [recarregar]);

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