import { Injectable, Logger } from '@nestjs/common';

import { WorkspaceQueryBuilderOptions } from 'src/workspace/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { Record as IRecord } from 'src/workspace/workspace-query-builder/interfaces/record.interface';
import { UpdateOneResolverArgs } from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { stringifyWithoutKeyQuote } from 'src/workspace/workspace-query-builder/utils/stringify-without-key-quote.util';

import { FieldsStringFactory } from './fields-string.factory';
import { ArgsAliasFactory } from './args-alias.factory';

@Injectable()
export class UpdateOneQueryFactory {
  private readonly logger = new Logger(UpdateOneQueryFactory.name);

  constructor(
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsAliasFactory: ArgsAliasFactory,
  ) {}

  async create<Record extends IRecord = IRecord>(
    args: UpdateOneResolverArgs<Record>,
    options: WorkspaceQueryBuilderOptions,
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
    );
    const computedArgs = this.argsAliasFactory.create(
      args,
      options.fieldMetadataCollection,
    );

    const argsData = {
      ...computedArgs.data,
      updatedAt: new Date().toISOString(),
    };

    return `
      mutation {
        update${
          options.targetTableName
        }Collection(set: ${stringifyWithoutKeyQuote(
          argsData,
        )}, filter: { id: { eq: "${computedArgs.id}" } }) {
          affectedCount
          records {
            ${fieldsString}
          }
        }
      }
    `;
  }
}
