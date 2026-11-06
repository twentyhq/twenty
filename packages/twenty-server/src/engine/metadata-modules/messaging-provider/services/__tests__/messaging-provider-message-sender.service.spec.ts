import { MessagingProviderExceptionCode } from 'src/engine/metadata-modules/messaging-provider/messaging-provider.exception';
import { MessagingProviderMessageSenderService } from 'src/engine/metadata-modules/messaging-provider/services/messaging-provider-message-sender.service';

const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const APPLICATION_ID = '44444444-4444-4444-8444-444444444444';
const CONNECTION_PROVIDER_ID = '55555555-5555-4555-8555-555555555555';
const PERSON_ID = '66666666-6666-4666-8666-666666666666';

const buildService = ({
  startConversationLogicFunctionUniversalIdentifier,
  logicFunctionResult = {},
}: {
  startConversationLogicFunctionUniversalIdentifier: string | null;
  logicFunctionResult?: unknown;
}) => {
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatMessagingProviderMaps: {
        byUniversalIdentifier: {
          'messaging-provider': {
            id: 'messaging-provider-id',
            name: 'linkedin-messaging',
            applicationId: APPLICATION_ID,
            connectionProviderUniversalIdentifier: 'connection-provider',
            sendMessageLogicFunctionUniversalIdentifier: 'send-message',
            startConversationLogicFunctionUniversalIdentifier,
          },
        },
      },
      flatConnectionProviderMaps: {
        byUniversalIdentifier: {
          'connection-provider': { id: CONNECTION_PROVIDER_ID },
        },
      },
      flatLogicFunctionMaps: {
        byUniversalIdentifier: {
          'send-message': {
            id: 'send-message-id',
            applicationId: APPLICATION_ID,
            deletedAt: null,
          },
          'start-conversation': {
            id: 'start-conversation-id',
            applicationId: APPLICATION_ID,
            deletedAt: null,
          },
        },
      },
    }),
  };
  const logicFunctionExecutorService = {
    executeOrThrow: jest.fn().mockResolvedValue(logicFunctionResult),
  };

  return {
    service: new MessagingProviderMessageSenderService(
      workspaceCacheService as never,
      logicFunctionExecutorService as never,
    ),
    logicFunctionExecutorService,
  };
};

const LOOKUP = {
  messagingProviderUniversalIdentifier: 'messaging-provider',
  connectionProviderId: CONNECTION_PROVIDER_ID,
  messageChannelId: 'channel-id',
  workspaceId: WORKSPACE_ID,
};

const PAYLOAD = {
  connectedAccountId: 'connected-account-id',
  messageChannelId: 'channel-id',
  text: 'Hello',
  idempotencyKey: '77777777-7777-4777-8777-777777777777',
  recipients: [{ personId: PERSON_ID, displayName: 'Ada', handle: null }],
};

describe('MessagingProviderMessageSenderService start conversation', () => {
  it('runs the start conversation function and returns its parsed result', async () => {
    const { service, logicFunctionExecutorService } = buildService({
      startConversationLogicFunctionUniversalIdentifier: 'start-conversation',
      logicFunctionResult: {
        externalId: 'message-1',
        threadExternalId: 'chat-1',
        recipients: [{ personId: PERSON_ID, handle: 'ada-handle' }],
      },
    });

    const conversationStarter =
      await service.resolveConversationStarterOrThrow(LOOKUP);

    await expect(
      service.startConversationOrThrow({
        conversationStarter,
        workspaceId: WORKSPACE_ID,
        payload: PAYLOAD,
      }),
    ).resolves.toEqual({
      externalId: 'message-1',
      threadExternalId: 'chat-1',
      recipients: [{ personId: PERSON_ID, handle: 'ada-handle' }],
    });

    expect(logicFunctionExecutorService.executeOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionId: 'start-conversation-id',
        payload: { messagingProviderName: 'linkedin-messaging', ...PAYLOAD },
      }),
    );
  });

  it('refuses a provider without a start conversation function', async () => {
    const { service } = buildService({
      startConversationLogicFunctionUniversalIdentifier: null,
    });

    await expect(
      service.resolveConversationStarterOrThrow(LOOKUP),
    ).rejects.toMatchObject({
      code: MessagingProviderExceptionCode.START_CONVERSATION_NOT_AVAILABLE,
    });
    await expect(
      service.canStartConversation({
        messagingProviderUniversalIdentifier: 'messaging-provider',
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(false);
  });

  it('reports a provider with a start conversation function', async () => {
    const { service } = buildService({
      startConversationLogicFunctionUniversalIdentifier: 'start-conversation',
    });

    await expect(
      service.canStartConversation({
        messagingProviderUniversalIdentifier: 'messaging-provider',
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBe(true);
  });

  it('fails when the function returns no thread', async () => {
    const { service } = buildService({
      startConversationLogicFunctionUniversalIdentifier: 'start-conversation',
      logicFunctionResult: { externalId: 'message-1' },
    });

    const conversationStarter =
      await service.resolveConversationStarterOrThrow(LOOKUP);

    await expect(
      service.startConversationOrThrow({
        conversationStarter,
        workspaceId: WORKSPACE_ID,
        payload: PAYLOAD,
      }),
    ).rejects.toMatchObject({
      code: MessagingProviderExceptionCode.SEND_MESSAGE_FAILED,
    });
  });
});
