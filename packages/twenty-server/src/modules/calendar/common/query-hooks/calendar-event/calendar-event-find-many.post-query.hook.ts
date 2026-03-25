import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
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
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CalendarEventWorkspaceEntity[],
  ): Promise<void> {
    const isUserContext = isUserAuthContext(authContext);
    const userId = isUserContext ? authContext.user.id : undefined;

    const isTwentyStandardApplication =
      authContext.type === 'application' &&
      authContext.application.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier;

    if (
      !isUserContext &&
      authContext.type !== 'apiKey' &&
      !isTwentyStandardApplication
    ) {
      throw new ForbiddenError('Authentication is required');
    }

    const workspace = authContext.workspace;

    if (!workspace) {
      throw new ForbiddenError('Workspace is required');
    }

    await this.applyCalendarEventsVisibilityRestrictionsService.applyCalendarEventsVisibilityRestrictions(
      payload,
      workspace.id,
      userId,
    );
  }
}
