import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import AdminSidebar from "../../components/Adminsidebar";

// ---- Tipos ----
type Role = "comum" | "admin";
type Status = "ativo" | "bloqueado";

interface User {
  id: string;
  email: string;
  role: Role;
  quotaGb: number;
  nearLimit: boolean; // true quando o usuário está perto de estourar a própria cota
  status: Status;
}

// ---- Dados de exemplo (substituir pela chamada à API com fetch) ----
const mockUsers: User[] = [
  {
    id: "1",
    email: "joao.silva@ifms.edu.br",
    role: "comum",
    quotaGb: 5,
    nearLimit: false,
    status: "ativo",
  },
  {
    id: "2",
    email: "maria.souza@ifms.edu.br",
    role: "comum",
    quotaGb: 2,
    nearLimit: false,
    status: "ativo",
  },
  {
    id: "3",
    email: "renata.barros@ifms.edu.br",
    role: "comum",
    quotaGb: 10,
    nearLimit: true,
    status: "ativo",
  },
  {
    id: "4",
    email: "pedro.henri@ifms.edu.br",
    role: "comum",
    quotaGb: 8,
    nearLimit: false,
    status: "ativo",
  },
  {
    id: "5",
    email: "henrique.mo@ifms.edu.br",
    role: "comum",
    quotaGb: 1,
    nearLimit: false,
    status: "bloqueado",
  },
  {
    id: "6",
    email: "roberto@barbosa.edu.br",
    role: "admin",
    quotaGb: 4,
    nearLimit: false,
    status: "ativo",
  },
];

// ---- Badges ----
function RoleBadge({ role }: { role: Role }) {
  if (role === "admin") {
    return (
      <span className="inline-block w-16 rounded-md bg-blue-500/15 px-2.5 py-2 text-xs font-medium text-blue-300">
        Admin
      </span>
    );
  }
  return <span className="text-sm text-gray-300">Comum</span>;
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "bloqueado") {
    return (
      <span className="inline-block w-20 rounded-md bg-red-500/20 px-2.5 py-3.5 text-xs font-medium text-red-400">
        Bloqueado
      </span>
    );
  }
  return (
    <span className="inline-block w-20 rounded-md bg-emerald-500/20 px-3.5 py-2 text-xs font-medium text-emerald-400">
      Ativo
    </span>
  );
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState<User[]>(mockUsers);

  function handleDelete(id: string) {
    // TODO: quando tiver API, chamar o endpoint de exclusão e depois refazer o fetch
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {/* Cabeçalho */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Usuário</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencia papéis, cotas e o status de cada um na conta
            </p>
          </div>
          <button className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200">
            <UserPlus className="h-4 w-4" />
            Novo Usuário
          </button>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
          {/* ---- Tabela: tablet (md) e desktop ---- */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-[1fr_120px_100px_120px_80px] px-2 py-3 text-xs uppercase tracking-wide text-gray-500 border-b border-white/10">
              <span>Usuário</span>
              <span>Papel</span>
              <span>Cota</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1fr_120px_100px_120px_80px] items-center border-b border-white/5 px-2 py-3 transition-colors last:border-b-0 hover:bg-white/5"
              >
                <span className="truncate text-sm">{user.email}</span>
                <RoleBadge role={user.role} />
                <span
                  className={`text-sm ${user.nearLimit ? "text-red-400" : "text-gray-300"}`}
                >
                  {user.quotaGb} Gb
                </span>
                <StatusBadge status={user.status} />
                <button
                  type="button"
                  onClick={() => handleDelete(user.id)}
                  className="w-fit rounded-md p-1.5 text-gray-400 hover:bg-red-500/15 hover:text-red-400"
                  aria-label={`Excluir ${user.email}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* ---- Cartões: celular, abaixo do md ---- */}
          <div className="flex flex-col gap-1 lg:hidden">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-white/10 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm">{user.email}</p>
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-red-500/15 hover:text-red-400"
                    aria-label={`Excluir ${user.email}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <RoleBadge role={user.role} />
                  <span
                    className={`text-sm ${user.nearLimit ? "text-red-400" : "text-gray-300"}`}
                  >
                    {user.quotaGb} Gb
                  </span>
                  <StatusBadge status={user.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
