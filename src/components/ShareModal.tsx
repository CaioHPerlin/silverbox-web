import { useCallback, useEffect, useState } from "react";
import {
  criarLinkCompartilhamento,
  EXPIRACAO_SHARE,
  listarLinksCompartilhados,
  mensagemErroShare,
  revogarLinkCompartilhado,
  type ShareApi,
  type PermissaoShare,
  type StatusLink,
} from "../services/shares";

interface Props {
  file: { id: string; name: string } | null; // null = fechado
  onClose: () => void;
}

const PRAZOS = [
  { label: "1 hora", valor: EXPIRACAO_SHARE.UMA_HORA },
  { label: "1 dia", valor: EXPIRACAO_SHARE.UM_DIA },
  { label: "7 dias", valor: EXPIRACAO_SHARE.SETE_DIAS },
];

const estiloStatus = {
  ativo: "text-emerald-400",
  expirado: "text-amber-400",
  revogado: "text-red-400",
} as const;

function dataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusDoLinkArquivo(link: ShareApi): StatusLink {
  if (link.revokedAt) return "revogado";

  if (new Date(link.expiresAt).getTime() <= Date.now()) {
    return "expirado";
  }

  return "ativo";
}

const EXTENSOES_VISUALIZACAO = [
  "txt",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
];

function permiteVisualizacao(nome: string) {
  const extensao = nome.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSOES_VISUALIZACAO.includes(extensao);
}

export function ShareModal({ file, onClose }: Props) {
  if (!file) return null;
  return <ShareModalContent key={file.id} file={file} onClose={onClose} />;
}

function ShareModalContent({
  file,
  onClose,
}: Props & { file: NonNullable<Props["file"]> }) {
  const fileId = Number(file.id);

  const suportaVisualizacao = permiteVisualizacao(file.name);

  const [prazo, setPrazo] = useState<number>(EXPIRACAO_SHARE.UM_DIA);
  const [permissao, setPermissao] = useState<PermissaoShare>(
    suportaVisualizacao ? "view" : "download",
  );
  const [gerado, setGerado] = useState<{
    url: string;
    expiresAt: string;
    permission: PermissaoShare;
  } | null>(null);
  const [links, setLinks] = useState<ShareApi[]>([]);
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarLinks = useCallback(async () => {
    if (fileId === null) return;
    try {
      setLinks(await listarLinksCompartilhados(fileId));
    } catch (e) {
      setErro(mensagemErroShare(e));
    }
  }, [fileId]);

  // O conteúdo é remontado para cada arquivo; só a consulta precisa de um efeito.
  useEffect(() => {
    let ativo = true;
    void Promise.resolve().then(() => {
      if (ativo) return carregarLinks();
    });
    return () => {
      ativo = false;
    };
  }, [carregarLinks]);

  async function gerar() {
    if (fileId === null) return;
    setGerando(true);
    setErro(null);
    setCopiado(false);
    try {
      const r = await criarLinkCompartilhamento(fileId, prazo, permissao);
      setGerado({
        url: r.url,
        expiresAt: r.expiresAt,
        permission: r.permission,
      });
      await carregarLinks();
    } catch (e) {
      setErro(mensagemErroShare(e));
    } finally {
      setGerando(false);
    }
  }

  async function copiar() {
    if (!gerado) return;
    try {
      await navigator.clipboard.writeText(gerado.url);
      setCopiado(true);
    } catch {
      setErro("Não foi possível copiar. Selecione o link e copie manualmente.");
    }
  }

  async function revogar(shareId: number) {
    if (fileId === null) return;
    if (!window.confirm("Revogar este link? Quem tem o link perde o acesso."))
      return;
    try {
      await revogarLinkCompartilhado(fileId, shareId);
      setGerado(null); // o link recém-criado pode ter sido o revogado
      await carregarLinks();
    } catch (e) {
      setErro(mensagemErroShare(e));
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-white/10 bg-[#161616] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Compartilhar</h2>
            <p className="truncate text-sm text-gray-500">{file.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-gray-500 hover:text-white"
          >
            ✕
          </button>
        </div>

        {erro && (
          <div
            role="alert"
            className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            {erro}
          </div>
        )}

        <p className="mb-3 text-sm text-gray-400">
          Crie um link temporário e escolha se a pessoa poderá visualizar ou
          baixar o arquivo.
        </p>

        <div className="flex flex-wrap gap-2">
          <select
            value={prazo}
            onChange={(e) => setPrazo(Number(e.target.value))}
            aria-label="Validade do link"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {PRAZOS.map((p) => (
              <option key={p.valor} value={p.valor}>
                Válido por {p.label}
              </option>
            ))}
          </select>

          <select
            value={permissao}
            onChange={(e) => setPermissao(e.target.value as PermissaoShare)}
            aria-label="Permissão do link"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            <option value="view" disabled={!suportaVisualizacao}>
              {suportaVisualizacao
                ? "Visualização"
                : "Visualização indisponível para este arquivo"}
            </option>
            <option value="download">Download</option>
          </select>

          <button
            type="button"
            onClick={gerar}
            disabled={gerando}
            className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {gerando ? "Gerando..." : "Gerar link"}
          </button>
        </div>

        {gerado && (
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-xs text-gray-400">
              Copie agora: o link só aparece desta vez. Expira em{" "}
              {dataHora(gerado.expiresAt)}.
            </p>
            <p className="mb-2 text-xs text-gray-400">
              Permissão:{" "}
              {gerado.permission === "view" ? "Visualização" : "Download"}
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={gerado.url}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="Link de compartilhamento"
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={copiar}
                className="shrink-0 rounded-md border border-white/15 px-3 py-1.5 text-xs hover:bg-white/10"
              >
                {copiado ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-5">
          <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
            Links deste arquivo
          </p>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10">
            {links.length === 0 ? (
              <p className="px-3 py-5 text-center text-sm text-gray-500">
                Nenhum link criado.
              </p>
            ) : (
              links.map((l) => {
                const status = statusDoLinkArquivo(l);
                return (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-sm last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium ${estiloStatus[status]}`}
                      >
                        {status === "ativo"
                          ? "Ativo"
                          : status === "expirado"
                            ? "Expirado"
                            : "Revogado"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Criado {dataHora(l.createdAt)} · expira{" "}
                        {dataHora(l.expiresAt)}
                      </p>
                    </div>
                    {status === "ativo" && (
                      <button
                        type="button"
                        onClick={() => revogar(l.id)}
                        className="shrink-0 text-xs text-red-300 hover:text-red-200"
                      >
                        Revogar
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
