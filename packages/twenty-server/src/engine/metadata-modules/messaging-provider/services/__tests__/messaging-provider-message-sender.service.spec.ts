import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { MessagingProviderMessageSenderService } from 'src/engine/metadata-modules/messaging-provider/services/messaging-provider-message-sender.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const PERSON_ID = '20202020-0000-4000-8000-000000000001';

describe('MessagingProviderMessageSenderService.startConversationOrThrow', () => {
  const executeOrThrow = jest.fn();
  const onInvalidResult = jest.fn();

  const service = new MessagingProviderMessageSenderService(
    {} as WorkspaceCacheService,
    { executeOrThrow } as unknown as LogicFunctionExecutorService,
  );

  const startConversation = () =>
    service.startConversationOrThrow({
      conversationStarter: {
        messagingProvider: { id: 'provider-1', name: 'linkedin' },
        startConversationLogicFunctionId: 'logic-function-1',
      } as Parameters<
        typeof service.startConversationOrThrow
      >[0]['conversationStarter'],
      workspaceId: 'workspace-1',
      payload: {
        connectedAccountId: 'connected-account-1',
        messageChannelId: 'channel-1',
        text: 'Hi',
        idempotencyKey: 'idempotency-key-1',
        recipients: [{ personId: PERSON_ID, displayName: null, handle: null }],
      },
      onInvalidResult,
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the started conversation', async () => {
    executeOrThrow.mockResolvedValue({
      externalId: 'message-1',
      threadExternalId: 'thread-1',
    });

    await expect(startConversation()).resolves.toEqual({
      externalId: 'message-1',
      threadExternalId: 'thread-1',
    });
    expect(onInvalidResult).not.toHaveBeenCalled();
  });

  it('reports an invalid result before throwing, since the app already ran', async () => {
    executeOrThrow.mockResolvedValue({ externalId: 'message-1' });

    await expect(startConversation()).rejects.toThrow(
      'returned an invalid result',
    );
    expect(onInvalidResult).toHaveBeenCalledTimes(1);
    expect(onInvalidResult).toHaveBeenCalledWith(
      expect.stringContaining('returned an invalid result'),
    );
  });

  it('does not report a failed run as delivered', async () => {
    executeOrThrow.mockRejectedValue(new Error('timed out'));

    await expect(startConversation()).rejects.toThrow('timed out');
    expect(onInvalidResult).not.toHaveBeenCalled();
  });
});
