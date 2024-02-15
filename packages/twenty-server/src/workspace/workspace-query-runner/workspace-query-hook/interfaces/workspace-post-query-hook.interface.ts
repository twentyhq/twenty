import { IConnection } from 'src/utils/pagination/interfaces/connection.interface';
import { IEdge } from 'src/utils/pagination/interfaces/edge.interface';
import { PGGraphQLMutation } from 'src/workspace/workspace-query-runner/interfaces/pg-graphql.interface';
import { Record as IRecord } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

type Result<Record> =
  | IConnection<Record, IEdge<Record>>
  | PGGraphQLMutation<Record>;

export interface WorkspacePostQueryHook {
  execute<Record extends IRecord = IRecord>(
    userId: string | undefined,
    workspaceId: string,
    result: Result<Record>,
  ): Promise<Result<Record>>;
}
