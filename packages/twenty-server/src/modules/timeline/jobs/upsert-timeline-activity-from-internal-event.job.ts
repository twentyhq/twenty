import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';
import { type ObjectRecordNonDestructiveEvent } from 'twenty-shared/database-events';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { SYSTEM_OBJECTS_WITH_TIMELINE_ACTIVITIES } from 'src/modules/timeline/constants/system-objects-with-timeline-activities.constant';
import { TimelineActivityService } from 'src/modules/timeline/services/timeline-activity.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

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

    if (
      workspaceEventBatch.objectMetadata.isSystem &&
      !SYSTEM_OBJECTS_WITH_TIMELINE_ACTIVITIES.includes(
        workspaceEventBatch.objectMetadata.nameSingular,
      )
    ) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceEventBatch.workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceEventBatch.workspaceId,
            WorkspaceMemberWorkspaceEntity,
            {
              shouldBypassPermissionChecks: true,
            },
          );

        const userIds = workspaceEventBatch.events
          .map((event) => event.userId)
          .filter(isDefined);

        const workspaceMembers = await workspaceMemberRepository.findBy({
          userId: In(userIds),
        });

        for (const eventData of workspaceEventBatch.events) {
          const workspaceMember = workspaceMembers.find(
            (workspaceMember) => workspaceMember.userId === eventData.userId,
          );

          if (eventData.userId && workspaceMember) {
            eventData.workspaceMemberId = workspaceMember.id;
          }
        }

        await this.timelineActivityService.upsertEvents(workspaceEventBatch);
      },
    );
  }
}
