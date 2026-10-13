import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Any, Not, Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type CalendarEventSharingProvider } from 'src/modules/calendar/calendar-event-import-manager/types/calendar-event-sharing-provider.type';
import { buildCalendarEventIdSharedByEventExternalId } from 'src/modules/calendar/calendar-event-import-manager/utils/build-calendar-event-id-shared-by-event-external-id.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event.type';

@Injectable()
export class CalendarEventSharingService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly featureFlagService: FeatureFlagService,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
  ) {}

  public async findSharingProvider({
    connectedAccount,
    workspaceId,
  }: {
    connectedAccount: Pick<ConnectedAccountEntity, 'provider'>;
    workspaceId: string;
  }): Promise<CalendarEventSharingProvider | undefined> {
    const { provider } = connectedAccount;

    if (
      provider !== ConnectedAccountProvider.GOOGLE &&
      provider !== ConnectedAccountProvider.MICROSOFT
    ) {
      return undefined;
    }

    const isSharingEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_CALENDAR_EVENT_SHARED_ACROSS_CHANNELS_ENABLED,
      workspaceId,
    );

    return isSharingEnabled ? provider : undefined;
  }

  public async findCalendarEventIdSharedByEventExternalId({
    sharingProvider,
    calendarChannel,
    workspaceId,
    fetchedCalendarEvents,
  }: {
    sharingProvider: CalendarEventSharingProvider | undefined;
    calendarChannel: Pick<CalendarChannelEntity, 'id'>;
    workspaceId: string;
    fetchedCalendarEvents: FetchedCalendarEvent[];
  }): Promise<Map<string, string>> {
    if (!isDefined(sharingProvider) || fetchedCalendarEvents.length === 0) {
      return new Map();
    }

    const calendarChannelEventAssociationRepository =
      this.getCalendarChannelEventAssociationRepository();

    if (sharingProvider === ConnectedAccountProvider.GOOGLE) {
      const otherChannelAssociations =
        await calendarChannelEventAssociationRepository.find({
          where: {
            eventExternalId: Any(fetchedCalendarEvents.map(({ id }) => id)),
          },
        });

      return buildCalendarEventIdSharedByEventExternalId({
        provider: sharingProvider,
        fetchedCalendarEvents,
        otherChannelAssociations,
        otherChannelCalendarEvents: [],
      });
    }

    const iCalUids = fetchedCalendarEvents
      .map(({ iCalUid }) => iCalUid)
      .filter(isNonEmptyString);

    if (iCalUids.length === 0) {
      return new Map();
    }

    const otherMicrosoftCalendarChannels =
      await this.calendarChannelRepository.find({
        select: { id: true },
        where: {
          workspaceId,
          id: Not(calendarChannel.id),
          connectedAccount: { provider: sharingProvider },
        },
      });

    if (otherMicrosoftCalendarChannels.length === 0) {
      return new Map();
    }

    const otherChannelCalendarEvents = await this.workspaceOrmManager
      .getRepository<CalendarEventWorkspaceEntity>('calendarEvent', {
        shouldBypassPermissionChecks: true,
      })
      .find({ where: { iCalUid: Any(iCalUids) } });

    if (otherChannelCalendarEvents.length === 0) {
      return new Map();
    }

    const otherChannelAssociations =
      await calendarChannelEventAssociationRepository.find({
        where: {
          calendarEventId: Any(otherChannelCalendarEvents.map(({ id }) => id)),
          calendarChannelId: Any(
            otherMicrosoftCalendarChannels.map(({ id }) => id),
          ),
        },
      });

    return buildCalendarEventIdSharedByEventExternalId({
      provider: sharingProvider,
      fetchedCalendarEvents,
      otherChannelAssociations,
      otherChannelCalendarEvents,
    });
  }

  public async findCalendarEventIdsSharedWithOtherChannels({
    sharingProvider,
    calendarChannel,
    calendarEventIds,
  }: {
    sharingProvider: CalendarEventSharingProvider | undefined;
    calendarChannel: Pick<CalendarChannelEntity, 'id'>;
    calendarEventIds: string[];
  }): Promise<Set<string>> {
    if (!isDefined(sharingProvider) || calendarEventIds.length === 0) {
      return new Set();
    }

    const otherChannelAssociations =
      await this.getCalendarChannelEventAssociationRepository().find({
        where: {
          calendarEventId: Any(calendarEventIds),
          calendarChannelId: Not(calendarChannel.id),
        },
      });

    return new Set(
      otherChannelAssociations.map(({ calendarEventId }) => calendarEventId),
    );
  }

  private getCalendarChannelEventAssociationRepository() {
    return this.workspaceOrmManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
      'calendarChannelEventAssociation',
      { shouldBypassPermissionChecks: true },
    );
  }
}
