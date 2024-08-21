import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import {
  BlocklistItemDeleteCalendarEventsJob,
  BlocklistItemDeleteCalendarEventsJobData,
} from 'src/modules/calendar/blocklist-manager/jobs/blocklist-item-delete-calendar-events.job';
import {
  BlocklistReimportCalendarEventsJob,
  BlocklistReimportCalendarEventsJobData,
} from 'src/modules/calendar/blocklist-manager/jobs/blocklist-reimport-calendar-events.job';

@Injectable()
export class CalendarBlocklistListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('blocklist.created')
  async handleCreatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<BlocklistWorkspaceEntity>
    >,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) =>
        this.messageQueueService.add<BlocklistItemDeleteCalendarEventsJobData>(
          BlocklistItemDeleteCalendarEventsJob.name,
          {
            workspaceId: payload.workspaceId,
            blocklistItemId: eventPayload.recordId,
          },
        ),
      ),
    );
  }

  @OnEvent('blocklist.deleted')
  async handleDeletedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<BlocklistWorkspaceEntity>
    >,
  ) {
    await Promise.all(
      payload.events.map((eventPayload) =>
        this.messageQueueService.add<BlocklistReimportCalendarEventsJobData>(
          BlocklistReimportCalendarEventsJob.name,
          {
            workspaceId: payload.workspaceId,
            workspaceMemberId:
              eventPayload.properties.before.workspaceMember.id,
          },
        ),
      ),
    );
  }

  @OnEvent('blocklist.updated')
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<BlocklistWorkspaceEntity>
    >,
  ) {
    await Promise.all(
      payload.events.reduce((acc: Promise<void>[], eventPayload) => {
        acc.push(
          this.messageQueueService.add<BlocklistItemDeleteCalendarEventsJobData>(
            BlocklistItemDeleteCalendarEventsJob.name,
            {
              workspaceId: payload.workspaceId,
              blocklistItemId: eventPayload.recordId,
            },
          ),
        );

        acc.push(
          this.messageQueueService.add<BlocklistReimportCalendarEventsJobData>(
            BlocklistReimportCalendarEventsJob.name,
            {
              workspaceId: payload.workspaceId,
              workspaceMemberId:
                eventPayload.properties.after.workspaceMember.id,
            },
          ),
        );

        return acc;
      }, []),
    );
  }
}
