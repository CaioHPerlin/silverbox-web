import { useEffect, useState } from "react";
import { buscar, type EscopoBusca, type ItemBusca } from "../services/search";
import { foiCancelado, mensagemDeErro } from "../services/files";

export const POR_PAGINA_BUSCA = 20;

export function useBusca(termo: string, escopo: EscopoBusca, folderId: number | null) {
  const [q, setQ] = useState("");
  const [itens, setItens] = useState<ItemBusca[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // a página volta para 1 quando termo, escopo ou pasta mudam
  const chave = `${q}|${escopo}|${folderId}`;
  const [estadoPagina, setEstadoPagina] = useState({ chave, pagina: 1 });
  const pagina = estadoPagina.chave === chave ? estadoPagina.pagina : 1;
  const setPagina = (p: number) => setEstadoPagina({ chave, pagina: p });

  // debounce de 300 ms
  useEffect(() => {
    const t = setTimeout(() => setQ(termo.trim()), 300);
    return () => clearTimeout(t);
  }, [termo]);

  useEffect(() => {
    if (!q) {
      setItens([]);
      setTotal(0);
      setErro(null);
      setCarregando(false);
      return;
    }
    const ac = new AbortController();
    setCarregando(true);
    buscar(q, escopo, folderId, pagina, POR_PAGINA_BUSCA, ac.signal)
      .then((r) => {
        if (ac.signal.aborted) return; // resposta obsoleta
        setItens(r.items);
        setTotal(r.total);
        setErro(null);
        setCarregando(false);
      })
      .catch((e) => {
        if (foiCancelado(e)) return; // sem banner falso
        setErro(mensagemDeErro(e));
        setCarregando(false);
      });
    return () => ac.abort(); // trocar o termo cancela a busca anterior
  }, [q, escopo, folderId, pagina]);

  return {
    q,
    ativa: q.length > 0,
    itens,
    total,
    pagina,
    setPagina,
    totalPaginas: Math.max(1, Math.ceil(total / POR_PAGINA_BUSCA)),
    carregando,
    erro,
  };
}