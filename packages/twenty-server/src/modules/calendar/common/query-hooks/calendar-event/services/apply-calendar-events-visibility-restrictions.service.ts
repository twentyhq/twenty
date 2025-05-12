import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { In } from 'typeorm';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class ApplyCalendarEventsVisibilityRestrictionsService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  public async applyCalendarEventsVisibilityRestrictions(
    workspaceMemberId: string,
    calendarEvents: CalendarEventWorkspaceEntity[],
  ) {
    const calendarChannelEventAssociationRepository =
      await this.twentyORMManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
        'calendarChannelEventAssociation',
      );

    const calendarChannelCalendarEventsAssociations =
      await calendarChannelEventAssociationRepository.find({
        where: {
          calendarEventId: In(calendarEvents.map((event) => event.id)),
        },
        relations: ['calendarChannel'],
      });

    const connectedAccountRepository =
      await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
        'connectedAccount',
      );

    for (let i = calendarEvents.length - 1; i >= 0; i--) {
      const calendarChannelCalendarEventAssociations =
        calendarChannelCalendarEventsAssociations.filter(
          (association) => association.calendarEventId === calendarEvents[i].id,
        );

      const calendarChannels = calendarChannelCalendarEventAssociations.map(
        (association) => association.calendarChannel,
      );

      const calendarChannelsGroupByVisibility = groupBy(
        calendarChannels,
        (channel) => channel.visibility,
      );

      if (
        calendarChannelsGroupByVisibility[
          CalendarChannelVisibility.SHARE_EVERYTHING
        ]
      ) {
        continue;
      }

      const connectedAccounts = await connectedAccountRepository.find({
        select: ['id'],
        where: {
          calendarChannels: {
            id: In(calendarChannels.map((channel) => channel.id)),
          },
          accountOwnerId: workspaceMemberId,
        },
      });

      if (connectedAccounts.length > 0) {
        continue;
      }

      if (
        calendarChannelsGroupByVisibility[CalendarChannelVisibility.METADATA]
      ) {
        calendarEvents[i].title =
          FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
        calendarEvents[i].description =
          FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
        continue;
      }

      calendarEvents.splice(i, 1);
    }

    return calendarEvents;
  }
}
