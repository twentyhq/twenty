import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import {
  MessageChannelSyncStatus,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MESSAGING_THROTTLE_MAX_ATTEMPTS } from 'src/modules/messaging/message-import-manager/constants/messaging-throttle-max-attempts';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';
import {
  MessageImportException,
  MessageImportExceptionCode,
} from 'src/modules/messaging/message-import-manager/exceptions/message-import.exception';

export enum MessageImportSyncStep {
  FULL_MESSAGE_LIST_FETCH = 'FULL_MESSAGE_LIST_FETCH', // TODO: deprecate to only use MESSAGE_LIST_FETCH
  MESSAGE_LIST_FETCH = 'MESSAGE_LIST_FETCH',
  MESSAGES_IMPORT_PENDING = 'MESSAGES_IMPORT_PENDING',
  MESSAGES_IMPORT_ONGOING = 'MESSAGES_IMPORT_ONGOING',
}

@Injectable()
export class MessageImportExceptionHandlerService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  public async handleDriverException(
    exception: MessageImportDriverException | Error | TwentyORMException,
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'id' | 'throttleFailureCount'
    >,
    workspaceId: string,
  ): Promise<void> {
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
        case MessageNetworkExceptionCode.ECONNABORTED:
        case MessageNetworkExceptionCode.ENOTFOUND:
        case MessageNetworkExceptionCode.ECONNRESET:
        case MessageNetworkExceptionCode.ETIMEDOUT:
        case MessageNetworkExceptionCode.ERR_NETWORK:
        case MessageImportDriverExceptionCode.CLIENT_NOT_AVAILABLE:
          await this.handleTemporaryException(
            syncStep,
            messageChannel,
            workspaceId,
            exception,
          );
          break;
        case MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
          await this.handleInsufficientPermissionsException(
            messageChannel,
            workspaceId,
          );
          break;
        case MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR:
          await this.handlePermanentException(
            exception,
            messageChannel,
            workspaceId,
          );
          break;
        case MessageImportDriverExceptionCode.UNKNOWN:
        case MessageImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR:
        default:
          await this.handleUnknownException(
            exception,
            messageChannel,
            workspaceId,
          );
          break;
      }
    } else {
      await this.handleUnknownException(exception, messageChannel, workspaceId);
    }
  }

  private async handleTemporaryException(
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'id' | 'throttleFailureCount'
    >,
    workspaceId: string,
    exception: { message: string },
  ): Promise<void> {
    if (
      messageChannel.throttleFailureCount >= MESSAGING_THROTTLE_MAX_ATTEMPTS
    ) {
      await this.messageChannelSyncStatusService.markAsFailedAndFlushMessagesToImport(
        [messageChannel.id],
        workspaceId,
        MessageChannelSyncStatus.FAILED_UNKNOWN,
      );

      this.exceptionHandlerService.captureExceptions(
        [
          `Temporary error occurred ${MESSAGING_THROTTLE_MAX_ATTEMPTS} times while importing messages for message channel ${messageChannel.id.slice(0, 5)}... in workspace ${workspaceId}: ${exception?.message}`,
        ],
        {
          additionalData: {
            messageChannelId: messageChannel.id,
          },
          workspace: { id: workspaceId },
        },
      );

      throw new MessageImportException(
        `Temporary error occurred multiple times while importing messages for message channel ${messageChannel.id} in workspace ${workspaceId}: ${exception?.message}`,
        MessageImportExceptionCode.UNKNOWN,
      );
    }

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.increment(
      { id: messageChannel.id },
      'throttleFailureCount',
      1,
      undefined,
      ['throttleFailureCount', 'id'],
    );

    switch (syncStep) {
      case MessageImportSyncStep.FULL_MESSAGE_LIST_FETCH:
        await this.messageChannelSyncStatusService.scheduleMessageListFetch([
          messageChannel.id,
        ]);
        break;

      case MessageImportSyncStep.MESSAGES_IMPORT_PENDING:
      case MessageImportSyncStep.MESSAGES_IMPORT_ONGOING:
        await this.messageChannelSyncStatusService.scheduleMessagesImport([
          messageChannel.id,
        ]);
        break;

      default:
        break;
    }
  }

  private async handleInsufficientPermissionsException(
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsFailedAndFlushMessagesToImport(
      [messageChannel.id],
      workspaceId,
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
  }

  private async handleUnknownException(
    exception: MessageImportDriverException | Error,
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsFailedAndFlushMessagesToImport(
      [messageChannel.id],
      workspaceId,
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );

    const messageImportException = new MessageImportException(
      isDefined(exception.name)
        ? `${exception.name}: ${exception.message}`
        : exception.message,
      MessageImportExceptionCode.UNKNOWN,
    );

    this.exceptionHandlerService.captureExceptions([messageImportException], {
      additionalData: {
        exception,
        messageChannelId: messageChannel.id,
      },
      workspace: { id: workspaceId },
    });

    throw messageImportException;
  }

  private async handlePermanentException(
    exception: MessageImportDriverException,
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsFailedAndFlushMessagesToImport(
      [messageChannel.id],
      workspaceId,
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );

    throw new MessageImportException(
      `Permanent error occurred while importing messages for message channel ${messageChannel.id} in workspace ${workspaceId}: ${exception.message}`,
      MessageImportExceptionCode.UNKNOWN,
    );
  }

  private async handleNotFoundException(
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    if (syncStep === MessageImportSyncStep.FULL_MESSAGE_LIST_FETCH) {
      return;
    }

    await this.messageChannelSyncStatusService.resetAndScheduleMessageListFetch(
      [messageChannel.id],
      workspaceId,
    );
  }
}
