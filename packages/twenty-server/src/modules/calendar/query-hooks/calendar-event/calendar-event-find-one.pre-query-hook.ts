import { BadRequestException, Injectable } from '@nestjs/common';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { FindOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { InjectWorkspaceRepository } from 'src/engine/twenty-orm/decorators/inject-workspace-repository.decorator';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { CanAccessCalendarEventService } from 'src/modules/calendar/query-hooks/calendar-event/services/can-access-calendar-event.service';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.workspace-entity';

@Injectable()
export class CalendarEventFindOnePreQueryHook implements WorkspacePreQueryHook {
  constructor(
    @InjectWorkspaceRepository(CalendarChannelEventAssociationWorkspaceEntity)
    private readonly calendarChannelEventAssociationRepository: WorkspaceRepository<CalendarChannelEventAssociationWorkspaceEntity>,
    private readonly canAccessCalendarEventService: CanAccessCalendarEventService,
  ) {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: FindOneResolverArgs,
  ): Promise<void> {
    if (!payload?.filter?.id?.eq) {
      throw new BadRequestException('id filter is required');
    }

    // TODO: Re-implement this using twenty ORM
    // const calendarChannelCalendarEventAssociations =
    //   await this.calendarChannelEventAssociationRepository.find({
    //     where: {
    //       calendarEvent: {
    //         id: payload?.filter?.id?.eq,
    //       },
    //     },
    //   });

    // if (calendarChannelCalendarEventAssociations.length === 0) {
    //   throw new NotFoundException();
    // }

    // await this.canAccessCalendarEventService.canAccessCalendarEvent(
    //   userId,
    //   workspaceId,
    //   calendarChannelCalendarEventAssociations,
    // );
  }
}
