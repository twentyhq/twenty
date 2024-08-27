import { Injectable } from '@nestjs/common';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CALENDAR_THROTTLE_MAX_ATTEMPTS } from 'src/modules/calendar/calendar-event-import-manager/constants/calendar-throttle-max-attempts';
import { MessageChannelSyncStatusService } from 'src/modules/messaging/common/services/message-channel-sync-status.service';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageImportDriverException } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

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

  public async handleException(
    exception: MessageImportDriverException,
    syncStep: MessageImportSyncStep,
    messageChannel: Pick<
      MessageChannelWorkspaceEntity,
      'id' | 'throttleFailureCount'
    >,
    workspaceId: string,
  ): Promise<void> {
    switch (exception.code) {
      case 'NOT_FOUND':
        await this.handleNotFoundException(
          syncStep,
          messageChannel,
          workspaceId,
        );
        break;
      case 'TEMPORARY_ERROR':
        await this.handleTemporaryException(
          syncStep,
          messageChannel,
          workspaceId,
        );
        break;
      case 'INSUFFICIENT_PERMISSIONS':
        await this.handleInsufficientPermissionsException(
          messageChannel,
          workspaceId,
        );
        break;
      case 'UNKNOWN':
        await this.handleUnknownException(
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

  private async handleInsufficientPermissionsException(
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsFailedInsufficientPermissionsAndFlushMessagesToImport(
      messageChannel.id,
      workspaceId,
    );
  }

  private async handleUnknownException(
    exception: MessageImportDriverException,
    messageChannel: Pick<MessageChannelWorkspaceEntity, 'id'>,
    workspaceId: string,
  ): Promise<void> {
    await this.messageChannelSyncStatusService.markAsFailedUnknownAndFlushMessagesToImport(
      messageChannel.id,
      workspaceId,
    );

    throw new Error(
      `Unknown error occurred while importing calendar events for calendar channel ${messageChannel.id} in workspace ${workspaceId}: ${exception.message}`,
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
      messageChannel.id,
      workspaceId,
    );
  }
}
