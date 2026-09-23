import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatWorkflowMaps } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow-maps.type';
import { fromWorkflowEntityToFlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/utils/from-workflow-entity-to-flat-workflow.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_WORKFLOW_ROWS_REQUIREMENT = {
  workflow: true,
  application: ['id', 'universalIdentifier', 'deletedAt'],
} as const;

@Injectable()
@WorkspaceCache('flatWorkflowMaps', { packingPonderation: 1 })
export class WorkspaceFlatWorkflowMapCacheService extends MetadataFlatEntityMapsCacheProvider<'workflow'> {
  override readonly rowsRequirement = FLAT_WORKFLOW_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_WORKFLOW_ROWS_REQUIREMENT
  >): FlatWorkflowMaps {
    const { workflow: workflows, application: applications } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        applications.filter((application) => !isDefined(application.deletedAt)),
      );

    const flatWorkflowMaps = createEmptyFlatEntityMaps();

    for (const workflowEntity of workflows) {
      const flatWorkflow = fromWorkflowEntityToFlatWorkflow({
        entity: workflowEntity,
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatWorkflow,
        flatEntityMapsToMutate: flatWorkflowMaps,
      });
    }

    return flatWorkflowMaps;
  }
}
