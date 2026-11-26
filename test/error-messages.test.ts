import assert from "node:assert/strict";
import { test } from "node:test";
import { mensagemDaApi } from "../src/lib/errorMessages.ts";
import { validarNome } from "../src/lib/fileName.ts";
import { validarTamanhoDaSenha } from "../src/lib/passwordPolicy.ts";

test("prioriza o código do erro e cobre APIs que ainda retornam texto em inglês", () => {
  assert.match(mensagemDaApi({ status: 403, code: "BANNED_USER" }), /conta foi bloqueada/);
  assert.match(mensagemDaApi({ status: 400, code: "PASSWORD_TOO_COMMON" }), /senha é muito comum/);
  assert.match(mensagemDaApi({ status: 400, code: "INVALID_TOKEN" }), /link é inválido ou expirou/);
  assert.match(mensagemDaApi({ status: 400, error: "User already exists. Use another email." }), /existe uma conta/);
  assert.match(mensagemDaApi({ status: 415, error: "This file type does not support shared previews" }), /Selecione Download/);
  assert.match(mensagemDaApi({ status: 415, error: "Invalid JPEG, PNG or WebP image" }), /imagem válida/);
  assert.equal(mensagemDaApi({ status: 500, message: "database details" }, "Tente novamente."), "Tente novamente.");
});

test("confere nomes de arquivo e o tamanho da senha antes do envio", () => {
  assert.match(String(validarNome("   ")), /Informe um nome/);
  assert.match(String(validarNome("pasta/arquivo")), /barras/);
  assert.equal(validarNome("Relatório - novembro.pdf"), true);
  assert.equal(validarTamanhoDaSenha("12345678"), "Use pelo menos 15 caracteres.");
  assert.equal(validarTamanhoDaSenha("😀".repeat(8)), "Use pelo menos 15 caracteres.");
  assert.equal(validarTamanhoDaSenha("a".repeat(129)), "Use no máximo 128 caracteres.");
  assert.equal(validarTamanhoDaSenha("minha frase de teste"), true);
});
