import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  applyManuallyAssignedDefault,
  type TargetJunctionRecordInput,
} from 'src/modules/match-participant/utils/apply-manually-assigned-default.util';

@WorkspaceQueryHook('messageThreadTarget.createMany')
export class MessageThreadTargetCreateManyPreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs<TargetJunctionRecordInput>,
  ): Promise<CreateManyResolverArgs<TargetJunctionRecordInput>> {
    return {
      ...payload,
      data: payload.data.map(applyManuallyAssignedDefault),
    };
  }
}
