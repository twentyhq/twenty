import { MethodNotAllowedException } from '@nestjs/common';

import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/decorators/workspace-query-hook.decorator';

@WorkspaceQueryHook(`workspaceMember.deleteMany`)
export class WorkspaceMemberDeleteManyPreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor() {}

  async execute(): Promise<void> {
    throw new MethodNotAllowedException('Method not allowed.');
  }
}
