import { Injectable } from '@nestjs/common';

import {
  FieldMetadataType,
  FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { GraphqlQueryFilterConditionParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  ChartDataException,
  ChartDataExceptionCode,
  ChartDataExceptionMessageKey,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';

export type GroupByRawResult = {
  groupByDimensionValues: unknown[];
  aggregateValue: number;
};

type ExecuteGroupByQueryParams = {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  groupByFieldMetadataId: string;
  groupBySubFieldName?: string | null;
  aggregateFieldMetadataId: string;
  aggregateOperation: AggregateOperations;
  filter?: ObjectRecordFilter | null;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
  userTimezone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
  limit?: number;
  secondaryGroupByFieldMetadataId?: string | null;
  secondaryGroupBySubFieldName?: string | null;
  secondaryDateGranularity?: ObjectRecordGroupByDateGranularity | null;
};

const COUNT_OPERATIONS = [
  AggregateOperations.COUNT,
  AggregateOperations.COUNT_EMPTY,
  AggregateOperations.COUNT_NOT_EMPTY,
  AggregateOperations.COUNT_UNIQUE_VALUES,
  AggregateOperations.COUNT_TRUE,
  AggregateOperations.COUNT_FALSE,
];

const PERCENT_OPERATIONS = [
  AggregateOperations.PERCENTAGE_EMPTY,
  AggregateOperations.PERCENTAGE_NOT_EMPTY,
];

@Injectable()
export class ChartDataQueryService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async executeGroupByQuery(
    params: ExecuteGroupByQueryParams,
  ): Promise<GroupByRawResult[]> {
    const {
      workspaceId,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      groupByFieldMetadataId,
      groupBySubFieldName,
      aggregateFieldMetadataId,
      aggregateOperation,
      filter,
      limit = 100,
      secondaryGroupByFieldMetadataId,
      secondaryGroupBySubFieldName,
    } = params;

    const groupByField = flatFieldMetadataMaps.byId[groupByFieldMetadataId];
    const aggregateField = flatFieldMetadataMaps.byId[aggregateFieldMetadataId];

    if (!isDefined(groupByField)) {
      throw new ChartDataException(
        generateChartDataExceptionMessage(
          ChartDataExceptionMessageKey.FIELD_METADATA_NOT_FOUND,
          groupByFieldMetadataId,
        ),
        ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    if (!isDefined(aggregateField)) {
      throw new ChartDataException(
        generateChartDataExceptionMessage(
          ChartDataExceptionMessageKey.FIELD_METADATA_NOT_FOUND,
          aggregateFieldMetadataId,
        ),
        ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    const isTwoDimensional = isDefined(secondaryGroupByFieldMetadataId);
    let secondaryGroupByField: FlatFieldMetadata | undefined;

    if (isTwoDimensional) {
      secondaryGroupByField =
        flatFieldMetadataMaps.byId[secondaryGroupByFieldMetadataId];

      if (!isDefined(secondaryGroupByField)) {
        throw new ChartDataException(
          generateChartDataExceptionMessage(
            ChartDataExceptionMessageKey.FIELD_METADATA_NOT_FOUND,
            secondaryGroupByFieldMetadataId,
          ),
          ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
      }
    }

    const authContext = buildSystemAuthContext(workspaceId);

    try {
      return await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const repository = await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            flatObjectMetadata.nameSingular,
            { shouldBypassPermissionChecks: true },
          );

          const tableName = flatObjectMetadata.nameSingular;
          const queryBuilder = repository.createQueryBuilder(tableName);

          if (isDefined(filter) && Object.keys(filter).length > 0) {
            const filterParser = new GraphqlQueryFilterConditionParser(
              flatObjectMetadata,
              flatFieldMetadataMaps,
            );

            filterParser.parse(queryBuilder, tableName, filter);

            if (this.hasDeletedAtFilter(filter)) {
              queryBuilder.withDeleted();
            }
          }

          if (!this.hasDeletedAtFilter(filter)) {
            queryBuilder.andWhere(`"${tableName}"."deletedAt" IS NULL`);
          }

          const groupByColumnName = isDefined(groupBySubFieldName)
            ? `${groupByField.name}${this.capitalizeFirst(groupBySubFieldName)}`
            : groupByField.name;

          queryBuilder.select(
            `"${tableName}"."${groupByColumnName}"`,
            'groupByValue',
          );

          let secondaryGroupByColumnName: string | undefined;

          if (isTwoDimensional && isDefined(secondaryGroupByField)) {
            secondaryGroupByColumnName = isDefined(secondaryGroupBySubFieldName)
              ? `${secondaryGroupByField.name}${this.capitalizeFirst(secondaryGroupBySubFieldName)}`
              : secondaryGroupByField.name;

            queryBuilder.addSelect(
              `"${tableName}"."${secondaryGroupByColumnName}"`,
              'secondaryGroupByValue',
            );
          }

          const aggregateColumnName = this.getAggregateColumnName(
            aggregateField,
            aggregateOperation,
          );
          const aggregateAlias = `${aggregateField.name}_${aggregateOperation}`;

          const aggregateExpression = this.getAggregateExpression(
            aggregateOperation,
            tableName,
            aggregateColumnName,
          );

          queryBuilder.addSelect(aggregateExpression, aggregateAlias);

          queryBuilder.groupBy(`"${tableName}"."${groupByColumnName}"`);

          if (isTwoDimensional && isDefined(secondaryGroupByColumnName)) {
            queryBuilder.addGroupBy(
              `"${tableName}"."${secondaryGroupByColumnName}"`,
            );
          }

          queryBuilder.limit(limit);

          const rawResults = await queryBuilder.getRawMany();

          return rawResults.map((row) => ({
            groupByDimensionValues: isTwoDimensional
              ? [row.groupByValue, row.secondaryGroupByValue]
              : [row.groupByValue],
            aggregateValue: this.processAggregateValue(
              row[aggregateAlias],
              aggregateOperation,
              aggregateField,
            ),
          }));
        },
      );
    } catch (error) {
      throw new ChartDataException(
        generateChartDataExceptionMessage(
          ChartDataExceptionMessageKey.QUERY_EXECUTION_FAILED,
          error.message,
        ),
        ChartDataExceptionCode.QUERY_EXECUTION_FAILED,
      );
    }
  }

  private getAggregateExpression(
    operation: AggregateOperations,
    tableName: string,
    columnName: string,
  ): string {
    const columnExpression = `"${tableName}"."${columnName}"`;

    switch (operation) {
      case AggregateOperations.COUNT:
        return 'COUNT(*)';
      case AggregateOperations.COUNT_EMPTY:
        return `COUNT(*) - COUNT(${columnExpression})`;
      case AggregateOperations.COUNT_NOT_EMPTY:
        return `COUNT(${columnExpression})`;
      case AggregateOperations.COUNT_UNIQUE_VALUES:
        return `COUNT(DISTINCT ${columnExpression})`;
      case AggregateOperations.COUNT_TRUE:
        return `COUNT(CASE WHEN ${columnExpression} = true THEN 1 END)`;
      case AggregateOperations.COUNT_FALSE:
        return `COUNT(CASE WHEN ${columnExpression} = false THEN 1 END)`;
      case AggregateOperations.PERCENTAGE_EMPTY:
        return `CASE WHEN COUNT(*) = 0 THEN 0 ELSE (COUNT(*) - COUNT(${columnExpression}))::float / COUNT(*) END`;
      case AggregateOperations.PERCENTAGE_NOT_EMPTY:
        return `CASE WHEN COUNT(*) = 0 THEN 0 ELSE COUNT(${columnExpression})::float / COUNT(*) END`;
      case AggregateOperations.SUM:
        return `SUM(${columnExpression})`;
      case AggregateOperations.AVG:
        return `AVG(${columnExpression})`;
      case AggregateOperations.MIN:
        return `MIN(${columnExpression})`;
      case AggregateOperations.MAX:
        return `MAX(${columnExpression})`;
      default:
        return 'COUNT(*)';
    }
  }

  private processAggregateValue(
    rawValue: unknown,
    operation: AggregateOperations,
    fieldMetadata: FlatFieldMetadata,
  ): number {
    if (!isDefined(rawValue)) {
      return 0;
    }

    const numericValue = Number(rawValue);

    if (isNaN(numericValue)) {
      return 0;
    }

    if (PERCENT_OPERATIONS.includes(operation)) {
      return numericValue * 100;
    }

    if (
      fieldMetadata.type === FieldMetadataType.CURRENCY &&
      !COUNT_OPERATIONS.includes(operation) &&
      !PERCENT_OPERATIONS.includes(operation)
    ) {
      return numericValue / 1_000_000;
    }

    return numericValue;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private hasDeletedAtFilter(filter?: ObjectRecordFilter | null): boolean {
    if (!isDefined(filter)) {
      return false;
    }

    const checkFilter = (
      filterToCheck: ObjectRecordFilter | ObjectRecordFilter[],
    ): boolean => {
      if (Array.isArray(filterToCheck)) {
        return filterToCheck.some((subFilter) => checkFilter(subFilter));
      }

      for (const [key, value] of Object.entries(filterToCheck)) {
        if (key === 'deletedAt') {
          return true;
        }

        if (
          typeof value === 'object' &&
          value !== null &&
          checkFilter(value as ObjectRecordFilter)
        ) {
          return true;
        }
      }

      return false;
    };

    return checkFilter(filter);
  }

  private getAggregateColumnName(
    fieldMetadata: FlatFieldMetadata,
    operation: AggregateOperations,
  ): string {
    const isNumericOperation = [
      AggregateOperations.SUM,
      AggregateOperations.AVG,
      AggregateOperations.MIN,
      AggregateOperations.MAX,
    ].includes(operation);

    if (
      fieldMetadata.type === FieldMetadataType.CURRENCY &&
      isNumericOperation
    ) {
      return `${fieldMetadata.name}AmountMicros`;
    }

    return fieldMetadata.name;
  }
}
