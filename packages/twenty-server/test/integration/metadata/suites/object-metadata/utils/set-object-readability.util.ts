import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { type MetadataReadability } from 'twenty-shared/types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// Written straight to the table and pushed into the caches: the metadata API
// refuses most levels, and an update through it would leave an override behind
export const setObjectReadability = async (
  objectMetadataId: string,
  readability: MetadataReadability,
) => {
  await getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity).update(
    objectMetadataId,
    { readability },
  );

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatObjectMetadataMaps']);
};
