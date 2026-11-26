export const minPasswordLength = 15;
export const maxPasswordLength = 128;

export const passwordGuidance = `Use de ${minPasswordLength} a ${maxPasswordLength} caracteres. Prefira uma frase difícil de adivinhar.`;

export function validarTamanhoDaSenha(senha: string): true | string {
  if (senha.length > maxPasswordLength) return `Use no máximo ${maxPasswordLength} caracteres.`;
  if (Array.from(senha).length < minPasswordLength) return `Use pelo menos ${minPasswordLength} caracteres.`;
  return true;
}
