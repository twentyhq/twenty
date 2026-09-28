import { fileURLToPath } from 'node:url';

import { runServerRenderingConsumer } from './server-rendering/runServerRenderingConsumer';

runServerRenderingConsumer({
  consumerPath: fileURLToPath(
    new URL('./server-rendering/consumer.mjs', import.meta.url),
  ),
  flags: ['--editor'],
});
