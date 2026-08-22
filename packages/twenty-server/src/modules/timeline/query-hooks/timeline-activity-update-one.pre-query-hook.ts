import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { TimelineActivityCreateQueryHookService } from 'src/modules/timeline/query-hooks/timeline-activity-create-query-hook.service';

type TimelineActivityUpdateInput = Record<string, unknown> & {
  timelineActivityTypeId?: string | null;
};

@WorkspaceQueryHook('timelineActivity.updateOne')
export class TimelineActivityUpdateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly timelineActivityCreateQueryHookService: TimelineActivityCreateQueryHookService,
  ) {}

  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<TimelineActivityUpdateInput>,
  ): Promise<UpdateOneResolverArgs<TimelineActivityUpdateInput>> {
    this.timelineActivityCreateQueryHookService.assertTimelineActivityTypeIsNotUpdated(
      [payload.data],
    );

    return payload;
  }
}
