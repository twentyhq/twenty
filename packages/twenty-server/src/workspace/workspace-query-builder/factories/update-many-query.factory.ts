import { Injectable } from '@nestjs/common';

import {
  Record as IRecord,
  RecordFilter,
} from 'src/workspace/workspace-query-builder/interfaces/record.interface';
import { WorkspaceQueryBuilderOptions } from 'src/workspace/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { UpdateManyResolverArgs } from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { stringifyWithoutKeyQuote } from 'src/workspace/workspace-query-builder/utils/stringify-without-key-quote.util';
import { FieldsStringFactory } from 'src/workspace/workspace-query-builder/factories/fields-string.factory';
import { ArgsAliasFactory } from 'src/workspace/workspace-query-builder/factories/args-alias.factory';

@Injectable()
export class UpdateManyQueryFactory {
  constructor(
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsAliasFactory: ArgsAliasFactory,
  ) {}

  async create<
    Record extends IRecord = IRecord,
    Filter extends RecordFilter = RecordFilter,
  >(
    args: UpdateManyResolverArgs<Record, Filter>,
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
      update${options.targetTableName}Collection(
        set: ${stringifyWithoutKeyQuote(argsData)},
        filter: ${stringifyWithoutKeyQuote(args.filter)},
      ) {
        affectedCount
        records {
          ${fieldsString}
        }
      }
    }`;
  }
}
