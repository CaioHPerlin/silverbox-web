export const minPasswordLength = 8;
export const maxPasswordLength = 128;

export const passwordGuidance = `Use de ${minPasswordLength} a ${maxPasswordLength} caracteres, com pelo menos uma letra maiúscula e um símbolo (como @, ! ou #).`;

export const passwordErrors = {
  PASSWORD_TOO_SHORT: `Use pelo menos ${minPasswordLength} caracteres.`,
  PASSWORD_TOO_LONG: `Use no máximo ${maxPasswordLength} caracteres.`,
  PASSWORD_MISSING_UPPERCASE: "Use pelo menos uma letra maiúscula.",
  PASSWORD_MISSING_SYMBOL: "Use pelo menos um símbolo, como @, ! ou #.",
};

export function validarSenha(senha: string): true | string {
  if (senha.length > maxPasswordLength) return passwordErrors.PASSWORD_TOO_LONG;
  if (Array.from(senha).length < minPasswordLength) return passwordErrors.PASSWORD_TOO_SHORT;
  if (!/\p{Lu}/u.test(senha)) return passwordErrors.PASSWORD_MISSING_UPPERCASE;
  if (!/[\p{P}\p{S}]/u.test(senha)) return passwordErrors.PASSWORD_MISSING_SYMBOL;
  return true;
}
