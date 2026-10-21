import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { AgentChatChannelGrantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-grant.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { AGENT_CHAT_CHANNEL_THREAD_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/agent-chat-seeds.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { STANDARD_AGENT_CHAT_CHANNEL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent-chat-channel.constant';

const AGENT_CHAT_CHANNEL_SEED_NAMESPACE =
  '8f1d2c3b-4a5e-4f60-9b7a-6c5d4e3f2a10';

type ChannelConversationToSeed = {
  threadId: string;
  title: string;
  askedBy: {
    workspaceMemberId: string;
    userWorkspaceId: string;
  };
  assigneeId: string | null;
  prompt: string;
  reply: string;
};

const GENERAL_CONVERSATIONS_TO_SEED: ChannelConversationToSeed[] = [
  {
    threadId: AGENT_CHAT_CHANNEL_THREAD_DATA_SEED_IDS.GENERAL_WEEKEND_SUPPORT,
    title: 'Weekend support coverage',
    askedBy: {
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
    },
    assigneeId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
    prompt: 'Who is on call for customer support this weekend?',
    reply:
      'Jony covers Saturday and Phil covers Sunday. I added both shifts to the shared calendar.',
  },
  {
    threadId: AGENT_CHAT_CHANNEL_THREAD_DATA_SEED_IDS.GENERAL_NEW_DEALS,
    title: "This week's new deals",
    askedBy: {
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    },
    assigneeId: null,
    prompt: 'Summarize the opportunities created this week.',
    reply:
      'Four new opportunities this week, led by Airbnb and Figma. Two are already in the proposal stage.',
  },
  {
    threadId: AGENT_CHAT_CHANNEL_THREAD_DATA_SEED_IDS.GENERAL_NEWSLETTER,
    title: 'October newsletter',
    askedBy: {
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    },
    assigneeId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    prompt: 'Draft the outline of the October customer newsletter.',
    reply:
      'Here is an outline: product updates, a customer story from Stripe, upcoming webinar dates and a short survey.',
  },
];

@Injectable()
export class DevSeederAgentChatChannelWorkspaceService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly channelGrantService: AgentChatChannelGrantService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async seed({ workspaceId }: { workspaceId: string }): Promise<void> {
    if (workspaceId !== SEED_APPLE_WORKSPACE_ID) {
      return;
    }

    const { flatAgentChatChannelMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatAgentChatChannelMaps'] },
      );
    const generalChannelId =
      flatAgentChatChannelMaps.byUniversalIdentifier[
        STANDARD_AGENT_CHAT_CHANNEL.general.universalIdentifier
      ]?.id;

    if (!isDefined(generalChannelId)) {
      return;
    }

    for (const conversation of GENERAL_CONVERSATIONS_TO_SEED) {
      await this.seedConversation({
        workspaceId,
        channelId: generalChannelId,
        conversation,
      });
    }

    await this.channelGrantService.rewriteChannelGrants({
      workspaceId,
      channelId: generalChannelId,
    });
  }

  private async seedConversation({
    workspaceId,
    channelId,
    conversation,
  }: {
    workspaceId: string;
    channelId: string;
    conversation: ChannelConversationToSeed;
  }): Promise<void> {
    const seedId = (name: string) =>
      v5(`${conversation.threadId}:${name}`, AGENT_CHAT_CHANNEL_SEED_NAMESPACE);
    const { threadId } = conversation;
    const turnId = seedId('turn');

    await this.threadRepository.insert(workspaceId, {
      id: threadId,
      title: conversation.title,
      workspaceMemberId: conversation.askedBy.workspaceMemberId,
      assigneeId: conversation.assigneeId,
      channelId,
    });

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
      senderUserWorkspaceId: conversation.askedBy.userWorkspaceId,
      parts: [{ type: 'text', text: conversation.prompt }],
    });

    await this.conversationWriterService.insertMessage({
      workspaceId,
      id: seedId('replyMessage'),
      threadId,
      turnId,
      role: AgentMessageRole.ASSISTANT,
      agentId: null,
      senderUserWorkspaceId: null,
      parts: [{ type: 'text', text: conversation.reply }],
    });
  }
}
