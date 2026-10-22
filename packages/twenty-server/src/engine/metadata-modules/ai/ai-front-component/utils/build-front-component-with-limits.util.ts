import { FRONT_COMPONENT_BUILD_TIMEOUT_MS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-build-timeout-ms.constant';
import { context, type BuildOptions } from 'esbuild';
import { isDefined } from 'twenty-shared/utils';

import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

const MAX_BUILD_OUTPUT_BYTES = 5 * 1024 * 1024;

export const buildFrontComponentWithLimits = async (options: BuildOptions) => {
  const buildContext = await context({ ...options, write: false });
  let timeoutError: FrontComponentException | undefined;
  const timeout = setTimeout(() => {
    timeoutError = new FrontComponentException(
      'Component build exceeded the 10 second time limit.',
      FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
    );
    void buildContext.cancel().catch(() => undefined);
  }, FRONT_COMPONENT_BUILD_TIMEOUT_MS);

  try {
    const result = await buildContext.rebuild();

    if (isDefined(timeoutError)) {
      throw timeoutError;
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
    if (isDefined(timeoutError)) {
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    await buildContext.dispose();
  }
};
