import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, MoreThan } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

const CALENDAR_CLEANUP_PAGE_SIZE = 500;

@Injectable()
export class CalendarEventCleanerService {
  private readonly logger = new Logger(CalendarEventCleanerService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async deleteCalendarChannelEventAssociationsByChannelId({
    workspaceId,
    calendarChannelId,
  }: {
    workspaceId: string;
    calendarChannelId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.globalWorkspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const calendarChannelEventAssociationRepository =
              transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                'calendarChannelEventAssociation',
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
          },
        );
      },
      authContext,
      { lite: true },
    );
  }

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.globalWorkspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const calendarEventRepository =
              transactionScope.getRepository<CalendarEventWorkspaceEntity>(
                'calendarEvent',
              );
            const calendarChannelEventAssociationRepository =
              transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                'calendarChannelEventAssociation',
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
