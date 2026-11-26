import { useEffect, useState } from "react";
import { buscar, type EscopoBusca, type ItemBusca } from "../services/search";
import { foiCancelado, mensagemDeErro } from "../services/files";

export const POR_PAGINA_BUSCA = 20;

type Resultado = {
  chave: string; // requisição que gerou este resultado
  itens: ItemBusca[];
  total: number;
  erro: string | null;
};

export function useBusca(
  termo: string,
  escopo: EscopoBusca,
  folderId: number | null,
) {
  const termoAtual = termo.trim();

  const [q, setQ] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const chaveBusca = JSON.stringify([q, escopo, folderId]);

  // a página volta para 1 quando termo, escopo ou pasta mudam
  const [estadoPagina, setEstadoPagina] = useState({
    chave: chaveBusca,
    pagina: 1,
  });
  const pagina = estadoPagina.chave === chaveBusca ? estadoPagina.pagina : 1;
  const setPagina = (p: number) =>
    setEstadoPagina({ chave: chaveBusca, pagina: p });

  const chaveRequisicao = JSON.stringify([chaveBusca, pagina]);

  // debounce de 300 ms (setState dentro do callback do timer é permitido)
  useEffect(() => {
    const t = setTimeout(() => setQ(termoAtual), termoAtual ? 300 : 0);
    return () => clearTimeout(t);
  }, [termoAtual]);

  // Busca paginada no servidor.
  useEffect(() => {
    if (!q) return;

    const ac = new AbortController();
    buscar(q, escopo, folderId, pagina, POR_PAGINA_BUSCA, ac.signal)
      .then((r) => {
        if (ac.signal.aborted) return; // resposta obsoleta
        setResultado({
          chave: chaveRequisicao,
          itens: r.items,
          total: r.total,
          erro: null,
        });
      })
      .catch((e) => {
        if (foiCancelado(e) || ac.signal.aborted) return;
        setResultado({
          chave: chaveRequisicao,
          itens: [],
          total: 0,
          erro: mensagemDeErro(e),
        });
      });

    return () => ac.abort(); // trocar termo, escopo ou página cancela a anterior
  }, [q, escopo, folderId, pagina, chaveRequisicao]);

  // só há busca ativa se o campo tem texto e o debounce já aplicou o termo
  const ativa = termo.length > 0;

  // Impede que resultados de termos anteriores sejam exibidos.
  const atual =
    ativa && q === termoAtual && resultado?.chave === chaveRequisicao
      ? resultado
      : null;

  return {
    q,
    ativa,
    itens: atual?.itens ?? [],
    total: atual?.total ?? 0,
    erro: atual?.erro ?? null,
    carregando: ativa && atual === null,
    pagina,
    setPagina,
    totalPaginas: Math.max(
      1,
      Math.ceil((atual?.total ?? 0) / POR_PAGINA_BUSCA),
    ),
  };
}
