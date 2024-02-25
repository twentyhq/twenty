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
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';

export interface UpdateManyQueryFactoryOptions
  extends WorkspaceQueryBuilderOptions {
  atMost?: number;
}

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
    options: UpdateManyQueryFactoryOptions,
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
      options.objectMetadataCollection,
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
      update${computeObjectTargetTable(options.objectMetadataItem)}Collection(
        set: ${stringifyWithoutKeyQuote(argsData)},
        filter: ${stringifyWithoutKeyQuote(args.filter)},
        atMost: ${options.atMost ?? 1},
      ) {
        affectedCount
        records {
          ${fieldsString}
        }
      }
    }`;
  }
}
