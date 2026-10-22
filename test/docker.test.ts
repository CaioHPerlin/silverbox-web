import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';

const project = `silverbox-web-test-${process.pid}`;
const env = { ...process.env, API_URL: 'https://api.silverbox.test' };
function compose(...args: string[]) {
  return execFileSync('docker', ['compose', '--env-file', '/dev/null', '-p', project, ...args], {
    env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 600_000,
  });
}

test('Docker serves SPA routes, runtime origin and rejects unsafe configuration', { timeout: 660_000 }, async () => {
  try {
    compose('up', '--build', '-d', '--wait', '--wait-timeout', '60');
    const base = 'http://127.0.0.1:5173';
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    assert.equal(await health.text(), 'ok\n');
    const runtime = await fetch(`${base}/runtime-config.js`);
    assert.match(runtime.headers.get('cache-control') ?? '', /no-store/);
    assert.match(await runtime.text(), /https:\/\/api\.silverbox\.test/);
    const home = await fetch(base).then(r => r.text());
    assert.match(home, /runtime-config.js/);
    assert.equal(await fetch(`${base}/arquivos`).then(r => r.text()), home);
    assert.equal((await fetch(`${base}/assets/missing.js`)).status, 404);
    assert.equal(compose('exec', '-T', 'web', 'id', '-u').trim(), '101');
    for (const value of ['https://example.test/";alert(1)', 'https://example.test\nalert(1)']) {
      const unsafe = spawnSync('docker', ['compose', '--env-file', '/dev/null', '-p', project,
        'run', '--rm', '-e', `API_URL=${value}`, 'web', 'nginx', '-t'],
        { env, encoding: 'utf8', timeout: 30_000 });
      assert.notEqual(unsafe.status, 0);
      assert.match(unsafe.stderr + unsafe.stdout, /API_URL must/);
    }
  } catch (error) {
    console.error(compose('logs', '--tail', '50'));
    throw error;
  } finally {
    compose('down', '--remove-orphans');
  }
});
