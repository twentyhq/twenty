import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { findApplicationWorkflowUpdateConflicts } from 'src/modules/workflow/application-workflow-lifecycle/utils/find-application-workflow-update-conflicts.util';
import { findChangedApplicationWorkflowDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/find-changed-application-workflow-dependencies.util';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunStopWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-stop.workspace-service';

const IN_PROGRESS_WORKFLOW_RUN_STATUSES = [
  WorkflowRunStatus.NOT_STARTED,
  WorkflowRunStatus.ENQUEUED,
  WorkflowRunStatus.RUNNING,
];

@Injectable()
export class ApplicationWorkflowLifecycleWorkspaceService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowRunStopWorkspaceService: WorkflowRunStopWorkspaceService,
  ) {}

  async assertUpdateKeepsInProgressRunsExecutable({
    workspaceId,
    applicationName,
    fromAllFlatEntityMaps,
    flatEntityOperationRecordByMetadataName,
    dryRun,
  }: {
    workspaceId: string;
    applicationName: string;
    fromAllFlatEntityMaps: Pick<
      AllFlatEntityMaps,
      'flatWorkflowMaps' | 'flatLogicFunctionMaps' | 'flatAgentMaps'
    >;
    flatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
    dryRun: boolean;
  }): Promise<void> {
    const changedDependencies = findChangedApplicationWorkflowDependencies({
      fromAllFlatEntityMaps,
      flatEntityOperationRecordByMetadataName,
      shouldBlockLogicFunctionUpdates: dryRun,
    });

    if (
      changedDependencies.removedWorkflowIds.size === 0 &&
      changedDependencies.changedLogicFunctionDescriptionById.size === 0 &&
      changedDependencies.changedAgentDescriptionById.size === 0
    ) {
      return;
    }

    const workflows = Object.values(
      fromAllFlatEntityMaps.flatWorkflowMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const inProgressWorkflowRuns = await this.findInProgressWorkflowRuns({
      workspaceId,
      coreWorkflowIds: workflows.map(({ id }) => id),
    });

    const conflicts = findApplicationWorkflowUpdateConflicts({
      inProgressWorkflowRuns: inProgressWorkflowRuns,
      workflowNameById: Object.fromEntries(
        workflows.map(({ id, name, universalIdentifier }) => [
          id,
          name ?? universalIdentifier,
        ]),
      ),
      changedDependencies,
    });

    if (conflicts.length === 0) {
      return;
    }

    const conflictDescriptions = conflicts.map(
      ({ workflowName, workflowRunCount, blockedChanges }) =>
        workflowRunCount === 1
          ? `workflow "${workflowName}" has 1 run in progress that still needs ${blockedChanges.join(' and ')}`
          : `workflow "${workflowName}" has ${workflowRunCount} runs in progress that still need ${blockedChanges.join(' and ')}`,
    );

    throw new ApplicationException(
      `Cannot update application "${applicationName}": ${conflictDescriptions.join('; ')}. Wait for these runs to finish or stop them, then try again.`,
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`Workflow runs in progress still need parts of this application that the update changes or removes. Wait for them to finish or stop them, then try again.`,
      },
    );
  }

  async stopInProgressRuns({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<void> {
    const inProgressWorkflowRuns = await this.findInProgressWorkflowRuns({
      workspaceId,
      coreWorkflowIds,
    });

    for (const { id } of inProgressWorkflowRuns) {
      await this.workflowRunStopWorkspaceService.stopWorkflowRun(
        workspaceId,
        id,
      );
    }
  }

  private async findInProgressWorkflowRuns({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<
    Pick<WorkflowRunWorkspaceEntity, 'id' | 'coreWorkflowId' | 'state'>[]
  > {
    if (coreWorkflowIds.length === 0) {
      return [];
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () =>
        this.workspaceOrmManager
          .getRepository<WorkflowRunWorkspaceEntity>('workflowRun', {
            shouldBypassPermissionChecks: true,
          })
          .find({
            where: {
              coreWorkflowId: In(coreWorkflowIds),
              status: In(IN_PROGRESS_WORKFLOW_RUN_STATUSES),
            },
            select: { id: true, coreWorkflowId: true, state: true },
          }),
      buildSystemAuthContext(workspaceId),
    );
  }
}
