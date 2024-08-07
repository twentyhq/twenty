import { MethodNotAllowedException } from '@nestjs/common';

import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { DeleteManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';

@WorkspaceQueryHook(`workspaceMember.deleteMany`)
export class WorkspaceMemberDeleteManyPreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor() {}

  async execute(): Promise<DeleteManyResolverArgs> {
    throw new MethodNotAllowedException('Method not allowed.');
  }
}
