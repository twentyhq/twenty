import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Not, type Repository } from 'typeorm';
import { type ObjectRecordDeleteEvent } from 'twenty-shared/database-events';

import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';

export type BlocklistReimportCalendarEventsJobData = WorkspaceEventBatch<
  ObjectRecordDeleteEvent<BlocklistWorkspaceEntity>
>;

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class BlocklistReimportCalendarEventsJob {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
  ) {}

  @Process(BlocklistReimportCalendarEventsJob.name)
  async handle(data: BlocklistReimportCalendarEventsJobData): Promise<void> {
    const workspaceId = data.workspaceId;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workspaceMemberRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          'workspaceMember',
        );

      for (const eventPayload of data.events) {
        const workspaceMemberId =
          eventPayload.properties.before.workspaceMemberId;

        const workspaceMember = await workspaceMemberRepository.findOne({
          where: { id: workspaceMemberId },
        });

        if (!isDefined(workspaceMember)) {
          continue;
        }

        const userWorkspace = await this.userWorkspaceRepository.findOne({
          where: { userId: workspaceMember.userId, workspaceId },
          select: ['id'],
        });

        if (!isDefined(userWorkspace)) {
          continue;
        }

        const calendarChannels = await this.calendarChannelRepository.find({
          select: ['id'],
          where: {
            connectedAccount: { userWorkspaceId: userWorkspace.id },
            syncStage: Not(
              CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
            ),
            workspaceId,
          },
        });

        await this.calendarChannelSyncStatusService.resetAndMarkAsCalendarEventListFetchPending(
          calendarChannels.map((calendarChannel) => calendarChannel.id),
          workspaceId,
        );
      }
    }, authContext);
  }
}
