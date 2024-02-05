import { Injectable } from '@nestjs/common';

import { ValidationHandler } from 'src/workspace/workspace-query-runner/validation-handler/interfaces/validation-handler.interface';
import { FindManyResolverArgs } from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import {
  RecordFilter,
  RecordOrderBy,
} from 'src/workspace/workspace-query-builder/interfaces/record.interface';

@Injectable()
export class PersonValidationHandler implements ValidationHandler {
  async validate<
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    workspaceId: string,
  ): Promise<boolean> {
    console.log('validating person for workspaceId', workspaceId);
    console.log('args', JSON.stringify(args, null, 3));

    return true;
  }
}
