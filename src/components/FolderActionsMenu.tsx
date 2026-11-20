import { useRef, useState, type ComponentType } from "react";
import { MoreHorizontal, Pencil, FolderInput, Trash2 } from "lucide-react";
import { useClickOutside } from "../hooks/useClickOutside";

interface FolderActionsMenuProps {
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export function FolderActionsMenu({
  onRename,
  onMove,
  onDelete,
}: FolderActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  function runAndClose(action: () => void) {
    action();
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => {
          if (!isOpen) {
            const rect = containerRef.current?.getBoundingClientRect();
            const spaceBelow = window.innerHeight - (rect?.bottom ?? 0);
            setOpenUpward(spaceBelow < 220);
          }

          setIsOpen((open) => !open);
        }}
        aria-label="Ações da pasta"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`absolute right-0 z-50 w-44 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-lg ${
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <FolderMenuItem
            icon={Pencil}
            label="Renomear"
            onClick={() => runAndClose(onRename)}
          />

          <FolderMenuItem
            icon={FolderInput}
            label="Mover"
            onClick={() => runAndClose(onMove)}
          />

          <div className="my-1 h-px bg-zinc-800" />

          <FolderMenuItem
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

interface FolderMenuItemProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function FolderMenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: FolderMenuItemProps) {
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
