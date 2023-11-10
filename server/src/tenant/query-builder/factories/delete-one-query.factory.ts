import { Injectable, Logger } from '@nestjs/common';

import { QueryBuilderOptions } from 'src/tenant/query-builder/interfaces/query-builder-options.interface';
import { DeleteOneResolverArgs } from 'src/tenant/query-builder/interfaces/resolvers-builder.interface';

import { FieldsStringFactory } from './fields-string.factory';

@Injectable()
export class DeleteOneQueryFactory {
  private readonly logger = new Logger(DeleteOneQueryFactory.name);

  constructor(private readonly fieldsStringFactory: FieldsStringFactory) {}

  create(args: DeleteOneResolverArgs, options: QueryBuilderOptions) {
    const fieldsString = this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
    );

    return `
      mutation {
        deleteFrom${options.targetTableName}Collection(filter: { id: { eq: "${args.id}" } }) {
          affectedCount
          records {
            ${fieldsString}
          }
        }
      }
    `;
  }
}
