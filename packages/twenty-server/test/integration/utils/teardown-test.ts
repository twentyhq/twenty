import 'tsconfig-paths/register';

const TEARDOWN_TIMEOUT_MS = 30_000;

export default async () => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(
            `Integration teardown exceeded ${TEARDOWN_TIMEOUT_MS}ms: a worker did not drain, likely a job left running by a test in this shard (e.g. an unmocked external call that hung instead of failing fast)`,
          ),
        ),
      TEARDOWN_TIMEOUT_MS,
    );
  });

  try {
    await Promise.race([global.app.close(), timeout]);
    await global.testDataSource.destroy();
  } catch (error) {
    console.error(error);
    // A hung app.close() keeps Redis handles open, so the process would
    // otherwise sit until the CI job timeout. Force a fast, loud failure.
    process.exit(1);
  } finally {
    clearTimeout(timer);
  }
};
