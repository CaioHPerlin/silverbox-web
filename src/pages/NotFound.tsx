import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 001-9.9A6 6 0 006 9.1 4 4 0 003 15z" />
        </svg>
        <span className="text-lg font-semibold">Minha Nuvem</span>
      </div>

      <p className="text-6xl font-bold text-white/10">404</p>
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <p className="text-sm text-gray-500 max-w-sm">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>

      <Link
        to="/"
        className="mt-4 bg-blue-500 hover:bg-blue-600 transition-colors px-5 py-2.5 rounded-lg text-sm font-medium"
      >
        Voltar para o início
      </Link>
    </div>
  );
}