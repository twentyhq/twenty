import { WorkspaceQueryPostHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ApplyCalendarEventsVisibilityRestrictionsService } from 'src/modules/calendar/common/query-hooks/calendar-event/services/apply-calendar-events-visibility-restrictions.service';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

@WorkspaceQueryHook({
  key: `calendarEvent.findMany`,
  type: WorkspaceQueryHookType.PostHook,
})
export class CalendarEventFindManyPostQueryHook
  implements WorkspaceQueryPostHookInstance
{
  constructor(
    private readonly applyCalendarEventsVisibilityRestrictionsService: ApplyCalendarEventsVisibilityRestrictionsService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: CalendarEventWorkspaceEntity[],
  ): Promise<void> {
    if (!authContext.workspaceMemberId) {
      throw new UserInputError('Workspace member id is required');
    }

    await this.applyCalendarEventsVisibilityRestrictionsService.applyCalendarEventsVisibilityRestrictions(
      authContext.workspaceMemberId,
      payload,
    );
  }
}
