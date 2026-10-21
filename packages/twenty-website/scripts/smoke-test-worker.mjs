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

const EXPECTED_RESPONSES = [
  { path: '/', status: 200 },
  { path: '/fr', status: 200 },
  { path: '/pricing', status: 200 },
  { path: '/fr/pricing', status: 200 },
  { path: '/customers', status: 200 },
  { path: '/sitemap.xml', status: 200 },
  { path: '/en/pricing', status: 301, location: '/pricing' },
  { path: '/smoke-test-missing-page', status: 404 },
];

// `--env dev` gives the Worker its R2 and self-reference bindings; preview
// simulates them locally and never talks to Cloudflare.
const preview = spawn(
  'npx',
  ['opennextjs-cloudflare', 'preview', '--env', 'dev', '--port', String(PORT)],
  { detached: true, stdio: 'inherit' },
);

let isPreviewExited = false;
preview.on('exit', () => {
  isPreviewExited = true;
});

const stopPreview = () => {
  if (!isPreviewExited) {
    // Negative pid kills the whole group: npx, wrangler and workerd.
    process.kill(-preview.pid, 'SIGTERM');
  }
};

const fetchPath = async (path) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  // Pages stream: a render error after the first bytes still sends a 200,
  // so only a fully received body counts.
  await response.text();
  const location = response.headers.get('location');
  return {
    status: response.status,
    location: location === null ? null : new URL(location, BASE_URL).pathname,
  };
};

const describeResponse = ({ status, location }) =>
  location ? `${status} ${location}` : `${status}`;

const waitForPreview = async (deadline) => {
  if (isPreviewExited) {
    throw new Error('preview exited before serving requests');
  }
  try {
    await fetchPath('/sitemap.xml');
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
  for (const expected of EXPECTED_RESPONSES) {
    // Sequential on purpose: workerd compiles the route on first hit.
    // eslint-disable-next-line no-await-in-loop
    const actual = await fetchPath(expected.path).catch((error) => ({
      status: error.message,
      location: null,
    }));
    const passed =
      actual.status === expected.status &&
      (expected.location === undefined ||
        actual.location === expected.location);
    console.log(
      `${passed ? 'ok  ' : 'FAIL'} ${expected.path} -> ${describeResponse(actual)} (expected ${describeResponse(expected)})`,
    );
    if (!passed) {
      failures.push(expected.path);
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
