import { Injectable } from '@nestjs/common';

import { buildCreatedByFromWorkspaceMember } from 'src/engine/core-modules/actor/utils/build-created-by-from-workspace-member.util';
import { User } from 'src/engine/core-modules/user/user.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowDatabaseEventTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/common/types/workflow-trigger.type';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workflow-common.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-runner.workspace-service';
import { assertWorkflowVersionIsValid } from 'src/modules/workflow/workflow-trigger/utils/assert-workflow-version-is-valid';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';

@Injectable()
export class WorkflowTriggerWorkspaceService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
  ) {}

  async runWorkflowVersion(
    workflowVersionId: string,
    payload: object,
    workspaceMemberId: string,
    user: User,
  ) {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new WorkflowTriggerException(
        'No workspace id found',
        WorkflowTriggerExceptionCode.INTERNAL_ERROR,
      );
    }

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersion(
        workflowVersionId,
      );

    if (!workflowVersion) {
      throw new WorkflowTriggerException(
        'No workflow version found',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      );
    }

    return await this.workflowRunnerWorkspaceService.run(
      workspaceId,
      workflowVersionId,
      payload,
      buildCreatedByFromWorkspaceMember(workspaceMemberId, user),
    );
  }

  async enableWorkflowTrigger(workflowVersionId: string) {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersion(
        workflowVersionId,
      );

    assertWorkflowVersionIsValid(workflowVersion);

    switch (workflowVersion.trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
        await this.upsertEventListenerAndPublishVersion(
          workflowVersion.workflowId,
          workflowVersionId,
          workflowVersion.trigger,
        );
        break;
      default:
        break;
    }

    return true;
  }

  private async upsertEventListenerAndPublishVersion(
    workflowId: string,
    workflowVersionId: string,
    trigger: WorkflowDatabaseEventTrigger,
  ) {
    const eventName = trigger.settings.eventName;

    const workflowEventListenerRepository =
      await this.twentyORMManager.getRepository<WorkflowEventListenerWorkspaceEntity>(
        'workflowEventListener',
      );

    const workflowEventListener = await workflowEventListenerRepository.create({
      workflowId,
      eventName,
    });

    const workspaceDataSource = await this.twentyORMManager.getDatasource();

    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    await workspaceDataSource?.transaction(async (transactionManager) => {
      // TODO: Use upsert when available for workspace entities
      await workflowEventListenerRepository.delete(
        {
          workflowId,
          eventName,
        },
        transactionManager,
      );

      await workflowEventListenerRepository.save(
        workflowEventListener,
        {},
        transactionManager,
      );

      await workflowRepository.update(
        { id: workflowId },
        { publishedVersionId: workflowVersionId },
        transactionManager,
      );
    });
  }
}
