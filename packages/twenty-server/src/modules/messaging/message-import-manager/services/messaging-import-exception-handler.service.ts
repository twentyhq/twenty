import { Injectable } from '@nestjs/common';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
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
import {
  MessageImportException,
  MessageImportExceptionCode,
} from 'src/modules/messaging/message-import-manager/exceptions/message-import.exception';

export enum MessageImportSyncStep {
  FULL_MESSAGE_LIST_FETCH = 'FULL_MESSAGE_LIST_FETCH',
  PARTIAL_MESSAGE_LIST_FETCH = 'PARTIAL_MESSAGE_LIST_FETCH',
  FULL_OR_PARTIAL_MESSAGE_LIST_FETCH = 'FULL_OR_PARTIAL_MESSAGE_LIST_FETCH',
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
    exception: MessageImportDriverException,
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'id' | 'throttleFailureCount'
    >,
    workspaceId: string,
  ): Promise<void> {
    switch (exception.code) {
      case MessageImportDriverExceptionCode.NOT_FOUND:
        await this.handleNotFoundException(
          syncStep,
          messageChannel,
          workspaceId,
        );
        break;
      case MessageImportDriverExceptionCode.TEMPORARY_ERROR:
        await this.handleTemporaryException(
          syncStep,
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
  }

  private async handleTemporaryException(
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'id' | 'throttleFailureCount'
    >,
    workspaceId: string,
  ): Promise<void> {
    if (
      messageChannel.throttleFailureCount >= MESSAGING_THROTTLE_MAX_ATTEMPTS
    ) {
      await this.messageChannelSyncStatusService.markAsFailedAndFlushMessagesToImport(
        [messageChannel.id],
        workspaceId,
        MessageChannelSyncStatus.FAILED_UNKNOWN,
      );
      throw new MessageImportException(
        `Unknown temporary error occurred multiple times while importing messages for message channel ${messageChannel.id} in workspace ${workspaceId}`,
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
    );

    switch (syncStep) {
      case MessageImportSyncStep.FULL_MESSAGE_LIST_FETCH:
        await this.messageChannelSyncStatusService.scheduleFullMessageListFetch(
          [messageChannel.id],
        );
        break;

      case MessageImportSyncStep.PARTIAL_MESSAGE_LIST_FETCH:
        await this.messageChannelSyncStatusService.schedulePartialMessageListFetch(
          [messageChannel.id],
        );
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
    exception: MessageImportDriverException,
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsFailedAndFlushMessagesToImport(
      [messageChannel.id],
      workspaceId,
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );

    this.exceptionHandlerService.captureExceptions([
      `Unknown error importing messages for message channel ${messageChannel.id} in workspace ${workspaceId}: ${exception.message}`,
    ]);

    throw new MessageImportException(
      exception.message,
      MessageImportExceptionCode.UNKNOWN,
    );
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

    await this.messageChannelSyncStatusService.resetAndScheduleFullMessageListFetch(
      [messageChannel.id],
      workspaceId,
    );
  }
}
