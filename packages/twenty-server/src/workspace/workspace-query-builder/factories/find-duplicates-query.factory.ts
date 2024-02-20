import { Injectable, Logger } from '@nestjs/common';

import isEmpty from 'lodash.isempty';

import { WorkspaceQueryBuilderOptions } from 'src/workspace/workspace-query-builder/interfaces/workspace-query-builder-options.interface';
import { RecordFilter } from 'src/workspace/workspace-query-builder/interfaces/record.interface';
import { FindDuplicatesResolverArgs } from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';
import { stringifyWithoutKeyQuote } from 'src/workspace/workspace-query-builder/utils/stringify-without-key-quote.util';
import { ArgsAliasFactory } from 'src/workspace/workspace-query-builder/factories/args-alias.factory';
import { duplicateCriteriaCollection } from 'src/workspace/workspace-resolver-builder/constants/duplicate-criteria.constants';

import { FieldsStringFactory } from './fields-string.factory';

@Injectable()
export class FindDuplicatesQueryFactory {
  private readonly logger = new Logger(FindDuplicatesQueryFactory.name);

  constructor(
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsAliasFactory: ArgsAliasFactory,
  ) {}

  async create<Filter extends RecordFilter = RecordFilter>(
    args: FindDuplicatesResolverArgs<Filter>,
    options: WorkspaceQueryBuilderOptions,
    currentRecord?: Record<string, unknown>,
  ) {
    const fieldsString = await this.fieldsStringFactory.create(
      options.info,
      options.fieldMetadataCollection,
      options.objectMetadataCollection,
    );

    const argsData = this.getFindDuplicateBy<Filter>(
      args,
      options,
      currentRecord,
    );

    const duplicateCondition = this.buildDuplicateCondition(
      options.objectMetadataItem,
      argsData,
      args.id,
    );

    const filters = stringifyWithoutKeyQuote(duplicateCondition);

    return `
      query {
        ${computeObjectTargetTable(options.objectMetadataItem)}Collection${
          filters ? `(filter: ${filters})` : ''
        } {
          ${fieldsString}
        }
      }
    `;
  }

  getFindDuplicateBy<Filter extends RecordFilter = RecordFilter>(
    args: FindDuplicatesResolverArgs<Filter>,
    options: WorkspaceQueryBuilderOptions,
    currentRecord?: Record<string, unknown>,
  ) {
    if (currentRecord) {
      return currentRecord;
    }

    return this.argsAliasFactory.create(
      args.data ?? {},
      options.fieldMetadataCollection,
    );
  }

  buildQueryForExistingRecord(
    id: string,
    options: WorkspaceQueryBuilderOptions,
  ) {
    return `
      query {
        ${computeObjectTargetTable(
          options.objectMetadataItem,
        )}Collection(filter: { id: { eq: "${id}" }}){
          edges {
            node {
              ${this.getApplicableDuplicateCriteriaCollection(
                options.objectMetadataItem,
              )
                .flatMap((dc) => dc.fieldNames)
                .join('\n')}
            }
          }
        }
      }
    `;
  }

  private buildDuplicateCondition(
    objectMetadataItem: ObjectMetadataInterface,
    argsData?: Record<string, unknown>,
    filteringByExistingRecordId?: string,
  ) {
    if (!argsData) {
      return;
    }

    const criteriaCollection =
      this.getApplicableDuplicateCriteriaCollection(objectMetadataItem);

    return {
      // when filtering by an existing record, we need to filter that explicit record out
      ...(filteringByExistingRecordId && {
        id: { neq: filteringByExistingRecordId },
      }),
      // keep condition as "or" to get results by more duplicate criteria
      or: criteriaCollection
        .map((dc) =>
          dc.fieldNames.reduce((acc, curr) => {
            if (!argsData[curr]) {
              return acc;
            }

            return {
              ...acc,
              [curr]: { ilike: `%${argsData[curr]}%` },
            };
          }, {}),
        )
        .filter((dc) => !isEmpty(dc)),
    };
  }

  private getApplicableDuplicateCriteriaCollection(
    objectMetadataItem: ObjectMetadataInterface,
  ) {
    return duplicateCriteriaCollection.filter(
      (dc) => dc.objectName === objectMetadataItem.nameSingular,
    );
  }
}
