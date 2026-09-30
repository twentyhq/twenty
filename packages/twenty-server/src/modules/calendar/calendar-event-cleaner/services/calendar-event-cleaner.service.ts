import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, MoreThan } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CALENDAR_EVENT_CHANNEL_RECORD_SHARE_SOURCE } from 'src/modules/connected-account/channel-record-share/constants/calendar-event-channel-record-share-source.constant';
import { ChannelRecordShareService } from 'src/modules/connected-account/channel-record-share/services/channel-record-share.service';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

const CALENDAR_CLEANUP_PAGE_SIZE = 500;

@Injectable()
export class CalendarEventCleanerService {
  private readonly logger = new Logger(CalendarEventCleanerService.name);

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly channelRecordShareService: ChannelRecordShareService,
  ) {}

  async deleteCalendarChannelEventAssociationsByChannelId({
    workspaceId,
    calendarChannelId,
  }: {
    workspaceId: string;
    calendarChannelId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const calendarChannelEventAssociationRepository =
              transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                'calendarChannelEventAssociation',
                { shouldBypassPermissionChecks: true },
              );

            for (;;) {
              const associations =
                await calendarChannelEventAssociationRepository.find({
                  where: { calendarChannelId },
                  take: CALENDAR_CLEANUP_PAGE_SIZE,
                  select: { id: true },
                });

              if (associations.length === 0) {
                break;
              }

              const ids = associations.map(({ id }) => id);

              this.logger.log(
                `WorkspaceId: ${workspaceId} Deleting ${ids.length} calendar channel event associations for channel ${calendarChannelId}`,
              );

              await calendarChannelEventAssociationRepository.delete(ids);
            }

            await this.channelRecordShareService.syncChannelRecordSharesInTransaction(
              {
                transactionScope,
                source: CALENDAR_EVENT_CHANNEL_RECORD_SHARE_SOURCE,
                channelId: calendarChannelId,
              },
            );
          },
        );
      },
      authContext,
      { lite: true },
    );
  }

  async deleteCalendarChannelEventAssociationsAndOrphans({
    workspaceId,
    calendarChannelId,
    eventExternalIds,
  }: {
    workspaceId: string;
    calendarChannelId: string;
    eventExternalIds: string[];
  }) {
    if (eventExternalIds.length === 0) {
      return;
    }

    const calendarEventIds =
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          const calendarChannelEventAssociationRepository =
            transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
              'calendarChannelEventAssociation',
              { shouldBypassPermissionChecks: true },
            );

          const associationsToDelete =
            await calendarChannelEventAssociationRepository.find({
              where: {
                eventExternalId: In(eventExternalIds),
                calendarChannelId,
              },
              select: { calendarEventId: true },
            });

          await calendarChannelEventAssociationRepository.delete({
            eventExternalId: In(eventExternalIds),
            calendarChannelId,
          });

          const deletedCalendarEventIds = associationsToDelete.map(
            ({ calendarEventId }) => calendarEventId,
          );

          await this.channelRecordShareService.syncChannelRecordSharesInTransaction(
            {
              transactionScope,
              source: CALENDAR_EVENT_CHANNEL_RECORD_SHARE_SOURCE,
              channelId: calendarChannelId,
              recordIds: deletedCalendarEventIds,
            },
          );

          return deletedCalendarEventIds;
        },
      );

    await this.deleteOrphanedCalendarEvents({ calendarEventIds, workspaceId });
  }

  public async deleteOrphanedCalendarEvents({
    calendarEventIds,
    workspaceId,
  }: {
    calendarEventIds: string[];
    workspaceId: string;
  }) {
    if (calendarEventIds.length === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const calendarEventRepository =
              transactionScope.getRepository<CalendarEventWorkspaceEntity>(
                'calendarEvent',
                { shouldBypassPermissionChecks: true },
              );
            const calendarChannelEventAssociationRepository =
              transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                'calendarChannelEventAssociation',
                { shouldBypassPermissionChecks: true },
              );

            for (
              let index = 0;
              index < calendarEventIds.length;
              index += CALENDAR_CLEANUP_PAGE_SIZE
            ) {
              const pageIds = calendarEventIds.slice(
                index,
                index + CALENDAR_CLEANUP_PAGE_SIZE,
              );

              const associations =
                await calendarChannelEventAssociationRepository.find({
                  where: { calendarEventId: In(pageIds) },
                  select: { calendarEventId: true },
                });

              const referencedEventIds = new Set(
                associations.map(({ calendarEventId }) => calendarEventId),
              );

              const orphanEventIds = pageIds.filter(
                (eventId) => !referencedEventIds.has(eventId),
              );

              if (orphanEventIds.length > 0) {
                await calendarEventRepository.delete(orphanEventIds);
              }
            }
          },
        );
      },
      authContext,
      { lite: true },
    );
  }

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const calendarEventRepository =
              transactionScope.getRepository<CalendarEventWorkspaceEntity>(
                'calendarEvent',
                { shouldBypassPermissionChecks: true },
              );
            const calendarChannelEventAssociationRepository =
              transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                'calendarChannelEventAssociation',
                { shouldBypassPermissionChecks: true },
              );

            let cursor: string | undefined;

            for (;;) {
              const page = await calendarEventRepository.find({
                where: isDefined(cursor) ? { id: MoreThan(cursor) } : {},
                order: { id: 'ASC' },
                take: CALENDAR_CLEANUP_PAGE_SIZE,
                select: { id: true },
              });

              if (page.length === 0) {
                break;
              }

              cursor = page[page.length - 1].id;

              const pageIds = page.map(({ id }) => id);

              const associations =
                await calendarChannelEventAssociationRepository.find({
                  where: { calendarEventId: In(pageIds) },
                  select: { calendarEventId: true },
                });

              const referencedEventIds = new Set(
                associations.map(({ calendarEventId }) => calendarEventId),
              );

              const orphanEventIds = pageIds.filter(
                (eventId) => !referencedEventIds.has(eventId),
              );

              if (orphanEventIds.length > 0) {
                await calendarEventRepository.delete(orphanEventIds);
              }
            }
          },
        );
      },
      authContext,
      { lite: true },
    );
  }
}
