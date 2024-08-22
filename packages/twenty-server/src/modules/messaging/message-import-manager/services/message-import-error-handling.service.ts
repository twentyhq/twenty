import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CALENDAR_THROTTLE_MAX_ATTEMPTS } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-throttle-max-attempts';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingError } from 'src/modules/messaging/message-import-manager/types/messaging-error.type';

export enum MessageImportSyncStep {
  FULL_MESSAGE_LIST_FETCH = 'FULL_MESSAGE_LIST_FETCH',
  PARTIAL_MESSAGE_LIST_FETCH = 'PARTIAL_MESSAGE_LIST_FETCH',
  MESSAGES_IMPORT = 'MESSAGES_IMPORT',
}

@Injectable()
export class MessageImportErrorHandlerService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly messageChannelSyncStatusService: MessageChannelSyncStatusService,
  ) {}

  public async handleError(
    error: MessagingError,
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'id' | 'throttleFailureCount'
    >,
    workspaceId: string,
  ): Promise<void> {
    switch (error.code) {
      case 'NOT_FOUND':
        await this.handleNotFoundError(syncStep, messageChannel, workspaceId);
        break;
      case 'TEMPORARY_ERROR':
        await this.handleTemporaryError(syncStep, messageChannel, workspaceId);
        break;
      case 'INSUFFICIENT_PERMISSIONS':
        await this.handleInsufficientPermissionsError(
          messageChannel,
          workspaceId,
        );
        break;
      case 'UNKNOWN':
        await this.handleUnknownError(error, messageChannel, workspaceId);
        break;
    }
  }

  private async handleTemporaryError(
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'id' | 'throttleFailureCount'
    >,
    workspaceId: string,
  ): Promise<void> {
    if (messageChannel.throttleFailureCount >= CALENDAR_THROTTLE_MAX_ATTEMPTS) {
      await this.messageChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
        messageChannel.id,
        workspaceId,
      );

      return;
    }

    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );

    await messageChannelRepository.increment(
      {
        id: messageChannel.id,
      },
      'throttleFailureCount',
      1,
    );

    switch (syncStep) {
      case MessageImportSyncStep.FULL_MESSAGE_LIST_FETCH:
        await this.messageChannelSyncStatusService.scheduleFullMessageListFetch(
          messageChannel.id,
        );
        break;

      case MessageImportSyncStep.PARTIAL_MESSAGE_LIST_FETCH:
        await this.messageChannelSyncStatusService.schedulePartialMessageListFetch(
          messageChannel.id,
        );
        break;

      case MessageImportSyncStep.MESSAGES_IMPORT:
        await this.messageChannelSyncStatusService.scheduleMessagesImport(
          messageChannel.id,
        );
        break;

      default:
        break;
    }
  }

  private async handleInsufficientPermissionsError(
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsFailedInsufficientPermissionsAndFlushMessagesToImport(
      messageChannel.id,
      workspaceId,
    );
  }

  private async handleUnknownError(
    error: MessagingError,
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
      messageChannel.id,
      workspaceId,
    );

    throw new Error(
      `Unknown error occurred while importing calendar events for calendar channel ${messageChannel.id} in workspace ${workspaceId}: ${error.message}`,
    );
  }

  private async handleNotFoundError(
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    if (syncStep === MessageImportSyncStep.FULL_MESSAGE_LIST_FETCH) {
      return;
    }

    await this.messageChannelSyncStatusService.resetAndScheduleFullMessageListFetch(
      messageChannel.id,
      workspaceId,
    );
  }
}
