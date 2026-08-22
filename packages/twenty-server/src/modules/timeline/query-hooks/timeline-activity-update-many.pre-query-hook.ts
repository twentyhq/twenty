import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type TimelineActivityMutationInput } from 'src/modules/timeline/query-hooks/types/timeline-activity-mutation-input.type';
import { assertTimelineActivityTypeIsNotUpdated } from 'src/modules/timeline/query-hooks/utils/timeline-activity-mutation-input.util';

@WorkspaceQueryHook('timelineActivity.updateMany')
export class TimelineActivityUpdateManyPreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateManyResolverArgs<TimelineActivityMutationInput>,
  ): Promise<UpdateManyResolverArgs<TimelineActivityMutationInput>> {
    assertTimelineActivityTypeIsNotUpdated([payload.data]);

    return payload;
  }
}
