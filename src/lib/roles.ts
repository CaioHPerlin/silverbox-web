export function temPapel(role: string | null | undefined, papel: string) {
    return (role ?? "").split(",").map((r) => r.trim()).includes(papel);
  }
  
  export const ehAdmin = (role?: string | null) => temPapel(role, "admin");