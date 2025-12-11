import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ApplyCalendarEventsVisibilityRestrictionsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  public async applyCalendarEventsVisibilityRestrictions(
    calendarEvents: CalendarEventWorkspaceEntity[],
    workspaceId: string,
    userId?: string, // undefined when request is made with api key
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const calendarChannelEventAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
            workspaceId,
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
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'connectedAccount',
          );

        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
          );

        for (let i = calendarEvents.length - 1; i >= 0; i--) {
          const calendarChannelCalendarEventAssociations =
            calendarChannelCalendarEventsAssociations.filter(
              (association) =>
                association.calendarEventId === calendarEvents[i].id,
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

          if (isDefined(userId)) {
            const workspaceMember =
              await workspaceMemberRepository.findOneByOrFail({
                userId: userId,
              });

            const connectedAccounts = await connectedAccountRepository.find({
              select: ['id'],
              where: {
                calendarChannels: {
                  id: In(calendarChannels.map((channel) => channel.id)),
                },
                accountOwnerId: workspaceMember.id,
              },
            });

            if (connectedAccounts.length > 0) {
              continue;
            }
          }

          if (
            calendarChannelsGroupByVisibility[
              CalendarChannelVisibility.METADATA
            ]
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
      },
    );
  }
}
