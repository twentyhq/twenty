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
import { getFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-shared-dependencies.util';
import { FRONT_COMPONENT_ALLOWED_IMPORTS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-allowed-imports.constant';
import { FRONT_COMPONENT_WRAPPER_NAME } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-wrapper-name.constant';
import { frontComponentQuerySchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-query.schema';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';
import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';
import { buildFrontComponentWithLimits } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-with-limits.util';
import { validateFrontComponentSource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/validate-front-component-source.util';

export const buildFrontComponent = async (
  input: FrontComponentBuildInput,
): Promise<{
  source: string;
  componentName: string;
  compiledSource: string;
  checksum: string;
  sharedDependencies: FrontComponentSharedDependencies;
}> => {
  validateFrontComponentSource(input.source);
  const source = buildFrontComponentEntrySource({
    ...input,
    query: frontComponentQuerySchema.parse(input.query),
  });
  const sharedDependencies = await getFrontComponentSharedDependencies();
  const sourceFile = join(__dirname, 'component.front-component.tsx');
  const result = await buildFrontComponentWithLimits({
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
      createSharedDependenciesShimPlugin(() => sharedDependencies),
    ],
  });
  const compiledSource = result.outputFiles[0].text;

  return {
    source,
    sharedDependencies,
    componentName: FRONT_COMPONENT_WRAPPER_NAME,
    compiledSource,
    checksum: createHash('sha256').update(compiledSource).digest('hex'),
  };
};
