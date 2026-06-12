import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  CONNECTED_ACCOUNT_DELETED_EVENT,
  type ConnectedAccountDeletedEvent,
} from 'src/engine/metadata-modules/connected-account/constants/connected-account-deleted.constant';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import {
  DeleteConnectedAccountAssociatedCalendarDataJob,
  type DeleteConnectedAccountAssociatedCalendarDataJobData,
} from 'src/modules/calendar/calendar-event-cleaner/jobs/delete-connected-account-associated-calendar-data.job';

@Injectable()
export class CalendarEventCleanerConnectedAccountListener {
  constructor(
    @InjectMessageQueue(MessageQueue.calendarQueue)
    private readonly calendarQueueService: MessageQueueService,
  ) {}

  @OnCustomBatchEvent(CONNECTED_ACCOUNT_DELETED_EVENT)
  async handleDeletedEvent(
    batchEvent: CustomWorkspaceEventBatch<ConnectedAccountDeletedEvent>,
  ) {
    const { workspaceId } = batchEvent;

    if (!isDefined(workspaceId)) {
      return;
    }

    await Promise.all(
      batchEvent.events.map((event) =>
        this.calendarQueueService.add<DeleteConnectedAccountAssociatedCalendarDataJobData>(
          DeleteConnectedAccountAssociatedCalendarDataJob.name,
          {
            workspaceId,
            connectedAccountId: event.connectedAccountId,
          },
        ),
      ),
    );
  }
}
