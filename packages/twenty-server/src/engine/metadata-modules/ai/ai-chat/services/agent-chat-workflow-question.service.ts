import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { PermissionFlagType } from 'twenty-shared/constants';
import { type AskQuestionAnswer } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AiChatFileAttachment } from 'src/engine/metadata-modules/ai/ai-chat/types/ai-chat-file-attachment.type';
import { hasQuestionAnswerContent } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-question-answer-content.util';
import { type WorkflowRunThreadFields } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-workflow-run-thread.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

// A workflow agent's question is answered in its run's conversation, but what
// the answer resumes is the run, not a chat stream: this records the answer in
// the conversation and hands the step back to the workflow runner, which
// continues the same conversation with it.
@Injectable()
export class AgentChatWorkflowQuestionService {
  constructor(
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly permissionsService: PermissionsService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
  ) {}

  async answer({
    thread,
    messageId,
    answers,
    fileAttachments,
    userWorkspaceId,
    workspaceId,
  }: {
    thread: AgentChatThreadWorkspaceEntity & WorkflowRunThreadFields;
    messageId: string;
    answers: AskQuestionAnswer[];
    fileAttachments?: AiChatFileAttachment[];
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

    // Only the answer's text is recorded for the resumed agent, so an
    // attachment would be dropped without the agent ever seeing it.
    if (isNonEmptyArray(fileAttachments)) {
      throw new AiException(
        'A workflow agent question cannot be answered with attachments',
        AiExceptionCode.INVALID_QUESTION_ANSWER,
      );
    }

    if (!hasQuestionAnswerContent(answers)) {
      throw new AiException(
        'Provide an answer',
        AiExceptionCode.INVALID_QUESTION_ANSWER,
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

    // No chat stream continues a workflow conversation, so its question is
    // claimed by its marker alone and nothing is left holding the thread.
    const resolved = await this.agentChatService.resolvePendingQuestion({
      threadId: thread.id,
      messageId,
      answers,
      streamId: null,
      workspaceId,
    });

    let answerMessageId: string | undefined;
    let isNoLongerAwaited = false;

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

      const stepAwaitingAnswer =
        await this.workflowRunnerWorkspaceService.resumeAgentStepWithAnswer({
          threadId: thread.id,
          workflowRunId,
          workspaceId,
        });

      isNoLongerAwaited = stepAwaitingAnswer.status === 'NO_LONGER_AWAITING';

      if (stepAwaitingAnswer.status !== 'AWAITING_ANSWER') {
        throw new AiException(
          'This workflow is no longer waiting for this answer',
          AiExceptionCode.QUESTION_NOT_PENDING,
        );
      }
    } catch (error) {
      if (isDefined(answerMessageId)) {
        await this.messageRepository
          .delete(workspaceId, { id: answerMessageId })
          .catch(() => {});
      }

      if (isNoLongerAwaited) {
        await this.agentChatService.closePendingQuestion({
          workspaceId,
          rollback: resolved.rollback,
        });
      } else {
        await this.agentChatService.restorePendingQuestion({
          threadId: thread.id,
          messageId,
          streamId: null,
          workspaceId,
          rollback: resolved.rollback,
        });
      }

      throw error;
    }
  }
}
