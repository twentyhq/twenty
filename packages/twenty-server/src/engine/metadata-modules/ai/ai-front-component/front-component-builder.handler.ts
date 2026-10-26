import { join } from 'path';
import { installAndBuildFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/install-and-build-front-component-shared-dependencies.util';
import { type FrontComponentBuilderInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-input.type';
import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
import { buildFrontComponent } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component.util';
import { frontComponentSharedDependenciesManifestSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-shared-dependencies-manifest.schema';

export const handler = async (event: FrontComponentBuilderInput) => {
  try {
    if (event.action === 'buildDependencies') {
      const vendor = await installAndBuildFrontComponentSharedDependencies({
        packageJson: event.packageJson,
        yarnLock: event.yarnLock,
        yarnEngineDirectory: join(__dirname, 'yarn-engine'),
      });
      return checkResponseSizeOrThrow({
        success: true as const,
        source: vendor.source,
        checksum: vendor.checksum,
        exports: Object.fromEntries(vendor.exportNamesBySpecifier),
      });
    }
    const manifest = frontComponentSharedDependenciesManifestSchema.parse(
      event.manifest,
    );
    const built = await buildFrontComponent({
      input: event.input,
      sharedDependencies: {
        checksum: manifest.checksum,
        exportNamesBySpecifier: new Map(Object.entries(manifest.exports)),
      },
    });
    const { compiledSource, checksum, sharedDependenciesChecksum } = built;
    const result = {
      success: true as const,
      compiledSource,
      checksum,
      sharedDependenciesChecksum,
    };
    return checkResponseSizeOrThrow(result);
  } catch (error) {
    if (
      !(
        (error instanceof FrontComponentBuildException &&
          error.code === 'INVALID_INPUT') ||
        (error instanceof Error &&
          /^Build failed with \d+ error/.test(error.message))
      )
    ) {
      throw error;
    }
    return {
      success: false as const,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const checkResponseSizeOrThrow = <TResult>(result: TResult): TResult => {
  if (Buffer.byteLength(JSON.stringify(result)) > 6 * 1024 * 1024) {
    throw new FrontComponentBuildException(
      'Component build exceeds the Lambda response limit.',
      'INVALID_INPUT',
    );
  }
  return result;
};
