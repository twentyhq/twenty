import { spawn } from 'child_process';

// Serves the built Worker in local workerd and checks what a few routes
// return. `next build` passing says nothing about whether the OpenNext
// adapter can serve the build: Next 16.3.8 changed its cache keys and
// every prerendered page 404'd on Cloudflare while CI stayed green.
// Run from the package root after `opennextjs-cloudflare build`.
const PORT = 8790;
const BASE_URL = `http://localhost:${PORT}`;
const READY_TIMEOUT_MS = 180_000;
const REQUEST_TIMEOUT_MS = 60_000;

const EXPECTED_STATUSES = [
  ['/', 200],
  ['/fr', 200],
  ['/pricing', 200],
  ['/fr/pricing', 200],
  ['/customers', 200],
  ['/sitemap.xml', 200],
  ['/en/pricing', 301],
  ['/smoke-test-missing-page', 404],
];

// `--env dev` gives the Worker its R2 and self-reference bindings; preview
// simulates them locally and never talks to Cloudflare.
const preview = spawn(
  'npx',
  ['opennextjs-cloudflare', 'preview', '--env', 'dev', '--port', String(PORT)],
  { detached: true, stdio: 'inherit' },
);

let previewExited = false;
preview.on('exit', () => {
  previewExited = true;
});

const stopPreview = () => {
  if (!previewExited) {
    // Negative pid kills the whole group: npx, wrangler and workerd.
    process.kill(-preview.pid, 'SIGTERM');
  }
};

const fetchStatus = async (path) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return response.status;
};

const waitForPreview = async (deadline) => {
  if (previewExited) {
    throw new Error('preview exited before serving requests');
  }
  try {
    await fetchStatus('/sitemap.xml');
  } catch {
    if (Date.now() > deadline) {
      throw new Error(`preview not ready after ${READY_TIMEOUT_MS / 1000}s`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return waitForPreview(deadline);
  }
};

const failures = [];
try {
  await waitForPreview(Date.now() + READY_TIMEOUT_MS);
  for (const [path, expectedStatus] of EXPECTED_STATUSES) {
    // Sequential on purpose: workerd compiles the route on first hit.
    // eslint-disable-next-line no-await-in-loop
    const status = await fetchStatus(path).catch((error) => error.message);
    const passed = status === expectedStatus;
    console.log(
      `${passed ? 'ok  ' : 'FAIL'} ${path} -> ${status} (expected ${expectedStatus})`,
    );
    if (!passed) {
      failures.push(path);
    }
  }
} catch (error) {
  failures.push(error.message);
  console.error(error.message);
} finally {
  stopPreview();
}

if (failures.length > 0) {
  console.error(`\nWorker smoke test failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log('\nWorker smoke test passed.');
