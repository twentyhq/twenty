import { CustomError } from 'twenty-shared/utils';
import { FRONT_COMPONENT_BUILDER_MAX_PAYLOAD_BYTES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-builder-max-payload-bytes.constant';
import { PageLayoutType } from 'twenty-shared/types';

import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
import { frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import { frontComponentDependenciesBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-dependencies-build-result.schema';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import { buildFrontComponent } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component.util';
import { executeFrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/utils/execute-front-component-builder-request.util';
import { installAndBuildFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/install-and-build-front-component-shared-dependencies.util';

jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/utils/validate-front-component-types-or-throw.util',
);
jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component.util',
);
jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/utils/install-and-build-front-component-shared-dependencies.util',
);

const REQUEST: FrontComponentBuilderRequest = {
  action: 'transpile',
  typeReferences: '',
  input: {
    componentId: 'component-id',
    name: 'Preview',
    source: 'export const Component = () => <div />;',
    pageLayoutType: PageLayoutType.DASHBOARD,
  },
  manifest: { checksum: 'a'.repeat(64), exports: {} },
};

describe('executeFrontComponentBuilderRequest', () => {
  it.each([
    ['transpile', 'INVALID_INPUT'],
    ['transpile', 'BUILD_FAILED'],
    ['transpile', 'INVALID_SETTINGS'],
    ['transpile', 'BUILD_TIMEOUT'],
    ['transpile', 'OUTPUT_TOO_LARGE'],
    ['buildDependencies', 'INVALID_INPUT'],
    ['buildDependencies', 'BUILD_FAILED'],
    ['buildDependencies', 'BUILD_TIMEOUT'],
    ['buildDependencies', 'OUTPUT_TOO_LARGE'],
  ] as const)(
    'preserves the %s %s code and diagnostic through JSON transport and response validation',
    async (action, code) => {
      const error = new FrontComponentBuildException({
        message: 'Compiler diagnostic',
        code,
      });
      const build =
        action === 'transpile'
          ? buildFrontComponent
          : installAndBuildFrontComponentSharedDependencies;
      jest.mocked(build).mockRejectedValueOnce(error);

      const response = await executeFrontComponentBuilderRequest({
        input:
          action === 'transpile'
            ? REQUEST
            : { action, packageJson: '{}', yarnLock: '# locked' },
        yarnEngineDirectory: '/unused',
      });
      const schema =
        action === 'transpile'
          ? frontComponentBuildResultSchema
          : frontComponentDependenciesBuildResultSchema;
      const result = schema.parse(JSON.parse(JSON.stringify(response)));

      expect(response).toEqual({
        success: false,
        error: 'Compiler diagnostic',
        code,
      });
      expect(result).toEqual(response);
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

  it('budgets type references within the dependency response limit', async () => {
    jest
      .mocked(installAndBuildFrontComponentSharedDependencies)
      .mockResolvedValueOnce({
        source: 'bundle',
        checksum: 'checksum',
        exportNamesBySpecifier: new Map(),
        typeReferences: 'x'.repeat(FRONT_COMPONENT_BUILDER_MAX_PAYLOAD_BYTES),
      });
    await expect(
      executeFrontComponentBuilderRequest({
        input: {
          action: 'buildDependencies',
          packageJson: '{}',
          yarnLock: '# lock',
        },
        yarnEngineDirectory: '/unused',
      }),
    ).resolves.toMatchObject({
      success: false,
      code: 'INVALID_INPUT',
      error: expect.stringContaining(
        'type references exceed the remaining builder response budget',
      ),
    });
  });

  it('returns oversized type reference errors through the builder protocol', async () => {
    jest
      .mocked(installAndBuildFrontComponentSharedDependencies)
      .mockRejectedValueOnce(
        new CustomError('Type references exceed 32 MiB', 'OUTPUT_TOO_LARGE'),
      );
    await expect(
      executeFrontComponentBuilderRequest({
        input: {
          action: 'buildDependencies',
          packageJson: '{}',
          yarnLock: '# lock',
        },
        yarnEngineDirectory: '/unused',
      }),
    ).resolves.toEqual({
      success: false,
      code: 'OUTPUT_TOO_LARGE',
      error: 'Type references exceed 32 MiB',
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
