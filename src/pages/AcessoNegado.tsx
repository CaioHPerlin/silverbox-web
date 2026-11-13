import { Link } from "react-router-dom";

export default function AcessoNegado() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0d0d0d] px-4 text-center text-white">
      <h1 className="text-2xl font-semibold">Acesso negado</h1>
      <p className="max-w-md text-sm text-gray-400">
        Sua conta não tem permissão para acessar a área administrativa.
      </p>
      <Link
        to="/arquivos"
        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium hover:bg-blue-600"
      >
        Voltar para meus arquivos
      </Link>
    </div>
  );
}