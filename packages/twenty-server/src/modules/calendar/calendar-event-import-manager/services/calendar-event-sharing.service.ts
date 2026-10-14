import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { Any, Not } from 'typeorm';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { computeCalendarEventSharingKey } from 'src/modules/calendar/calendar-event-import-manager/utils/compute-calendar-event-sharing-key.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';

@Injectable()
export class CalendarEventSharingService {
  constructor(
    @InjectWorkspaceScopedRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: WorkspaceScopedRepository<CalendarChannelEntity>,
  ) {}

  public async findOtherCalendarChannels({
    workspaceId,
    calendarChannelId,
    provider,
  }: {
    workspaceId: string;
    calendarChannelId: string;
    provider: ConnectedAccountProvider;
  }): Promise<CalendarChannelEntity[]> {
    return this.calendarChannelRepository.find(workspaceId, {
      where: {
        id: Not(calendarChannelId),
        connectedAccount: { provider },
      },
      relations: { connectedAccount: true },
      select: {
        id: true,
        handle: true,
        syncStatus: true,
        isSyncEnabled: true,
        connectedAccount: { id: true, handleAliases: true },
      },
    });
  }

  public async lockCalendarEventSharingKeys({
    transactionScope,
    provider,
    fetchedCalendarEvents,
  }: {
    transactionScope: WorkspaceTransactionScope;
    provider: ConnectedAccountProvider;
    fetchedCalendarEvents: FetchedCalendarEvent[];
  }): Promise<void> {
    const sharingKeys = fetchedCalendarEvents
      .map((fetchedCalendarEvent) =>
        computeCalendarEventSharingKey({
          provider,
          eventExternalId: fetchedCalendarEvent.id,
          iCalUid: fetchedCalendarEvent.iCalUid,
        }),
      )
      .filter(isDefined);

    for (const sharingKey of [...new Set(sharingKeys)].sort()) {
      await transactionScope.executeRawQuery(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [
          `calendar-event-sharing:${transactionScope.workspaceId}:${provider}:${sharingKey}`,
        ],
      );
    }
  }

  public async findCalendarEventIdsToLink({
    transactionScope,
    provider,
    otherCalendarChannels,
    fetchedCalendarEvents,
  }: {
    transactionScope: WorkspaceTransactionScope;
    provider: ConnectedAccountProvider;
    otherCalendarChannels: CalendarChannelEntity[];
    fetchedCalendarEvents: FetchedCalendarEvent[];
  }): Promise<Map<string, string>> {
    if (
      fetchedCalendarEvents.length === 0 ||
      otherCalendarChannels.length === 0
    ) {
      return new Map();
    }

    const associationRepository =
      transactionScope.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
        'calendarChannelEventAssociation',
        { shouldBypassPermissionChecks: true },
      );
    const otherCalendarChannelIds = otherCalendarChannels.map(({ id }) => id);

    let otherChannelAssociations: CalendarChannelEventAssociationWorkspaceEntity[];

    switch (provider) {
      case ConnectedAccountProvider.GOOGLE:
        otherChannelAssociations = await associationRepository.find({
          where: {
            calendarChannelId: Any(otherCalendarChannelIds),
            eventExternalId: Any(fetchedCalendarEvents.map(({ id }) => id)),
          },
          relations: { calendarEvent: true },
          order: { calendarEventId: 'ASC' },
        });
        break;
      case ConnectedAccountProvider.MICROSOFT:
        otherChannelAssociations = await associationRepository.find({
          where: {
            calendarChannelId: Any(otherCalendarChannelIds),
            calendarEvent: {
              iCalUid: Any(
                fetchedCalendarEvents
                  .map(({ iCalUid }) => iCalUid)
                  .filter(isNonEmptyString),
              ),
            },
          },
          relations: { calendarEvent: true },
          order: { calendarEventId: 'ASC' },
        });
        break;
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      case ConnectedAccountProvider.OIDC:
      case ConnectedAccountProvider.SAML:
      case ConnectedAccountProvider.EMAIL_GROUP:
      case ConnectedAccountProvider.APP:
        return new Map();
      default:
        return assertUnreachable(provider);
    }

    const calendarEventIdBySharingKey = new Map<string, string>();

    for (const association of otherChannelAssociations) {
      const sharingKey = computeCalendarEventSharingKey({
        provider,
        eventExternalId: association.eventExternalId,
        iCalUid: association.calendarEvent.iCalUid,
      });

      if (
        isDefined(sharingKey) &&
        !calendarEventIdBySharingKey.has(sharingKey)
      ) {
        calendarEventIdBySharingKey.set(
          sharingKey,
          association.calendarEventId,
        );
      }
    }

    const calendarEventIdToLinkByEventExternalId = new Map<string, string>();

    for (const fetchedCalendarEvent of fetchedCalendarEvents) {
      const sharingKey = computeCalendarEventSharingKey({
        provider,
        eventExternalId: fetchedCalendarEvent.id,
        iCalUid: fetchedCalendarEvent.iCalUid,
      });
      const calendarEventId = isDefined(sharingKey)
        ? calendarEventIdBySharingKey.get(sharingKey)
        : undefined;

      if (isDefined(calendarEventId)) {
        calendarEventIdToLinkByEventExternalId.set(
          fetchedCalendarEvent.id,
          calendarEventId,
        );
      }
    }

    if (calendarEventIdToLinkByEventExternalId.size === 0) {
      return calendarEventIdToLinkByEventExternalId;
    }

    const lockedCalendarEvents = await transactionScope
      .getRepository<CalendarEventWorkspaceEntity>('calendarEvent', {
        shouldBypassPermissionChecks: true,
      })
      .find({
        where: {
          id: Any([...calendarEventIdToLinkByEventExternalId.values()]),
        },
        select: { id: true },
        order: { id: 'ASC' },
        lock: { mode: 'for_key_share' },
      });
    const lockedCalendarEventIds = new Set(
      lockedCalendarEvents.map(({ id }) => id),
    );

    for (const [
      eventExternalId,
      calendarEventId,
    ] of calendarEventIdToLinkByEventExternalId) {
      if (!lockedCalendarEventIds.has(calendarEventId)) {
        calendarEventIdToLinkByEventExternalId.delete(eventExternalId);
      }
    }

    return calendarEventIdToLinkByEventExternalId;
  }

  public async findOtherChannelIdsByCalendarEventId({
    transactionScope,
    calendarChannelId,
    calendarEventIds,
  }: {
    transactionScope: WorkspaceTransactionScope;
    calendarChannelId: string;
    calendarEventIds: string[];
  }): Promise<Map<string, string[]>> {
    if (calendarEventIds.length === 0) {
      return new Map();
    }

    const otherChannelAssociations = await transactionScope
      .getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
        'calendarChannelEventAssociation',
        { shouldBypassPermissionChecks: true },
      )
      .find({
        where: {
          calendarEventId: Any(calendarEventIds),
          calendarChannelId: Not(calendarChannelId),
        },
        select: { calendarEventId: true, calendarChannelId: true },
      });

    const otherChannelIdsByCalendarEventId = new Map<string, string[]>();

    for (const {
      calendarEventId,
      calendarChannelId: otherChannelId,
    } of otherChannelAssociations) {
      otherChannelIdsByCalendarEventId.set(calendarEventId, [
        ...(otherChannelIdsByCalendarEventId.get(calendarEventId) ?? []),
        otherChannelId,
      ]);
    }

    return otherChannelIdsByCalendarEventId;
  }
}
