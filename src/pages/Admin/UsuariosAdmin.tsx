import { useEffect, useState } from "react";
import { Ban, CheckCircle2, Pencil, Trash2, UserPlus } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import { authClient } from "../../lib/authClient";
import { formatBytes } from "../../lib/format";
import { temPapel } from "../../lib/roles";
import { useUsuario } from "../../hooks/useUsuario";
import {
  criarUsuario,
  editarUsuario,
  listarUsuarios,
  mensagemAdmin,
  paraBytes,
  type UsuarioAdmin,
} from "../../services/adminUsers";

type Role = "user" | "admin";

const POR_PAGINA = 20;

function papelDe(u: UsuarioAdmin): Role {
  return temPapel(u.role, "admin") ? "admin" : "user";
}

function StatusBadge({ u }: { u: UsuarioAdmin }) {
  if (u.deletionPending)
    return (
      <span className="inline-block rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-400">
        Excluindo...
      </span>
    );
  return u.banned ? (
    <span className="inline-block rounded-md bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400">
      Bloqueado
    </span>
  ) : (
    <span className="inline-block rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400">
      Ativo
    </span>
  );
}

const campo =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500";

// ---- Modal: novo usuário ----
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
    try {
      await criarUsuario({
        name: nome.trim(),
        email: email.trim(),
        password: senha,
        role: papel,
      });
    } catch (err) {
      setSalvando(false);
      setErro(mensagemAdmin(err));
      return;
    }
    setSalvando(false);
    setNome("");
    setEmail("");
    setSenha("");
    setPapel("user");
    onCriado();
    onClose();
  }

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
          <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {erro}
          </div>
        )}
        <input className={campo} placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <input className={campo} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={campo} type="password" placeholder="Senha (8 a 128 caracteres)" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        <select className={campo} value={papel} onChange={(e) => setPapel(e.target.value as Role)}>
          <option value="user">Comum</option>
          <option value="admin">Admin</option>
        </select>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5">
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-50">
            {salvando ? "Criando..." : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---- Modal: editar nome e cota ----
function EditarUsuarioModal({
  usuario,
  onClose,
  onSalvo,
}: {
  usuario: UsuarioAdmin | null;
  onClose: () => void;
  onSalvo: () => void;
}) {
  if (!usuario) return null;
  // key remonta o formulário ao trocar de usuário
  return (
    <EditarForm key={usuario.id} usuario={usuario} onClose={onClose} onSalvo={onSalvo} />
  );
}

function EditarForm({
  usuario,
  onClose,
  onSalvo,
}: {
  usuario: UsuarioAdmin;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [nome, setNome] = useState(usuario.name);
  const [cotaGb, setCotaGb] = useState(
    String(+(paraBytes(usuario.quotaLimitBytes) / 1024 ** 3).toFixed(2)),
  );
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const gb = Number(cotaGb.replace(",", "."));
    if (!nome.trim()) return setErro("Informe o nome.");
    if (!Number.isFinite(gb) || gb <= 0) return setErro("Informe uma cota maior que zero.");

    setSalvando(true);
    setErro(null);
    try {
      await editarUsuario(usuario.id, {
        name: nome.trim(),
        quotaLimitBytes: Math.round(gb * 1024 ** 3),
      });
    } catch (err) {
      setSalvando(false);
      setErro(mensagemAdmin(err));
      return;
    }
    setSalvando(false);
    onSalvo();
    onClose();
  }

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
        <h2 className="text-lg font-semibold">Editar conta</h2>
        <p className="truncate text-sm text-gray-500">{usuario.email}</p>
        {erro && (
          <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {erro}
          </div>
        )}
        <label className="block text-xs text-gray-400">
          Nome
          <input className={`${campo} mt-1`} value={nome} onChange={(e) => setNome(e.target.value)} required />
        </label>
        <label className="block text-xs text-gray-400">
          Cota (GB)
          <input
            className={`${campo} mt-1`}
            inputMode="decimal"
            value={cotaGb}
            onChange={(e) => setCotaGb(e.target.value)}
            required
          />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5">
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-50">
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function UsuariosAdmin() {
  const { usuario: eu } = useUsuario();

  const [termo, setTermo] = useState("");
  const [q, setQ] = useState("");
  const [pagina, setPagina] = useState(1);
  const [recarga, setRecarga] = useState(0);

  const [users, setUsers] = useState<UsuarioAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);

  // debounce de 300 ms; a página volta para 1 quando o termo muda
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(termo.trim());
      setPagina(1);
    }, 300);
    return () => clearTimeout(t);
  }, [termo]);

  // setState só dentro de .then/.catch/.finally (regra do lint)
  useEffect(() => {
    const ac = new AbortController();
    listarUsuarios(q, pagina, POR_PAGINA, ac.signal)
      .then((r) => {
        if (ac.signal.aborted) return;
        setUsers(r?.users ?? []);
        setTotal(r?.total ?? 0);
        setErro(null);
      })
      .catch((e) => {
        if (ac.signal.aborted || (e instanceof Error && e.name === "AbortError")) return;
        setUsers([]);
        setTotal(0);
        setErro(mensagemAdmin(e));
      })
      .finally(() => {
        if (!ac.signal.aborted) setCarregando(false);
      });
    return () => ac.abort();
  }, [q, pagina, recarga]);

  function recarregar() {
    setCarregando(true);
    setRecarga((n) => n + 1);
  }

  function irParaPagina(nova: number) {
    setCarregando(true);
    setPagina(nova);
  }

  // executa uma operação, mostra falhas/conflitos e recarrega a lista
  async function executar(id: string, acao: () => Promise<unknown>) {
    setOcupado(id);
    setErro(null);
    try {
      const r = (await acao()) as { error?: { message?: string; status?: number } | null } | undefined;
      if (r?.error) {
        const msg = (r.error.message ?? "").toLowerCase();
        setErro(
          r.error.status === 409 && msg.includes("admin")
            ? "Não é possível: esta é a única conta administradora."
            : (r.error.message ?? "A operação falhou."),
        );
      }
    } catch (e) {
      setErro(mensagemAdmin(e));
    }
    setOcupado(null);
    recarregar();
  }

  function handleExcluir(u: UsuarioAdmin) {
    if (!window.confirm(`Excluir ${u.email}? Esta ação não pode ser desfeita.`)) return;
    executar(u.id, () => authClient.admin.removeUser({ userId: u.id }));
  }

  function handleBloqueio(u: UsuarioAdmin) {
    if (u.banned) {
      executar(u.id, () => authClient.admin.unbanUser({ userId: u.id }));
    } else if (window.confirm(`Bloquear ${u.email}?`)) {
      executar(u.id, () => authClient.admin.banUser({ userId: u.id }));
    }
  }

  function handlePapel(u: UsuarioAdmin, novo: Role) {
    if (novo === papelDe(u)) return;
    executar(u.id, async () => {
      const r = await authClient.admin.setRole({ userId: u.id, role: novo });
      if (!r.error) await authClient.admin.revokeUserSessions({ userId: u.id });
      return r;
    });
  }

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const colunas = "grid-cols-[1fr_130px_110px_110px_120px]";

  function Acoes({ u }: { u: UsuarioAdmin }) {
    const bloqueada = u.id === eu?.id || ocupado === u.id || u.deletionPending;
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={u.deletionPending || ocupado === u.id}
          onClick={() => setEditando(u)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
          aria-label={`Editar ${u.email}`}
          title="Editar nome e cota"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={bloqueada}
          onClick={() => handleBloqueio(u)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
          aria-label={u.banned ? `Desbloquear ${u.email}` : `Bloquear ${u.email}`}
          title={u.banned ? "Desbloquear" : "Bloquear"}
        >
          {u.banned ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
        </button>
        <button
          type="button"
          disabled={bloqueada}
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

  function SeletorPapel({ u }: { u: UsuarioAdmin }) {
    return (
      <select
        value={papelDe(u)}
        disabled={u.id === eu?.id || ocupado === u.id || u.deletionPending}
        onChange={(e) => handlePapel(u, e.target.value as Role)}
        aria-label={`Papel de ${u.email}`}
        className="rounded-md border border-white/10 bg-[#161616] px-2 py-1 text-xs disabled:opacity-50"
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
              Gerencie papéis, cotas e o status de cada conta
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

        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          maxLength={100}
          placeholder="Buscar por nome ou e-mail..."
          aria-label="Buscar usuário"
          className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-md"
        />

        {erro && (
          <div role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {erro}
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
          {carregando ? (
            <p className="py-10 text-center text-sm text-gray-500">Carregando...</p>
          ) : users.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              {q ? "Nenhum usuário encontrado para essa busca." : "Nenhum usuário encontrado."}
            </p>
          ) : (
            <>
              {/* Tabela: desktop */}
              <div className="hidden lg:block">
                <div className={`grid ${colunas} border-b border-white/10 px-2 py-3 text-xs uppercase tracking-wide text-gray-500`}>
                  <span>Usuário</span>
                  <span>Papel</span>
                  <span>Cota</span>
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
                      <p className="truncate text-xs text-gray-500">{u.email}</p>
                    </div>
                    <div><SeletorPapel u={u} /></div>
                    <span className="text-sm text-gray-300">
                      {formatBytes(paraBytes(u.quotaLimitBytes))}
                    </span>
                    <div><StatusBadge u={u} /></div>
                    <Acoes u={u} />
                  </div>
                ))}
              </div>

              {/* Cartões: celular e tablet */}
              <div className="flex flex-col gap-2 lg:hidden">
                {users.map((u) => (
                  <div key={u.id} className="rounded-xl border border-white/10 px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm">{u.name}</p>
                        <p className="truncate text-xs text-gray-500">{u.email}</p>
                      </div>
                      <Acoes u={u} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <SeletorPapel u={u} />
                      <span className="text-sm text-gray-300">
                        Cota: {formatBytes(paraBytes(u.quotaLimitBytes))}
                      </span>
                      <StatusBadge u={u} />
                    </div>
                  </div>
                ))}
              </div>

              {totalPaginas > 1 && (
                <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-400">
                  <button
                    type="button"
                    disabled={pagina <= 1}
                    onClick={() => irParaPagina(pagina - 1)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/5 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span>
                    Página {pagina} de {totalPaginas}
                  </span>
                  <button
                    type="button"
                    disabled={pagina >= totalPaginas}
                    onClick={() => irParaPagina(pagina + 1)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/5 disabled:opacity-40"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <NovoUsuarioModal
          aberto={criando}
          onClose={() => setCriando(false)}
          onCriado={recarregar}
        />
        <EditarUsuarioModal
          usuario={editando}
          onClose={() => setEditando(null)}
          onSalvo={recarregar}
        />
      </main>
    </div>
  );
}