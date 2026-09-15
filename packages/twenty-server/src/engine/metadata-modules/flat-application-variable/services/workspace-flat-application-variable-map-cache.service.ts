import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatApplicationVariableMaps } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable-maps.type';
import { fromApplicationVariableEntityToFlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/utils/from-application-variable-entity-to-flat-application-variable.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_APPLICATION_VARIABLE_ROWS_REQUIREMENT = {
  applicationVariable: true,
  application: ['id', 'universalIdentifier', 'deletedAt'],
} as const;

@Injectable()
@WorkspaceCache('flatApplicationVariableMaps', { packingPonderation: 1 })
export class WorkspaceFlatApplicationVariableMapCacheService extends MetadataFlatEntityMapsCacheProvider<'applicationVariable'> {
  override readonly rowsRequirement =
    FLAT_APPLICATION_VARIABLE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_APPLICATION_VARIABLE_ROWS_REQUIREMENT
  >): FlatApplicationVariableMaps {
    const {
      applicationVariable: applicationVariables,
      application: applications,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
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
