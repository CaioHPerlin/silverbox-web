import { useRef, useState } from "react";
import {
  MoreHorizontal,
  Share2,
  Pencil,
  Download,
  FolderInput,
  Trash2,
} from "lucide-react";
import { useClickOutside } from "../hooks/useClickOutside";

interface FileActionsMenuProps {
  onShare: () => void;
  onRename: () => void;
  onDownload: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export function FileActionsMenu({
  onShare,
  onRename,
  onDownload,
  onMove,
  onDelete,
}: FileActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  // executa a ação e fecha o menu em seguida — evita repetir isso em cada item
  function runAndClose(action: () => void) {
    action();
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-lg"
        >
          <MenuItem
            icon={Share2}
            label="Compartilhar"
            onClick={() => runAndClose(onShare)}
          />
          <MenuItem
            icon={Pencil}
            label="Renomear"
            onClick={() => runAndClose(onRename)}
          />
          <MenuItem
            icon={Download}
            label="Baixar"
            onClick={() => runAndClose(onDownload)}
          />
          <MenuItem
            icon={FolderInput}
            label="Mover"
            onClick={() => runAndClose(onMove)}
          />

          <div className="my-1 h-px bg-zinc-800" />

          <MenuItem
            icon={Trash2}
            label="Excluir"
            onClick={() => runAndClose(onDelete)}
            danger
          />
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon: Icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
        danger
          ? "text-red-400 hover:bg-red-950/40"
          : "text-zinc-200 hover:bg-zinc-800"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
