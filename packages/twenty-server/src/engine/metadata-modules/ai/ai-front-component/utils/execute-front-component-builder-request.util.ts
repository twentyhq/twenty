import { installAndBuildFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/install-and-build-front-component-shared-dependencies.util';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
import { buildFrontComponent } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component.util';
import { frontComponentSharedDependenciesManifestSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-shared-dependencies-manifest.schema';

export const executeFrontComponentBuilderRequest = async ({
  input,
  yarnEngineDirectory,
}: {
  input: FrontComponentBuilderRequest;
  yarnEngineDirectory: string;
}) => {
  try {
    if (input.action === 'buildDependencies') {
      const vendor = await installAndBuildFrontComponentSharedDependencies({
        packageJson: input.packageJson,
        yarnLock: input.yarnLock,
        yarnEngineDirectory,
      });
      return checkResponseSizeOrThrow({
        success: true as const,
        source: vendor.source,
        checksum: vendor.checksum,
        exports: Object.fromEntries(vendor.exportNamesBySpecifier),
      });
    }
    const manifest = frontComponentSharedDependenciesManifestSchema.parse(
      input.manifest,
    );
    const built = await buildFrontComponent({
      input: input.input,
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
        error instanceof FrontComponentBuildException ||
        (error instanceof Error &&
          /^Build failed with \d+ error/.test(error.message))
      )
    ) {
      throw error;
    }
    return {
      success: false as const,
      error: error.message,
      ...(error instanceof FrontComponentBuildException
        ? { code: error.code, userFriendlyMessage: error.userFriendlyMessage }
        : {}),
    };
  }
};

const checkResponseSizeOrThrow = <TResult>(result: TResult): TResult => {
  if (Buffer.byteLength(JSON.stringify(result)) > 6 * 1024 * 1024) {
    throw new FrontComponentBuildException({
      message: 'Component build exceeds the builder response limit.',
      code: 'INVALID_INPUT',
    });
  }
  return result;
};
