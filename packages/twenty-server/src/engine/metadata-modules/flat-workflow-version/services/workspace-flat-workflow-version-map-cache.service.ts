import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatWorkflowVersionMaps } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version-maps.type';
import { fromWorkflowVersionEntityToFlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/utils/from-workflow-version-entity-to-flat-workflow-version.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_WORKFLOW_VERSION_ROWS_REQUIREMENT = {
  workflowVersion: true,
  application: ['id', 'universalIdentifier', 'deletedAt'],
} as const;

@Injectable()
@WorkspaceCache('flatWorkflowVersionMaps', { packingPonderation: 1 })
export class WorkspaceFlatWorkflowVersionMapCacheService extends MetadataFlatEntityMapsCacheProvider<'workflowVersion'> {
  override readonly rowsRequirement = FLAT_WORKFLOW_VERSION_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_WORKFLOW_VERSION_ROWS_REQUIREMENT
  >): FlatWorkflowVersionMaps {
    const { workflowVersion: workflowVersions, application: applications } =
      rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        applications.filter((application) => !isDefined(application.deletedAt)),
      );

    const flatWorkflowVersionMaps = createEmptyFlatEntityMaps();

    for (const workflowVersionEntity of workflowVersions) {
      const flatWorkflowVersion =
        fromWorkflowVersionEntityToFlatWorkflowVersion({
          entity: workflowVersionEntity,
          applicationIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatWorkflowVersion,
        flatEntityMapsToMutate: flatWorkflowVersionMaps,
      });
    }

    return flatWorkflowVersionMaps;
  }
}
