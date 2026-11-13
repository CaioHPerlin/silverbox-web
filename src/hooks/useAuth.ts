import { authClient } from "../lib/authClient";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const navigate = useNavigate();

  async function logout() {
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message);
      await refetch();
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
