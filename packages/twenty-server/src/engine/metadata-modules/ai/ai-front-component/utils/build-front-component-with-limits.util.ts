import { context, type BuildOptions } from 'esbuild';

import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

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
      throw new FrontComponentException(
        'Component build exceeded the 10 second time limit.',
        FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
      );
    }
    if (
      result.outputFiles.reduce(
        (size, file) => size + file.contents.byteLength,
        0,
      ) > MAX_BUILD_OUTPUT_BYTES
    ) {
      throw new FrontComponentException(
        'Component build exceeds the 5 MB output limit.',
        FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
      );
    }

    return result;
  } catch (error) {
    if (timedOut) {
      throw new FrontComponentException(
        'Component build exceeded the 10 second time limit.',
        FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    await buildContext.dispose();
  }
};
