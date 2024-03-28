import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import { CalendarChannelEventAssociationRepository } from 'src/modules/calendar/repositories/calendar-channel-event-association.repository';
import { CanAccessCalendarEventService } from 'src/modules/calendar/query-hooks/calendar-event/services/can-access-calendar-event.service';

@Injectable()
export class CalendarEventFindManyPreQueryHook
  implements WorkspacePreQueryHook
{
  constructor(
    @InjectObjectMetadataRepository(
      CalendarChannelEventAssociationObjectMetadata,
    )
    private readonly calendarChannelEventAssociationRepository: CalendarChannelEventAssociationRepository,
    private readonly canAccessCalendarEventService: CanAccessCalendarEventService,
  ) {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: FindManyResolverArgs,
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

    await this.canAccessCalendarEventService.canAccessCalendarEvent(
      userId,
      workspaceId,
      calendarChannelCalendarEventAssociations,
    );
  }
}
