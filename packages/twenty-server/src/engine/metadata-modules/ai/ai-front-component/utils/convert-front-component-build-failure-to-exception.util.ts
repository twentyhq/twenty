import { msg } from '@lingui/core/macro';

import { FRONT_COMPONENT_BUILD_TIMEOUT_MS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-build-timeout-ms.constant';
import { FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-max-build-output-bytes.constant';
import { type FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

export const convertFrontComponentBuildFailureToException = ({
  error,
  code,
}: {
  error: string;
  code?: FrontComponentBuildException['code'];
}) =>
  new FrontComponentException(
    error,
    code === 'BUILD_FAILED' || code === 'BUILD_TIMEOUT'
      ? FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED
      : FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
    { userFriendlyMessage: getUserFriendlyMessage(code) },
  );

const getUserFriendlyMessage = (
  code?: FrontComponentBuildException['code'],
) => {
  switch (code) {
    case 'INVALID_INPUT':
      return msg`Invalid front component source.`;
    case 'INVALID_SETTINGS':
      return msg`Invalid front component settings.`;
    case 'BUILD_FAILED':
      return msg`Failed to build front component.`;
    case 'BUILD_TIMEOUT': {
      const timeoutSeconds = FRONT_COMPONENT_BUILD_TIMEOUT_MS / 1000;

      return msg`Component build exceeded the ${timeoutSeconds} second time limit.`;
    }
    case 'OUTPUT_TOO_LARGE': {
      const maximumOutputMegabytes =
        FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES / (1024 * 1024);

      return msg`Component build exceeds the ${maximumOutputMegabytes} MB output limit.`;
    }
    default:
      return undefined;
  }
};
