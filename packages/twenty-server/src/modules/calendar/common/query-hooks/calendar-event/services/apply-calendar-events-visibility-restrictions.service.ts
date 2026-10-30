import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import {
  CalendarChannelVisibility,
  type ObjectRecord,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';

const RESTRICTED_CALENDAR_EVENT_FIELD_NAMES = ['title', 'description'];

@Injectable()
export class ApplyCalendarEventsVisibilityRestrictionsService
  implements RecordVisibilityRestrictionHandler, OnModuleInit
{
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly commonRecordVisibilityService: CommonRecordVisibilityService,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
  ) {}

  onModuleInit() {
    this.commonRecordVisibilityService.registerHandler({
      objectNameSingular: 'calendarEvent',
      handler: this,
    });
  }

  public async applyVisibilityRestrictions({
    records,
    authContext,
  }: {
    records: ObjectRecord[];
    authContext: WorkspaceAuthContext;
  }): Promise<void> {
    const restrictableCalendarEvents = records.filter((calendarEvent) =>
      RESTRICTED_CALENDAR_EVENT_FIELD_NAMES.some(
        (fieldName) => fieldName in calendarEvent,
      ),
    );

    if (restrictableCalendarEvents.length === 0) {
      return;
    }

    const visibleCalendarEventIds = await this.findVisibleCalendarEventIds({
      calendarEvents: restrictableCalendarEvents,
      authContext,
    });

    for (const calendarEvent of restrictableCalendarEvents) {
      if (visibleCalendarEventIds.has(calendarEvent.id)) {
        continue;
      }

      for (const fieldName of RESTRICTED_CALENDAR_EVENT_FIELD_NAMES) {
        if (fieldName in calendarEvent) {
          calendarEvent[fieldName] =
            FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
        }
      }
    }
  }

  private async findVisibleCalendarEventIds({
    calendarEvents,
    authContext,
  }: {
    calendarEvents: ObjectRecord[];
    authContext: WorkspaceAuthContext;
  }): Promise<Set<string>> {
    const workspaceId = authContext.workspace.id;

    const calendarEventIds = [
      ...new Set(calendarEvents.map((calendarEvent) => calendarEvent.id)),
    ].filter(isDefined);

    if (calendarEventIds.length === 0) {
      return new Set();
    }

    const calendarChannelEventAssociations =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.workspaceOrmManager
            .getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
              'calendarChannelEventAssociation',
              { shouldBypassPermissionChecks: true },
            )
            .find({
              where: { calendarEventId: In(calendarEventIds) },
            }),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    const calendarChannelIds = [
      ...new Set(
        calendarChannelEventAssociations.map(
          (association) => association.calendarChannelId,
        ),
      ),
    ];

    if (calendarChannelIds.length === 0) {
      return new Set();
    }

    const calendarChannels = await this.calendarChannelRepository.find({
      where: { id: In(calendarChannelIds), workspaceId },
      select: {
        id: true,
        visibility: true,
        connectedAccount: { id: true, userWorkspaceId: true },
      },
      relations: { connectedAccount: true },
    });

    const viewerUserWorkspaceId = isUserAuthContext(authContext)
      ? authContext.userWorkspaceId
      : undefined;

    const visibleCalendarChannelIds = new Set(
      calendarChannels
        .filter(
          (calendarChannel) =>
            calendarChannel.visibility ===
              CalendarChannelVisibility.SHARE_EVERYTHING ||
            (isDefined(viewerUserWorkspaceId) &&
              calendarChannel.connectedAccount.userWorkspaceId ===
                viewerUserWorkspaceId),
        )
        .map((calendarChannel) => calendarChannel.id),
    );

    return new Set(
      calendarChannelEventAssociations
        .filter((association) =>
          visibleCalendarChannelIds.has(association.calendarChannelId),
        )
        .map((association) => association.calendarEventId),
    );
  }
}
