import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { In, MoreThan } from 'typeorm';

import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

const CALENDAR_CLEANUP_PAGE_SIZE = 500;

@Injectable()
export class CalendarEventCleanerService {
  private readonly logger = new Logger(CalendarEventCleanerService.name);

  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

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
        let deletedAssociationCount: number;

        do {
          deletedAssociationCount =
            await this.workspaceOrmManager.runInWorkspaceTransaction(
              async (transactionScope) => {
                const calendarChannelEventAssociationRepository =
                  transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
                    'calendarChannelEventAssociation',
                    { shouldBypassPermissionChecks: true },
                  );

                const associations =
                  await calendarChannelEventAssociationRepository.find({
                    where: { calendarChannelId },
                    take: CALENDAR_CLEANUP_PAGE_SIZE,
                    select: { id: true },
                  });

                if (associations.length === 0) {
                  return 0;
                }

                const ids = associations.map(({ id }) => id);

                this.logger.log(
                  `WorkspaceId: ${workspaceId} Deleting ${ids.length} calendar channel event associations for channel ${calendarChannelId}`,
                );

                await calendarChannelEventAssociationRepository.delete(ids);

                return ids.length;
              },
            );
        } while (deletedAssociationCount > 0);
      },
      authContext,
      { lite: true },
    );
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
        for (const calendarEventIdsChunk of chunk(
          calendarEventIds,
          CALENDAR_CLEANUP_PAGE_SIZE,
        )) {
          await this.workspaceOrmManager.runInWorkspaceTransaction(
            (transactionScope) =>
              this.deleteOrphansAmongCalendarEvents(
                transactionScope,
                calendarEventIdsChunk,
              ),
          );
        }
      },
      authContext,
      { lite: true },
    );
  }

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        let cursor: string | undefined;

        do {
          cursor = await this.workspaceOrmManager.runInWorkspaceTransaction(
            async (transactionScope) => {
              const calendarEventRepository =
                transactionScope.getRepository<CalendarEventWorkspaceEntity>(
                  'calendarEvent',
                  { shouldBypassPermissionChecks: true },
                );

              const page = await calendarEventRepository.find({
                where: isDefined(cursor) ? { id: MoreThan(cursor) } : {},
                order: { id: 'ASC' },
                take: CALENDAR_CLEANUP_PAGE_SIZE,
                select: { id: true },
              });

              if (page.length === 0) {
                return undefined;
              }

              const pageIds = page.map(({ id }) => id);

              await this.deleteOrphansAmongCalendarEvents(
                transactionScope,
                pageIds,
              );

              return pageIds[pageIds.length - 1];
            },
          );
        } while (isDefined(cursor));
      },
      authContext,
      { lite: true },
    );
  }

  private async deleteOrphansAmongCalendarEvents(
    transactionScope: WorkspaceTransactionScope,
    calendarEventIds: string[],
  ): Promise<void> {
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

    const associations = await calendarChannelEventAssociationRepository.find({
      where: { calendarEventId: In(calendarEventIds) },
      select: { calendarEventId: true },
    });

    const referencedEventIds = new Set(
      associations.map(({ calendarEventId }) => calendarEventId),
    );

    const orphanEventIds = calendarEventIds.filter(
      (eventId) => !referencedEventIds.has(eventId),
    );

    if (orphanEventIds.length > 0) {
      await calendarEventRepository.delete(orphanEventIds);
    }
  }
}
