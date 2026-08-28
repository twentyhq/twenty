import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { fromViewFieldGroupEntityToFlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/utils/from-view-field-group-entity-to-flat-view-field-group.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_VIEW_FIELD_GROUP_ROWS_REQUIREMENT = {
  viewFieldGroup: true,
  application: ['id', 'universalIdentifier'],
  view: ['id', 'universalIdentifier'],
  viewField: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['viewFieldGroupId'],
  },
} as const;

@Injectable()
@WorkspaceCache('flatViewFieldGroupMaps', { packingPonderation: 1 })
export class WorkspaceFlatViewFieldGroupMapCacheService extends MetadataFlatEntityMapsCacheProvider<'viewFieldGroup'> {
  override readonly rowsRequirement = FLAT_VIEW_FIELD_GROUP_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_VIEW_FIELD_GROUP_ROWS_REQUIREMENT
  >): FlatViewFieldGroupMaps {
    const {
      viewFieldGroup: viewFieldGroups,
      application: applications,
      view: views,
      viewField: viewFields,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);

    const flatViewFieldGroupMaps = createEmptyFlatEntityMaps();

    for (const viewFieldGroupEntity of viewFieldGroups) {
      const flatViewFieldGroup = fromViewFieldGroupEntityToFlatViewFieldGroup({
        entity: {
          ...viewFieldGroupEntity,
          viewFields:
            viewFields.byViewFieldGroupId.get(viewFieldGroupEntity.id) || [],
        },
        applicationIdToUniversalIdentifierMap,
        viewIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewFieldGroup,
        flatEntityMapsToMutate: flatViewFieldGroupMaps,
      });
    }

    return flatViewFieldGroupMaps;
  }
}
