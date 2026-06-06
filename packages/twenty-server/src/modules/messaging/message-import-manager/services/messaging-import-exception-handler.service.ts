import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { MessageChannelSyncStatus } from 'twenty-shared/types';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import {
  type TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MESSAGING_THROTTLE_MAX_ATTEMPTS } from 'src/modules/messaging/message-import-manager/constants/messaging-throttle-max-attempts';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';
import { MessagingMonitoringService } from 'src/modules/messaging/monitoring/services/messaging-monitoring.service';

export enum MessageImportSyncStep {
  MESSAGE_LIST_FETCH = 'MESSAGE_LIST_FETCH',
  MESSAGES_IMPORT_PENDING = 'MESSAGES_IMPORT_PENDING',
  MESSAGES_IMPORT_ONGOING = 'MESSAGES_IMPORT_ONGOING',
}

@Injectable()
export class MessageImportExceptionHandlerService {
  constructor(
    @InjectWorkspaceScopedRepository(MessageChannelEntity)
    private readonly messageChannelRepository: WorkspaceScopedRepository<MessageChannelEntity>,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly messagingMonitoringService: MessagingMonitoringService,
  ) {}

  public async handleDriverException(
    exception:
      | MessageImportDriverException
      | Error
      | TwentyORMException
      | ConnectedAccountRefreshAccessTokenException,
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<
      MessageChannelEntity,
      'id' | 'throttleFailureCount' | 'connectedAccountId'
    >,
    workspaceId: string,
  ): Promise<void> {
    if (exception instanceof MessageImportDriverException) {
      exception.context = {
        ...exception.context,
        messageChannelId: messageChannel.id,
        workspaceId,
        syncStep,
      };
    }

    if ('code' in exception) {
      switch (exception.code) {
        case MessageImportDriverExceptionCode.NOT_FOUND:
          await this.handleNotFoundException(
            syncStep,
            messageChannel,
            workspaceId,
          );
          break;
        case TwentyORMExceptionCode.QUERY_READ_TIMEOUT:
        case MessageImportDriverExceptionCode.TEMPORARY_ERROR:
        case ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR:
        case MessageNetworkExceptionCode.ECONNABORTED:
        case MessageNetworkExceptionCode.ENOTFOUND:
        case MessageNetworkExceptionCode.ECONNRESET:
        case MessageNetworkExceptionCode.ETIMEDOUT:
        case MessageNetworkExceptionCode.ERR_NETWORK:
          await this.handleTemporaryException(
            syncStep,
            messageChannel,
            workspaceId,
            exception,
          );
          break;
        case ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND:
        case ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN:
          await this.messagingMonitoringService.track({
            eventName: `refresh_token.error.insufficient_permissions`,
            workspaceId,
            connectedAccountId: messageChannel.connectedAccountId,
            messageChannelId: messageChannel.id,
            message: `${exception.code}: ${exception.message ?? ''}`,
          });
          await this.handleInsufficientPermissionsException(
            messageChannel,
            workspaceId,
          );
          break;
        case MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
          await this.handleInsufficientPermissionsException(
            messageChannel,
            workspaceId,
          );
          break;
        case MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR:
          await this.handleSyncCursorErrorException(
            messageChannel,
            workspaceId,
          );
          break;
        case ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND:
        case ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED:
        case MessageImportDriverExceptionCode.CHANNEL_MISCONFIGURED:
        case MessageImportDriverExceptionCode.ACCESS_TOKEN_MISSING:
        case MessageImportDriverExceptionCode.PROVIDER_NOT_SUPPORTED:
        case MessageImportDriverExceptionCode.UNKNOWN:
        case MessageImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR:
        default:
          await this.handleUnknownException(
            exception,
            messageChannel,
            workspaceId,
            syncStep,
          );
          break;
      }
    } else {
      await this.handleUnknownException(
        exception,
        messageChannel,
        workspaceId,
        syncStep,
      );
    }
  }

