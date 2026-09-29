import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { PermissionFlagType } from 'twenty-shared/constants';
import { type AskQuestionAnswer } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type WorkflowRunThreadFields } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-workflow-run-thread.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { InputAskWorkspaceService } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

// A workflow agent's question is answered in its run's conversation, but what
// the answer resumes is the run, not a chat stream: the step is handed back to
// the executor, which continues the same conversation with the answer.
@Injectable()
export class AgentChatWorkflowQuestionService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly permissionsService: PermissionsService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly inputAskWorkspaceService: InputAskWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async answer({
    thread,
    messageId,
    answers,
    userWorkspaceId,
    workspaceId,
  }: {
    thread: AgentChatThreadWorkspaceEntity & WorkflowRunThreadFields;
    messageId: string;
    answers: AskQuestionAnswer[];
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<void> {
    const { workflowRunId } = thread;

    if (!isNonEmptyString(workflowRunId)) {
      throw new AiException(
        'This conversation does not belong to a workflow run',
        AiExceptionCode.QUESTION_NOT_PENDING,
      );
    }

    // The same permission that lets someone submit a workflow's form.
    const canAnswer =
      await this.permissionsService.userHasWorkspaceSettingPermission({
        userWorkspaceId,
        workspaceId,
        setting: PermissionFlagType.WORKFLOWS,
        applicationId: undefined,
      });

    if (!canAnswer) {
      throw new AiException(
        'Answering a workflow question requires the Workflows permission',
        AiExceptionCode.WORKFLOW_RUN_QUESTION_FORBIDDEN,
      );
    }

    // Only a claim token here: no chat stream runs for a workflow conversation.
    const claimId = randomUUID();

    const resolved = await this.agentChatService.resolvePendingQuestion({
      threadId: thread.id,
      messageId,
      answers,
      streamId: claimId,
      workspaceId,
    });

    let answerMessageId: string | undefined;
    let releasedStepId: string | undefined;
    let isNoLongerAwaited = false;
    let answeredInputAskId: string | null = null;

    try {
      const answerMessage = await this.agentChatService.addMessage({
        threadId: thread.id,
        uiMessage: {
          role: 'user',
          parts: [{ type: 'text', text: resolved.answerText }],
        },
        turnId: resolved.turnId ?? undefined,
        workspaceId,
        userWorkspaceId,
      });

      answerMessageId = answerMessage.id;

      // The Ask is answered with the release, so it reads answered only for an
      // answer the run accepted, and a run that ends before the resume cannot
      // cancel it in between.
      const release =
        await this.workflowRunWorkspaceService.releaseStepAwaitingAnswer({
          threadId: thread.id,
          workflowRunId,
          workspaceId,
          onReleased: async () => {
            answeredInputAskId =
              await this.inputAskWorkspaceService.answerPendingForThread({
                workspaceId,
                threadId: thread.id,
                response: { answers, answerText: resolved.answerText },
              });
          },
        });

      isNoLongerAwaited = release.status === 'NO_LONGER_AWAITING';

      if (release.status !== 'RELEASED') {
        throw new AiException(
          'This workflow is no longer waiting for this answer',
          AiExceptionCode.QUESTION_NOT_PENDING,
        );
      }

      releasedStepId = release.stepId;

      // Re-executing the released step is what a retry does; the step is no
      // longer awaiting a retry, so the retry path runs it without resetting
      // it. Scheduling stays inside the rollback: a released step nobody
      // schedules would leave the run waiting on an answer it already has.
      await this.messageQueueService.add<RunWorkflowJobData>(
        RUN_WORKFLOW_JOB_NAME,
        { workspaceId, workflowRunId, stepIdsToRetry: [releasedStepId] },
        buildRunWorkflowJobOptions(workflowRunId),
      );
    } catch (error) {
      if (isDefined(releasedStepId)) {
        const inputAskIdToReopen = answeredInputAskId;

        await this.workflowRunWorkspaceService.restoreStepAwaitingAnswer({
          stepId: releasedStepId,
          threadId: thread.id,
          workflowRunId,
          workspaceId,
          onRestored: async () => {
            if (isDefined(inputAskIdToReopen)) {
              await this.inputAskWorkspaceService.reopenAnswered({
                workspaceId,
                inputAskId: inputAskIdToReopen,
              });
            }
          },
        });
      }

      if (isDefined(answerMessageId)) {
        await this.messageRepository
          .delete(workspaceId, { id: answerMessageId })
          .catch(() => {});
      }

      if (isNoLongerAwaited) {
        await this.agentChatService.closePendingQuestion({
          threadId: thread.id,
          streamId: claimId,
          workspaceId,
          rollback: resolved.rollback,
        });
      } else {
        await this.agentChatService.restorePendingQuestion({
          threadId: thread.id,
          messageId,
          streamId: claimId,
          workspaceId,
          rollback: resolved.rollback,
        });
      }

      throw error;
    }

    await this.threadRepository.update(
      workspaceId,
      { id: thread.id, activeStreamId: claimId },
      { activeStreamId: null },
    );
  }
}
