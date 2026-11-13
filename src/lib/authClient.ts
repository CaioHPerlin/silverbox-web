import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { API_URL } from "../config/api";

export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`,
  plugins: [adminClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
