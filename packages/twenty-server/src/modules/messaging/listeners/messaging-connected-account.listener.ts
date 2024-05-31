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
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';

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
    payload: ObjectRecordDeleteEvent<ConnectedAccountWorkspaceEntity>,
  ) {
    await this.messageQueueService.add<DeleteConnectedAccountAssociatedMessagingDataJobData>(
      DeleteConnectedAccountAssociatedMessagingDataJob.name,
      {
        workspaceId: payload.workspaceId,
        connectedAccountId: payload.recordId,
      },
    );

    await this.calendarQueueService.add<DeleteConnectedAccountAssociatedCalendarDataJobData>(
      DeleteConnectedAccountAssociatedCalendarDataJob.name,
      {
        workspaceId: payload.workspaceId,
        connectedAccountId: payload.recordId,
      },
    );
  }
}
