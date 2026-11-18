import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';

test('development modules exclude service credentials and retain public settings', async () => {
  const secretName = 'VITE_SUPABASE_SERVICE_ROLE_KEY';
  const publicName = 'VITE_SUPABASE_PUBLISHABLE_KEY';
  const previous = [process.env[secretName], process.env[publicName]];
  process.env[secretName] = 'synthetic-service-secret-public-env-test';
  process.env[publicName] = 'synthetic-public-key';
  let server;
  try {
    server = await createServer({
      server: { middlewareMode: true, hmr: false, watch: null },
      optimizeDeps: { noDiscovery: true, include: [] },
      appType: 'custom',
    });
    assert.equal(server.config.env[secretName], undefined);
    assert.equal(server.config.env[publicName], 'synthetic-public-key');
    const result = await server.transformRequest('/src/lib/superbase/client.ts');
    assert.ok(!result.code.includes(process.env[secretName]));
    assert.ok(result.code.includes('synthetic-public-key'));
  } finally {
    for (const [index, name] of [secretName, publicName].entries()) {
      if (previous[index] === undefined) delete process.env[name];
      else process.env[name] = previous[index];
    }
    await server?.close();
  }
});
