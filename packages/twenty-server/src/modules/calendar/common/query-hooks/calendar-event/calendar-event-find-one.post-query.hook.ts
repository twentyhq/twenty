import { WorkspaceQueryPostHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { BadRequestException } from '@nestjs/common';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { CanReturnCalendarEventsService } from 'src/modules/calendar/common/query-hooks/calendar-event/services/can-return-calendar-events.service';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

@WorkspaceQueryHook({
  key: `calendarEvent.findOne`,
  type: WorkspaceQueryHookType.PostHook,
})
export class CalendarEventFindOnePostQueryHook
  implements WorkspaceQueryPostHookInstance
{
  constructor(
    private readonly canReturnCalendarEventsService: CanReturnCalendarEventsService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: CalendarEventWorkspaceEntity[],
  ): Promise<void> {
    if (!authContext.workspaceMemberId) {
      throw new BadRequestException('Workspace member id is required');
    }

    await this.canReturnCalendarEventsService.canReturnCalendarEvents(
      authContext.workspaceMemberId,
      payload,
    );
  }
}
