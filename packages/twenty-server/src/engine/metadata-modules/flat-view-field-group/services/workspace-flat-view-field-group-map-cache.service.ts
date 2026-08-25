import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { fromViewFieldGroupEntityToFlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/utils/from-view-field-group-entity-to-flat-view-field-group.util';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewFieldGroupMaps', { packingPonderation: 1 })
export class WorkspaceFlatViewFieldGroupMapCacheService extends WorkspaceCacheProvider<FlatViewFieldGroupMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(ViewFieldGroupEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ViewEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ViewFieldEntity, [
      'id',
      'universalIdentifier',
      'viewFieldGroupId',
    ]),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatViewFieldGroupMaps {
    const viewFieldGroups = recomputeContext.getRows(ViewFieldGroupEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);
    const views = recomputeContext.getRows(ViewEntity);
    const viewFields = recomputeContext.getRows(ViewFieldEntity);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);

    const viewFieldsByViewFieldGroupId =
      regroupEntitiesByRelatedEntityId<'viewField'>({
        entities: viewFields,
        foreignKey: 'viewFieldGroupId',
      });

    const flatViewFieldGroupMaps = createEmptyFlatEntityMaps();

    for (const viewFieldGroupEntity of viewFieldGroups) {
      const flatViewFieldGroup = fromViewFieldGroupEntityToFlatViewFieldGroup({
        entity: {
          ...viewFieldGroupEntity,
          viewFields:
            viewFieldsByViewFieldGroupId.get(viewFieldGroupEntity.id) || [],
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
