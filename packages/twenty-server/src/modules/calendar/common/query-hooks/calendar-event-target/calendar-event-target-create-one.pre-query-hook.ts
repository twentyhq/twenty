import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  applyManuallyAssignedDefault,
  type TargetJunctionRecordInput,
} from 'src/modules/match-participant/utils/apply-manually-assigned-default.util';

@WorkspaceQueryHook('calendarEventTarget.createOne')
export class CalendarEventTargetCreateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<TargetJunctionRecordInput>,
  ): Promise<CreateOneResolverArgs<TargetJunctionRecordInput>> {
    return {
      ...payload,
      data: applyManuallyAssignedDefault(payload.data),
    };
  }
}
