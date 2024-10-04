import { BadRequestException, NotFoundException, Scope } from '@nestjs/common';

import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { FindOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CanAccessCalendarEventService } from 'src/modules/calendar/common/query-hooks/calendar-event/services/can-access-calendar-event.service';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';

@WorkspaceQueryHook({
  key: `calendarEvent.findOne`,
  scope: Scope.REQUEST,
})
export class CalendarEventFindOnePreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly canAccessCalendarEventService: CanAccessCalendarEventService,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: FindOneResolverArgs,
  ): Promise<FindOneResolverArgs> {
    if (!payload?.filter?.id?.eq) {
      throw new BadRequestException('id filter is required');
    }

    if (!authContext.user?.id) {
      throw new BadRequestException('User id is required');
    }

    const calendarChannelEventAssociationRepository =
      await this.twentyORMManager.getRepository<CalendarChannelEventAssociationWorkspaceEntity>(
        'calendarChannelEventAssociation',
      );

    const calendarChannelCalendarEventAssociations =
      await calendarChannelEventAssociationRepository.find({
        where: {
          calendarEventId: payload?.filter?.id?.eq,
        },
        relations: ['calendarChannel', 'calendarChannel.connectedAccount'],
      });

    if (calendarChannelCalendarEventAssociations.length === 0) {
      throw new NotFoundException();
    }

    await this.canAccessCalendarEventService.canAccessCalendarEvent(
      authContext.user.id,
      authContext.workspace.id,
      calendarChannelCalendarEventAssociations,
    );

    return payload;
  }
}
