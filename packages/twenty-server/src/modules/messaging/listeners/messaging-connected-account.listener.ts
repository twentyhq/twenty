import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  DeleteConnectedAccountAssociatedCalendarDataJobData,
  DeleteConnectedAccountAssociatedCalendarDataJob,
} from 'src/modules/calendar/jobs/delete-connected-account-associated-calendar-data.job';
import {
  DeleteConnectedAccountAssociatedMessagingDataJobData,
  DeleteConnectedAccountAssociatedMessagingDataJob,
} from 'src/modules/messaging/jobs/delete-connected-account-associated-messaging-data.job';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';

@Injectable()
export class MessagingConnectedAccountListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @Inject(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  @OnEvent('connectedAccount.deleted')
  async handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<ConnectedAccountObjectMetadata>,
  ) {
    const isCalendarEnabled = await this.featureFlagRepository.findOneBy({
      workspaceId: payload.workspaceId,
      key: FeatureFlagKeys.IsCalendarEnabled,
      value: true,
    });

    this.messageQueueService.add<DeleteConnectedAccountAssociatedMessagingDataJobData>(
      DeleteConnectedAccountAssociatedMessagingDataJob.name,
      {
        workspaceId: payload.workspaceId,
        connectedAccountId: payload.recordId,
      },
    );

    if (isCalendarEnabled) {
      this.calendarQueueService.add<DeleteConnectedAccountAssociatedCalendarDataJobData>(
        DeleteConnectedAccountAssociatedCalendarDataJob.name,
        {
          workspaceId: payload.workspaceId,
          connectedAccountId: payload.recordId,
        },
      );
    }
  }
}
