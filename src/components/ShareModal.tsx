import { useEffect, useState } from "react";
import { FileText, Copy, Check } from "lucide-react";
import { Modal } from "./Modal";
import {
  criarLinkCompartilhamento,
  listarLinksCompartilhados,
  revogarLinkCompartilhado,
  mensagemErroShare,
  EXPIRACAO_SHARE,
  type ShareApi,
  type CriarShareResponse,
} from "../services/shares";

interface ShareModalProps {
  file: { id: string; name: string } | null;
  onClose: () => void;
}

type ExpirationOption = "1h" | "24h" | "7d";

const EXPIRATION_LABELS: Record<ExpirationOption, string> = {
  "1h": "1 hora",
  "24h": "24 horas",
  "7d": "7 dias",
};

const EXPIRATION_SECONDS: Record<ExpirationOption, number> = {
  "1h": EXPIRACAO_SHARE.UMA_HORA,
  "24h": EXPIRACAO_SHARE.UM_DIA,
  "7d": EXPIRACAO_SHARE.SETE_DIAS,
};

function getShareStatus(share: ShareApi) {
  if (share.revokedAt) return "Revogado";
  if (new Date(share.expiresAt).getTime() <= Date.now()) return "Expirado";
  return "Ativo";
}

export function ShareModal({ file, onClose }: ShareModalProps) {
  const [expiration, setExpiration] = useState<ExpirationOption>("24h");
  const [shares, setShares] = useState<ShareApi[]>([]);
  const [createdShare, setCreatedShare] = useState<CriarShareResponse | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) return;

    let ativo = true;

    async function carregarLinks() {
      setLoading(true);
      setError("");
      setCreatedShare(null);
      setShares([]);

      try {
        const resultado = await listarLinksCompartilhados(Number(file!.id));
        if (ativo) setShares(resultado);
      } catch (err) {
        if (ativo) setError(mensagemErroShare(err));
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarLinks();

    return () => {
      ativo = false;
    };
  }, [file?.id]);

  //Criar link
  async function handleCreate() {
    if (!file) return;

    setCreating(true);
    setError("");
    setCreatedShare(null);

    try {
      const resultado = await criarLinkCompartilhamento(
        Number(file.id),
        EXPIRATION_SECONDS[expiration],
      );

      setCreatedShare(resultado);

      const atualizados = await listarLinksCompartilhados(Number(file.id));
      setShares(atualizados);
    } catch (err) {
      setError(mensagemErroShare(err));
    } finally {
      setCreating(false);
    }
  }

  //Copiar link
  async function handleCopy() {
    if (!createdShare?.url) return;

    try {
      await navigator.clipboard.writeText(createdShare.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Não foi possível copiar o link.");
    }
  }

  //Revogar link
  async function handleRevoke(shareId: number) {
    if (!file) return;

    setRevokingId(shareId);
    setError("");

    try {
      await revogarLinkCompartilhado(Number(file.id), shareId);

      const atualizados = await listarLinksCompartilhados(Number(file.id));
      setShares(atualizados);

      if (createdShare?.id === shareId) {
        setCreatedShare(null);
      }
    } catch (err) {
      setError(mensagemErroShare(err));
    } finally {
      setRevokingId(null);
    }
  }

  const isOpen = file !== null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[380px] max-w-[90vw] rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
        <h2 className="mb-3 text-base font-semibold text-white">
          Compartilhar arquivo
        </h2>

        <div className="mb-5 flex items-center gap-2 text-sm text-zinc-300">
          <FileText className="h-4 w-4 text-red-400" />
          <span className="truncate">{file?.name}</span>
        </div>

        <label className="mb-1.5 block text-sm text-zinc-300">
          Validade do link
        </label>

        <select
          value={expiration}
          onChange={(e) => setExpiration(e.target.value as ExpirationOption)}
          disabled={creating}
          className="mb-4 w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-[#5C93E6] focus:outline-none"
        >
          {Object.entries(EXPIRATION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleCreate}
          disabled={creating || loading}
          className="mb-4 w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "Gerando link..." : "Gerar link"}
        </button>

        {createdShare && (
          <div className="mb-5 rounded-lg border border-white/10 p-3">
            <p className="mb-2 text-xs text-gray-400">
              Link de acesso temporário:
            </p>

            <div className="flex gap-2">
              <input
                readOnly
                value={createdShare.url}
                className="min-w-0 flex-1 rounded-lg border border-zinc-600 bg-transparent px-3 py-2 text-xs text-zinc-100"
              />

              <button
                type="button"
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-600 px-3 py-2 text-xs text-zinc-100 hover:bg-zinc-800"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar
                  </>
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Expira em:{" "}
              {new Date(createdShare.expiresAt).toLocaleString("pt-BR")}
            </p>
          </div>
        )}

        <div className="border-t border-zinc-800 pt-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-300">
            Links deste arquivo
          </h3>

          {loading && (
            <p className="text-xs text-gray-500">Carregando links...</p>
          )}

          {!loading && shares.length === 0 && (
            <p className="text-xs text-gray-500">
              Nenhum link criado para este arquivo.
            </p>
          )}

          <div className="max-h-48 space-y-3 overflow-y-auto">
            {shares.map((share) => {
              const status = getShareStatus(share);

              return (
                <div
                  key={share.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white/5 p-3"
                >
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-medium ${
                        status === "Ativo"
                          ? "text-emerald-400"
                          : status === "Expirado"
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}
                    >
                      {status}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Expira em:{" "}
                      {new Date(share.expiresAt).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  {status === "Ativo" && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(share.id)}
                      disabled={revokingId === share.id}
                      className="shrink-0 rounded-lg border border-red-900 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-950/40 disabled:opacity-50"
                    >
                      {revokingId === share.id ? "Revogando..." : "Revogar"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
      </div>
    </Modal>
  );
}
