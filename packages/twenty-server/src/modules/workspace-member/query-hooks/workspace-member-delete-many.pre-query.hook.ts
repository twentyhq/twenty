import { Injectable, MethodNotAllowedException } from '@nestjs/common';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';

@Injectable()
export class WorkspaceMemberDeleteManyPreQueryHook
  implements WorkspacePreQueryHook
{
  constructor() {}

  async execute(): Promise<void> {
    throw new MethodNotAllowedException('Method not allowed.');
  }
}
