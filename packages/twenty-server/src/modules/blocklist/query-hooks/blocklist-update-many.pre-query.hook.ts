import { MethodNotAllowedException } from '@nestjs/common';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type BlocklistItem } from 'src/modules/blocklist/blocklist-validation-manager/services/blocklist-validation.service';

@WorkspaceQueryHook(`blocklist.updateMany`)
export class BlocklistUpdateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor() {}

  async execute(): Promise<UpdateManyResolverArgs<BlocklistItem>> {
    throw new MethodNotAllowedException('Method not allowed.');
  }
}
