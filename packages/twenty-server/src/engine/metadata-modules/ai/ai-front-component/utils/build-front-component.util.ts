import { PageLayoutType } from 'twenty-shared/types';
import { createHash } from 'crypto';
import { dirname, join } from 'path';
import {
  createSharedDependenciesShimPlugin,
  getCommonFrontComponentBuildOptions,
  unwrapDefineFrontComponentToDirectExport,
} from 'twenty-shared/front-component-build';

import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';

import { type FrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-shared-dependencies.type';
import { FRONT_COMPONENT_SHARED_DEPENDENCIES_BANNER_PREFIX } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-shared-dependencies-banner-prefix.constant';
import { FRONT_COMPONENT_ALLOWED_IMPORTS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-allowed-imports.constant';
import { FRONT_COMPONENT_WRAPPER_NAME } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-wrapper-name.constant';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';
import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';
import { buildFrontComponentWithLimitsOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-with-limits-or-throw.util';
import { validateFrontComponentSourceOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/validate-front-component-source-or-throw.util';

export const buildFrontComponent = async ({
  input,
  sharedDependencies,
}: {
  input: FrontComponentBuildInput;
  sharedDependencies: Pick<
    FrontComponentSharedDependencies,
    'checksum' | 'exportNamesBySpecifier'
  >;
}): Promise<{
  source: string;
  componentName: string;
  compiledSource: string;
  checksum: string;
  sharedDependenciesChecksum: string;
}> => {
  validateFrontComponentSourceOrThrow(input.source);
  const source = buildFrontComponentEntrySource(input);
  const sourceFile = join(__dirname, 'component.front-component.tsx');
  const result = await buildFrontComponentWithLimitsOrThrow({
    ...getCommonFrontComponentBuildOptions(),
    stdin: {
      contents: unwrapDefineFrontComponentToDirectExport(source),
      sourcefile: sourceFile,
      resolveDir: dirname(sourceFile),
      loader: 'tsx',
    },
    write: false,
    platform: 'browser',
    external: [FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER],
    banner: {
      js:
        FRONT_COMPONENT_SHARED_DEPENDENCIES_BANNER_PREFIX +
        sharedDependencies.checksum,
    },
    plugins: [
      {
        name: 'front-component-imports',
        setup(build) {
          build.onResolve({ filter: /.*/ }, ({ path, importer, kind }) => {
            if (
              importer !== sourceFile ||
              [
                ...FRONT_COMPONENT_ALLOWED_IMPORTS,
                ...(kind === 'import-statement'
                  ? ['react-dom/client', 'twenty-shared/types']
                  : []),
              ].includes(path)
            ) {
              return;
            }
            return {
              errors: [
                {
                  text: `Unsupported import: ${path}. Use React and the supported twenty-ui imports.`,
                },
              ],
            };
          });
        },
      },
      {
        name: 'front-component-page-layout',
        setup(build) {
          build.onResolve({ filter: /^twenty-shared\/types$/ }, ({ kind }) =>
            kind === 'import-statement'
              ? { path: 'page-layout', namespace: 'page-layout' }
              : undefined,
          );
          build.onLoad({ filter: /.*/, namespace: 'page-layout' }, () => ({
            contents: `export const PageLayoutType = ${JSON.stringify(PageLayoutType)};`,
            loader: 'js',
          }));
        },
      },
      createSharedDependenciesShimPlugin({
        getSharedDependenciesBuildContext: () => sharedDependencies,
      }),
    ],
  });
  const compiledSource = result.outputFiles[0].text;

  return {
    source,
    sharedDependenciesChecksum: sharedDependencies.checksum,
    componentName: FRONT_COMPONENT_WRAPPER_NAME,
    compiledSource,
    checksum: createHash('sha256').update(compiledSource).digest('hex'),
  };
};
