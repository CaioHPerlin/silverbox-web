const localOrigin = "https://silverbox.invalid";
const authPaths = new Set(["/login", "/cadastro", "/recuperar-acesso", "/nova-senha"]);

// Apenas destinos internos; impede que returnTo leve a outro site ou crie um loop de login.
export function safeReturnTo(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  if (Array.from(value).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return "/";
  try {
    const url = new URL(value, localOrigin);
    const pathname = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
    if (url.origin !== localOrigin || authPaths.has(pathname) || pathname.startsWith("//") || pathname.includes("\\")) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function authUrl(page: "login" | "cadastro", returnTo: string): string {
  return `/${page}?${new URLSearchParams({ returnTo: safeReturnTo(returnTo) })}`;
}
