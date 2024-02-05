import {
  RecordFilter,
  RecordOrderBy,
} from 'src/workspace/workspace-query-builder/interfaces/record.interface';
import { FindManyResolverArgs } from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export interface ValidationHandler<
  Filter extends RecordFilter = RecordFilter,
  OrderBy extends RecordOrderBy = RecordOrderBy,
> {
  validate(
    args: FindManyResolverArgs<Filter, OrderBy>,
    workspaceId: string,
  ): Promise<boolean>;
}
