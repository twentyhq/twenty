import { FRONT_COMPONENT_BUILD_TIMEOUT_MS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-build-timeout-ms.constant';
import { context, type BuildOptions } from 'esbuild';
import { isDefined } from 'twenty-shared/utils';
import { msg } from '@lingui/core/macro';

import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';

import { FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-max-build-output-bytes.constant';

export const buildFrontComponentWithLimitsOrThrow = async (
  options: BuildOptions,
) => {
  try {
    const buildContext = await context({ ...options, write: false });
    let timeoutError: FrontComponentBuildException | undefined;
    const timeout = setTimeout(() => {
      timeoutError = new FrontComponentBuildException({
        message: 'Component build exceeded the 10 second time limit.',
        code: 'BUILD_FAILED',
        userFriendlyMessage: msg`Component build exceeded the 10 second time limit.`,
      });
      void buildContext.cancel();
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
        ) > FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES
      ) {
        throw new FrontComponentBuildException({
          message: 'Component build exceeds the 5 MB output limit.',
          code: 'INVALID_INPUT',
          userFriendlyMessage: msg`Component build exceeds the 5 MB output limit.`,
        });
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
  } catch (error) {
    if (error instanceof FrontComponentBuildException) {
      throw error;
    }
    throw new FrontComponentBuildException({
      message: error instanceof Error ? error.message : String(error),
      code: 'BUILD_FAILED',
    });
  }
};
