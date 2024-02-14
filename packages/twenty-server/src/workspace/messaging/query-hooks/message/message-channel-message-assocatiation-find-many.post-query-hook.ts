/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';

import { IConnection } from 'src/utils/pagination/interfaces/connection.interface';
import { IEdge } from 'src/utils/pagination/interfaces/edge.interface';
import { WorkspacePostQueryHook } from 'src/workspace/workspace-query-runner/workspace-query-hook/interfaces/workspace-post-query-hook.interface';

import { EMPTY_PAGE } from 'src/workspace/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';

@Injectable()
export class MessageChannelMessageAssociationFindManyPostQueryHook
  implements WorkspacePostQueryHook
{
  async execute<Record>(
    _userId: string | undefined,
    _workspaceId: string,
    _result: IConnection<Record, IEdge<Record>>,
  ): Promise<IConnection<Record, IEdge<Record>>> {
    return EMPTY_PAGE;
  }
}
