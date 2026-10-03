import { Injectable } from '@nestjs/common';

import {
  type ExtendedUIMessagePart,
  REQUEST_FORM_TOOL_NAME,
  type RequestFormToolInput,
} from 'twenty-shared/ai';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { buildRequestFormPendingOutput } from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type RecordableAgentExecution } from 'src/engine/metadata-modules/ai/ai-history/types/recordable-agent-execution.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

export type RecordedConversation = {
  threadId: string;
  isAwaitingAnswer: boolean;
};

// One conversation per execution, so a loop iteration or retry never reads or continues another's messages.
// It has no owner: it belongs to the run and is readable by whoever can read the run.
@Injectable()
export class WorkflowAgentConversationWorkspaceService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
  ) {}

  async recordExecution({
    workspaceId,
    workflowRunId,
    stepId,
    title,
    agentId,
    prompt,
    initiatorUserWorkspaceId,
    executionResult,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    title: string;
    agentId: string | null;
    prompt: string;
    initiatorUserWorkspaceId: string | null;
    executionResult: RecordableAgentExecution;
  }): Promise<RecordedConversation> {
    const { threadId, turnId } = await this.openConversation({
      workspaceId,
      workflowRunId,
      stepId,
      title,
      agentId,
    });

    await this.conversationWriterService.insertMessage({
      workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.USER,
      agentId: null,
      senderUserWorkspaceId: initiatorUserWorkspaceId,
      parts: [{ type: 'text', text: prompt }],
    });

    const { isAwaitingAnswer } =
      await this.conversationWriterService.insertExecutionReply({
        workspaceId,
        threadId,
        turnId,
        agentId,
        execution: executionResult,
      });

    return { threadId, isAwaitingAnswer };
  }

  // A form step is answered like any call that waits on a person
  async recordFormRequest({
    workspaceId,
    workflowRunId,
    stepId,
    title,
    fields,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    title: string;
    fields: RequestFormToolInput['fields'];
  }): Promise<void> {
    const { threadId, turnId } = await this.openConversation({
      workspaceId,
      workflowRunId,
      stepId,
      title,
      agentId: null,
    });

    await this.conversationWriterService.insertMessage({
      workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.ASSISTANT,
      agentId: null,
      senderUserWorkspaceId: null,
      isAwaitingAnswer: true,
      parts: [
        {
          type: `tool-${REQUEST_FORM_TOOL_NAME}`,
          toolCallId: stepId,
          state: 'output-available',
          input: { fields },
          output: buildRequestFormPendingOutput(),
        } as ExtendedUIMessagePart,
      ],
    });
  }

  // The answer is already the last message, so only the agent's reply is added
  async recordContinuation({
    workspaceId,
    threadId,
    agentId,
    executionResult,
  }: {
    workspaceId: string;
    threadId: string;
    agentId: string | null;
    executionResult: RecordableAgentExecution;
  }): Promise<RecordedConversation> {
    const turnId = await this.conversationWriterService.insertTurn({
      workspaceId,
      threadId,
      agentId,
    });

    const { isAwaitingAnswer } =
      await this.conversationWriterService.insertExecutionReply({
        workspaceId,
        threadId,
        turnId,
        agentId,
        execution: executionResult,
      });

    return { threadId, isAwaitingAnswer };
  }

  private async openConversation({
    workspaceId,
    workflowRunId,
    stepId,
    title,
    agentId,
  }: {
    workspaceId: string;
    workflowRunId: string;
    stepId: string;
    title: string;
    agentId: string | null;
  }): Promise<{ threadId: string; turnId: string }> {
    const threadInsertResult = await this.threadRepository.insert(workspaceId, {
      title,
      workflowRunId,
    });
    const threadId = threadInsertResult.identifiers[0].id as string;

    const turnId = await this.conversationWriterService.insertTurn({
      workspaceId,
      threadId,
      agentId,
    });

    await this.workflowRunWorkspaceService.setStepThreadId({
      stepId,
      threadId,
      workflowRunId,
      workspaceId,
    });

    return { threadId, turnId };
  }
}
