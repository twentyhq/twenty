import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { TimelineActivityMutationQueryHookService } from 'src/modules/timeline/query-hooks/timeline-activity-mutation-query-hook.service';
import { type TimelineActivityMutationInput } from 'src/modules/timeline/query-hooks/types/timeline-activity-mutation-input.type';

@WorkspaceQueryHook('timelineActivity.createMany')
export class TimelineActivityCreateManyPreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly timelineActivityMutationQueryHookService: TimelineActivityMutationQueryHookService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs<TimelineActivityMutationInput>,
  ): Promise<CreateManyResolverArgs<TimelineActivityMutationInput>> {
    return {
      ...payload,
      data: await this.timelineActivityMutationQueryHookService.stampTimelineActivityTypeSnapshot(
        {
          workspaceId: authContext.workspace.id,
          applicationId:
            authContext.type === 'application'
              ? authContext.application.id
              : undefined,
          records: payload.data,
          upsert: payload.upsert,
        },
      ),
    };
  }
}
