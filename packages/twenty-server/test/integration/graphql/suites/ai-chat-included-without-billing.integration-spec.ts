import { randomUUID } from 'node:crypto';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { gql } from 'graphql-tag';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const isBillingEnabled = process.env.IS_BILLING_ENABLED === 'true';

const SEND_CHAT_MESSAGE = gql`
  mutation SendChatMessage(
    $threadId: UUID!
    $text: String!
    $messageId: UUID!
  ) {
    sendChatMessage(threadId: $threadId, text: $text, messageId: $messageId) {
      queued
      isIncluded
    }
  }
`;

(isBillingEnabled ? describe.skip : describe)('AI chat without billing', () => {
  const threadId = randomUUID();
  const spies: jest.SpyInstance[] = [];

  beforeAll(async () => {
    const aiModelRegistryService =
      getAppProviderByClassName<AiModelRegistryService>(
        'AiModelRegistryService',
      );

    // No provider key is configured in tests, so availability is stubbed
    spies.push(
      jest
        .spyOn(aiModelRegistryService, 'getModel')
        .mockImplementation((modelId: string) => ({ modelId }) as never),
      jest
        .spyOn(aiModelRegistryService, 'getAvailableModels')
        .mockReturnValue([{ modelId: 'test-model' }] as never),
      jest
        .spyOn(
          global.app.get<MessageQueueService>(
            getQueueToken(MessageQueue.aiStreamQueue),
          ),
          'add',
        )
        .mockResolvedValue(undefined as never),
    );

    await getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).createThread({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      id: threadId,
      title: 'Chat without billing',
    });
  });

  afterAll(async () => {
    spies.forEach((spy) => spy.mockRestore());
    await destroyAgentChatThread({ threadId });
  });

  it('admits a send and never reports it as included', async () => {
    const response = await makeMetadataApiRequest({
      query: SEND_CHAT_MESSAGE,
      variables: {
        threadId,
        text: 'Summarize my pipeline',
        messageId: randomUUID(),
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage).toEqual({
      queued: false,
      isIncluded: false,
    });
  });
});
