import { Navigate, Outlet } from "react-router-dom";

// Por enquanto verifica só se existe um token salvo.
// Quando o AuthContext existir, troca essa checagem por ele (também
// permite validar se o token expirou, etc.)
function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem("token"));
}

export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Outlet renderiza a rota filha (a página protegida)
  return <Outlet />;
}