import { MessageChannelExceptionCode } from 'src/engine/metadata-modules/message-channel/message-channel.exception';
import { ApplicationMessageReadService } from 'src/engine/metadata-modules/message-channel/services/application-message-read.service';
import { findAppThreadLatestMessages } from 'src/engine/metadata-modules/message-channel/utils/find-app-thread-latest-messages.util';

jest.mock(
  'src/engine/metadata-modules/message-channel/utils/find-app-thread-latest-messages.util',
  () => ({ findAppThreadLatestMessages: jest.fn() }),
);

const WORKSPACE_ID = '33333333-3333-4333-8333-333333333333';
const USER_WORKSPACE_ID = '66666666-6666-4666-8666-666666666666';
const MESSAGE_CHANNEL_ID = '77777777-7777-4777-8777-777777777777';
const MESSAGE_THREAD_ID = '88888888-8888-4888-8888-888888888888';
const CONNECTED_ACCOUNT_ID = '55555555-5555-4555-8555-555555555555';
const CONNECTION_PROVIDER_ID = '99999999-9999-4999-8999-999999999999';
const MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER =
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const MARKER = {
  messagingProvider: {
    id: 'messaging-provider-id',
    name: 'linkedin-messaging',
  },
  markThreadAsReadLogicFunctionId: 'logic-function-id',
};

const MARK_AS_READ_ARGS = {
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: USER_WORKSPACE_ID,
  messageChannelId: MESSAGE_CHANNEL_ID,
  messageThreadId: MESSAGE_THREAD_ID,
};

