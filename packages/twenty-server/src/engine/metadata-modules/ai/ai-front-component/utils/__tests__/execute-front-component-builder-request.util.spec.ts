import { setupI18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from 'twenty-shared/types';

import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
import { frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import { frontComponentVendorResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-vendor-result.schema';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import { buildFrontComponent } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component.util';
import { executeFrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/utils/execute-front-component-builder-request.util';
import { installAndBuildFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/install-and-build-front-component-shared-dependencies.util';

jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component.util',
);
jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/utils/install-and-build-front-component-shared-dependencies.util',
);

const REQUEST: FrontComponentBuilderRequest = {
  action: 'buildComponent',
  input: {
    componentId: 'component-id',
    name: 'Preview',
    source: 'export const Component = () => <div />;',
    query: { objectName: 'company', select: ['name'], limit: 20 },
    pageLayoutType: PageLayoutType.DASHBOARD,
  },
  manifest: { checksum: 'a'.repeat(64), exports: {} },
};

describe('executeFrontComponentBuilderRequest', () => {
  it.each([
    ['buildComponent', 'INVALID_INPUT'],
    ['buildComponent', 'BUILD_FAILED'],
    ['buildDependencies', 'INVALID_INPUT'],
    ['buildDependencies', 'BUILD_FAILED'],
  ] as const)(
    'preserves a translatable %s %s error through JSON transport and response validation',
    async (action, code) => {
      const error = new FrontComponentBuildException({
        message: 'Compiler diagnostic',
        code,
        userFriendlyMessage: msg`Failed to build front component.`,
      });
      const build =
        action === 'buildComponent'
          ? buildFrontComponent
          : installAndBuildFrontComponentSharedDependencies;
      jest.mocked(build).mockRejectedValueOnce(error);

      const response = await executeFrontComponentBuilderRequest({
        input:
          action === 'buildComponent'
            ? REQUEST
            : { action, packageJson: '{}', yarnLock: '# locked' },
        yarnEngineDirectory: '/unused',
      });
      const schema =
        action === 'buildComponent'
          ? frontComponentBuildResultSchema
          : frontComponentVendorResultSchema;
      const result = schema.parse(JSON.parse(JSON.stringify(response)));

      expect(result).toMatchObject({
        success: false,
        error: 'Compiler diagnostic',
        code,
      });
      if (result.success || !isDefined(result.userFriendlyMessage)) {
        throw new Error('Expected a translatable build failure');
      }
      const i18n = setupI18n({
        locale: 'fr',
        messages: {
          fr: {
            [result.userFriendlyMessage.id]:
              'Impossible de compiler le composant.',
          },
        },
      });

      expect(i18n._(result.userFriendlyMessage)).toBe(
        'Impossible de compiler le composant.',
      );
    },
  );

  it('preserves esbuild diagnostics for repairing the source', async () => {
    jest
      .mocked(buildFrontComponent)
      .mockRejectedValueOnce(
        new Error('Build failed with 1 error: unexpected closing tag'),
      );

    await expect(
      executeFrontComponentBuilderRequest({
        input: REQUEST,
        yarnEngineDirectory: '/unused',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Build failed with 1 error: unexpected closing tag',
    });
  });

  it('propagates unexpected execution errors', async () => {
    const error = new Error('Unexpected worker failure');
    jest.mocked(buildFrontComponent).mockRejectedValueOnce(error);

    await expect(
      executeFrontComponentBuilderRequest({
        input: REQUEST,
        yarnEngineDirectory: '/unused',
      }),
    ).rejects.toBe(error);
  });
});
