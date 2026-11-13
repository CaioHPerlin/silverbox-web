import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { createServer } from 'vite';
import { apiProxy, API_PROXY_PATH } from '../dev/api-proxy.ts';

test('development proxy preserves binary bodies and translates only its own auth cookies', async () => {
  let received: { path?: string; cookie?: string; origin?: string; body: Buffer } | undefined;
  const upstream = createHttpServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    received = { path: req.url, cookie: req.headers.cookie, origin: req.headers.origin, body: Buffer.concat(chunks) };
    if (req.url === '/api/auth/sign-in/email') {
      res.setHeader('Set-Cookie', [
        '__Secure-better-auth.session_token=signed-value; Path=/; Domain=api.test; Secure; HttpOnly; SameSite=Lax; Max-Age=3600',
        '__Secure-better-auth.session_data=cached; Path=/; Secure; HttpOnly; SameSite=Lax',
        'unrelated=private; Path=/; Secure',
      ]);
    } else if (req.url === '/api/auth/sign-out') {
      res.setHeader('Set-Cookie', '__Secure-better-auth.session_token=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0');
    }
    res.end(Buffer.concat(chunks));
  });
  upstream.listen(0, '127.0.0.1');
  await once(upstream, 'listening');
  const target = `http://127.0.0.1:${(upstream.address() as { port: number }).port}`;
  const proxy = apiProxy(target);
  const server = await createServer({
    configFile: false, plugins: [proxy.plugin],
    server: { host: '127.0.0.1', port: 0, proxy: { [API_PROXY_PATH]: proxy.options } },
  });
  try {
    await server.listen();
    const base = `http://127.0.0.1:${(server.httpServer!.address() as { port: number }).port}`;
    const login = await fetch(`${base}/__api/api/auth/sign-in/email`, { method: 'POST', headers: { Origin: base }, body: '{}' });
    assert.equal(login.status, 200);
    const cookies = login.headers.getSetCookie();
    assert.equal(cookies.length, 2);
    assert.match(cookies[0], /^silverbox-dev\.__Secure-better-auth\.session_token=signed-value;/);
    assert.match(cookies[0], /Path=\/__api/);
    assert.match(cookies[0], /HttpOnly; SameSite=Lax; Max-Age=3600/);
    assert.doesNotMatch(cookies[0], /;\s*(Secure|Domain=)/i);
    const bytes = Buffer.from([0, 255, 13, 10, 42]);
    const upload = await fetch(`${base}/__api/files?folderId=7`, {
      method: 'POST', headers: { Origin: base, Cookie: cookies.map(c => c.split(';')[0]).join('; ') + '; other=do-not-forward', 'Content-Type': 'application/octet-stream', 'X-File-Size': '5', 'X-File-Name': 'test.bin' }, body: bytes,
    });
    assert.equal(upload.status, 200);
    assert.deepEqual(Buffer.from(await upload.arrayBuffer()), bytes);
    assert.equal(received?.path, '/files?folderId=7');
    assert.equal(received?.origin, target);
    assert.equal(received?.cookie, '__Secure-better-auth.session_token=signed-value; __Secure-better-auth.session_data=cached');
    assert.deepEqual(received?.body, bytes);
    const logout = await fetch(`${base}/__api/api/auth/sign-out`, { method: 'POST', body: '{}' });
    assert.match(logout.headers.getSetCookie()[0], /Max-Age=0; Path=\/__api/);
    for (const headers of [{ Origin: 'https://other.example' }, { 'Sec-Fetch-Site': 'cross-site' }]) {
      assert.equal((await fetch(`${base}/__api/files`, { headers })).status, 403);
    }
  } finally {
    await server.close();
    await new Promise<void>((resolve, reject) => upstream.close(err => err ? reject(err) : resolve()));
  }
});
