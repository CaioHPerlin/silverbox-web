import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import process from "node:process";

const origemApi = process.env.SILVERBOX_E2E_API_URL;
const senha = process.env.SILVERBOX_E2E_PASSWORD;
const usuario = "usuario-browser@example.test";
const admin = "admin-browser@example.test";

test.skip(!origemApi || !senha, "Requer a API local e as contas sintéticas descritas no README.");
test.beforeAll(() => {
  const host = new URL(origemApi!).hostname;
  expect(["localhost", "127.0.0.1", "[::1]"]).toContain(host);
});

async function entrar(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(senha!);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
}

test("conta local cria pasta, envia arquivo, lê versão, compartilha e usa a lixeira", async ({ page }) => {
  await entrar(page, usuario);
  await page.goto("/arquivos");
  await expect(page.getByRole("button", { name: "Enviar arquivo" })).toBeVisible();

  const pasta = `Pasta de teste ${Date.now()}`;
  page.once("dialog", (dialog) => dialog.accept(pasta));
  await page.getByRole("button", { name: "Nova pasta" }).click();
  await expect(page.getByText(pasta, { exact: true }).first()).toBeVisible();

  const nome = `arquivo-de-teste-${Date.now()}.txt`;
  const conteudo = "Conteúdo sintético do teste";
  await page.locator('input[type="file"]').setInputFiles({
    name: nome,
    mimeType: "text/plain",
    buffer: Buffer.from(conteudo),
  });
  const versoes = page.getByRole("button", { name: `Versões de ${nome}` });
  await expect(versoes).toBeVisible();
  await versoes.click();
  const modal = page.getByRole("dialog");
  await expect(modal.getByText("Versão 1")).toBeVisible();
  const baixar = page.waitForEvent("download");
  await modal.getByRole("link", { name: "Baixar" }).click();
  expect(await readFile((await (await baixar).path())!, "utf8")).toBe(conteudo);
  await modal.getByRole("button", { name: "Fechar" }).click();

  const linhaArquivo = versoes.locator("../..");
  const menu = linhaArquivo.locator('button[aria-haspopup="menu"]');
  await menu.click();
  await page.getByRole("menuitem", { name: "Compartilhar" }).click();
  await modal.getByRole("button", { name: "Gerar link" }).click();
  const campoLink = modal.getByLabel("Link de compartilhamento");
  await expect(campoLink).not.toHaveValue("");
  const link = new URL(await campoLink.inputValue());
  expect(link.origin).toBe(origemApi);
  const compartilhado = await page.request.get(link.toString());
  expect(compartilhado.status()).toBe(200);
  expect(await compartilhado.text()).toBe(conteudo);
  await modal.getByRole("button", { name: "Fechar" }).click();

  await menu.click();
  await page.getByRole("menuitem", { name: "Excluir" }).click();
  await expect(versoes).toHaveCount(0);
  await page.goto("/lixeira");
  await expect(page.getByText(nome, { exact: true }).first()).toBeVisible();
  await page.goto("/perfil");
  await expect(page.getByRole("heading", { name: "Perfil do usuário" })).toBeVisible();
  await page.goto("/admin/auditoria");
  await expect(page.getByRole("heading", { name: "Acesso negado" })).toBeVisible();
});

test("admin local filtra e baixa o CSV real da auditoria", async ({ page }) => {
  await entrar(page, admin);
  const pasta = await page.request.post("/__api/folders", {
    data: { name: `Auditoria do navegador ${Date.now()}` },
  });
  expect(pasta.status()).toBe(201);

  await page.goto("/admin/auditoria");
  await page.getByLabel("Ação", { exact: true }).fill("folder_create");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  await expect(page.getByText("Criou pasta", { exact: true }).first()).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar relatório (CSV)" }).click();
  const download = await downloadPromise;
  const csv = await readFile((await download.path())!, "utf8");
  expect(csv).toContain("ID da requisição");
  expect(csv).toContain('"folder_create"');
  expect(csv).toContain(admin);
});
