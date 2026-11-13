import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../lib/authClient";
import { ehAdmin } from "../lib/roles";
import AcessoNegado from "../pages/AcessoNegado";

export default function AdminRoute() {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0d] text-gray-400">
        Carregando...
      </div>
    );
  }

  // anônimo: vai para o login
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;

  // logado, mas sem papel de admin
  if (!ehAdmin(session.user.role)) return <AcessoNegado />;

  return <Outlet />;
}