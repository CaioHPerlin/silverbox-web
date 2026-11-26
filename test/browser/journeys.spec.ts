import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

function contaDeTeste(role: "user" | "admin") {
  return {
    id: "31",
    name: "Conta sintética",
    email: "smoke@example.test",
    role,
    emailVerified: true,
    createdAt: "2026-11-25T00:00:00Z",
    updatedAt: "2026-11-25T00:00:00Z",
  };
}

async function simularSessao(page: Page, role?: "user" | "admin") {
  await page.route("**/__api/**", async (route) => {
    const url = new URL(route.request().url());
    const user = role ? contaDeTeste(role) : null;
    if (url.pathname.endsWith("/api/auth/get-session")) {
      return route.fulfill({
        json: user ? { session: { userId: user.id }, user } : null,
      });
    }
    if (url.pathname.endsWith("/users/me")) {
      return user ? route.fulfill({ json: { user } }) : route.fulfill({ status: 401 });
    }
    if (url.pathname.endsWith("/storage/usage")) {
      return route.fulfill({ json: { usedBytes: "0", limitBytes: "1024", reservedBytes: "0" } });
    }
    return route.fulfill({ status: 404 });
  });
}

test("rota protegida, leitura em celular e página inexistente", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await simularSessao(page);

  await page.goto("/arquivos?folderId=3");
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  expect(new URL(page.url()).searchParams.get("returnTo")).toBe("/arquivos?folderId=3");
  await page.reload();
  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeVisible();
  await page.getByLabel("Email").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Senha", { exact: true })).toBeFocused();

  await page.goto("/pagina-inexistente");
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});

test("conta comum não abre a área administrativa", async ({ page }) => {
  await simularSessao(page, "user");
  let consultouAuditoria = false;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith("/admin/audit")) {
      consultouAuditoria = true;
    }
  });

  await page.goto("/admin/auditoria");
  await expect(page.getByRole("heading", { name: "Acesso negado" })).toBeVisible();
  expect(consultouAuditoria).toBe(false);
});

test("auditoria pagina, aplica filtros, repete consulta e baixa o CSV da API", async ({ page }) => {
  await simularSessao(page, "admin");
  let falharConsulta = true;
  let falharExportacao = true;
  const consultas: URLSearchParams[] = [];
  const exportacoes: URLSearchParams[] = [];
  const csv = "Data UTC,Ação\r\n2026-11-25,upload\r\n2026-11-24,upload\r\n";

  await page.route("**/__api/admin/audit?**", async (route) => {
    const params = new URL(route.request().url()).searchParams;
    consultas.push(params);
    if (falharConsulta) {
      return route.fulfill({ status: 503, json: { message: "Auditoria indisponível no teste" } });
    }

    return route.fulfill({
      json: {
        page: Number(params.get("page")),
        limit: 50,
        total: params.has("action") ? 2 : 51,
        logs: [{
          id: 14,
          userId: 31,
          actorName: "Operador sintético",
          actorEmail: "operator@example.test",
          action: "upload",
          ipAddress: "127.0.0.1",
          createdAt: "2026-11-25T13:00:00Z",
          details: "file:14",
          requestId: "identificador-de-teste",
        }],
      },
    });
  });
  await page.route(/\/__api\/admin\/audit\/export\?/, async (route) => {
    exportacoes.push(new URL(route.request().url()).searchParams);
    if (falharExportacao) {
      falharExportacao = false;
      return route.fulfill({ status: 503, json: { message: "Exportação indisponível no teste" } });
    }
    return route.fulfill({ contentType: "text/csv", body: csv });
  });

  await page.goto("/admin/auditoria");
  await expect(page.getByRole("alert")).toContainText("Serviço temporariamente indisponível");
  falharConsulta = false;
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByText("Página 1 de 2")).toBeVisible();
  await expect(page.getByText("Requisição identificador-de-teste").first()).toBeVisible();
  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(page.getByText("Página 2 de 2")).toBeVisible();

  await page.getByLabel("Data inicial").fill("2026-11-24");
  await page.getByLabel("Data final").fill("2026-11-25");
  await page.getByLabel("ID do usuário").fill("31");
  await page.getByLabel("Ação", { exact: true }).fill("upload");
  await page.getByRole("button", { name: "Aplicar filtros" }).click();
  const exportar = page.getByRole("button", { name: "Exportar relatório (CSV)" });
  await expect(exportar).toBeEnabled();

  const filtros = {
    since: "2026-11-24T04:00:00.000Z",
    until: "2026-11-26T04:00:00.000Z",
    userId: "31",
    action: "upload",
  };
  expect(Object.fromEntries(consultas.at(-1)!)).toEqual({ ...filtros, page: "1", limit: "50" });

  await exportar.click();
  await expect(page.getByRole("alert")).toContainText("Falha ao exportar");
  const downloadPromise = page.waitForEvent("download");
  await exportar.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("auditoria-silverbox.csv");
  expect(await readFile((await download.path())!, "utf8")).toBe(csv);
  expect(exportacoes.map((params) => Object.fromEntries(params))).toEqual([filtros, filtros]);

  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page.getByText("Página 1 de 2")).toBeVisible();
  expect(Object.fromEntries(consultas.at(-1)!)).toEqual({ page: "1", limit: "50" });
});

test("recuperação pede link, rejeita token inválido e retorna ao login após sucesso", async ({ page }) => {
  await simularSessao(page);
  const email = "recuperacao@example.test";
  const novaSenha = "senha-sintetica-de-teste";
  let novoPedido = 0;

  await page.route("**/__api/api/auth/request-password-reset", async (route) => {
    novoPedido += 1;
    expect(route.request().postDataJSON()).toEqual({
      email,
      redirectTo: "http://localhost:4178/nova-senha",
    });
    return route.fulfill({ json: { status: true } });
  });
  await page.route("**/__api/api/auth/reset-password", async (route) => {
    const body = route.request().postDataJSON();
    expect(body.newPassword).toBe(novaSenha);
    return body.token === "teste-valido"
      ? route.fulfill({ json: { status: true } })
      : route.fulfill({ status: 400, json: { code: "INVALID_TOKEN" } });
  });

  await page.goto("/recuperar-acesso");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Enviar link de recuperação" }).click();
  await expect(page.getByText(/Se existir uma conta/)).toBeVisible();
  expect(novoPedido).toBe(1);

  for (const token of ["teste-expirado", "teste-valido"]) {
    await page.goto(`/nova-senha?token=${token}`);
    await page.getByLabel("Nova senha", { exact: true }).fill(novaSenha);
    await page.getByLabel("Confirme nova senha").fill(novaSenha);
    await page.getByRole("button", { name: "Redefinir senha" }).click();
    if (token === "teste-expirado") {
      await expect(page.getByRole("alert")).toContainText("Este link é inválido ou expirou");
      await expect(page.getByRole("link", { name: "Pedir novo link" })).toBeVisible();
    } else {
      await expect(page.getByText(/Senha alterada com sucesso/)).toBeVisible();
      await expect(page).toHaveURL(/\/login$/);
    }
  }
});
