import { createHash } from 'crypto';
import {
  collectFrontComponentTypeReferences,
  encodeFrontComponentTypeReferencesOrThrow,
  createJsxRuntimeRemoteWrapperPlugin,
  cssInjectionPlugin,
  getCommonFrontComponentBuildOptions,
  getSharedDependenciesEntrySource,
  enumerateSharedDependenciesExportNames,
  normalizeFrontComponentSharedDependencies,
} from 'twenty-shared/front-component-build';

import { AI_FRONT_COMPONENT_SHARED_DEPENDENCIES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/ai-front-component-shared-dependencies.constant';
import { type FrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-shared-dependencies.type';
import { buildFrontComponentWithLimitsOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-with-limits-or-throw.util';

export const buildFrontComponentSharedDependencies = async ({
  resolveDirectory,
  dependencies = AI_FRONT_COMPONENT_SHARED_DEPENDENCIES,
}: {
  resolveDirectory: string;
  dependencies?: string[];
}): Promise<FrontComponentSharedDependencies> => {
  const exportNamesBySpecifier = new Map(
    await Promise.all(
      normalizeFrontComponentSharedDependencies({ dependencies }).map(
        async (specifier) =>
          [
            specifier,
            await enumerateSharedDependenciesExportNames({
              appPath: resolveDirectory,
              specifier,
              build: buildFrontComponentWithLimitsOrThrow,
            }),
          ] as const,
      ),
    ),
  );
  const result = await buildFrontComponentWithLimitsOrThrow({
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
  const source = result.outputFiles[0].text;

  return {
    source,
    typeReferences: encodeFrontComponentTypeReferencesOrThrow(
      collectFrontComponentTypeReferences({
        directory: resolveDirectory,
        dependencies: [...exportNamesBySpecifier.keys()],
      }),
    ).toString('base64'),
    checksum: createHash('sha256').update(source).digest('hex'),
    exportNamesBySpecifier,
  };
};
