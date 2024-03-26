/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { FindOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CanAccessCalendarEventProvider } from 'src/modules/calendar/query-hooks/calendar-event/providers/can-access-calendar-event.provider';
import { CalendarChannelEventAssociationRepository } from 'src/modules/calendar/repositories/calendar-channel-event-association.repository';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.object-metadata';

@Injectable()
export class CalendarEventFindOnePreQueryHook implements WorkspacePreQueryHook {
  constructor(
    @InjectObjectMetadataRepository(
      CalendarChannelEventAssociationObjectMetadata,
    )
    private readonly calendarChannelEventAssociationRepository: CalendarChannelEventAssociationRepository,
    private readonly canAccessCalendarEventProvider: CanAccessCalendarEventProvider,
  ) {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: FindOneResolverArgs,
  ): Promise<void> {
    if (!payload?.filter?.id?.eq) {
      throw new BadRequestException('id filter is required');
    }

    const calendarChannelCalendarEventAssociations =
      await this.calendarChannelEventAssociationRepository.getByCalendarEventIds(
        [payload?.filter?.id?.eq],
        workspaceId,
      );

    if (calendarChannelCalendarEventAssociations.length === 0) {
      throw new NotFoundException();
    }

    await this.canAccessCalendarEventProvider.canAccessCalendarEvent(
      userId,
      workspaceId,
      calendarChannelCalendarEventAssociations,
    );
  }
}
