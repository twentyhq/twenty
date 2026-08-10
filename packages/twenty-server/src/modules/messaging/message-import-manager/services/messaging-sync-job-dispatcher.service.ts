import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import {
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import {
  MessagingMessagesImportJob,
  type MessagingMessagesImportJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-messages-import.job';
import {
  MessagingOnboardingContactsBootstrapJob,
  type MessagingOnboardingContactsBootstrapJobData,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-onboarding-contacts-bootstrap.job';
import { MessagingOnboardingMessageListFetchJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-onboarding-message-list-fetch.job';
import { MessagingOnboardingMessagesImportJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-onboarding-messages-import.job';

type DispatchableMessageChannel = Pick<MessageChannelEntity, 'id' | 'syncedAt'>;

// A channel that has never completed a sync belongs to a user who is still
// waiting for their first contacts, so its jobs run on a dedicated lane instead
// of queueing behind the ongoing syncs of every already-connected account.
@Injectable()
export class MessagingSyncJobDispatcherService {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messagingQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.messagingOnboardingQueue)
    private readonly onboardingQueueService: MessageQueueService,
  ) {}

  async enqueueMessageListFetch({
    messageChannel,
    workspaceId,
  }: {
    messageChannel: DispatchableMessageChannel;
    workspaceId: string;
  }): Promise<void> {
    const data: MessagingMessageListFetchJobData = {
      messageChannelId: messageChannel.id,
      workspaceId,
    };

    if (this.isOnboardingSync(messageChannel)) {
      await this.onboardingQueueService.add<MessagingMessageListFetchJobData>(
        MessagingOnboardingMessageListFetchJob.name,
        data,
      );

      return;
    }

    await this.messagingQueueService.add<MessagingMessageListFetchJobData>(
      MessagingMessageListFetchJob.name,
      data,
    );
  }

  // Kicks off the lightweight contact bootstrap in parallel with the regular
  // sync, and is a no-op for a channel that already completed one
  async enqueueOnboardingContactsBootstrap({
    messageChannel,
    workspaceId,
  }: {
    messageChannel: DispatchableMessageChannel;
    workspaceId: string;
  }): Promise<void> {
    if (!this.isOnboardingSync(messageChannel)) {
      return;
    }

    await this.onboardingQueueService.add<MessagingOnboardingContactsBootstrapJobData>(
      MessagingOnboardingContactsBootstrapJob.name,
      { messageChannelId: messageChannel.id, workspaceId },
    );
  }

  async enqueueMessagesImport({
    messageChannel,
    workspaceId,
  }: {
    messageChannel: DispatchableMessageChannel;
    workspaceId: string;
  }): Promise<void> {
    const data: MessagingMessagesImportJobData = {
      messageChannelId: messageChannel.id,
      workspaceId,
    };

    if (this.isOnboardingSync(messageChannel)) {
      await this.onboardingQueueService.add<MessagingMessagesImportJobData>(
        MessagingOnboardingMessagesImportJob.name,
        data,
      );

      return;
    }

    await this.messagingQueueService.add<MessagingMessagesImportJobData>(
      MessagingMessagesImportJob.name,
      data,
    );
  }

  private isOnboardingSync(
    messageChannel: DispatchableMessageChannel,
  ): boolean {
    return !isDefined(messageChannel.syncedAt);
  }
}
