import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatLogicFunctionMaps } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function-maps.type';
import { fromLogicFunctionEntityToFlatLogicFunction } from 'src/engine/metadata-modules/logic-function/utils/from-logic-function-entity-to-flat-logic-function.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_LOGIC_FUNCTION_ROWS_REQUIREMENT = {
  logicFunction: true,
  application: ['id', 'universalIdentifier', 'deletedAt'],
} as const;

@Injectable()
@WorkspaceCache('flatLogicFunctionMaps', { packingPonderation: 12 })
export class WorkspaceFlatLogicFunctionMapCacheService extends MetadataFlatEntityMapsCacheProvider<'logicFunction'> {
  override readonly rowsRequirement = FLAT_LOGIC_FUNCTION_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_LOGIC_FUNCTION_ROWS_REQUIREMENT
  >): FlatLogicFunctionMaps {
    const { logicFunction: logicFunctions, application: applications } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
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
