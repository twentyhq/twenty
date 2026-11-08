import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';
import { type LinkedTimelineActivityDeletion } from 'src/modules/timeline/types/linked-timeline-activity-deletion.type';

@Processor({
  queueName: MessageQueue.deleteCascadeQueue,
  scope: Scope.REQUEST,
})
export class LinkedTimelineActivityDeletionJob {
  constructor(
    private readonly timelineActivityService: TimelineActivityService,
  ) {}

  @Process(LinkedTimelineActivityDeletionJob.name)
  async handle(data: LinkedTimelineActivityDeletion): Promise<void> {
    await this.timelineActivityService.deleteLinkedTimelineActivities(data);
  }
}
