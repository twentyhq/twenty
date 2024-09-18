import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-properties.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import {
  CalendarCreateCompanyAndContactAfterSyncJob,
  CalendarCreateCompanyAndContactAfterSyncJobData,
} from 'src/modules/calendar/calendar-event-participant-manager/jobs/calendar-create-company-and-contact-after-sync.job';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class AutoCompaniesAndContactsCreationCalendarChannelListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('calendarChannel.updated')
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<MessageChannelWorkspaceEntity>
    >,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) => {
        if (
          objectRecordChangedProperties(
            eventPayload.properties.before,
            eventPayload.properties.after,
          ).includes('isContactAutoCreationEnabled') &&
          eventPayload.properties.after.isContactAutoCreationEnabled
        ) {
          return this.messageQueueService.add<CalendarCreateCompanyAndContactAfterSyncJobData>(
            CalendarCreateCompanyAndContactAfterSyncJob.name,
            {
              workspaceId: payload.workspaceId,
              calendarChannelId: eventPayload.recordId,
            },
          );
        }
      }),
    );
  }
}
