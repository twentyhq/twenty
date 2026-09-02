import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFrontComponentMaps } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component-maps.type';
import { fromFrontComponentEntityToFlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/utils/from-front-component-entity-to-flat-front-component.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_FRONT_COMPONENT_ROWS_REQUIREMENT = {
  frontComponent: true,
  application: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatFrontComponentMaps', { packingPonderation: 1 })
export class WorkspaceFlatFrontComponentMapCacheService extends MetadataFlatEntityMapsCacheProvider<'frontComponent'> {
  override readonly rowsRequirement = FLAT_FRONT_COMPONENT_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_FRONT_COMPONENT_ROWS_REQUIREMENT
  >): FlatFrontComponentMaps {
    const { frontComponent: frontComponents, application: applications } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatFrontComponentMaps = createEmptyFlatEntityMaps();

    for (const frontComponentEntity of frontComponents) {
      const flatFrontComponent = fromFrontComponentEntityToFlatFrontComponent({
        entity: frontComponentEntity,
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatFrontComponent,
        flatEntityMapsToMutate: flatFrontComponentMaps,
      });
    }

    return flatFrontComponentMaps;
  }
}
