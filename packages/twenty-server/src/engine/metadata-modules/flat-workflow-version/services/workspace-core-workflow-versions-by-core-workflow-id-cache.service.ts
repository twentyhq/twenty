import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';
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
      .sort((firstFlatWorkflowVersion, secondFlatWorkflowVersion) =>
        this.compareByCreation(
          firstFlatWorkflowVersion,
          secondFlatWorkflowVersion,
        ),
      );

    for (const flatWorkflowVersion of flatWorkflowVersionsInCreationOrder) {
      const { coreWorkflowId } = flatWorkflowVersion;

      if (!isDefined(coreWorkflowId)) {
        continue;
      }

      const flatWorkflowVersions =
        flatWorkflowVersionsByCoreWorkflowId.get(coreWorkflowId) ?? [];

      flatWorkflowVersions.push(flatWorkflowVersion);
      flatWorkflowVersionsByCoreWorkflowId.set(
        coreWorkflowId,
        flatWorkflowVersions,
      );
    }

    return Object.fromEntries(
      [...flatWorkflowVersionsByCoreWorkflowId].map(
        ([coreWorkflowId, flatWorkflowVersions]) => [
          coreWorkflowId,
          {
            flatWorkflowVersionsInCreationOrder: flatWorkflowVersions,
            statuses: this.computeStatuses(flatWorkflowVersions),
          },
        ],
      ),
    );
  }

  private compareByCreation(
    firstFlatWorkflowVersion: Pick<FlatWorkflowVersion, 'createdAt' | 'id'>,
    secondFlatWorkflowVersion: Pick<FlatWorkflowVersion, 'createdAt' | 'id'>,
  ): number {
    return (
      Date.parse(firstFlatWorkflowVersion.createdAt) -
        Date.parse(secondFlatWorkflowVersion.createdAt) ||
      firstFlatWorkflowVersion.id.localeCompare(secondFlatWorkflowVersion.id)
    );
  }

  private computeStatuses(
    flatWorkflowVersions: Pick<FlatWorkflowVersion, 'status'>[],
  ): WorkflowStatus[] {
    const hasVersionWithStatus = (status: WorkflowVersionStatus) =>
      flatWorkflowVersions.some(
        (flatWorkflowVersion) => flatWorkflowVersion.status === status,
      );

    return computeCoreWorkflowStatuses({
      hasDraftVersion: hasVersionWithStatus(WorkflowVersionStatus.DRAFT),
      hasActiveVersion: hasVersionWithStatus(WorkflowVersionStatus.ACTIVE),
      hasDeactivatedVersion: hasVersionWithStatus(
        WorkflowVersionStatus.DEACTIVATED,
      ),
    });
  }
}
