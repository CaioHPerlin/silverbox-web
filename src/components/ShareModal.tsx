import { useEffect, useState } from "react";
import { FileText, Copy, Check } from "lucide-react";
import { Modal } from "./Modal";

interface ShareModalProps {
  file: { id: string; name: string } | null;
  onClose: () => void;
}

type ExpirationOption = "1h" | "24h" | "7d" | "30d";

const EXPIRATION_LABELS: Record<ExpirationOption, string> = {
  "1h": "1 hora",
  "24h": "24 horas",
  "7d": "7 dias",
  "30d": "30 dias",
};

export function ShareModal({ file, onClose }: ShareModalProps) {
  const [link, setLink] = useState("");
  const [expiration, setExpiration] = useState<ExpirationOption>("24h");
  const [copied, setCopied] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);

  // gera (ou regenera) o link sempre que o modal abre para um novo arquivo,
  // ou quando o prazo de expiração muda
  useEffect(() => {
    if (!file) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetando o estado do modal ao trocar de arquivo/prazo, é o comportamento esperado
    setRevoked(false);
    setCopied(false);
    setCreatedAt(new Date());

    // TODO: substituir por chamada real à API — algo como:
    // const { url } = await apiClient.post(`/files/${file.id}/share`, { expiresIn: expiration });
    // setLink(url);
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    setLink(`nuvem.io/s/${token}`);
  }, [file, expiration]);

  async function handleCopy() {
    await navigator.clipboard.writeText(`https://${link}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleRevoke() {
    // TODO: substituir por chamada real à API — DELETE /files/{id}/share
    setRevoked(true);
  }

  const isOpen = file !== null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[380px] rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
        <h2 className="mb-3 text-base font-semibold text-white">
          Compartilhar arquivo
        </h2>

        <div className="mb-5 flex items-center gap-2 text-sm text-zinc-300">
          <FileText className="h-4 w-4 text-red-400" />
          {file?.name}
        </div>

        <label className="mb-1.5 block text-sm text-zinc-300">
          Link de acesso temporário
        </label>
        <div className="mb-4 flex gap-2">
          <input
            readOnly
            value={revoked ? "link revogado" : link}
            className="flex-1 rounded-lg border border-zinc-600 bg-transparent px-3 py-2 text-sm text-zinc-100 disabled:opacity-50"
            disabled={revoked}
          />
          <button
            type="button"
            onClick={handleCopy}
            disabled={revoked}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
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

        <label className="mb-1.5 block text-sm text-zinc-300">Expira em</label>
        <select
          value={expiration}
          onChange={(e) => setExpiration(e.target.value as ExpirationOption)}
          disabled={revoked}
          className="mb-5 w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-[#5C93E6] focus:outline-none disabled:opacity-50"
        >
          {Object.entries(EXPIRATION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <span className="text-xs text-zinc-500">
            {revoked
              ? "Link revogado"
              : createdAt &&
                `Link ativo desde ${createdAt.toLocaleDateString("pt-BR")} às ${createdAt.toLocaleTimeString(
                  "pt-BR",
                  { hour: "2-digit", minute: "2-digit" },
                )}`}
          </span>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={revoked}
            className="rounded-lg border border-red-900 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Revogar
          </button>
        </div>
      </div>
    </Modal>
  );
}
