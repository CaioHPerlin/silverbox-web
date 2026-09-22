import { useEffect, useState } from "react";
import { Folder } from "lucide-react";
import { Modal } from "./Modal";

interface MoveModalProps {
  file: { id: string; name: string } | null;
  onClose: () => void;
  onMoved?: (fileId: string, folderId: string) => void;
}

interface FolderOption {
  id: string;
  name: string;
}

// TODO: substituir por chamada real à API — algo como:
// const { data: folders } = await apiClient.get<FolderOption[]>("/folders");
const mockFolders: FolderOption[] = [
  { id: "1", name: "Contratos" },
  { id: "2", name: "Backups" },
  { id: "3", name: "Relatórios" },
  { id: "4", name: "Relatórios 2026" },
];

export function MoveModal({ file, onClose, onMoved }: MoveModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // sempre que abrir o modal para um arquivo novo, limpa a seleção anterior
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- limpando a seleção ao trocar de arquivo, é o comportamento esperado
    if (file) setSelectedFolderId(null);
  }, [file]);

  async function handleMove() {
    if (!file || !selectedFolderId) return;
    setIsSaving(true);

    // TODO: substituir por chamada real à API — algo como:
    // await apiClient.put(`/files/${file.id}`, { folderId: selectedFolderId });
    console.log("movido (placeholder):", file.id, "->", selectedFolderId);

    setIsSaving(false);
    onMoved?.(file.id, selectedFolderId);
    onClose();
  }

  const isOpen = file !== null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[340px] rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
        <h2 className="mb-4 text-base font-semibold text-white">
          Mover para...
        </h2>

        <div className="mb-5 flex flex-col gap-1">
          {mockFolders.map((folder) => {
            const isSelected = folder.id === selectedFolderId;
            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => setSelectedFolderId(folder.id)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <Folder className="h-4 w-4 text-zinc-400" />
                {folder.name}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleMove}
            disabled={!selectedFolderId || isSaving}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Movendo..." : "Mover aqui"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
