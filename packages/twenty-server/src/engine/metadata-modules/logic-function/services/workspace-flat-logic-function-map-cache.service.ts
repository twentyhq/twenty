import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { fromLogicFunctionEntityToFlatLogicFunction } from 'src/engine/metadata-modules/logic-function/utils/from-logic-function-entity-to-flat-logic-function.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatLogicFunctionMaps', { packingPonderation: 12 })
export class WorkspaceFlatLogicFunctionMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatLogicFunction>
> {
  override readonly fetchRequirements = [
    entityFetchRequirement(LogicFunctionEntity),
    entityFetchRequirement(ApplicationEntity, [
      'id',
      'universalIdentifier',
      'deletedAt',
    ]),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatEntityMaps<FlatLogicFunction> {
    const logicFunctions = recomputeContext.getRows(LogicFunctionEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        // the previous application fetch excluded soft-deleted rows
        applications.filter((application) => !isDefined(application.deletedAt)),
      );

    const flatLogicFunctionMaps = createEmptyFlatEntityMaps();

    for (const logicFunctionEntity of logicFunctions) {
      const flatLogicFunction = fromLogicFunctionEntityToFlatLogicFunction({
        entity: logicFunctionEntity,
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatLogicFunction,
        flatEntityMapsToMutate: flatLogicFunctionMaps,
      });
    }

    return flatLogicFunctionMaps;
  }
}
