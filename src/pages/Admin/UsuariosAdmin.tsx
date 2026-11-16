import { useCallback, useEffect, useState } from "react";
import { Ban, CheckCircle2, Trash2, UserPlus } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import { authClient } from "../../lib/authClient";
import { useUsuario } from "../../hooks/useUsuario";
import LoadingSkeleton from "../../components/LoadingSkeleton";

// ---- Tipos ----
type Role = "user" | "admin";

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
}

function papelDe(u: ApiUser): Role {
  return (u.role ?? "")
    .split(",")
    .map((r) => r.trim())
    .includes("admin")
    ? "admin"
    : "user";
}

// ---- Badges ----
function RoleBadge({ role }: { role: Role }) {
  if (role === "admin") {
    return (
      <span className="inline-block rounded-md bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-300">
        Admin
      </span>
    );
  }
  return <span className="text-sm text-gray-300">Comum</span>;
}

function StatusBadge({ bloqueado }: { bloqueado: boolean }) {
  return bloqueado ? (
    <span className="inline-block rounded-md bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400">
      Bloqueado
    </span>
  ) : (
    <span className="inline-block rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400">
      Ativo
    </span>
  );
}

// ---- Modal de novo usuário ----
function NovoUsuarioModal({
  aberto,
  onClose,
  onCriado,
}: {
  aberto: boolean;
  onClose: () => void;
  onCriado: () => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<Role>("user");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  if (!aberto) return null;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8 || senha.length > 128) {
      setErro("A senha deve ter de 8 a 128 caracteres.");
      return;
    }
    setSalvando(true);
    setErro(null);
    const res = await authClient.admin.createUser({
      name: nome.trim(),
      email: email.trim(),
      password: senha,
      role: papel,
    });
    setSalvando(false);
    if (res.error) {
      setErro(res.error.message ?? "Não foi possível criar o usuário.");
      return;
    }
    setNome("");
    setEmail("");
    setSenha("");
    setPapel("user");
    onCriado();
    onClose();
  }

  const campo =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={enviar}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-3 rounded-xl border border-white/10 bg-[#161616] p-5"
      >
        <h2 className="text-lg font-semibold">Novo usuário</h2>
        {erro && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            {erro}
          </div>
        )}
        <input
          className={campo}
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          className={campo}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={campo}
          type="password"
          placeholder="Senha (8 a 128 caracteres)"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <select
          className={campo}
          value={papel}
          onChange={(e) => setPapel(e.target.value as Role)}
        >
          <option value="user">Comum</option>
          <option value="admin">Admin</option>
        </select>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {salvando ? "Criando..." : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function UsuariosAdmin() {
  const { usuario: eu } = useUsuario();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const res = await authClient.admin.listUsers({
      query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
    });
    if (res.error) {
      setErro(res.error.message ?? "Não foi possível carregar os usuários.");
    } else {
      const data = res.data as unknown as { users: ApiUser[] } | null;
      setUsers(data?.users ?? []);
      setErro(null);
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // executa uma ação do plugin, mostra o erro e recarrega a lista
  async function executar(
    id: string,
    acao: () => Promise<{ error?: { message?: string } | null }>,
  ) {
    setOcupado(id);
    setErro(null);
    const res = await acao();
    if (res.error) setErro(res.error.message ?? "A operação falhou.");
    setOcupado(null);
    await carregar();
  }

  function handleExcluir(u: ApiUser) {
    if (window.confirm(`Excluir ${u.email}? Esta ação não pode ser desfeita.`))
      executar(u.id, () => authClient.admin.removeUser({ userId: u.id }));
  }

  function handleBloqueio(u: ApiUser) {
    if (u.banned) {
      executar(u.id, () => authClient.admin.unbanUser({ userId: u.id }));
    } else if (window.confirm(`Bloquear ${u.email}?`)) {
      executar(u.id, () => authClient.admin.banUser({ userId: u.id }));
    }
  }

  function handlePapel(u: ApiUser, novo: Role) {
    if (novo === papelDe(u)) return;
    executar(u.id, () =>
      authClient.admin.setRole({ userId: u.id, role: novo }),
    );
  }

  const colunas = "grid-cols-[1fr_130px_110px_90px]";

  function Acoes({ u }: { u: ApiUser }) {
    const eEu = u.id === eu?.id;
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={eEu || ocupado === u.id}
          onClick={() => handleBloqueio(u)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
          aria-label={
            u.banned ? `Desbloquear ${u.email}` : `Bloquear ${u.email}`
          }
          title={u.banned ? "Desbloquear" : "Bloquear"}
        >
          {u.banned ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Ban className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          disabled={eEu || ocupado === u.id}
          onClick={() => handleExcluir(u)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-red-500/15 hover:text-red-400 disabled:opacity-30"
          aria-label={`Excluir ${u.email}`}
          title="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  function SeletorPapel({ u }: { u: ApiUser }) {
    return (
      <select
        value={papelDe(u)}
        disabled={u.id === eu?.id || ocupado === u.id}
        onChange={(e) => handlePapel(u, e.target.value as Role)}
        aria-label={`Papel de ${u.email}`}
        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs disabled:opacity-50"
      >
        <option value="user">Comum</option>
        <option value="admin">Admin</option>
      </select>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Usuários</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie papéis e o status de cada conta
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCriando(true)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200"
          >
            <UserPlus className="h-4 w-4" />
            Novo usuário
          </button>
        </div>

        {erro && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {erro}
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/2 p-4 sm:p-6">
          {carregando ? (
            <LoadingSkeleton mensagem="Carregando usuários..." />
          ) : users.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              Nenhum usuário encontrado.
            </p>
          ) : (
            <>
              {/* Tabela: desktop */}
              <div className="hidden lg:block">
                <div
                  className={`grid ${colunas} border-b border-white/10 px-2 py-3 text-xs uppercase tracking-wide text-gray-500`}
                >
                  <span>Usuário</span>
                  <span>Papel</span>
                  <span>Status</span>
                  <span>Ações</span>
                </div>
                {users.map((u) => (
                  <div
                    key={u.id}
                    className={`grid ${colunas} items-center border-b border-white/5 px-2 py-3 transition-colors last:border-b-0 hover:bg-white/5`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate text-sm">{u.name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {u.email}
                      </p>
                    </div>
                    <div>
                      <SeletorPapel u={u} />
                    </div>
                    <div>
                      <StatusBadge bloqueado={!!u.banned} />
                    </div>
                    <Acoes u={u} />
                  </div>
                ))}
              </div>

              {/* Cartões: celular e tablet */}
              <div className="flex flex-col gap-2 lg:hidden">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="rounded-xl border border-white/10 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm">{u.name}</p>
                        <p className="truncate text-xs text-gray-500">
                          {u.email}
                        </p>
                      </div>
                      <Acoes u={u} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <RoleBadge role={papelDe(u)} />
                      <SeletorPapel u={u} />
                      <StatusBadge bloqueado={!!u.banned} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <NovoUsuarioModal
          aberto={criando}
          onClose={() => setCriando(false)}
          onCriado={carregar}
        />
      </main>
    </div>
  );
}
