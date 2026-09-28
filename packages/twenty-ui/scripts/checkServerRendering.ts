import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const consumerPath = fileURLToPath(
  new URL('./server-rendering/consumer.mjs', import.meta.url),
);

for (const moduleFormat of ['esm', 'commonjs']) {
  const result = spawnSync(
    process.execPath,
    [consumerPath, moduleFormat, '--editor'],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
