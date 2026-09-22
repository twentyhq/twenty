import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, MoreThan } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
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
        await this.workspaceOrmManager.runInWorkspaceTransaction(
          (transactionScope) =>
            this.deleteCalendarChannelEventAssociationsByChannelIdInTransaction(
              { workspaceId, calendarChannelId, transactionScope },
            ),
        );
      },
      authContext,
      { lite: true },
    );
  }

  public async deleteCalendarChannelEventAssociationsByChannelIdInTransaction({
    workspaceId,
    calendarChannelId,
    transactionScope,
  }: {
    workspaceId: string;
    calendarChannelId: string;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    const calendarChannelEventAssociationRepository =
      transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
        'calendarChannelEventAssociation',
      );

    for (;;) {
      const associations = await calendarChannelEventAssociationRepository.find(
        {
          where: { calendarChannelId },
          take: CALENDAR_CLEANUP_PAGE_SIZE,
          select: { id: true },
        },
      );

      if (associations.length === 0) {
        break;
      }

      const ids = associations.map(({ id }) => id);

      this.logger.log(
        `WorkspaceId: ${workspaceId} Deleting ${ids.length} calendar channel event associations for channel ${calendarChannelId}`,
      );

      await calendarChannelEventAssociationRepository.delete(ids);
    }
  }

  public async deleteCalendarChannelEventAssociationsAndRelatedOrphansInTransaction({
    workspaceId,
    calendarChannelId,
    transactionScope,
  }: {
    workspaceId: string;
    calendarChannelId: string;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    const calendarChannelEventAssociationRepository =
      transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
        'calendarChannelEventAssociation',
      );
    const candidateCalendarEventIds = new Set<string>();

    for (;;) {
      const associations = await calendarChannelEventAssociationRepository.find(
        {
          where: { calendarChannelId },
          take: CALENDAR_CLEANUP_PAGE_SIZE,
          select: { id: true, calendarEventId: true },
        },
      );

      if (associations.length === 0) {
        break;
      }

      associations.forEach(({ calendarEventId }) =>
        candidateCalendarEventIds.add(calendarEventId),
      );

      await calendarChannelEventAssociationRepository.delete(
        associations.map(({ id }) => id),
      );

      this.logger.log(
        `WorkspaceId: ${workspaceId} Deleting ${associations.length} calendar channel event associations for channel ${calendarChannelId}`,
      );
    }

    await this.deleteOrphanedCalendarEventsInTransaction({
      calendarEventIds: [...candidateCalendarEventIds],
      transactionScope,
    });
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
          (transactionScope) =>
            this.deleteOrphanedCalendarEventsInTransaction({
              calendarEventIds,
              transactionScope,
            }),
        );
      },
      authContext,
      { lite: true },
    );
  }

  public async deleteOrphanedCalendarEventsInTransaction({
    calendarEventIds,
    transactionScope,
  }: {
    calendarEventIds: string[];
    transactionScope: WorkspaceTransactionScope;
  }): Promise<void> {
    const calendarEventRepository =
      transactionScope.getRepository<CalendarEventWorkspaceEntity>(
        'calendarEvent',
      );
    const calendarChannelEventAssociationRepository =
      transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
        'calendarChannelEventAssociation',
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

      const associations = await calendarChannelEventAssociationRepository.find(
        {
          where: { calendarEventId: In(pageIds) },
          select: { calendarEventId: true },
        },
      );

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
  }

  public async cleanWorkspaceCalendarEvents(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.workspaceOrmManager.runInWorkspaceTransaction(
          (transactionScope) =>
            this.cleanWorkspaceCalendarEventsInTransaction(transactionScope),
        );
      },
      authContext,
      { lite: true },
    );
  }

  public async cleanWorkspaceCalendarEventsInTransaction(
    transactionScope: WorkspaceTransactionScope,
  ): Promise<void> {
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

      const associations = await calendarChannelEventAssociationRepository.find(
        {
          where: { calendarEventId: In(pageIds) },
          select: { calendarEventId: true },
        },
      );

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
  }
}
