import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { isDefined } from 'twenty-shared/utils';
import { FRONT_COMPONENT_BUILD_ASSETS_DIRECTORY } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-build-assets-directory.constant';
import { frontComponentSharedDependenciesManifestSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-shared-dependencies-manifest.schema';
import { type FrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-shared-dependencies.type';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

let sharedDependencies: Promise<FrontComponentSharedDependencies> | undefined;

const readSharedDependencies =
  async (): Promise<FrontComponentSharedDependencies> => {
    const [source, manifestSource] = await Promise.all([
      fs.readFile(
        join(FRONT_COMPONENT_BUILD_ASSETS_DIRECTORY, 'shared-dependencies.mjs'),
        'utf8',
      ),
      fs.readFile(
        join(
          FRONT_COMPONENT_BUILD_ASSETS_DIRECTORY,
          'shared-dependencies.json',
        ),
        'utf8',
      ),
    ]);
    const manifest = frontComponentSharedDependenciesManifestSchema.parse(
      JSON.parse(manifestSource),
    );
    if (
      createHash('sha256').update(source).digest('hex') !== manifest.checksum
    ) {
      throw new Error(
        'Shared frontend component dependencies checksum mismatch.',
      );
    }
    return {
      source,
      checksum: manifest.checksum,
      exportNamesBySpecifier: new Map(Object.entries(manifest.exports)),
    };
  };

export const getFrontComponentSharedDependencies =
  (): Promise<FrontComponentSharedDependencies> => {
    if (!isDefined(sharedDependencies)) {
      sharedDependencies = readSharedDependencies().catch((error: unknown) => {
        sharedDependencies = undefined;
        throw new FrontComponentException(
          `Unable to load the shared frontend component dependencies: ${error instanceof Error ? error.message : String(error)}`,
          FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
        );
      });
    }
    return sharedDependencies;
  };
