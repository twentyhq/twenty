import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
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
  MESSAGES_IMPORT = 'MESSAGES_IMPORT',
}

@Injectable()
export class MessageImportExceptionHandlerService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
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
      case MessageImportDriverExceptionCode.UNKNOWN:
      case MessageImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR:
        await this.handleUnknownException(
          exception,
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
      default:
        throw exception;
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
      await this.messageChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
        [messageChannel.id],
        workspaceId,
      );

      return;
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

      case MessageImportSyncStep.MESSAGES_IMPORT:
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
    await this.messageChannelSyncStatusService.markAsFailedInsufficientPermissionsAndFlushMessagesToImport(
      [messageChannel.id],
      workspaceId,
    );
  }

  private async handleUnknownException(
    exception: MessageImportDriverException,
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
      [messageChannel.id],
      workspaceId,
    );

    throw new MessageImportException(
      `Unknown error occurred while importing messages for message channel ${messageChannel.id} in workspace ${workspaceId}: ${exception.message}`,
      MessageImportExceptionCode.UNKNOWN,
    );
  }

  private async handlePermanentException(
    exception: MessageImportDriverException,
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
      [messageChannel.id],
      workspaceId,
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
