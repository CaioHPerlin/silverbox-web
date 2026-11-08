import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { authClient, useSession } from "../lib/authClient";

// ---- Uso de armazenamento: continua mock até existir endpoint na API ----
const storage = { usedGb: 3.2, totalGb: 5 };

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Perfil() {
  const { data: session, isPending, error } = useSession();

  //Estados para a edição de nome
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState("");

  //useState para editar senha

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] text-gray-400">
        Carregando...
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] text-gray-400">
        Não foi possível carregar seus dados.
      </div>
    );
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    memberSince: new Date(session.user.createdAt).toLocaleDateString("pt-BR"),
    role: (session.user as { role?: string }).role ?? "comum",
    usedGb: storage.usedGb,
    totalGb: storage.totalGb,
  };

  async function handleUpdateName() {
    const name = newName.trim();

    if (!name) {
      setNameMessage("O nome não pode ficar vazio.");
      return;
    }

    setSavingName(true);
    setNameMessage("");

    try {
      const { error } = await authClient.updateUser({ name });

      if (error) {
        setNameMessage(error.message || "Não foi possível atualizar o nome.");
        return;
      }

      setEditingName(false);
      setNameMessage("Nome atualizado com sucesso!");
    } catch {
      setNameMessage("Erro ao atualizar o nome.");
    } finally {
      setSavingName(false);
    }
  }

  const usedPercent = Math.round((user.usedGb / user.totalGb) * 100);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <Sidebar />

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
                <p className="wrape-break-words text-sm text-gray-500">
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

              {editingName ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    placeholder="Digite seu novo nome"
                  />

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleUpdateName}
                      disabled={savingName}
                      className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium transition-colors hover:bg-blue-600 disabled:opacity-50"
                    >
                      {savingName ? "Salvando..." : "Salvar"}
                    </button>

                    <button
                      onClick={() => {
                        setEditingName(false);
                        setNameMessage("");
                      }}
                      className="rounded-lg border border-white/15 px-3 py-2 text-xs transition-colors hover:bg-white/5"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="wrap-break-words text-base">
                    {user.name}
                  </span>

                  <button
                    aria-label="Editar nome"
                    onClick={() => {
                      setNewName(user.name);
                      setEditingName(true);
                      setNameMessage("");
                    }}
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
              )}

              {nameMessage && (
                <p className="mt-2 text-xs text-gray-400">{nameMessage}</p>
              )}
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
