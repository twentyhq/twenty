import { randomUUID } from 'node:crypto';

import { agentConversationHistoryQueryFactory } from 'test/integration/ai/utils/agent-conversation-history-query-factory.util';
import { configureChatParticipationModels } from 'test/integration/ai/utils/configure-chat-participation-models.util';
import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { sendChatMessageQueryFactory } from 'test/integration/ai/utils/send-chat-message-query-factory.util';
import { resetWorkspaceAssistantProfileQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/reset-workspace-assistant-profile-query-factory.util';
import { updateWorkspaceAssistantProfileQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/update-workspace-assistant-profile-query-factory.util';
import { workspaceAssistantProfileQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/workspace-assistant-profile-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  type AiChatAssistantProfile,
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
} from 'twenty-shared/ai';

import { type AgentMessageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message.dto';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const CUSTOM_ASSISTANT_PROFILE: AiChatAssistantProfile = {
  ...DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  displayName: 'Scout "CRM"',
  avatarColor: 'green',
  avatarFace: 'wink',
  isAvatarAnimated: false,
};

type HistoryMessage = Pick<
  AgentMessageDTO,
  | 'threadId'
  | 'turnId'
  | 'role'
  | 'agentId'
  | 'senderApplicationId'
  | 'isBuiltInAssistant'
>;

describe('Assistant personalization across settings and conversation execution', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shares saved and reset profiles while keeping reply attribution stable', async () => {
    const context = await createChatParticipationTestContext();
    const original = await makeMetadataApiRequest(
      workspaceAssistantProfileQueryFactory(),
    );

    expect(original.body.errors).toBeUndefined();

    const originalProfile: AiChatAssistantProfile =
      original.body.data.currentWorkspace.aiChatAssistantProfile;
    const threadId = context.registerThread();

    configureChatParticipationModels();

    const sendAndReadReplies = async ({
      profile,
      expectedReplyCount,
    }: {
      profile: AiChatAssistantProfile;
      expectedReplyCount: number;
    }) => {
      const sharedProfile = await makeMetadataApiRequest(
        workspaceAssistantProfileQueryFactory(),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(sharedProfile.body.errors).toBeUndefined();
      expect(
        sharedProfile.body.data.currentWorkspace.aiChatAssistantProfile,
      ).toEqual(profile);

      const sent = await makeMetadataApiRequest(
        sendChatMessageQueryFactory({
          threadId,
          messageId: randomUUID(),
          recipientWorkspaceMemberIds: [WORKSPACE_MEMBER_DATA_SEED_IDS.JONY],
        }),
      );

      expect(sent.body.errors).toBeUndefined();

      await expectEventually(async () => {
        const history = await makeMetadataApiRequest(
          agentConversationHistoryQueryFactory({ threadId }),
        );

        expect(history.body.errors).toBeUndefined();

        const messages: HistoryMessage[] = history.body.data.chatMessages;

        expect(
          messages.filter(({ role }) => role === AgentMessageRole.ASSISTANT),
        ).toHaveLength(expectedReplyCount);
      });

      await waitForAllJobsToFinish();

      const history = await makeMetadataApiRequest(
        agentConversationHistoryQueryFactory({ threadId }),
      );
      const otherMemberHistory = await makeMetadataApiRequest(
        agentConversationHistoryQueryFactory({ threadId }),
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(history.body.errors).toBeUndefined();
      expect(otherMemberHistory.body.errors).toBeUndefined();
      expect(otherMemberHistory.body.data.chatMessages).toEqual(
        history.body.data.chatMessages,
      );

      const messages: HistoryMessage[] = history.body.data.chatMessages;
      const replies = messages.filter(
        ({ role }) => role === AgentMessageRole.ASSISTANT,
      );

      for (const reply of replies) {
        expect(reply).toEqual(
          expect.objectContaining({
            threadId,
            agentId: null,
            senderApplicationId: null,
            isBuiltInAssistant: true,
          }),
        );
        expect(reply.turnId).not.toBeNull();
      }

      return replies;
    };

    try {
      const saved = await makeMetadataApiRequest(
        updateWorkspaceAssistantProfileQueryFactory({
          data: { aiChatAssistantProfile: CUSTOM_ASSISTANT_PROFILE },
        }),
      );

      expect(saved.body.errors).toBeUndefined();

      const [originalReply] = await sendAndReadReplies({
        profile: CUSTOM_ASSISTANT_PROFILE,
        expectedReplyCount: 1,
      });
      const reset = await makeMetadataApiRequest(
        resetWorkspaceAssistantProfileQueryFactory(),
      );

      expect(reset.body.errors).toBeUndefined();
      expect(reset.body.data.resetAiChatAssistantProfile).toEqual(
        DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
      );

      const [preservedReply, resetReply] = await sendAndReadReplies({
        profile: DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
        expectedReplyCount: 2,
      });

      expect(preservedReply).toEqual(originalReply);
      expect(resetReply.turnId).not.toEqual(originalReply.turnId);
    } finally {
      const restored = await makeMetadataApiRequest(
        updateWorkspaceAssistantProfileQueryFactory({
          data: { aiChatAssistantProfile: originalProfile },
        }),
      );

      await context.cleanup();
      expect(restored.body.errors).toBeUndefined();
    }
  });
});
