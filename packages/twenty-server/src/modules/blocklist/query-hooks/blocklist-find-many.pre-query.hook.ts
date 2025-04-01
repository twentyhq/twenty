import { BadRequestException } from '@nestjs/common';

import { WorkspaceQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

@WorkspaceQueryHook(`blocklist.findMany`)
export class BlocklistFindManyPreQueryHook
  implements WorkspaceQueryHookInstance
{
  constructor() {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: FindManyResolverArgs,
  ): Promise<FindManyResolverArgs> {
    if (authContext.apiKey?.id) {
      return payload;
    }

    if (
      !(authContext.workspaceMemberId === payload.filter.workspaceMemberId.eq)
    ) {
      throw new BadRequestException("Cannot query other members' blocklist.");
    }

    return payload;
  }
}
