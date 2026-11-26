import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface PricingDialogProps {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

export default function PricingDialog({ title, description, children, onClose }: PricingDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-zinc-900 p-0 text-white shadow-2xl backdrop:bg-black/75"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="pt-1 text-2xl font-semibold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar resumo" className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-400"><X size={20} /></button>
        </div>
        {description && <p id={descriptionId} className="mt-4 text-sm leading-6 text-zinc-400">{description}</p>}
        {children}
      </div>
    </dialog>
  );
}
