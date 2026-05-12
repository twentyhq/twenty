import { Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ObjectRecordCreateEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';
import { And, Any, ILike, In, Not, Or, type Repository } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';

export type BlocklistItemDeleteCalendarEventsJobData = WorkspaceEventBatch<
  ObjectRecordCreateEvent<BlocklistWorkspaceEntity>
>;

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class BlocklistItemDeleteCalendarEventsJob {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
  ) {}

  @Process(BlocklistItemDeleteCalendarEventsJob.name)
  async handle(data: BlocklistItemDeleteCalendarEventsJobData): Promise<void> {
    const workspaceId = data.workspaceId;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const blocklistItemIds = data.events.map(
        (eventPayload) => eventPayload.recordId,
      );

      const blocklistRepository =
        await this.globalWorkspaceOrmManager.getRepository<BlocklistWorkspaceEntity>(
          workspaceId,
          'blocklist',
        );

      const blocklist = await blocklistRepository.find({
        where: {
          id: Any(blocklistItemIds),
        },
      });

      const handlesToDeleteByWorkspaceMemberIdMap = blocklist.reduce(
        (acc, blocklistItem) => {
          const { handle, workspaceMemberId } = blocklistItem;

          if (!acc.has(workspaceMemberId)) {
            acc.set(workspaceMemberId, []);
          }

          if (!isDefined(handle)) {
            return acc;
          }

          acc.get(workspaceMemberId)?.push(handle);

          return acc;
        },
        new Map<string, string[]>(),
      );

      const calendarChannelEventAssociationRepository =
        await this.globalWorkspaceOrmManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
          workspaceId,
          'calendarChannelEventAssociation',
        );

      const workspaceMemberRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          'workspaceMember',
          { shouldBypassPermissionChecks: true },
        );

      for (const workspaceMemberId of handlesToDeleteByWorkspaceMemberIdMap.keys()) {
        const handles =
          handlesToDeleteByWorkspaceMemberIdMap.get(workspaceMemberId);

        if (!handles) {
          continue;
        }

        const workspaceMember = await workspaceMemberRepository.findOne({
          where: { id: workspaceMemberId },
        });

        if (!workspaceMember) {
          continue;
        }

        const userWorkspace = await this.userWorkspaceRepository.findOne({
          where: { userId: workspaceMember.userId, workspaceId },
          select: ['id'],
        });

        if (!userWorkspace) {
          continue;
        }

        const calendarChannels = await this.calendarChannelRepository.find({
          select: {
            id: true,
            handle: true,
            connectedAccount: {
              handleAliases: true,
            },
          },
          where: {
            connectedAccount: { userWorkspaceId: userWorkspace.id },
            workspaceId,
          },
          relations: ['connectedAccount'],
        });

        for (const calendarChannel of calendarChannels) {
          const calendarChannelHandles = [calendarChannel.handle];

          if (calendarChannel.connectedAccount.handleAliases) {
            const rawAliases = calendarChannel.connectedAccount
              .handleAliases as string | string[];

            const aliasList = Array.isArray(rawAliases)
              ? rawAliases
              : rawAliases.split(',').map((alias: string) => alias.trim());

            calendarChannelHandles.push(...aliasList);
          }

          const handleConditions = handles.map((handle) => {
            const isHandleDomain = handle.startsWith('@');

            return isHandleDomain
              ? {
                  handle: And(
                    Or(ILike(`%${handle}`), ILike(`%.${handle.slice(1)}`)),
                    Not(In(calendarChannelHandles)),
                  ),
                }
              : { handle };
          });

          const calendarEventsAssociationsToDelete =
            await calendarChannelEventAssociationRepository.find({
              where: {
                calendarChannelId: calendarChannel.id,
                calendarEvent: {
                  calendarEventParticipants: handleConditions,
                },
              },
            });

          if (calendarEventsAssociationsToDelete.length === 0) {
            continue;
          }

          await calendarChannelEventAssociationRepository.delete(
            calendarEventsAssociationsToDelete.map(({ id }) => id),
          );
        }
      }

      await this.calendarEventCleanerService.cleanWorkspaceCalendarEvents(
        workspaceId,
      );
    }, authContext);
  }
}
