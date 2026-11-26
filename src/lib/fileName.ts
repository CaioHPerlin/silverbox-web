export function validarNome(nome: string): true | string {
  const valor = nome.trim();
  if (!valor) return "Informe um nome.";
  if (valor.length > 255) return "Use no máximo 255 caracteres no nome.";
  if (/[/\\\r\n]/.test(valor) || valor.includes("\0")) return "O nome não pode ter barras nem quebras de linha.";
  return true;
}
