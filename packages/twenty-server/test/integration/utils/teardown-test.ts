import 'tsconfig-paths/register';

// app.close() waits for in-flight queue jobs; a job stuck on a request that
// never settles would otherwise hang teardown until the CI job timeout kills
// the runner 30 minutes later, with all jest output lost.
const APP_CLOSE_TIMEOUT_MS = 60_000;

export default async () => {
  let closeTimeout: NodeJS.Timeout | undefined;

  const timedOut = await Promise.race([
    global.app.close().then(() => false),
    new Promise<boolean>((resolve) => {
      closeTimeout = setTimeout(() => resolve(true), APP_CLOSE_TIMEOUT_MS);
      closeTimeout.unref();
    }),
  ]);

  if (closeTimeout) {
    clearTimeout(closeTimeout);
  }

  if (timedOut) {
    console.error(
      `[teardown] app.close() did not finish within ${APP_CLOSE_TIMEOUT_MS}ms, likely a queue job stuck on a request that never settles; forcing exit`,
    );
    process.exit(1);
  }

  await global.testDataSource.destroy();
};
