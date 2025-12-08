import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ApplyCalendarEventsVisibilityRestrictionsService } from 'src/modules/calendar/common/query-hooks/calendar-event/services/apply-calendar-events-visibility-restrictions.service';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

@WorkspaceQueryHook({
  key: `calendarEvent.findMany`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class CalendarEventFindManyPostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly applyCalendarEventsVisibilityRestrictionsService: ApplyCalendarEventsVisibilityRestrictionsService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: CalendarEventWorkspaceEntity[],
  ): Promise<void> {
    const { user, apiKey } = authContext;

    if (!isDefined(user) && !isDefined(apiKey)) {
      throw new ForbiddenError('User is required');
    }

    const workspace = authContext.workspace;

    if (!workspace) {
      throw new ForbiddenError('Workspace is required');
    }

    await this.applyCalendarEventsVisibilityRestrictionsService.applyCalendarEventsVisibilityRestrictions(
      payload,
      workspace.id,
      user?.id,
    );
  }
}
