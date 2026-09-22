import { authClient } from "../lib/authClient";

export function useAuth() {
  const { data: session, isPending } = authClient.useSession();

  return {
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    loading: isPending,
    logout: () => authClient.signOut(),
  };
}