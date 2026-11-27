import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEventMetadataMaps } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata-maps.type';
import { fromEventMetadataEntityToFlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/utils/from-event-metadata-entity-to-flat-event-metadata.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_EVENT_METADATA_ROWS_REQUIREMENT = {
  eventMetadata: true,
  application: ['id', 'universalIdentifier', 'deletedAt'],
} as const;

@Injectable()
@WorkspaceCache('flatEventMetadataMaps', { packingPonderation: 1 })
export class WorkspaceFlatEventMetadataMapCacheService extends MetadataFlatEntityMapsCacheProvider<'eventMetadata'> {
  override readonly rowsRequirement = FLAT_EVENT_METADATA_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_EVENT_METADATA_ROWS_REQUIREMENT
  >): FlatEventMetadataMaps {
    const { eventMetadata: eventMetadataEntities, application: applications } =
      rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        applications.filter((application) => !isDefined(application.deletedAt)),
      );

    const flatEventMetadataMaps = createEmptyFlatEntityMaps();

    for (const eventMetadataEntity of eventMetadataEntities) {
      const flatEventMetadata = fromEventMetadataEntityToFlatEventMetadata({
        entity: eventMetadataEntity,
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatEventMetadata,
        flatEntityMapsToMutate: flatEventMetadataMaps,
      });
    }

    return flatEventMetadataMaps;
  }
}
