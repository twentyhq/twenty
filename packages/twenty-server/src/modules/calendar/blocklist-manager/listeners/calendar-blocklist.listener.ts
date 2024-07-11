import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  BlocklistItemDeleteCalendarEventsJobData,
  BlocklistItemDeleteCalendarEventsJob,
} from 'src/modules/calendar/blocklist-manager/jobs/blocklist-item-delete-calendar-events.job';
import {
  BlocklistReimportCalendarEventsJobData,
  BlocklistReimportCalendarEventsJob,
} from 'src/modules/calendar/blocklist-manager/jobs/blocklist-reimport-calendar-events.job';
import { BlocklistWorkspaceEntity } from 'src/modules/connected-account/standard-objects/blocklist.workspace-entity';

@Injectable()
export class CalendarBlocklistListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('blocklist.created')
  async handleCreatedEvent(
    payload: ObjectRecordCreateEvent<BlocklistWorkspaceEntity>,
  ) {
    await this.messageQueueService.add<BlocklistItemDeleteCalendarEventsJobData>(
      BlocklistItemDeleteCalendarEventsJob.name,
      {
        workspaceId: payload.workspaceId,
        blocklistItemId: payload.recordId,
      },
    );
  }

  @OnEvent('blocklist.deleted')
  async handleDeletedEvent(
    payload: ObjectRecordDeleteEvent<BlocklistWorkspaceEntity>,
  ) {
    await this.messageQueueService.add<BlocklistReimportCalendarEventsJobData>(
      BlocklistReimportCalendarEventsJob.name,
      {
        workspaceId: payload.workspaceId,
        workspaceMemberId: payload.properties.before.workspaceMember.id,
      },
    );
  }

  @OnEvent('blocklist.updated')
  async handleUpdatedEvent(
    payload: ObjectRecordUpdateEvent<BlocklistWorkspaceEntity>,
  ) {
    await this.messageQueueService.add<BlocklistItemDeleteCalendarEventsJobData>(
      BlocklistItemDeleteCalendarEventsJob.name,
      {
        workspaceId: payload.workspaceId,
        blocklistItemId: payload.recordId,
      },
    );

    await this.messageQueueService.add<BlocklistReimportCalendarEventsJobData>(
      BlocklistReimportCalendarEventsJob.name,
      {
        workspaceId: payload.workspaceId,
        workspaceMemberId: payload.properties.after.workspaceMember.id,
      },
    );
  }
}
