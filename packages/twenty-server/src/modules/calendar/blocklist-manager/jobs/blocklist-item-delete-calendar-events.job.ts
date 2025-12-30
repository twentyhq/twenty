import { Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { And, Any, ILike, In, Not, Or } from 'typeorm';
import { type ObjectRecordCreateEvent } from 'twenty-shared/database-events';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventCleanerService } from 'src/modules/calendar/calendar-event-cleaner/services/calendar-event-cleaner.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

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
    private readonly calendarEventCleanerService: CalendarEventCleanerService,
  ) {}

  @Process(BlocklistItemDeleteCalendarEventsJob.name)
  async handle(data: BlocklistItemDeleteCalendarEventsJobData): Promise<void> {
    const workspaceId = data.workspaceId;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
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

        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        const calendarChannelEventAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
            workspaceId,
            'calendarChannelEventAssociation',
          );

        for (const workspaceMemberId of handlesToDeleteByWorkspaceMemberIdMap.keys()) {
          const handles =
            handlesToDeleteByWorkspaceMemberIdMap.get(workspaceMemberId);

          if (!handles) {
            continue;
          }

          const calendarChannels = await calendarChannelRepository.find({
            select: {
              id: true,
              handle: true,
              connectedAccount: {
                handleAliases: true,
              },
            },
            where: {
              connectedAccount: {
                accountOwnerId: workspaceMemberId,
              },
            },
            relations: ['connectedAccount'],
          });

          for (const calendarChannel of calendarChannels) {
            const calendarChannelHandles = [calendarChannel.handle];

            if (calendarChannel.connectedAccount.handleAliases) {
              calendarChannelHandles.push(
                ...calendarChannel.connectedAccount.handleAliases.split(','),
              );
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
      },
    );
  }
}
