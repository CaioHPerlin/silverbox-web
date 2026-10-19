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
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <Sidebar usedGb={user.usedGb} totalGb={user.totalGb} />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="mb-6 text-xl font-semibold sm:text-2xl">
          Perfil do usuário
        </h1>

        <div className="max-w-5xl">
          {/* Cabeçalho */}
          <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xl font-semibold text-blue-400 sm:h-20 sm:w-20 sm:text-2xl">
                {getInitials(user.name)}
              </div>

              <div className="min-w-0">
                <p className="text-lg font-semibold sm:text-xl">{user.name}</p>
                <p className="break-words text-sm text-gray-500">
                  {user.email} · membro desde {user.memberSince}
                </p>
              </div>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm transition-colors hover:bg-white/5 sm:w-auto sm:py-2.5">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h1.586a1 1 0 00.707-.293l1.414-1.414A1 1 0 019.414 5h5.172a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 17a4 4 0 100-8 4 4 0 000 8z"
                />
              </svg>
              Trocar foto
            </button>
          </div>

          {/* Dados da conta */}
          <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">
            Dados da conta
          </p>

          <div className="mb-8 grid grid-cols-1 gap-3 sm:mb-10 sm:grid-cols-2 sm:gap-4">
            <div className="min-w-0 rounded-xl border border-white/10 px-4 py-4 sm:px-5">
              <p className="mb-1 text-xs text-gray-500">Nome</p>
              <div className="flex items-center justify-between gap-3">
                <span className="break-words text-base">{user.name}</span>
                <button
                  aria-label="Editar nome"
                  className="shrink-0 text-gray-500 transition-colors hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="min-w-0 rounded-xl border border-white/10 px-4 py-4 sm:px-5">
              <p className="mb-1 text-xs text-gray-500">E-mail</p>
              <span className="break-all text-base">{user.email}</span>
            </div>

            <div className="rounded-xl border border-white/10 px-4 py-4 sm:px-5">
              <p className="mb-1 text-xs text-gray-500">Senha</p>
              <button className="text-base text-blue-400 transition-colors hover:text-blue-300">
                Alterar senha
              </button>
            </div>

            <div className="rounded-xl border border-white/10 px-4 py-4 sm:px-5">
              <p className="mb-1 text-xs text-gray-500">Papel</p>
              <span className="inline-block rounded-md bg-white/10 px-2.5 py-1 text-sm">
                {user.role}
              </span>
            </div>
          </div>

          {/* Meu uso */}
          <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">
            Meu uso
          </p>

          <div className="rounded-xl border border-white/10 px-4 py-5 sm:px-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-gray-300 sm:text-base">
                {user.usedGb.toFixed(1).replace(".", ",")} GB de {user.totalGb}{" "}
                GB usados
              </span>
              <span className="text-lg font-semibold">{usedPercent}%</span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
