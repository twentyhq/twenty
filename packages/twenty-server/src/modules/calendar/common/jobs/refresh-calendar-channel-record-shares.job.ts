import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CalendarChannelRecordShareService } from 'src/modules/calendar/common/services/calendar-channel-record-share.service';

export type RefreshCalendarChannelRecordSharesJobData = {
  workspaceId: string;
  calendarChannelId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class RefreshCalendarChannelRecordSharesJob {
  constructor(
    private readonly calendarChannelRecordShareService: CalendarChannelRecordShareService,
  ) {}

  @Process(RefreshCalendarChannelRecordSharesJob.name)
  async handle(data: RefreshCalendarChannelRecordSharesJobData): Promise<void> {
    await this.calendarChannelRecordShareService.rebuildRecordSharesForCalendarChannel(
      data,
    );
  }
}
