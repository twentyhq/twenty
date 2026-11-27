import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import {
  CalendarChannelVisibility,
  type ObjectRecord,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { RecordReadCustomPermissionHandler } from 'src/engine/permissions/record-read-custom-permissions/decorators/record-read-custom-permission-handler.decorator';
import { type RecordReadCustomPermissionHandlerService } from 'src/engine/permissions/record-read-custom-permissions/types/record-read-custom-permission-handler-service.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { isChannelVisibilityEnforcedByIndividualRole } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-enforced-by-individual-role.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';

const RESTRICTED_CALENDAR_EVENT_FIELD_NAMES = ['title', 'description'];

@Injectable()
@RecordReadCustomPermissionHandler('calendarEvent')
export class CalendarEventReadCustomPermissionHandlerService implements RecordReadCustomPermissionHandlerService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
  ) {}

  public async applyToRecords({
    records,
    authContext,
  }: {
    records: ObjectRecord[];
    authContext: WorkspaceAuthContext;
  }): Promise<void> {
    if (isChannelVisibilityEnforcedByIndividualRole(authContext)) {
      return;
    }

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
            .getRepositoryWithoutPermissionChecks<CalendarChannelEventAssociationWorkspaceEntity>(
              'calendarChannelEventAssociation',
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
