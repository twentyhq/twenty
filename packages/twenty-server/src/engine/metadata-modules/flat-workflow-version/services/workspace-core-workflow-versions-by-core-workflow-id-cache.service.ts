import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { compareFlatWorkflowVersionsByCreation } from 'src/engine/core-modules/workflow/utils/compare-flat-workflow-versions-by-creation.util';
import { computeCoreWorkflowStatusesFromFlatWorkflowVersions } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses-from-flat-workflow-versions.util';
import { type CoreWorkflowVersionsByCoreWorkflowId } from 'src/engine/metadata-modules/flat-workflow-version/types/core-workflow-versions-by-core-workflow-id.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('coreWorkflowVersionsByCoreWorkflowId')
export class WorkspaceCoreWorkflowVersionsByCoreWorkflowIdCacheService extends WorkspaceDerivedCacheProvider<
  'coreWorkflowVersionsByCoreWorkflowId',
  'flatWorkflowVersionMaps'
> {
  readonly sourceKeyName = 'flatWorkflowVersionMaps';

  protected computeFromSource(
    flatWorkflowVersionMaps: WorkspaceCacheDataMap['flatWorkflowVersionMaps'],
  ): CoreWorkflowVersionsByCoreWorkflowId {
    const flatWorkflowVersionsByCoreWorkflowId = new Map<
      string,
      FlatWorkflowVersion[]
    >();

    const flatWorkflowVersionsInCreationOrder = Object.values(
      flatWorkflowVersionMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .sort(compareFlatWorkflowVersionsByCreation);

    for (const flatWorkflowVersion of flatWorkflowVersionsInCreationOrder) {
      const { coreWorkflowId } = flatWorkflowVersion;

      if (!isDefined(coreWorkflowId)) {
        continue;
      }

      flatWorkflowVersionsByCoreWorkflowId.set(coreWorkflowId, [
        ...(flatWorkflowVersionsByCoreWorkflowId.get(coreWorkflowId) ?? []),
        flatWorkflowVersion,
      ]);
    }

    return Object.fromEntries(
      [...flatWorkflowVersionsByCoreWorkflowId].map(
        ([coreWorkflowId, flatWorkflowVersions]) => [
          coreWorkflowId,
          {
            flatWorkflowVersionsInCreationOrder: flatWorkflowVersions,
            statuses:
              computeCoreWorkflowStatusesFromFlatWorkflowVersions(
                flatWorkflowVersions,
              ),
          },
        ],
      ),
    );
  }
}
