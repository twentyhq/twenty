import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { mapAiStepsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ai-steps-to-ui-message-parts.util';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { AGENT_CHAT_TOOL_CALL_CONVERSATION_SEEDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/agent-chat-tool-call-conversation-seeds.constant';
import { type SeededToolStep } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-step.type';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const AGENT_CHAT_TOOL_CALL_SEED_NAMESPACE =
  '8b1d6e40-3f72-4c9a-a5d8-6e0f1b2c3d47';

const buildToolStepOutcome = ({
  toolCall,
  step,
}: {
  toolCall: { toolCallId: string; toolName: string; input: unknown };
  step: Pick<SeededToolStep, 'errorText' | 'output'>;
}) => {
  if (isDefined(step.errorText)) {
    return { ...toolCall, type: 'tool-error' as const, error: step.errorText };
  }

  return { ...toolCall, type: 'tool-result' as const, output: step.output };
};

@Injectable()
export class DevSeederAgentChatToolCallWorkspaceService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
  ) {}

  async seed({ workspaceId }: { workspaceId: string }): Promise<void> {
    if (workspaceId !== SEED_APPLE_WORKSPACE_ID) {
      return;
    }

    for (const conversation of AGENT_CHAT_TOOL_CALL_CONVERSATION_SEEDS) {
      const { threadId } = conversation;
      const seedId = (name: string) =>
        v5(`${threadId}:${name}`, AGENT_CHAT_TOOL_CALL_SEED_NAMESPACE);
      const turnId = seedId('turn');

      await this.threadRepository.insert(workspaceId, {
        id: threadId,
        title: conversation.title,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      });
      await this.threadRepository.query(workspaceId, ({ manager, table }) =>
        manager.query(
          `UPDATE ${table('agentChatThread')} SET "${IS_PRIVATE_COLUMN_NAME}" = true WHERE id = $1`,
          [threadId],
        ),
      );

      await this.conversationWriterService.insertTurn({
        workspaceId,
        id: turnId,
        threadId,
        agentId: null,
        status: AgentTurnStatus.COMPLETED,
      });

      await this.conversationWriterService.insertMessage({
        workspaceId,
        id: seedId('promptMessage'),
        threadId,
        turnId,
        role: AgentMessageRole.USER,
        agentId: null,
        senderUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
        parts: [{ type: 'text', text: conversation.prompt }],
      });

      await this.conversationWriterService.insertMessage({
        workspaceId,
        id: seedId('assistantMessage'),
        threadId,
        turnId,
        role: AgentMessageRole.ASSISTANT,
        agentId: null,
        senderUserWorkspaceId: null,
        parts: mapAiStepsToUIMessageParts([
          ...conversation.steps.map((step, stepIndex) => {
            const toolCall = {
              toolCallId: `call_${seedId(`toolCall${stepIndex}`).replace(/-/g, '')}`,
              toolName: step.toolName,
              input: step.input,
            };

            return {
              content: [
                ...(isDefined(step.reasoning)
                  ? [{ type: 'reasoning' as const, text: step.reasoning }]
                  : []),
                {
                  ...toolCall,
                  type: 'tool-call' as const,
                  providerExecuted: step.providerExecuted,
                },
                buildToolStepOutcome({ toolCall, step }),
              ],
            };
          }),
          { content: [{ type: 'text' as const, text: conversation.reply }] },
        ]),
      });
    }
  }
}
