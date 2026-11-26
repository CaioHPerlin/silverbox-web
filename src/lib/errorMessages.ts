import { passwordErrors } from "./passwordPolicy.ts";

type RemoteError = {
  status?: number;
  code?: unknown;
  message?: unknown;
  error?: unknown;
};

const duplicateEmail = "Já existe uma conta com esse e-mail.";
const previewUnavailable = "Este tipo de arquivo não permite visualização. Selecione Download para gerar o link.";
const invalidImage = "Envie uma imagem válida em JPEG, PNG ou WebP.";

const byCode = new Map([
  ["BANNED_USER", "Sua conta foi bloqueada. Entre em contato com a administração do Silverbox."],
  ["INVALID_EMAIL_OR_PASSWORD", "E-mail ou senha incorretos."],
  ["INVALID_EMAIL", "Informe um e-mail válido."],
  ["INVALID_TOKEN", "Este link é inválido ou expirou."],
  ["USER_ALREADY_EXISTS", duplicateEmail],
  ["USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", duplicateEmail],
  ...Object.entries(passwordErrors),
]);

// Algumas rotas REST ainda enviam apenas a mensagem, inclusive em versões já publicadas.
const byMessage = new Map([
  ["Invalid request", "Dados inválidos. Revise os campos e tente novamente."],
  ["This file type does not support shared previews", previewUnavailable],
  ["Invalid JPEG, PNG or WebP image", invalidImage],
  ["Send a JPEG, PNG or WebP image", invalidImage],
  ["User already exists.", duplicateEmail],
  ["User already exists. Use another email.", duplicateEmail],
  ["Folder is not empty", "Esvazie a pasta antes de excluí-la. Verifique também se ela contém arquivos na lixeira."],
  ["Folder move would create a cycle", "Você não pode mover uma pasta para dentro dela mesma ou de uma subpasta."],
  ["At least one administrator must remain active", "Pelo menos uma conta administradora precisa permanecer ativa."],
  ["An administrator cannot delete their own account", "Você não pode excluir sua própria conta pelo painel administrativo."],
  ["Account deletion is pending", "Esta conta já está sendo excluída."],
  ["Wait for active uploads before deleting the account", "Aguarde os envios em andamento antes de excluir esta conta."],
  ["Quota cannot be lower than usage and active reservations", "A cota não pode ser menor que o espaço usado e reservado para envios."],
  ["Storage quota exceeded", "O espaço da sua conta está esgotado. Libere espaço e tente novamente."],
  ["File exceeds upload limit", "O tamanho do arquivo ultrapassa o limite de envio."],
]);

const byStatus = new Map([
  [400, "Dados inválidos. Revise os campos e tente novamente."],
  [401, "Sua sessão expirou. Entre novamente."],
  [403, "Você não tem permissão para esta operação."],
  [404, "Item não encontrado."],
  [409, "A operação não pôde ser concluída no estado atual."],
  [410, "Este link expirou ou foi removido."],
  [413, "O tamanho ultrapassa o limite permitido."],
  [415, "O formato enviado não é compatível."],
  [429, "Muitas tentativas. Aguarde um momento e tente novamente."],
  [503, "Serviço temporariamente indisponível."],
  [507, "Armazenamento temporariamente indisponível."],
]);

export function mensagemDaApi(
  falha: RemoteError | null | undefined,
  fallback = "Não foi possível concluir a operação. Tente novamente.",
): string {
  const message = falha?.message ?? falha?.error;
  const porCodigo = typeof falha?.code === "string" ? byCode.get(falha.code) : undefined;
  const porMensagem = typeof message === "string" ? byMessage.get(message) : undefined;
  const porStatus = falha?.status === undefined ? undefined : byStatus.get(falha.status);
  return porCodigo ?? porMensagem ?? porStatus ?? fallback;
}
