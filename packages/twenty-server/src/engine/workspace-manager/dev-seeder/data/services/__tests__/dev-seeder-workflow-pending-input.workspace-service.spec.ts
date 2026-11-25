import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentChatActorService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-actor.service';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { DevSeederWorkflowPendingInputWorkspaceService } from 'src/engine/workspace-manager/dev-seeder/data/services/dev-seeder-workflow-pending-input.workspace-service';

type StoredMessage = Pick<
  AgentMessageWorkspaceEntity,
  | 'id'
  | 'threadId'
  | 'turnId'
  | 'role'
  | 'senderWorkspaceMemberId'
  | 'senderApplicationId'
>;

describe('seeded workflow pending input', () => {
  it.each([
    {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      timUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      philUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
    },
    {
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      timUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM_ACME,
      philUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL_ACME,
    },
  ])(
    'preserves the initiators so pending requests can be answered in $workspaceId',
    async ({ workspaceId, timUserWorkspaceId, philUserWorkspaceId }) => {
      const messages: StoredMessage[] = [];
      const userWorkspaceIdByMemberId: Record<string, string> = {
        [WORKSPACE_MEMBER_DATA_SEED_IDS.TIM]: timUserWorkspaceId,
        [WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL]: philUserWorkspaceId,
      };
      const userAuthContextService = {
        resolveWorkspaceMember: jest.fn(
          async (args: { workspaceId: string; workspaceMemberId: string }) => {
            expect(args.workspaceId).toBe(workspaceId);
            expect(userWorkspaceIdByMemberId).toHaveProperty(
              args.workspaceMemberId,
            );

            return {
              userWorkspaceId:
                userWorkspaceIdByMemberId[args.workspaceMemberId],
            };
          },
        ),
      };
      const scope = {
        insert: jest.fn<
          ReturnType<AgentHistoryTransactionScope['insert']>,
          Parameters<AgentHistoryTransactionScope['insert']>
        >(async ({ name, values }) => {
          if (name === 'agentMessage') {
            messages.push({
              senderWorkspaceMemberId: null,
              senderApplicationId: null,
              ...values,
            } as StoredMessage);
          }
        }),
        update: jest.fn().mockResolvedValue(1),
      };
      const writer = new AgentConversationWriterService(
        {
          run: async ({
            work,
          }: {
            work: (scope: AgentHistoryTransactionScope) => Promise<unknown>;
          }) => work(scope as never),
        } as never,
        {
          getOrRecompute: jest.fn().mockResolvedValue({
            flatWorkspaceMemberMaps: {
              idByUserWorkspaceId: {
                [timUserWorkspaceId]: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
                [philUserWorkspaceId]: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
              },
            },
          }),
        } as never,
      );
      const conversationService = new AgentRunConversationService(
        {} as never,
        writer,
        {} as never,
      );
      const seeder = new DevSeederWorkflowPendingInputWorkspaceService(
        {
          createCoreWorkflowRun: jest.fn(),
          startWorkflowRun: jest.fn(),
          updateWorkflowRunStepInfo: jest.fn(),
        } as never,
        {
          openConversation: async ({ threadKey }: { threadKey: string }) => ({
            threadId: threadKey,
          }),
          findTurnCreatedBy: jest.fn(),
        } as never,
        conversationService,
        { suspend: jest.fn() } as never,
        writer,
        { recordThreadActivity: jest.fn() } as never,
        {
          createOneAgent: jest.fn().mockResolvedValue({ id: 'agent-id' }),
        } as never,
        { insert: jest.fn() } as never,
        { insert: jest.fn() } as never,
        userAuthContextService as never,
      );

      await seeder.seed({ workspaceId, applicationId: 'application-id' });

      const actorService = new AgentChatActorService(
        {
          findOne: async (
            _workspaceId: string,
            { where }: { where: Partial<StoredMessage> },
          ) =>
            messages.find((message) =>
              Object.entries(where).every(
                ([key, value]) => message[key as keyof StoredMessage] === value,
              ),
            ) ?? null,
        } as never,
        {} as never,
        {} as never,
        userAuthContextService as never,
        {} as never,
        {} as never,
      );
      const assistantMessages = messages.filter(
        ({ role }) => role === AgentMessageRole.ASSISTANT,
      );

      expect(assistantMessages).toHaveLength(2);

      for (const message of assistantMessages) {
        await expect(
          withWorkspaceAuthContext(
            { type: 'user', workspace: { id: workspaceId } } as never,
            () =>
              actorService.authorizeToolCallResolution({
                workspaceId,
                threadId: message.threadId,
                messageId: message.id,
              }),
          ),
        ).resolves.toBeUndefined();
      }

      expect(
        messages
          .filter(({ role }) => role === AgentMessageRole.USER)
          .map(({ senderWorkspaceMemberId }) => senderWorkspaceMemberId),
      ).toEqual([
        WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
        WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
      ]);
    },
  );
});
