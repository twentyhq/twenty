/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { FindOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

@Injectable()
export class MessageFindOnePreQueryHook implements WorkspacePreQueryHook {
  async execute(
    _userId: string,
    _workspaceId: string,
    _payload: FindOneResolverArgs,
  ): Promise<void> {
    throw new BadRequestException('Method not implemented.');
  }
}
