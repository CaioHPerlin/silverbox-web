import assert from "node:assert/strict";
import { test } from "node:test";
import { mensagemDaApi } from "../src/lib/errorMessages.ts";
import { validarNome } from "../src/lib/fileName.ts";
import { validarSenha } from "../src/lib/passwordPolicy.ts";

test("prioriza o código do erro e cobre APIs que ainda retornam texto em inglês", () => {
  assert.match(mensagemDaApi({ status: 403, code: "BANNED_USER" }), /conta foi bloqueada/);
  assert.match(mensagemDaApi({ status: 400, code: "PASSWORD_MISSING_UPPERCASE" }), /uma letra maiúscula/);
  assert.match(mensagemDaApi({ status: 400, code: "PASSWORD_MISSING_SYMBOL" }), /um símbolo/);
  assert.match(mensagemDaApi({ status: 400, code: "INVALID_TOKEN" }), /link é inválido ou expirou/);
  assert.match(mensagemDaApi({ status: 400, error: "User already exists. Use another email." }), /existe uma conta/);
  assert.match(mensagemDaApi({ status: 415, error: "This file type does not support shared previews" }), /Selecione Download/);
  assert.match(mensagemDaApi({ status: 415, error: "Invalid JPEG, PNG or WebP image" }), /imagem válida/);
  assert.equal(mensagemDaApi({ status: 500, message: "database details" }, "Tente novamente."), "Tente novamente.");
});

test("confere nomes de arquivo e os requisitos de senha antes do envio", () => {
  assert.match(String(validarNome("   ")), /Informe um nome/);
  assert.match(String(validarNome("pasta/arquivo")), /barras/);
  assert.equal(validarNome("Relatório - novembro.pdf"), true);
  assert.equal(validarSenha("Aa@1234"), "Use pelo menos 8 caracteres.");
  assert.equal(validarSenha("A😀😀😀😀😀😀"), "Use pelo menos 8 caracteres.");
  assert.equal(validarSenha("a".repeat(129)), "Use no máximo 128 caracteres.");
  assert.match(String(validarSenha("teste@123")), /maiúscula/);
  assert.match(String(validarSenha("Teste123")), /símbolo/);
  assert.equal(validarSenha("Teste@123"), true);
  assert.equal(validarSenha("Palavra!"), true);
});
