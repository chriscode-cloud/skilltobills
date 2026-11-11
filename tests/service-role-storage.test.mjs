import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { transformSync } from 'esbuild';

const legacyKey = 'skill2bills_supabase_service_role_key';
const storage = () => {
  const values = new Map([[legacyKey, 'synthetic-service-secret']]);
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
};
function load(path, context, dependencies) {
  const { code } = transformSync(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    loader: 'ts', format: 'cjs', define: { 'import.meta.env': '{}' },
  });
  const module = { exports: {} };
  vm.runInNewContext(code, {
    ...context, module, exports: module.exports,
    require: name => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return module.exports;
}
function setup() {
  const localStorage = storage();
  const sessionStorage = storage();
  const created = [];
  const window = { localStorage, sessionStorage, location: { reload() {} } };
  const client = load('../src/lib/superbase/client.ts', { window, localStorage, URL }, {
    '@supabase/supabase-js': { createClient: (...args) => { created.push(args); return {}; } },
  });
  return { client, window, created };
}

test('startup removes legacy secrets from both stores and preserves public settings', () => {
  const { client, window, created } = setup();
  assert.equal(window.localStorage.getItem(legacyKey), null);
  assert.equal(window.sessionStorage.getItem(legacyKey), null);
  client.setCustomSupabaseCredentials('https://project.supabase.co', 'public-key');
  assert.equal(window.localStorage.getItem('skill2bills_supabase_key'), 'public-key');
  assert.equal(created.length, 1);
  assert.equal(created[0][1], client.DEFAULT_PROJECT_KEY);
});

test('no privileged client can be created even with a reintroduced secret or override', () => {
  const { client, window, created } = setup();
  window.localStorage.setItem(legacyKey, 'synthetic-service-secret');
  assert.equal(client.getSupabaseAdminClient(), null);
  assert.equal(client.getSupabaseAdminClient('synthetic-override'), null);
  assert.equal(created.length, 1);
});

test('cleanup tolerates unavailable storage and still clears the other store', () => {
  const { client, window } = setup();
  window.sessionStorage.setItem(legacyKey, 'synthetic-service-secret');
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } });
  assert.doesNotThrow(() => client.clearCustomServiceRoleKey());
  assert.equal(window.sessionStorage.getItem(legacyKey), null);
});

test('Supabase logout clears legacy secrets even when remote signout fails', async () => {
  const { client, window } = setup();
  window.localStorage.setItem(legacyKey, 'synthetic-service-secret');
  const auth = load('../src/lib/superbase/auth.ts', {}, {
    './client': { ...client, supabase: { auth: { signOut: async () => { throw new Error('Offline'); } } } },
  });
  await assert.rejects(auth.signOut(), /Offline/);
  assert.equal(window.localStorage.getItem(legacyKey), null);
});

test('application logout clears legacy secrets with local authentication state', () => {
  const { client, window } = setup();
  window.localStorage.setItem(legacyKey, 'synthetic-service-secret');
  window.dispatchEvent = () => {};
  const auth = load('../src/lib/auth.ts', {
    window, localStorage: window.localStorage, sessionStorage: window.sessionStorage,
    CustomEvent: class {},
  }, { './superbase/client': client, './supabase': {} });
  auth.clearStoredUser();
  assert.equal(window.localStorage.getItem(legacyKey), null);
});
