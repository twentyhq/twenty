import { context, type BuildOptions } from 'esbuild';

const BUILD_TIMEOUT_MS = 10000;
const MAX_BUILD_OUTPUT_BYTES = 5 * 1024 * 1024;

export const buildFrontComponentWithLimits = async (options: BuildOptions) => {
  const buildContext = await context({ ...options, write: false });
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    void buildContext.cancel().catch(() => undefined);
  }, BUILD_TIMEOUT_MS);

  try {
    const result = await buildContext.rebuild();

    if (timedOut) {
      throw new Error('Component build exceeded the 10 second time limit.');
    }
    if (
      result.outputFiles.reduce(
        (size, file) => size + file.contents.byteLength,
        0,
      ) > MAX_BUILD_OUTPUT_BYTES
    ) {
      throw new Error('Component build exceeds the 5 MB output limit.');
    }

    return result;
  } catch (error) {
    if (timedOut) {
      throw new Error('Component build exceeded the 10 second time limit.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    await buildContext.dispose();
  }
};