describe('ApplicationMessageReadService', () => {
  const buildService = ({
    messageChannel = {
      id: MESSAGE_CHANNEL_ID,
      connectedAccountId: CONNECTED_ACCOUNT_ID,
      messagingProviderUniversalIdentifier:
        MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
    },
    ownedConnectedAccount = {
      id: CONNECTED_ACCOUNT_ID,
      connectionProviderId: CONNECTION_PROVIDER_ID,
    },
    marker = MARKER,
    cachedThrottle = undefined,
  }: {
    messageChannel?: object | null;
    ownedConnectedAccount?: object | null;
    marker?: typeof MARKER | null;
    cachedThrottle?: boolean;
  } = {}) => {
    const messageChannelRepository = {
      findOne: jest.fn().mockResolvedValue(messageChannel),
    };
    const connectedAccountMetadataService = {
      findByIdAndUserWorkspaceId: jest
        .fn()
        .mockResolvedValue(ownedConnectedAccount),
    };
    const messagingProviderThreadReadMarkerService = {
      resolveMarker: jest.fn().mockResolvedValue(marker),
      markAsReadOrThrow: jest.fn().mockResolvedValue(undefined),
    };
    const workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn((callback: () => unknown) =>
        callback(),
      ),
    };
    const cacheStorageService = {
      setIfAbsent: jest.fn().mockResolvedValue(cachedThrottle !== true),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const service = new ApplicationMessageReadService(
      messageChannelRepository as never,
      connectedAccountMetadataService as never,
      messagingProviderThreadReadMarkerService as never,
      workspaceOrmManager as never,
      cacheStorageService as never,
    );

    return {
      service,
      connectedAccountMetadataService,
      messagingProviderThreadReadMarkerService,
      cacheStorageService,
    };
  };

  beforeEach(() => {
    jest
      .mocked(findAppThreadLatestMessages)
      .mockReset()
      .mockResolvedValue({
        threadExternalId: 'chat-1',
        latestMessageIds: ['message-1'],
      });
  });

  it('asks the messaging provider to mark the thread as read for its owner', async () => {
    const { service, messagingProviderThreadReadMarkerService } =
      buildService();

    await service.markThreadAsRead(MARK_AS_READ_ARGS);

    expect(
      messagingProviderThreadReadMarkerService.resolveMarker,
    ).toHaveBeenCalledWith({
      messagingProviderUniversalIdentifier:
        MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
      connectionProviderId: CONNECTION_PROVIDER_ID,
      workspaceId: WORKSPACE_ID,
    });
    expect(
      messagingProviderThreadReadMarkerService.markAsReadOrThrow,
    ).toHaveBeenCalledWith({
      marker: MARKER,
      workspaceId: WORKSPACE_ID,
      payload: {
        connectedAccountId: CONNECTED_ACCOUNT_ID,
        messageChannelId: MESSAGE_CHANNEL_ID,
        threadExternalId: 'chat-1',
      },
    });
  });

  it('fails when the app message channel does not exist', async () => {
    const { service } = buildService({ messageChannel: null });

    await expect(service.markThreadAsRead(MARK_AS_READ_ARGS)).rejects.toThrow(
      expect.objectContaining({
        code: MessageChannelExceptionCode.MESSAGE_CHANNEL_NOT_FOUND,
      }),
    );
  });

  it('does nothing for a member the connected account is only shared with', async () => {
    const { service, messagingProviderThreadReadMarkerService } = buildService({
      ownedConnectedAccount: null,
    });

    await service.markThreadAsRead(MARK_AS_READ_ARGS);

    expect(
      messagingProviderThreadReadMarkerService.resolveMarker,
    ).not.toHaveBeenCalled();
    expect(
      messagingProviderThreadReadMarkerService.markAsReadOrThrow,
    ).not.toHaveBeenCalled();
  });

  it('does nothing when the messaging provider cannot mark threads as read', async () => {
    const { service, messagingProviderThreadReadMarkerService } = buildService({
      marker: null,
    });

    await service.markThreadAsRead(MARK_AS_READ_ARGS);

    expect(
      messagingProviderThreadReadMarkerService.markAsReadOrThrow,
    ).not.toHaveBeenCalled();
  });

  it('skips a thread already marked as read moments ago', async () => {
    const { service, messagingProviderThreadReadMarkerService } = buildService({
      cachedThrottle: true,
    });

    await service.markThreadAsRead(MARK_AS_READ_ARGS);

    expect(findAppThreadLatestMessages).not.toHaveBeenCalled();
    expect(
      messagingProviderThreadReadMarkerService.markAsReadOrThrow,
    ).not.toHaveBeenCalled();
  });

  it('remembers the call so the next one in the window is skipped', async () => {
    const { service, cacheStorageService } = buildService();

    await service.markThreadAsRead(MARK_AS_READ_ARGS);

    expect(cacheStorageService.setIfAbsent).toHaveBeenCalledWith(
      `app-thread-mark-as-read:${WORKSPACE_ID}:${USER_WORKSPACE_ID}:${MESSAGE_CHANNEL_ID}:${MESSAGE_THREAD_ID}`,
      true,
      30 * 1000,
    );
  });

  it('does nothing when the thread has no message in the channel', async () => {
    jest.mocked(findAppThreadLatestMessages).mockResolvedValue(null);
    const {
      service,
      messagingProviderThreadReadMarkerService,
      cacheStorageService,
    } = buildService();

    await service.markThreadAsRead(MARK_AS_READ_ARGS);

    expect(
      messagingProviderThreadReadMarkerService.markAsReadOrThrow,
    ).not.toHaveBeenCalled();
    expect(cacheStorageService.del).toHaveBeenCalledTimes(1);
  });

  it('releases the window when the provider fails so the next open retries', async () => {
    const {
      service,
      messagingProviderThreadReadMarkerService,
      cacheStorageService,
    } = buildService();
    messagingProviderThreadReadMarkerService.markAsReadOrThrow.mockRejectedValue(
      new Error('Provider unavailable'),
    );

    await expect(service.markThreadAsRead(MARK_AS_READ_ARGS)).rejects.toThrow(
      'Provider unavailable',
    );

    expect(cacheStorageService.del).toHaveBeenCalledWith(
      `app-thread-mark-as-read:${WORKSPACE_ID}:${USER_WORKSPACE_ID}:${MESSAGE_CHANNEL_ID}:${MESSAGE_THREAD_ID}`,
    );
  });
});
