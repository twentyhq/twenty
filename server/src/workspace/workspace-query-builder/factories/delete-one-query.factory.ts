import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceQueryBuilderOptions } from 'src/workspace/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { DeleteOneResolverArgs } from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { FieldsStringFactory } from './fields-string.factory';

@Injectable()
export class DeleteOneQueryFactory {
  private readonly logger = new Logger(DeleteOneQueryFactory.name);

  constructor(private readonly fieldsStringFactory: FieldsStringFactory) {}

  async create(
    args: DeleteOneResolverArgs,
    options: WorkspaceQueryBuilderOptions,
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
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
