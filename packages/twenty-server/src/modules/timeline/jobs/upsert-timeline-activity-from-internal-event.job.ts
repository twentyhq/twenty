import { type ObjectRecordNonDestructiveEvent } from 'twenty-shared/database-events';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';

@Processor(MessageQueue.entityEventsToDbQueue)
export class UpsertTimelineActivityFromInternalEvent {
  constructor(
    private readonly timelineActivityService: TimelineActivityService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(UpsertTimelineActivityFromInternalEvent.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordNonDestructiveEvent>,
  ): Promise<void> {
    if (workspaceEventBatch.events.length === 0) {
      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () =>
        await this.timelineActivityService.upsertEvents(workspaceEventBatch),
      buildSystemAuthContext(workspaceEventBatch.workspaceId),
    );
  }
}
