import { randomUUID } from 'node:crypto';

import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Chat thread owner contexts with real storage', () => {
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('returns ordered system text only to the thread owner', async () => {
    const threadId = await context.createThread();

    await context.chatService.addMessage({
      id: randomUUID(),
      threadId,
      workspaceId: context.workspaceId,
      userWorkspaceId: context.userWorkspaceId,
      turnStatus: AgentTurnStatus.COMPLETED,
      uiMessage: {
        role: AgentMessageRole.SYSTEM,
        parts: [
          { type: 'text', text: 'Company: Acme Inc' },
          { type: 'text', text: 'The user locale is French.' },
        ],
      },
    });
    await context.saveMessage({ threadId });

    await expect(
      context.chatService.getThreadContexts({
        threadId,
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
      }),
    ).resolves.toEqual(['Company: Acme Inc\n\nThe user locale is French.']);
    await expect(
      context.chatService.getThreadContexts({
        threadId,
        workspaceId: context.workspaceId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      }),
    ).resolves.toEqual([]);
  });
});
