import { Injectable } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowDatabaseEventTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/common/types/workflow-trigger.type';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workflow-common.workspace-service';
import {
  RunWorkflowJobData,
  WorkflowRunnerJob,
} from 'src/modules/workflow/workflow-runner/workflow-runner.job';
import { WorkflowStatusWorkspaceService } from 'src/modules/workflow/workflow-status/workflow-status.workspace-service';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';

@Injectable()
export class WorkflowTriggerWorkspaceService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowStatusWorkspaceService: WorkflowStatusWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  async runWorkflowVersion(workflowVersionId: string, payload: object) {
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

    return await this.startWorkflowRun(
      workspaceId,
      workflowVersionId,
      payload,
      {
        source: FieldActorSource.MANUAL,
        name: '', // TODO: Add name
      },
    );
  }

  async enableWorkflowTrigger(workflowVersionId: string) {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersion(
        workflowVersionId,
      );

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
    const eventName = trigger?.settings?.eventName;

    if (!eventName) {
      throw new WorkflowTriggerException(
        'No event name provided in database event trigger',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER,
      );
    }

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

  async startWorkflowRun(
    workspaceId: string,
    workflowVersionId: string,
    payload: object,
    source: ActorMetadata,
  ) {
    const workflowRunId =
      await this.workflowStatusWorkspaceService.createWorkflowRun(
        workflowVersionId,
        source,
      );

    await this.messageQueueService.add<RunWorkflowJobData>(
      WorkflowRunnerJob.name,
      {
        workspaceId,
        workflowVersionId,
        payload: payload,
        workflowRunId,
      },
    );

    return { workflowRunId };
  }
}
