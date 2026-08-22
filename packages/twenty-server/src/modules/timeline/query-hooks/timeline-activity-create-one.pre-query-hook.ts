import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { TimelineActivityCreateQueryHookService } from 'src/modules/timeline/query-hooks/timeline-activity-create-query-hook.service';

type TimelineActivityCreateInput = Record<string, unknown> & {
  timelineActivityTypeId?: string | null;
};

@WorkspaceQueryHook('timelineActivity.createOne')
export class TimelineActivityCreateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly timelineActivityCreateQueryHookService: TimelineActivityCreateQueryHookService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<TimelineActivityCreateInput>,
  ): Promise<CreateOneResolverArgs<TimelineActivityCreateInput>> {
    const [data] =
      await this.timelineActivityCreateQueryHookService.stampTimelineActivityTypeSnapshot(
        {
          workspaceId: authContext.workspace.id,
          applicationId:
            authContext.type === 'application'
              ? authContext.application.id
              : undefined,
          records: [payload.data],
          upsert: payload.upsert,
        },
      );

    return { ...payload, data };
  }
}
