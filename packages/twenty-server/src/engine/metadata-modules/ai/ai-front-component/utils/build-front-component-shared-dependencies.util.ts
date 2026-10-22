import { FRONT_COMPONENT_BUILD_TIMEOUT_MS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-build-timeout-ms.constant';
import { createHash } from 'crypto';
import { transform } from 'esbuild';
import { runInNewContext } from 'vm';
import {
  createJsxRuntimeRemoteWrapperPlugin,
  cssInjectionPlugin,
  getCommonFrontComponentBuildOptions,
  getSharedDependenciesEntrySource,
  toSharedDependenciesNamespaceIdentifier,
} from 'twenty-shared/front-component-build';

import { FRONT_COMPONENT_UI_IMPORTS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-ui-imports.constant';
import { type FrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-shared-dependencies.type';
import { buildFrontComponentWithLimitsOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-with-limits-or-throw.util';

export const buildFrontComponentSharedDependencies =
  async (): Promise<FrontComponentSharedDependencies> => {
    const dependencies = [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      ...FRONT_COMPONENT_UI_IMPORTS,
    ];
    const result = await buildFrontComponentWithLimitsOrThrow({
      ...getCommonFrontComponentBuildOptions(),
      stdin: {
        contents: getSharedDependenciesEntrySource(dependencies),
        resolveDir: __dirname,
        sourcefile: 'front-component-shared-dependencies.js',
        loader: 'js',
      },
      write: false,
      platform: 'browser',
      plugins: [createJsxRuntimeRemoteWrapperPlugin(), cssInjectionPlugin],
    });
    const source = result.outputFiles[0].text;
    const { code } = await transform(source, { format: 'cjs' });
    const module: { exports: Record<string, Record<string, unknown>> } = {
      exports: {},
    };

    // Only the installed dependencies run here, never authored component code.
    runInNewContext(
      code,
      { module, exports: module.exports },
      { timeout: FRONT_COMPONENT_BUILD_TIMEOUT_MS },
    );

    const exportNamesBySpecifier = new Map(
      dependencies.map((specifier) => {
        const namespace =
          module.exports[toSharedDependenciesNamespaceIdentifier(specifier)];

        return [
          specifier,
          {
            namedExports: Object.keys(namespace)
              .filter((name) => name !== 'default')
              .sort(),
            hasDefaultExport: 'default' in namespace,
          },
        ] as const;
      }),
    );

    return {
      source,
      checksum: createHash('sha256').update(source).digest('hex'),
      exportNamesBySpecifier,
    };
  };
