import { Injectable } from '@nestjs/common';

import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { AgentCallerConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-conversation.service';
import { type AgentRunConversation } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-conversation.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowRunInboxSenderWorkspaceService } from 'src/modules/workflow/workflow-executor/services/workflow-run-inbox-sender.workspace-service';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';

// A step's conversation goes to the step's recipient or else the workflow's creator
@Injectable()
export class WorkflowAgentConversationWorkspaceService {
  constructor(
    private readonly agentCallerConversationService: AgentCallerConversationService,
    private readonly workflowRunInboxSenderService: WorkflowRunInboxSenderWorkspaceService,
    private readonly workflowRunRecordShareService: WorkflowRunRecordShareService,
  ) {}

  async openConversation({
    runInfo,
    stepId,
    title,
    recipientWorkspaceMemberId,
    threadKey,
  }: {
    runInfo: WorkflowRunInfo;
    stepId: string;
    title: string;
    recipientWorkspaceMemberId: string | null;
    threadKey: string;
  }): Promise<AgentRunConversation> {
    const { workspaceId, workflowRunId } = runInfo;
    const sender =
      await this.workflowRunInboxSenderService.findRunSenderOrThrow(runInfo);

    // a workflow without a member creator, such as one an application installs, keeps a
    // conversation no inbox receives
    const fallbackRecipientWorkspaceMemberId = isDefined(
      recipientWorkspaceMemberId,
    )
      ? null
      : await this.workflowRunRecordShareService.findCreatorWorkspaceMemberId({
          workspaceId,
          coreWorkflowId: sender.workflowId,
        });

    const openedConversation =
      await this.agentCallerConversationService.openConversation({
        workspaceId,
        sender,
        title,
        threadKey,
        fallbackThreadKey: `${threadKey}:${workflowRunId}:${stepId}`,
        recipientWorkspaceMemberId,
        fallbackRecipientWorkspaceMemberId,
      });

    if (openedConversation.status === 'DELETED') {
      throw new WorkflowStepExecutorException(
        'The recipient deleted this conversation',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    return {
      threadId: openedConversation.threadId,
      isCreated: openedConversation.isCreated,
    };
  }

  async findTurnCreatedBy(runInfo: WorkflowRunInfo): Promise<ActorMetadata> {
    const sender =
      await this.workflowRunInboxSenderService.findRunSenderOrThrow(runInfo);

    return {
      source: FieldActorSource.WORKFLOW,
      name: sender.workflowName,
      workspaceMemberId: null,
      context: {},
    };
  }
}
