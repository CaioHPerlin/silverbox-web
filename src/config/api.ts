export function validateApiOrigin(value: string): string {
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol) || url.origin !== value || url.username || url.password) {
    throw new Error("API URL must be an HTTP(S) origin without path or trailing slash");
  }
  return url.origin;
}

declare global {
  interface Window {
    __SILVERBOX_CONFIG__?: { apiUrl?: string };
  }
}

export const API_URL = validateApiOrigin(
  window.__SILVERBOX_CONFIG__?.apiUrl ?? import.meta.env.VITE_API_URL ?? "http://localhost:8000",
);
