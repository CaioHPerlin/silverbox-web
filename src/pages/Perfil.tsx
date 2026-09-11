import Sidebar from "../components/Sidebar";

// ---- Dados de exemplo (substituir pela chamada à API) ----
const user = {
  name: "Rafael Borges",
  email: "rafael.borges@ifms.br",
  memberSince: "03/09/2026",
  role: "comum",
  usedGb: 3.2,
  totalGb: 5,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Perfil() {
  const usedPercent = Math.round((user.usedGb / user.totalGb) * 100);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      <Sidebar usedGb={user.usedGb} totalGb={user.totalGb} />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Perfil do usuário</h1>

        <div className="max-w-5xl">
          {/* Cabeçalho: avatar + nome + trocar foto */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-semibold text-2xl">
                {getInitials(user.name)}
              </div>
              <div>
                <p className="font-semibold text-xl">{user.name}</p>
                <p className="text-sm text-gray-500">
                  {user.email} · membro desde {user.memberSince}
                </p>
              </div>
            </div>

            <button className="flex items-center gap-2 border border-white/15 hover:bg-white/5 transition-colors px-5 py-2.5 rounded-lg text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h1.586a1 1 0 00.707-.293l1.414-1.414A1 1 0 019.414 5h5.172a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
              Trocar foto
            </button>
          </div>

          {/* Dados da conta */}
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">Dados da conta</p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="border border-white/10 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 mb-1">Nome</p>
              <div className="flex items-center justify-between">
                <span className="text-base">{user.name}</span>
                <button className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="border border-white/10 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 mb-1">E-mail</p>
              <span className="text-base">{user.email}</span>
            </div>

            <div className="border border-white/10 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 mb-1">Senha</p>
              <button className="text-base text-blue-400 hover:text-blue-300 transition-colors">
                Alterar senha
              </button>
            </div>

            <div className="border border-white/10 rounded-xl px-5 py-4">
              <p className="text-xs text-gray-500 mb-1">Papel</p>
              <span className="text-sm bg-white/10 px-2.5 py-1 rounded-md inline-block">{user.role}</span>
            </div>
          </div>

          {/* Meu uso */}
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">Meu uso</p>

          <div className="border border-white/10 rounded-xl px-6 py-5">
            <div className="flex items-center justify-between mb-3 text-base">
              <span className="text-gray-300">
                {user.usedGb.toFixed(1).replace(".", ",")} gb de {user.totalGb} gb usados
              </span>
              <span className="font-semibold text-lg">{usedPercent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}