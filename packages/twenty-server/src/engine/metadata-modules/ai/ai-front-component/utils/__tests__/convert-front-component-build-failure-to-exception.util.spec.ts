import { setupI18n } from '@lingui/core';

import { frontComponentBuildFailureSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-failure.schema';
import { convertFrontComponentBuildFailureToException } from 'src/engine/metadata-modules/ai/ai-front-component/utils/convert-front-component-build-failure-to-exception.util';
import { FrontComponentExceptionCode } from 'src/engine/metadata-modules/front-component/front-component.exception';

jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-build-timeout-ms.constant',
  () => ({ FRONT_COMPONENT_BUILD_TIMEOUT_MS: 17000 }),
);
jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-max-build-output-bytes.constant',
  () => ({ FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES: 9 * 1024 * 1024 }),
);

describe('convertFrontComponentBuildFailureToException', () => {
  it.each([
    [
      'INVALID_INPUT',
      'Invalid front component source.',
      'Source invalide.',
      false,
    ],
    [
      'INVALID_SETTINGS',
      'Invalid front component settings.',
      'Paramètres invalides.',
      false,
    ],
    [
      'BUILD_FAILED',
      'Failed to build front component.',
      'Compilation impossible.',
      true,
    ],
    [
      'BUILD_TIMEOUT',
      'Component build exceeded the {timeoutSeconds} second time limit.',
      'Délai de compilation dépassé.',
      true,
    ],
    [
      'OUTPUT_TOO_LARGE',
      'Component build exceeds the {maximumOutputMegabytes} MB output limit.',
      'Composant trop volumineux.',
      false,
    ],
  ] as const)(
    'localizes %s on the server while retaining its diagnostic',
    (code, message, translation, isBuildFailure) => {
      const failure = frontComponentBuildFailureSchema.parse(
        JSON.parse(
          JSON.stringify({
            success: false,
            code,
            error: 'Internal compiler diagnostic',
          }),
        ),
      );
      const exception = convertFrontComponentBuildFailureToException(failure);
      const i18n = setupI18n({
        locale: 'fr',
        messages: { fr: { [exception.userFriendlyMessage.id]: translation } },
      });

      expect(exception.message).toBe('Internal compiler diagnostic');
      expect(exception.code).toBe(
        isBuildFailure
          ? FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED
          : FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
      );
      expect(exception.userFriendlyMessage.message).toBe(message);
      expect(i18n._(exception.userFriendlyMessage)).toBe(translation);
    },
  );

  it.each([
    ['BUILD_TIMEOUT', 'timeoutSeconds', 17],
    ['OUTPUT_TOO_LARGE', 'maximumOutputMegabytes', 9],
  ] as const)(
    'interpolates the configured limit for %s',
    (code, placeholder, expectedLimit) => {
      const exception = convertFrontComponentBuildFailureToException({
        code,
        error: 'Build limit exceeded',
      });
      const i18n = setupI18n({
        locale: 'fr',
        messages: {
          fr: {
            [exception.userFriendlyMessage.id]: ['Limite : ', [placeholder]],
          },
        },
      });

      expect(i18n._(exception.userFriendlyMessage)).toBe(
        `Limite : ${expectedLimit}`,
      );
    },
  );

  it('keeps the default user-facing message for unclassified esbuild diagnostics', () => {
    const exception = convertFrontComponentBuildFailureToException({
      error: 'Build failed with 1 error: unexpected closing tag',
    });

    expect(exception.code).toBe(
      FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
    );
    expect(exception.userFriendlyMessage.message).toBe(
      'Invalid front component input.',
    );
    expect(exception.message).toContain('unexpected closing tag');
  });
});
