import { authClient } from "../lib/authClient";
import { api } from "../services/apiClient";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  async function logout() {
    try {
      await api.post("/auth/logout", {});
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  return {
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    loading: isPending,
    logout,
  };
}
