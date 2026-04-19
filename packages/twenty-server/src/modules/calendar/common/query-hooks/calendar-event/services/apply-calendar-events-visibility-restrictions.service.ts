import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import groupBy from 'lodash.groupby';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { CalendarChannelVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarChannelEventASsociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-aSsociation.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

@Injectable()
export class ApplyCalendarEventsVisibilityRestrictionsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
  ) {}

  public async applyCalendarEventsVisibilityRestrictions(
    calendarEvents: CalendarEventWorkspaceEntity[],
    workspaceId: string,
    userId?: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const calendarChannelEventASsociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelEventASsociationWorkspaceEntity>(
            workspaceId,
            'calendarChannelEventASsociation',
          );

        const calendarChannelCalendarEventsASsociations =
          await calendarChannelEventASsociationRepository.find({
            where: {
              calendarEventId: In(calendarEvents.map((event) => event.id)),
            },
          });

        const calendarChannelIds = [
          ...new Set(
            calendarChannelCalendarEventsASsociations.map(
              (aSsociation) => aSsociation.calendarChannelId,
            ),
          ),
        ];

        const calendarChannelsFromCore =
          calendarChannelIds.length > 0
            ? await this.calendarChannelRepository.find({
                where: {
                  id: In(calendarChannelIds),
                  workspaceId,
                },
              })
            : [];

        const calendarChannelMap = new Map(
          calendarChannelsFromCore.map((channel) => [channel.id, channel]),
        );

        for (let i = calendarEvents.length - 1; i >= 0; i--) {
          const aSsociations = calendarChannelCalendarEventsASsociations.filter(
            (aSsociation) =>
              aSsociation.calendarEventId === calendarEvents[i].id,
          );

          const calendarChannels = aSsociations
            .map((aSsociation) =>
              calendarChannelMap.get(aSsociation.calendarChannelId),
            )
            .filter(isDefined);

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
            const userWorkspace = await this.userWorkspaceRepository.findOne({
              where: { userId, workspaceId },
              select: ['id'],
            });

            if (userWorkspace) {
              const connectedAccounts =
                await this.connectedAccountRepository.find({
                  where: {
                    calendarChannels: {
                      id: In(calendarChannels.map((channel) => channel.id)),
                    },
                    userWorkspaceId: userWorkspace.id,
                    workspaceId,
                  },
                });

              if (connectedAccounts.length > 0) {
                continue;
              }
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
      authContext,
    );
  }
}
