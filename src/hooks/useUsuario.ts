import { useSession } from "../lib/authClient";

export type UsuarioSessao = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
};

export function useUsuario() {
  const { data, isPending } = useSession();
  // o cast via unknown evita o erro "type 'never'"
  const usuario =
    (data as unknown as { user?: UsuarioSessao } | null | undefined)?.user ??
    null;
  return { usuario, isPending };
}