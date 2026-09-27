import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import {
  type AgentMessageEntity,
  AgentMessageRole,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { mapAiStepsToUiMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ai-steps-to-ui-message-parts.util';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/mapUIMessagePartsToDBParts';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { hasWorkflowRunThreadFields } from 'src/engine/metadata-modules/ai/ai-history/utils/has-workflow-run-thread-fields.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

// Each execution of an agent step gets its own conversation, so a loop
// iteration or a retry never reads or continues another one's messages. The
// conversation has no owner: it belongs to the run and is readable by whoever
// can read the run.
@Injectable()
export class WorkflowAgentConversationWorkspaceService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadEntity>,
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
    // Absent when the agent failed before replying; the prompt is still
    // recorded so the run shows what the agent was asked.
    executionResult?: AgentExecutionResult;
  }): Promise<string | null> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    if (!hasWorkflowRunThreadFields(flatFieldMetadataMaps)) {
      return null;
    }

    const threadId = randomUUID();

    await this.threadRepository.query(workspaceId, ({ manager, table }) =>
      manager.query(
        `INSERT INTO ${table('agentChatThread')} (id, title, "workflowRunId", "workflowStepId")
         VALUES ($1, $2, $3, $4)`,
        [threadId, title, workflowRunId, stepId],
      ),
    );

    const turnInsertResult = await this.turnRepository.insert(workspaceId, {
      threadId,
      agentId,
    });
    const turnId = turnInsertResult.identifiers[0].id as string;

    await this.insertMessage({
      workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.USER,
      agentId: null,
      senderUserWorkspaceId: initiatorUserWorkspaceId,
      parts: [{ type: 'text', text: prompt }],
    });

    const replyParts = mapAiStepsToUiMessageParts(executionResult?.steps ?? []);

    if (replyParts.length > 0) {
      await this.insertMessage({
        workspaceId,
        threadId,
        turnId,
        role: AgentMessageRole.ASSISTANT,
        agentId,
        senderUserWorkspaceId: null,
        parts: replyParts,
      });
    }

    await this.workflowRunWorkspaceService.setStepThreadId({
      stepId,
      threadId,
      workflowRunId,
      workspaceId,
    });

    return threadId;
  }

  private async insertMessage({
    workspaceId,
    threadId,
    turnId,
    role,
    agentId,
    senderUserWorkspaceId,
    parts,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    role: AgentMessageRole;
    agentId: string | null;
    senderUserWorkspaceId: string | null;
    parts: ExtendedUIMessagePart[];
  }): Promise<void> {
    const messageId = randomUUID();

    await this.messageRepository.insert(workspaceId, {
      id: messageId,
      threadId,
      turnId,
      role,
      agentId,
      processedAt: new Date(),
      ...(isDefined(senderUserWorkspaceId) ? { senderUserWorkspaceId } : {}),
    });

    const dbParts = mapUIMessagePartsToDBParts(parts, messageId, workspaceId);

    if (dbParts.length > 0) {
      await this.messagePartRepository.insert(
        workspaceId,
        dbParts as QueryDeepPartialEntity<AgentMessagePartEntity>[],
      );
    }
  }
}
