import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type RecordInput } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { stampCallRecordingApplicationId } from 'src/modules/call-recording/query-hooks/utils/stamp-call-recording-application-id.util';

@WorkspaceQueryHook('callRecording.createOne')
export class CallRecordingCreateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<RecordInput>,
  ): Promise<CreateOneResolverArgs<RecordInput>> {
    const [data] = stampCallRecordingApplicationId({
      authContext,
      records: [payload.data],
    });

    return { ...payload, data };
  }
}
