import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatApplicationVariableMaps } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable-maps.type';
import { fromApplicationVariableEntityToFlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/utils/from-application-variable-entity-to-flat-application-variable.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatApplicationVariableMaps', { packingPonderation: 1 })
export class WorkspaceFlatApplicationVariableMapCacheService extends FlatEntityMapCacheProvider<'applicationVariable'> {
  override readonly fetchRequirements = {
    applicationVariable: true,
    application: ['id', 'universalIdentifier', 'deletedAt'],
  } as const;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatApplicationVariableMaps {
    const {
      applicationVariable: applicationVariables,
      application: applications,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        // the previous application fetch excluded soft-deleted rows
        applications.filter((application) => !isDefined(application.deletedAt)),
      );

    const flatApplicationVariableMaps = createEmptyFlatEntityMaps();

    for (const applicationVariableEntity of applicationVariables) {
      const flatApplicationVariable =
        fromApplicationVariableEntityToFlatApplicationVariable({
          entity: applicationVariableEntity,
          applicationIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatApplicationVariable,
        flatEntityMapsToMutate: flatApplicationVariableMaps,
      });
    }

    return flatApplicationVariableMaps;
  }
}
