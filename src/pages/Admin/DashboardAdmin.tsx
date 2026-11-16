import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import { authClient } from "../../lib/authClient";
import { useCota } from "../../hooks/useCota";
import { formatBytes } from "../../lib/format";
import { temPapel } from "../../lib/roles";
import LoadingSkeleton from "../../components/LoadingSkeleton";

interface ApiUser {
  id: string;
  role?: string | null;
  banned?: boolean | null;
}

interface ResumoUsuarios {
  total: number;
  admins: number;
  bloqueados: number;
  amostra: number; // quantos usuários foram contados nos números acima
}

function progressColor(percent: number) {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 70) return "bg-amber-500";
  return "bg-blue-500";
}

function StatCard({
  label,
  value,
  to,
  hint,
}: {
  label: string;
  value: string;
  to?: string;
  hint?: string;
}) {
  const conteudo = (
    <>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </>
  );
  const classes = "rounded-xl border border-white/10 bg-white/[0.03] p-4";
  return to ? (
    <Link
      to={to}
      className={`${classes} transition-colors hover:border-white/20 hover:bg-white/[0.06]`}
    >
      {conteudo}
    </Link>
  ) : (
    <div className={classes}>{conteudo}</div>
  );
}

export default function DashboardAdmin() {
  const { cota, carregandoCota } = useCota();
  const [resumo, setResumo] = useState<ResumoUsuarios | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(true);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      try {
        const res = await authClient.admin.listUsers({
          query: { limit: 100 },
        });

        if (cancelado) return;

        if (res.error) {
          setErro(
            res.error.message ?? "Não foi possível carregar os usuários.",
          );
          return;
        }

        const data = res.data as unknown as {
          users: ApiUser[];
          total: number;
        } | null;

        const users = data?.users ?? [];

        setResumo({
          total: data?.total ?? users.length,
          admins: users.filter((u) => temPapel(u.role, "admin")).length,
          bloqueados: users.filter((u) => u.banned).length,
          amostra: users.length,
        });
      } catch {
        if (!cancelado) {
          setErro("Não foi possível carregar os usuários.");
        }
      } finally {
        if (!cancelado) {
          setCarregandoUsuarios(false);
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  const percent = cota
    ? Math.min(Math.round((cota.usedBytes / cota.limitBytes) * 100), 100)
    : 0;

  const parcial = resumo !== null && resumo.amostra < resumo.total;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0d0d] text-white md:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {(carregandoCota || carregandoUsuarios) && (
          <LoadingSkeleton mensagem="Carregando painel administrativo..." />
        )}

        {!carregandoCota && !carregandoUsuarios && (
          <>
            <h1 className="mb-6 text-xl font-semibold sm:text-2xl">
              Dashboard
            </h1>

            {erro && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {erro}
              </div>
            )}

            {/* Bloqueados: só aparece quando há algo que precisa de atenção */}
            {resumo && resumo.bloqueados > 0 && (
              <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-amber-200">
                  <strong>{resumo.bloqueados}</strong>{" "}
                  {resumo.bloqueados === 1
                    ? "conta está bloqueada."
                    : "contas estão bloqueadas."}
                </p>
                <Link
                  to="/admin/usuarios"
                  className="shrink-0 rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/15"
                >
                  Ver usuários
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Usuários"
                value={resumo ? String(resumo.total) : "..."}
                to="/admin/usuarios"
              />
              <StatCard
                label="Administradores"
                value={resumo ? String(resumo.admins) : "..."}
                to="/admin/usuarios"
                hint={
                  parcial
                    ? `contados nos primeiros ${resumo?.amostra}`
                    : undefined
                }
              />
              <StatCard
                label="Bloqueados"
                value={resumo ? String(resumo.bloqueados) : "..."}
                to="/admin/usuarios"
                hint={
                  parcial
                    ? `contados nos primeiros ${resumo?.amostra}`
                    : undefined
                }
              />
              <StatCard
                label="Meu armazenamento"
                value={cota ? formatBytes(cota.usedBytes) : "..."}
                to="/admin/sistema"
                hint={cota ? `de ${formatBytes(cota.limitBytes)}` : undefined}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
              {/* Cota da conta logada */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Minha cota
                  </p>
                  <span className="text-xs text-gray-500">
                    {cota ? `${percent}%` : "..."}
                  </span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${progressColor(percent)}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-gray-400">
                  {cota
                    ? `${formatBytes(cota.usedBytes)} de ${formatBytes(cota.limitBytes)} usados`
                    : "Carregando..."}
                </p>
              </div>

              {/* Pendências do back */}
              <div className="rounded-xl border border-dashed border-white/15 p-4 lg:col-span-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Métricas globais e últimas ações (pendentes)
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Armazenamento total do sistema, quantidade de arquivos,
                  uploads recusados e o histórico de ações dependem de endpoints
                  administrativos que ainda não existem na API. A tabela de
                  auditoria já existe no banco, mas nenhuma rota a expõe.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
