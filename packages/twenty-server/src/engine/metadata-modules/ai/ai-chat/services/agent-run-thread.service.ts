import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { type StepResult, type ToolSet } from 'ai';
import { randomUUID } from 'crypto';
import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionAnswer,
  type AskQuestionItem,
  type AskQuestionsToolResult,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import {
  type RunAgentMessage,
  type RunAgentMessageRole,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { IsNull, Not, Repository } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  AgentMessageEntity,
  AgentMessageRole,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type AgentRunReference = {
  workflowRunId: string;
  workflowStepId: string;
  workspaceId: string;
};

type UiTextPart = Extract<ExtendedUIMessagePart, { type: 'text' }>;

// A workflow AI agent step keeps its conversation in a chat thread: the
// prompt, what the agent did and, when it asks a person something, the
// question the run waits on.
@Injectable()
export class AgentRunThreadService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
    @InjectWorkspaceScopedRepository(AgentMessageEntity)
    private readonly messageRepository: WorkspaceScopedRepository<AgentMessageEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    @InjectWorkspaceScopedRepository(RoleTargetEntity)
    private readonly roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly agentChatService: AgentChatService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async findRunThread({
    workflowRunId,
    workflowStepId,
    workspaceId,
  }: AgentRunReference): Promise<AgentChatThreadEntity | null> {
    return this.threadRepository.findOne(workspaceId, {
      where: { workflowRunId, workflowStepId },
    });
  }

  async openRunThread({
    workflowRunId,
    workflowStepId,
    workspaceId,
    ownerUserWorkspaceId,
    title,
    prompt,
    agentId,
  }: AgentRunReference & {
    ownerUserWorkspaceId: string;
    title: string;
    prompt: string;
    agentId: string | null;
  }): Promise<AgentChatThreadEntity> {
    const thread = await this.agentChatService.createThread({
      userWorkspaceId: ownerUserWorkspaceId,
      workspaceId,
      title,
      workflowRun: { workflowRunId, workflowStepId },
    });

    // The prompt is what the run asked; it is not a message a person wrote.
    await this.agentChatService.addMessage({
      threadId: thread.id,
      uiMessage: { role: 'user', parts: [{ type: 'text', text: prompt }] },
      agentId: agentId ?? undefined,
      workspaceId,
    });

    return thread;
  }

  // The person the run conversation belongs to: whoever triggered the run
  // when there is one, otherwise a workspace admin so a paused run always
  // has someone to answer it.
  async resolveOwnerUserWorkspaceId({
    authContext,
    initiatorWorkspaceMemberId,
    workspaceId,
  }: {
    authContext: WorkspaceAuthContext;
    initiatorWorkspaceMemberId: string | null;
    workspaceId: string;
  }): Promise<string> {
    if (
      authContext.type === 'user' &&
      isNonEmptyString(authContext.userWorkspaceId)
    ) {
      return authContext.userWorkspaceId;
    }

    if (isDefined(initiatorWorkspaceMemberId)) {
      const initiatorUserWorkspaceId =
        await this.findUserWorkspaceIdOfWorkspaceMember({
          workspaceMemberId: initiatorWorkspaceMemberId,
          workspaceId,
        });

      if (isDefined(initiatorUserWorkspaceId)) {
        return initiatorUserWorkspaceId;
      }
    }

    const adminRole = await this.roleRepository.findOne(workspaceId, {
      where: { canUpdateAllSettings: true, canBeAssignedToUsers: true },
      order: { createdAt: 'ASC' },
      select: ['id'],
    });

    const adminRoleTarget = isDefined(adminRole)
      ? await this.roleTargetRepository.findOne(workspaceId, {
          where: { roleId: adminRole.id, userWorkspaceId: Not(IsNull()) },
          order: { createdAt: 'ASC' },
          select: ['userWorkspaceId'],
        })
      : null;

    if (!isDefined(adminRoleTarget?.userWorkspaceId)) {
      throw new AiException(
        'No workspace member can own the run conversation',
        AiExceptionCode.USER_WORKSPACE_ID_NOT_FOUND,
      );
    }

    return adminRoleTarget.userWorkspaceId;
  }

  // The conversation so far as the model sees it on a resumed run: text
  // only, with what the agent did and asked spelled out.
  async loadTranscript({
    threadId,
    workspaceId,
  }: {
    threadId: string;
    workspaceId: string;
  }): Promise<RunAgentMessage[]> {
    const messages = await this.messageRepository.find(workspaceId, {
      where: { threadId, isHidden: false },
      relations: ['parts'],
      order: { createdAt: 'ASC' },
    });

    return messages.flatMap((message) => {
      const role = this.toRunAgentMessageRole(message.role);

      if (!isDefined(role)) {
        return [];
      }

      const content = [...(message.parts ?? [])]
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .map((part) => this.describePart(part))
        .filter(isNonEmptyString)
        .join('\n');

      return content.length > 0 ? [{ role, content }] : [];
    });
  }

  // Everything the agent produced in one execution lands as one assistant
  // message; a question it asked leaves the thread waiting on the answer.
  async recordAssistantTurn({
    thread,
    executionResult,
    agentId,
  }: {
    thread: AgentChatThreadEntity;
    executionResult: AgentExecutionResult;
    agentId: string | null;
  }): Promise<{
    messageId: string;
    pendingQuestions: AskQuestionItem[] | null;
  }> {
    const parts = this.buildAssistantParts(executionResult);

    if (parts.length === 0) {
      parts.push({ type: 'text', text: '' });
    }

    const message = await this.agentChatService.addMessage({
      threadId: thread.id,
      uiMessage: { role: 'assistant', parts },
      agentId: agentId ?? undefined,
      workspaceId: thread.workspaceId,
    });

    const pendingQuestions = this.findPendingQuestions(executionResult);

    await this.threadRepository.update(
      thread.workspaceId,
      { id: thread.id },
      {
        pendingQuestionMessageId: isDefined(pendingQuestions)
          ? message.id
          : null,
        totalInputTokens:
          thread.totalInputTokens + (executionResult.usage.inputTokens ?? 0),
        totalOutputTokens:
          thread.totalOutputTokens + (executionResult.usage.outputTokens ?? 0),
      },
    );

    await this.agentChatService.broadcastThreadChanged({
      threadId: thread.id,
      workspaceId: thread.workspaceId,
      updatedFields: ['updatedAt'],
    });

    await this.eventPublisherService.publish({
      threadId: thread.id,
      workspaceId: thread.workspaceId,
      event: { type: 'message-persisted', messageId: message.id },
    });

    return { messageId: message.id, pendingQuestions };
  }

  // Answering the question a run waits on records the answer and puts the
  // step back in the run's queue; the agent picks the conversation up from
  // there inside the workflow job, not in a chat stream.
  async answerRunQuestion({
    thread,
    messageId,
    answers,
    userWorkspaceId,
  }: {
    thread: AgentChatThreadEntity;
    messageId: string;
    answers: AskQuestionAnswer[];
    userWorkspaceId: string;
  }): Promise<{ messageId: string }> {
    if (!isDefined(thread.workflowRunId) || !isDefined(thread.workflowStepId)) {
      throw new AiException(
        'This thread is not a workflow run conversation',
        AiExceptionCode.QUESTION_NOT_PENDING,
      );
    }

    const questionMessage = await this.messageRepository.findOne(
      thread.workspaceId,
      { where: { id: messageId, threadId: thread.id }, relations: ['parts'] },
    );

    const questions = this.findQuestionsInMessage(questionMessage);

    const claimStreamId = `workflow-run-answer:${randomUUID()}`;

    await this.assertWorkflowRunIsRunning({
      workflowRunId: thread.workflowRunId,
      workspaceId: thread.workspaceId,
    });

    const { rollback } = await this.agentChatService.resolvePendingQuestion({
      threadId: thread.id,
      messageId,
      answers,
      streamId: claimStreamId,
      workspaceId: thread.workspaceId,
    });

    // Past this point the question already reads as answered, so every failure
    // has to put it back: a question that reads answered on a run nothing ever
    // resumes is the one state nobody can get out of. The claim is held until
    // the run is on its way for the same reason — a thread with no pending
    // question and no claim is exactly what a second answer adopts as an
    // orphan, and the two would overwrite each other and post twice. Both
    // exits below release it.
    let answerMessage;

    try {
      answerMessage = await this.agentChatService.addMessage({
        threadId: thread.id,
        uiMessage: {
          role: 'user',
          parts: [
            { type: 'text', text: this.formatAnswers({ questions, answers }) },
          ],
        },
        workspaceId: thread.workspaceId,
        authorUserWorkspaceId: userWorkspaceId,
      });

      await this.eventPublisherService.publish({
        threadId: thread.id,
        workspaceId: thread.workspaceId,
        event: { type: 'question-answered' },
      });

      await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
        stepId: thread.workflowStepId,
        stepInfo: { status: StepStatus.NOT_STARTED },
        workflowRunId: thread.workflowRunId,
        workspaceId: thread.workspaceId,
      });

      await this.messageQueueService.add<RunWorkflowJobData>(
        RUN_WORKFLOW_JOB_NAME,
        {
          workspaceId: thread.workspaceId,
          workflowRunId: thread.workflowRunId,
          stepIdsToRetry: [thread.workflowStepId],
        },
        buildRunWorkflowJobOptions(thread.workflowRunId),
      );
    } catch (error) {
      await this.agentChatService.restorePendingQuestion({
        threadId: thread.id,
        messageId,
        streamId: claimStreamId,
        workspaceId: thread.workspaceId,
        rollback,
      });

      // The answer goes back with the question. Leaving it would show the
      // thread answered while the question is pending again, and the next
      // attempt would post the same answer a second time. A failure to clean
      // it up must not replace the error that caused the rollback.
      if (isDefined(answerMessage)) {
        await this.agentChatService
          .deleteMessage({
            messageId: answerMessage.id,
            workspaceId: thread.workspaceId,
          })
          .catch(() => {});
      }

      throw error;
    }

    await this.threadRepository
      .update(
        thread.workspaceId,
        { id: thread.id, activeStreamId: claimStreamId },
        { activeStreamId: null },
      )
      .catch(() => {});

    return { messageId: answerMessage.id };
  }

  // A run that has already finished, failed or been stopped has nothing left to
  // resume, and RunWorkflowJob drops the retry silently, so the answer would
  // read as accepted while the question stays open forever.
  private async assertWorkflowRunIsRunning({
    workflowRunId,
    workspaceId,
  }: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<void> {
    const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun({
      workflowRunId,
      workspaceId,
    });

    if (workflowRun?.status !== WorkflowRunStatus.RUNNING) {
      throw new AiException(
        'This workflow run is no longer waiting for an answer',
        AiExceptionCode.QUESTION_NOT_PENDING,
      );
    }
  }

  private async findUserWorkspaceIdOfWorkspaceMember({
    workspaceMemberId,
    workspaceId,
  }: {
    workspaceMemberId: string;
    workspaceId: string;
  }): Promise<string | null> {
    const workspaceMember =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository<WorkspaceMemberWorkspaceEntity>('workspaceMember', {
              shouldBypassPermissionChecks: true,
            })
            .findOne({ where: { id: workspaceMemberId } }),
        buildSystemAuthContext(workspaceId),
      );

    if (!isDefined(workspaceMember)) {
      return null;
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: workspaceMember.userId, workspaceId },
      select: ['id'],
    });

    return userWorkspace?.id ?? null;
  }

  private buildAssistantParts(
    executionResult: AgentExecutionResult,
  ): ExtendedUIMessagePart[] {
    const steps: StepResult<ToolSet>[] = executionResult.steps ?? [];

    return steps.flatMap((step) => {
      const stepParts: ExtendedUIMessagePart[] = [];

      if (isNonEmptyString(step.text.trim())) {
        const textPart: UiTextPart = { type: 'text', text: step.text };

        stepParts.push(textPart);
      }

      for (const toolCall of step.toolCalls) {
        const toolResult = step.toolResults.find(
          (candidate) => candidate.toolCallId === toolCall.toolCallId,
        );

        stepParts.push({
          type: `tool-${toolCall.toolName}`,
          toolCallId: toolCall.toolCallId,
          state: 'output-available',
          input: toolCall.input,
          output: toolResult?.output,
        } as ExtendedUIMessagePart);
      }

      return stepParts;
    });
  }

  private findPendingQuestions(
    executionResult: AgentExecutionResult,
  ): AskQuestionItem[] | null {
    if (executionResult.pausedOnToolName !== ASK_QUESTIONS_TOOL_NAME) {
      return null;
    }

    const steps = executionResult.steps ?? [];
    const lastStep = steps[steps.length - 1];
    const questionCall = lastStep?.toolCalls.find(
      (toolCall) => toolCall.toolName === ASK_QUESTIONS_TOOL_NAME,
    );
    const questions = (questionCall?.input as { questions?: AskQuestionItem[] })
      ?.questions;

    return isDefined(questions) && questions.length > 0 ? questions : null;
  }

  private findQuestionsInMessage(
    message: AgentMessageEntity | null,
  ): AskQuestionItem[] {
    const questionPart = (message?.parts ?? []).find(
      (part) => part.toolName === ASK_QUESTIONS_TOOL_NAME,
    );
    const result = (
      questionPart?.toolOutput as { result?: AskQuestionsToolResult } | null
    )?.result;

    return result?.questions ?? [];
  }

  private formatAnswers({
    questions,
    answers,
  }: {
    questions: AskQuestionItem[];
    answers: AskQuestionAnswer[];
  }): string {
    return answers
      .map((answer) => {
        const question = questions[answer.questionIndex];
        const selectedLabels = answer.selectedOptionIndices
          .map((optionIndex) => question?.options[optionIndex]?.label)
          .filter(isNonEmptyString);
        const chosen = [
          ...selectedLabels,
          ...(isNonEmptyString(answer.freeText) ? [answer.freeText] : []),
        ].join(', ');

        return isDefined(question) ? `${question.header}: ${chosen}` : chosen;
      })
      .filter(isNonEmptyString)
      .join('\n');
  }

  private describePart(part: {
    type: string;
    textContent: string | null;
    toolName: string | null;
    toolInput: unknown;
    toolOutput: unknown;
  }): string | null {
    if (part.type === 'text') {
      return part.textContent;
    }

    if (!isDefined(part.toolName)) {
      return null;
    }

    if (part.toolName === ASK_QUESTIONS_TOOL_NAME) {
      const output = part.toolOutput as {
        result?: AskQuestionsToolResult;
      } | null;
      const questions = output?.result?.questions ?? [];
      const answers =
        output?.result?.status === 'answered'
          ? (output.result.answers ?? null)
          : null;

      const askedLines = questions.map(
        (question) =>
          `Asked: ${question.question} (options: ${question.options
            .map((option) => option.label)
            .join(', ')})`,
      );

      if (!isDefined(answers)) {
        return [...askedLines, 'Waiting for the answer.'].join('\n');
      }

      return [
        ...askedLines,
        `Answered: ${this.formatAnswers({ questions, answers })}`,
      ].join('\n');
    }

    const output = JSON.stringify(part.toolOutput ?? null);

    return `Used tool ${part.toolName} with ${JSON.stringify(part.toolInput ?? {})}; result: ${output.slice(0, 500)}`;
  }

  private toRunAgentMessageRole(
    role: AgentMessageRole,
  ): RunAgentMessageRole | null {
    switch (role) {
      case AgentMessageRole.USER:
        return 'user';
      case AgentMessageRole.ASSISTANT:
        return 'assistant';
      default:
        return null;
    }
  }
}
