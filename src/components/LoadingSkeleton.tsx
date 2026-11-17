import { LoaderCircle } from "lucide-react";

type Props = {
  mensagem?: string;
};

export default function LoadingSkeleton({ mensagem = "" }: Props) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className="flex min-h-[280px] flex-col items-center justify-center gap-4"
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-pulse" />

        <img
          src="/minha-nuvem-logo.png"
          alt="Logo Minha Nuvem"
          className="h-24 w-24 object-contain animate-pulse"
        />
        <LoaderCircle
          className="absolute -right-1 -top-1 h-6 w-6 animate-spin text-[#5C93E6]"
          strokeWidth={2}
        />
      </div>

      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-white">{mensagem}</p>

        <p className="text-xs text-gray-500">Aguarde um instante...</p>
      </div>

      <span className="sr-only">Carregando...</span>
    </div>
  );
}
