import { IConnection } from 'src/utils/pagination/interfaces/connection.interface';
import { IEdge } from 'src/utils/pagination/interfaces/edge.interface';
import { PGGraphQLMutation } from 'src/workspace/workspace-query-runner/interfaces/pg-graphql.interface';

type Result<Record> =
  | IConnection<Record, IEdge<Record>>
  | PGGraphQLMutation<Record>;

export interface WorkspacePostQueryHook {
  execute<Record>(
    userId: string | undefined,
    workspaceId: string,
    result: Result<Record>,
  ): Promise<Result<Record>>;
}
