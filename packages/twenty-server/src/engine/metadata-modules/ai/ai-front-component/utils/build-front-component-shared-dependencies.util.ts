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
  type SharedDependenciesExportNames,
} from 'twenty-shared/front-component-build';

import { FRONT_COMPONENT_UI_IMPORTS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-ui-imports.constant';
import { type FrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-shared-dependencies.type';
import { buildFrontComponentWithLimitsOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-with-limits-or-throw.util';

export const buildFrontComponentSharedDependencies = async ({
  resolveDirectory,
}: {
  resolveDirectory: string;
}): Promise<FrontComponentSharedDependencies> => {
  const dependencies = [
    'react',
    'react-dom',
    'react-dom/client',
    'react/jsx-runtime',
    ...FRONT_COMPONENT_UI_IMPORTS,
  ];
  const buildVendor = (
    exportNamesBySpecifier: Map<string, SharedDependenciesExportNames>,
  ) =>
    buildFrontComponentWithLimitsOrThrow({
      ...getCommonFrontComponentBuildOptions(),
      stdin: {
        contents: getSharedDependenciesEntrySource(exportNamesBySpecifier),
        resolveDir: resolveDirectory,
        sourcefile: 'front-component-shared-dependencies.js',
        loader: 'js',
      },
      write: false,
      platform: 'browser',
      plugins: [createJsxRuntimeRemoteWrapperPlugin(), cssInjectionPlugin],
    });
  const probe = await buildVendor(
    new Map(
      dependencies.map((specifier) => [
        specifier,
        { namedExports: [], hasDefaultExport: false },
      ]),
    ),
  );
  const { code } = await transform(probe.outputFiles[0].text, {
    format: 'cjs',
  });
  const module: { exports: Record<string, Record<string, unknown>> } = {
    exports: {},
  };

  // Export discovery executes app dependencies inside the builder Lambda.
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

  const result = await buildVendor(exportNamesBySpecifier);
  const source = result.outputFiles[0].text;

  return {
    source,
    checksum: createHash('sha256').update(source).digest('hex'),
    exportNamesBySpecifier,
  };
};
