import { Injectable, Logger } from '@nestjs/common';

import { QueryBuilderOptions } from 'src/tenant/query-builder/interfaces/query-builder-options.interface';
import { Record as IRecord } from 'src/tenant/query-builder/interfaces/record.interface';
import { UpdateOneResolverArgs } from 'src/tenant/query-builder/interfaces/resolvers-builder.interface';

import { stringifyWithoutKeyQuote } from 'src/tenant/query-builder/utils/stringify-without-key-quote.util';

import { FieldsStringFactory } from './fields-string.factory';
import { ArgsAliasFactory } from './args-alias.factory';

@Injectable()
export class UpdateOneQueryFactory {
  private readonly logger = new Logger(UpdateOneQueryFactory.name);

  constructor(
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsAliasFactory: ArgsAliasFactory,
  ) {}

  create<Record extends IRecord = IRecord>(
    args: UpdateOneResolverArgs<Record>,
    options: QueryBuilderOptions,
  ) {
    const fieldsString = this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
    );
    const computedArgs = this.argsAliasFactory.create(
      args,
      options.fieldMetadataCollection,
    );

    return `
      mutation {
        update${
          options.targetTableName
        }Collection(set: ${stringifyWithoutKeyQuote(
      computedArgs.data,
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
