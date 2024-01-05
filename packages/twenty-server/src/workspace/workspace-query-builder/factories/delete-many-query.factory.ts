import { Injectable } from '@nestjs/common';

import { WorkspaceQueryBuilderOptions } from 'src/workspace/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { DeleteManyResolverArgs } from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { stringifyWithoutKeyQuote } from 'src/workspace/workspace-query-builder/utils/stringify-without-key-quote.util';

import { FieldsStringFactory } from './fields-string.factory';

@Injectable()
export class DeleteManyQueryFactory {
  constructor(private readonly fieldsStringFactory: FieldsStringFactory) {}

  async create(
    args: DeleteManyResolverArgs,
    options: WorkspaceQueryBuilderOptions,
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
    );

    return `
      mutation {
        deleteFrom${
          options.targetTableName
        }Collection(filter: ${stringifyWithoutKeyQuote(
          args.filter,
        )}, atMost: 30) {
          affectedCount
          records {
            ${fieldsString}
          }
        }
      }
    `;
  }
}