  private async handleSyncCursorErrorException(
    messageChannel: Pick<MessageChannelEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending(
      [messageChannel.id],
      workspaceId,
    );
  }

  private async handleTemporaryException(
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<MessageChannelEntity, 'id' | 'throttleFailureCount'>,
    workspaceId: string,
    exception: { message: string },
  ): Promise<void> {
    if (
      messageChannel.throttleFailureCount >= MESSAGING_THROTTLE_MAX_ATTEMPTS
    ) {
      await this.messageChannelSyncStatusService.markAsFailed(
        [messageChannel.id],
        workspaceId,
        MessageChannelSyncStatus.FAILED_UNKNOWN,
      );

      this.exceptionHandlerService.captureExceptions(
        [
          new Error(
            `Temporary error occurred ${MESSAGING_THROTTLE_MAX_ATTEMPTS} times while importing messages for message channel ${messageChannel.id} in workspace ${workspaceId}: ${exception?.message}`,
          ),
        ],
        {
          additionalData: {
            messageChannelId: messageChannel.id,
            syncStep,
            throttleFailureCount: messageChannel.throttleFailureCount,
          },
          workspace: { id: workspaceId },
        },
      );

      return;
    }

    await this.messageChannelRepository.increment(
      workspaceId,
      { id: messageChannel.id },
      'throttleFailureCount',
      1,
    );

    const throttleRetryAfter =
      exception instanceof MessageImportDriverException
        ? exception.throttleRetryAfter
        : undefined;

    await this.messageChannelRepository.update(
      workspaceId,
      { id: messageChannel.id },
      {
        throttleRetryAfter: isDefined(throttleRetryAfter)
          ? throttleRetryAfter.toISOString()
          : null,
      },
    );

    switch (syncStep) {
      case MessageImportSyncStep.MESSAGE_LIST_FETCH:
        await this.messageChannelSyncStatusService.markAsMessagesListFetchPending(
          [messageChannel.id],
          workspaceId,
          true,
        );
        break;

      case MessageImportSyncStep.MESSAGES_IMPORT_PENDING:
      case MessageImportSyncStep.MESSAGES_IMPORT_ONGOING:
        await this.messageChannelSyncStatusService.markAsMessagesImportPending(
          [messageChannel.id],
          workspaceId,
          true,
        );
        break;

      default:
        break;
    }
  }

  private async handleInsufficientPermissionsException(
    messageChannel: Pick<MessageChannelEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsFailed(
      [messageChannel.id],
      workspaceId,
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
  }

  private async handleUnknownException(
    exception: Error,
    messageChannel: Pick<MessageChannelEntity, 'id'>,
    workspaceId: string,
    syncStep: MessageImportSyncStep,
  ): Promise<void> {
    this.exceptionHandlerService.captureExceptions([exception], {
      additionalData: {
        messageChannelId: messageChannel.id,
        syncStep,
      },
      workspace: { id: workspaceId },
    });
    await this.messageChannelSyncStatusService.markAsFailed(
      [messageChannel.id],
      workspaceId,
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
  }

  private async handleNotFoundException(
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<MessageChannelEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    if (syncStep === MessageImportSyncStep.MESSAGE_LIST_FETCH) {
      await this.messageChannelSyncStatusService.markAsFailed(
        [messageChannel.id],
        workspaceId,
        MessageChannelSyncStatus.FAILED_UNKNOWN,
      );

      this.exceptionHandlerService.captureExceptions(
        [
          new Error(
            'Not Found exception occurred while fetching message list, which should never happen',
          ),
        ],
        {
          additionalData: {
            messageChannelId: messageChannel.id,
            syncStep,
          },
          workspace: { id: workspaceId },
        },
      );

      return;
    }

    await this.messageChannelSyncStatusService.resetAndMarkAsMessagesListFetchPending(
      [messageChannel.id],
      workspaceId,
    );
  }
}
