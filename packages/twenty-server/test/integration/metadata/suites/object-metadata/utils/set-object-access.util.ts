import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  type MetadataReadability,
  type ObjectAccessInheritance,
} from 'twenty-shared/types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// Written straight to the table and pushed into the caches, like
// setObjectReadability: the metadata API refuses most levels
export const setObjectAccess = async (
  objectMetadataId: string,
  {
    readability,
    inheritance = null,
  }: {
    readability: MetadataReadability;
    inheritance?: ObjectAccessInheritance | null;
  },
) => {
  await getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity).update(
    objectMetadataId,
    { readability, inheritance },
  );

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatObjectMetadataMaps']);
};
