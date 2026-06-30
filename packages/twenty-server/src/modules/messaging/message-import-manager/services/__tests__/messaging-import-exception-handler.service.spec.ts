import { Test, type TestingModule } from '@nestjs/testing';

import { MessageChannelSyncStatus } from 'twenty-shared/types';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageImportExceptionHandlerService,
  MessageImportSyncStep,
} from 'src/modules/messaging/message-import-manager/services/messaging-import-exception-handler.service';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

describe('MessageImportExceptionHandlerService — refresh code dispatch', () => {
  let service: MessageImportExceptionHandlerService;
  let messageChannelSyncStatusService: {
    markAsFailed: jest.Mock;
    markAsMessagesListFetchPending: jest.Mock;
    markAsMessagesImportPending: jest.Mock;
    resetAndMarkAsMessagesListFetchPending: jest.Mock;
  };
  let messageChannelRepository: { increment: jest.Mock; update: jest.Mock };
  let messagingMonitoringService: { track: jest.Mock };
  let exceptionHandlerService: { captureExceptions: jest.Mock };

  const workspaceId = 'workspace-1';
  const messageChannel = {
    id: 'channel-1',
    throttleFailureCount: 0,
    connectedAccountId: 'connected-account-1',
  };

  beforeEach(async () => {
    messageChannelSyncStatusService = {
      markAsFailed: jest.fn(),
      markAsMessagesListFetchPending: jest.fn(),
      markAsMessagesImportPending: jest.fn(),
      resetAndMarkAsMessagesListFetchPending: jest.fn(),
    };
    messageChannelRepository = { increment: jest.fn(), update: jest.fn() };
    messagingMonitoringService = { track: jest.fn() };
    exceptionHandlerService = { captureExceptions: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageImportExceptionHandlerService,
        {
          provide: getWorkspaceScopedRepositoryToken(MessageChannelEntity),
          useValue: messageChannelRepository,
        },
        {
          provide: MessageChannelSyncStatusService,
          useValue: messageChannelSyncStatusService,
        },
        { provide: ExceptionHandlerService, useValue: exceptionHandlerService },
        {
          provide: MessagingMonitoringService,
          useValue: messagingMonitoringService,
        },
      ],
    }).compile();

    service = module.get(MessageImportExceptionHandlerService);
  });

  it('should mark channel FAILED_INSUFFICIENT_PERMISSIONS and fire monitoring on REFRESH_TOKEN_NOT_FOUND', async () => {
    await service.handleDriverException(
      new ConnectedAccountRefreshAccessTokenException(
        'refresh token missing',
        ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND,
      ),
      MessageImportSyncStep.MESSAGE_LIST_FETCH,
      messageChannel,
      workspaceId,
    );

    expect(messageChannelSyncStatusService.markAsFailed).toHaveBeenCalledWith(
      [messageChannel.id],
      workspaceId,
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(messagingMonitoringService.track).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'refresh_token.error.insufficient_permissions',
        workspaceId,
        connectedAccountId: messageChannel.connectedAccountId,
        messageChannelId: messageChannel.id,
        message: expect.stringContaining('REFRESH_TOKEN_NOT_FOUND'),
      }),
    );
  });

  it('should fire monitoring on INVALID_REFRESH_TOKEN', async () => {
    await service.handleDriverException(
      new ConnectedAccountRefreshAccessTokenException(
        'refresh rejected',
        ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      ),
      MessageImportSyncStep.MESSAGES_IMPORT_ONGOING,
      messageChannel,
      workspaceId,
    );

    expect(messagingMonitoringService.track).toHaveBeenCalledTimes(1);
    expect(messageChannelSyncStatusService.markAsFailed).toHaveBeenCalledWith(
      [messageChannel.id],
      workspaceId,
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should NOT fire monitoring on TEMPORARY_NETWORK_ERROR and should throttle instead', async () => {
    await service.handleDriverException(
      new ConnectedAccountRefreshAccessTokenException(
        'temp',
        ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
      ),
      MessageImportSyncStep.MESSAGE_LIST_FETCH,
      messageChannel,
      workspaceId,
    );

    expect(messagingMonitoringService.track).not.toHaveBeenCalled();
    expect(messageChannelRepository.increment).toHaveBeenCalled();
    expect(
      messageChannelSyncStatusService.markAsMessagesListFetchPending,
    ).toHaveBeenCalled();
  });

  it('should mark FAILED_UNKNOWN on ACCESS_TOKEN_NOT_FOUND (matches pre-refactor fall-through)', async () => {
    await service.handleDriverException(
      new ConnectedAccountRefreshAccessTokenException(
        'no access token',
        ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND,
      ),
      MessageImportSyncStep.MESSAGE_LIST_FETCH,
      messageChannel,
      workspaceId,
    );

    expect(messageChannelSyncStatusService.markAsFailed).toHaveBeenCalledWith(
      [messageChannel.id],
      workspaceId,
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        additionalData: expect.objectContaining({
          messageChannelId: messageChannel.id,
          syncStep: MessageImportSyncStep.MESSAGE_LIST_FETCH,
        }),
      }),
    );
    expect(messagingMonitoringService.track).not.toHaveBeenCalled();
  });

  it('should mark FAILED_UNKNOWN on PROVIDER_NOT_SUPPORTED', async () => {
    await service.handleDriverException(
      new ConnectedAccountRefreshAccessTokenException(
        'provider down',
        ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED,
      ),
      MessageImportSyncStep.MESSAGE_LIST_FETCH,
      messageChannel,
      workspaceId,
    );

    expect(messageChannelSyncStatusService.markAsFailed).toHaveBeenCalledWith(
      [messageChannel.id],
      workspaceId,
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(messagingMonitoringService.track).not.toHaveBeenCalled();
  });
});
