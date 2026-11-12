import { useCallback, useState } from "react";
import { listarPastas, type PastaApi } from "../services/folders";

import { useAsyncData } from "../hooks/useAsyncData";

interface Props {
  aberto: boolean;
  titulo: string;
  excluirId?: number; // ao mover uma pasta, esconde ela mesma da lista
  onClose: () => void;
  onConfirm: (destino: number | null) => void;
}

export function FolderPickerModal(props: Props) {
  if (!props.aberto) return null;
  return <FolderPickerContent {...props} />;
}

function FolderPickerContent({ titulo, excluirId, onClose, onConfirm }: Props) {
  const [caminho, setCaminho] = useState<{ id: number; name: string }[]>([]);
  const atual = caminho.length > 0 ? caminho[caminho.length - 1].id : null;
  const carregar = useCallback(() => listarPastas(atual), [atual]);
  const { value: pastas, loading: carregando } = useAsyncData<PastaApi[]>(carregar, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-white/10 bg-[#161616] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-lg font-semibold">{titulo}</h2>

        <div className="mb-3 flex flex-wrap items-center gap-1 text-sm text-gray-400">
          <button type="button" onClick={() => setCaminho([])} className="hover:text-white">
            Meus arquivos
          </button>
          {caminho.map((p, i) => (
            <span key={p.id} className="flex items-center gap-1">
              /
              <button
                type="button"
                onClick={() => setCaminho(caminho.slice(0, i + 1))}
                className="hover:text-white"
              >
                {p.name}
              </button>
            </span>
          ))}
        </div>

        <div className="mb-4 max-h-60 overflow-y-auto rounded-lg border border-white/10">
          {carregando ? (
            <p className="px-3 py-6 text-center text-sm text-gray-500">Carregando...</p>
          ) : pastas.filter((p) => p.id !== excluirId).length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-gray-500">Nenhuma subpasta aqui.</p>
          ) : (
            pastas
              .filter((p) => p.id !== excluirId)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCaminho([...caminho, { id: p.id, name: p.name }])}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-white/5"
                >
                  <span className="truncate">{p.name}</span>
                  <span className="text-gray-500">›</span>
                </button>
              ))
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(atual); onClose(); }}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium hover:bg-blue-600"
          >
            Mover para cá
          </button>
        </div>
      </div>
    </div>
  );
}