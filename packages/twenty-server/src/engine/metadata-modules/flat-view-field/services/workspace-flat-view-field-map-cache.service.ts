import { Injectable } from '@nestjs/common';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { fromViewFieldEntityToFlatViewField } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-entity-to-flat-view-field.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewFieldMaps', { packingPonderation: 32 })
export class WorkspaceFlatViewFieldMapCacheService extends FlatEntityMapCacheProvider<'viewField'> {
  override readonly fetchRequirements = {
    viewField: true,
    application: ['id', 'universalIdentifier'],
    fieldMetadata: ['id', 'universalIdentifier'],
    view: ['id', 'universalIdentifier'],
    viewFieldGroup: ['id', 'universalIdentifier'],
  } as const;

  computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatViewFieldMaps {
    const {
      viewField: viewFields,
      application: applications,
      fieldMetadata: fieldMetadatas,
      view: views,
      viewFieldGroup: viewFieldGroups,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);
    const viewFieldGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(viewFieldGroups);

    const flatViewFieldMaps = createEmptyFlatEntityMaps();

    for (const viewFieldEntity of viewFields) {
      const flatViewField = fromViewFieldEntityToFlatViewField({
        entity: viewFieldEntity,
        applicationIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
        viewIdToUniversalIdentifierMap,
        viewFieldGroupIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewField,
        flatEntityMapsToMutate: flatViewFieldMaps,
      });
    }

    return flatViewFieldMaps;
  }
}
