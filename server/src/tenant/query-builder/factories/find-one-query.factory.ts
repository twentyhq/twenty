import { Injectable, Logger } from '@nestjs/common';

import { QueryBuilderOptions } from 'src/tenant/query-builder/interfaces/query-builder-options.interface';
import { RecordFilter } from 'src/tenant/query-builder/interfaces/record.interface';
import { FindOneResolverArgs } from 'src/tenant/query-builder/interfaces/resolvers-builder.interface';

import { ArgsStringFactory } from './args-string.factory';
import { FieldsStringFactory } from './fields-string.factory';

@Injectable()
export class FindOneQueryFactory {
  private readonly logger = new Logger(FindOneQueryFactory.name);

  constructor(
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsStringFactory: ArgsStringFactory,
  ) {}

  create<Filter extends RecordFilter = RecordFilter>(
    args: FindOneResolverArgs<Filter>,
    options: QueryBuilderOptions,
  ) {
    const fieldsString = this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
    );
    const argsString = this.argsStringFactory.create(
      args,
      options.fieldMetadataCollection,
    );

    return `
      query {
        ${options.targetTableName}Collection${
      argsString ? `(${argsString})` : ''
    } {
          edges {
            node {
              ${fieldsString}
            }
          }
        }
      }
    `;
  }
}
