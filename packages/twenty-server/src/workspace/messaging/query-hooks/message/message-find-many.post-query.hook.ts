import { Injectable } from '@nestjs/common';

import { IConnection } from 'src/utils/pagination/interfaces/connection.interface';
import { IEdge } from 'src/utils/pagination/interfaces/edge.interface';
import { WorkspacePostQueryHook } from 'src/workspace/workspace-query-runner/workspace-query-hook/interfaces/workspace-post-query-hook.interface';

@Injectable()
export class MessageFindManyPostQueryHook implements WorkspacePostQueryHook {
  async execute<Record>(
    _userId: string | undefined,
    _workspaceId: string,
    result: IConnection<Record, IEdge<Record>>,
  ): Promise<IConnection<Record, IEdge<Record>>> {
    return {
      ...result,
      edges: result.edges.map((edge) => ({
        ...edge,
        node: {
          ...edge.node,
        },
      })),
    };
  }
}
