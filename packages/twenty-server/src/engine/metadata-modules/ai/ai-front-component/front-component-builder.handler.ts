import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { buildFrontComponent } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component.util';
import { frontComponentSharedDependenciesManifestSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-shared-dependencies-manifest.schema';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';

export const handler = async (input: FrontComponentBuildInput) => {
  const manifest = frontComponentSharedDependenciesManifestSchema.parse(
    JSON.parse(
      await readFile(join(__dirname, 'shared-dependencies.json'), 'utf8'),
    ),
  );
  try {
    const built = await buildFrontComponent({
      input,
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
    if (Buffer.byteLength(JSON.stringify(result)) > 6 * 1024 * 1024) {
      throw new FrontComponentBuildException(
        'Component build exceeds the Lambda response limit.',
        'INVALID_INPUT',
      );
    }
    return result;
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
