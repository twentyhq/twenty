import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { type AgentInboxSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-sender.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';

// Every run carries the core workflow it was started from, which is the
// identity its conversations are attributed to.
@Injectable()
export class WorkflowRunInboxSenderWorkspaceService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
  ) {}

  async findRunSenderOrThrow({
    workflowRunId,
    workspaceId,
  }: WorkflowRunInfo): Promise<
    Extract<AgentInboxSender, { type: 'workflow' }>
  > {
    const workflowRun =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository<WorkflowRunWorkspaceEntity>('workflowRun', {
              shouldBypassPermissionChecks: true,
            })
            .findOne({
              where: { id: workflowRunId },
              select: ['id', 'coreWorkflowId'],
            }),
        buildSystemAuthContext(workspaceId),
      );

    const workflow = isDefined(workflowRun?.coreWorkflowId)
      ? await this.workflowCoreSyncService.findCoreWorkflowById(
          workspaceId,
          workflowRun.coreWorkflowId,
        )
      : null;

    if (!isDefined(workflow)) {
      throw new WorkflowStepExecutorException(
        'Workflow run has no workflow',
        WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
      );
    }

    return {
      type: 'workflow',
      workflowId: workflow.id,
      workflowName: isNonEmptyString(workflow.name)
        ? workflow.name
        : 'Untitled',
    };
  }
}
