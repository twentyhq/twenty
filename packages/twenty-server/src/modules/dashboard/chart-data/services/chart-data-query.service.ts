import { Injectable } from '@nestjs/common';

import { CalendarStartDay } from 'twenty-shared/constants';
import {
  ObjectRecordGroupByDateGranularity,
  OrderByWithGroupBy,
} from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

import {
  ObjectRecordFilter,
  ObjectRecordGroupBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import {
  GRAPH_DEFAULT_DATE_GRANULARITY,
  GRAPH_DEFAULT_ORDER_BY,
} from 'src/modules/dashboard/chart-data/constants/graph-defaults.constants';
import {
  ChartDataException,
  ChartDataExceptionCode,
  ChartDataExceptionMessageKey,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { buildAggregateFieldKey } from 'src/modules/dashboard/chart-data/utils/build-aggregate-field-key.util';
import {
  buildGroupByFieldObject,
  type GroupByFieldObject,
} from 'src/modules/dashboard/chart-data/utils/build-group-by-field-object.util';
import { getGroupByOrderBy } from 'src/modules/dashboard/chart-data/utils/get-group-by-order-by.util';
import { isRelationNestedFieldDateKind } from 'src/modules/dashboard/chart-data/utils/is-relation-nested-field-date-kind.util';

export type GroupByRawResult = {
  groupByDimensionValues: unknown[];
  aggregateValue: number;
};

export type ExecuteGroupByQueryParams = {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  objectIdByNameSingular: Record<string, string>;
  authContext: AuthContext;
  groupByFieldMetadataId: string;
  groupBySubFieldName?: string | null;
  aggregateFieldMetadataId: string;
  aggregateOperation: AggregateOperations;
  filter?: ObjectRecordFilter;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  userTimezone: string;
  firstDayOfTheWeek: CalendarStartDay;
  limit: number;
  secondaryGroupByFieldMetadataId?: string;
  secondaryGroupBySubFieldName?: string | null;
  secondaryDateGranularity?: ObjectRecordGroupByDateGranularity;
};

@Injectable()
export class ChartDataQueryService {
  constructor(
    private readonly commonGroupByQueryRunnerService: CommonGroupByQueryRunnerService,
  ) {}

  async executeGroupByQuery({
    flatObjectMetadata,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    objectIdByNameSingular,
    authContext,
    groupByFieldMetadataId,
    groupBySubFieldName,
    aggregateFieldMetadataId,
    aggregateOperation,
    filter,
    dateGranularity,
    userTimezone,
    firstDayOfTheWeek,
    limit,
    secondaryGroupByFieldMetadataId,
    secondaryGroupBySubFieldName,
    secondaryDateGranularity,
  }: ExecuteGroupByQueryParams): Promise<GroupByRawResult[]> {
    const primaryGroupByField = this.getFieldMetadata(
      groupByFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const aggregateField = this.getFieldMetadata(
      aggregateFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const isPrimaryFieldDate = isFieldMetadataDateKind(
      primaryGroupByField.type,
    );
    const isPrimaryNestedDate = isRelationNestedFieldDateKind({
      relationFieldMetadata: primaryGroupByField,
      relationNestedFieldName: groupBySubFieldName ?? undefined,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const shouldApplyPrimaryDateGranularity =
      isPrimaryFieldDate || isPrimaryNestedDate;

    const groupBy: GroupByFieldObject[] = [];

    groupBy.push(
      buildGroupByFieldObject({
        fieldMetadata: primaryGroupByField,
        subFieldName: groupBySubFieldName,
        dateGranularity: shouldApplyPrimaryDateGranularity
          ? (dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY)
          : undefined,
        firstDayOfTheWeek,
        isNestedDateField: isPrimaryNestedDate,
        timeZone: userTimezone,
      }),
    );

    if (isDefined(secondaryGroupByFieldMetadataId)) {
      const secondaryGroupByField = this.getFieldMetadata(
        secondaryGroupByFieldMetadataId,
        flatFieldMetadataMaps.byId,
      );

      const isSecondaryFieldDate = isFieldMetadataDateKind(
        secondaryGroupByField.type,
      );
      const isSecondaryNestedDate = isRelationNestedFieldDateKind({
        relationFieldMetadata: secondaryGroupByField,
        relationNestedFieldName: secondaryGroupBySubFieldName ?? undefined,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      const shouldApplySecondaryDateGranularity =
        isSecondaryFieldDate || isSecondaryNestedDate;

      groupBy.push(
        buildGroupByFieldObject({
          fieldMetadata: secondaryGroupByField,
          subFieldName: secondaryGroupBySubFieldName,
          dateGranularity: shouldApplySecondaryDateGranularity
            ? (secondaryDateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY)
            : undefined,
          firstDayOfTheWeek,
          isNestedDateField: isSecondaryNestedDate,
          timeZone: userTimezone,
        }),
      );
    }

    const aggregateFieldKey = buildAggregateFieldKey({
      aggregateOperation,
      aggregateFieldMetadata: aggregateField,
    });

    const selectedFields = {
      [aggregateFieldKey]: true,
      groupByDimensionValues: true,
    };

    const results = await this.commonGroupByQueryRunnerService.execute(
      {
        filter: filter ?? {},
        groupBy: groupBy as ObjectRecordGroupBy,
        selectedFields,
        limit,
      },
      {
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      },
    );

    return results.map((result) => ({
      groupByDimensionValues: result.groupByDimensionValues ?? [],
      aggregateValue: Number(result[aggregateFieldKey] ?? 0),
    }));
  }

  async executeGroupByQueryWithOrderBy({
    flatObjectMetadata,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    objectIdByNameSingular,
    authContext,
    groupByFieldMetadataId,
    groupBySubFieldName,
    aggregateFieldMetadataId,
    aggregateOperation,
    filter,
    dateGranularity,
    userTimezone,
    firstDayOfTheWeek,
    limit,
    primaryAxisOrderBy,
    secondaryGroupByFieldMetadataId,
    secondaryGroupBySubFieldName,
    secondaryDateGranularity,
    secondaryAxisOrderBy,
  }: ExecuteGroupByQueryParams & {
    primaryAxisOrderBy?: GraphOrderBy;
    secondaryAxisOrderBy?: GraphOrderBy;
  }): Promise<GroupByRawResult[]> {
    const primaryGroupByField = this.getFieldMetadata(
      groupByFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const aggregateField = this.getFieldMetadata(
      aggregateFieldMetadataId,
      flatFieldMetadataMaps.byId,
    );

    const isPrimaryFieldDate = isFieldMetadataDateKind(
      primaryGroupByField.type,
    );
    const isPrimaryNestedDate = isRelationNestedFieldDateKind({
      relationFieldMetadata: primaryGroupByField,
      relationNestedFieldName: groupBySubFieldName ?? undefined,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const shouldApplyPrimaryDateGranularity =
      isPrimaryFieldDate || isPrimaryNestedDate;

    const groupBy: GroupByFieldObject[] = [];

    groupBy.push(
      buildGroupByFieldObject({
        fieldMetadata: primaryGroupByField,
        subFieldName: groupBySubFieldName,
        dateGranularity: shouldApplyPrimaryDateGranularity
          ? (dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY)
          : undefined,
        firstDayOfTheWeek,
        isNestedDateField: isPrimaryNestedDate,
        timeZone: userTimezone,
      }),
    );

    const orderBy: OrderByWithGroupBy = [];

    const primaryOrderBy = getGroupByOrderBy({
      graphOrderBy: primaryAxisOrderBy ?? GRAPH_DEFAULT_ORDER_BY,
      groupByFieldMetadata: primaryGroupByField,
      groupBySubFieldName,
      aggregateOperation,
      dateGranularity: shouldApplyPrimaryDateGranularity
        ? (dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY)
        : undefined,
    });

    if (isDefined(primaryOrderBy)) {
      orderBy.push(primaryOrderBy);
    }

    if (isDefined(secondaryGroupByFieldMetadataId)) {
      const secondaryGroupByField = this.getFieldMetadata(
        secondaryGroupByFieldMetadataId,
        flatFieldMetadataMaps.byId,
      );

      const isSecondaryFieldDate = isFieldMetadataDateKind(
        secondaryGroupByField.type,
      );
      const isSecondaryNestedDate = isRelationNestedFieldDateKind({
        relationFieldMetadata: secondaryGroupByField,
        relationNestedFieldName: secondaryGroupBySubFieldName ?? undefined,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      const shouldApplySecondaryDateGranularity =
        isSecondaryFieldDate || isSecondaryNestedDate;

      groupBy.push(
        buildGroupByFieldObject({
          fieldMetadata: secondaryGroupByField,
          subFieldName: secondaryGroupBySubFieldName,
          dateGranularity: shouldApplySecondaryDateGranularity
            ? (secondaryDateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY)
            : undefined,
          firstDayOfTheWeek,
          isNestedDateField: isSecondaryNestedDate,
          timeZone: userTimezone,
        }),
      );

      if (isDefined(secondaryAxisOrderBy)) {
        const secondaryOrderByItem = getGroupByOrderBy({
          graphOrderBy: secondaryAxisOrderBy,
          groupByFieldMetadata: secondaryGroupByField,
          groupBySubFieldName: secondaryGroupBySubFieldName,
          aggregateOperation,
          dateGranularity: shouldApplySecondaryDateGranularity
            ? (secondaryDateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY)
            : undefined,
        });

        if (isDefined(secondaryOrderByItem)) {
          orderBy.push(secondaryOrderByItem);
        }
      }
    }

    const aggregateFieldKey = buildAggregateFieldKey({
      aggregateOperation,
      aggregateFieldMetadata: aggregateField,
    });

    const selectedFields = {
      [aggregateFieldKey]: true,
      groupByDimensionValues: true,
    };

    const results = await this.commonGroupByQueryRunnerService.execute(
      {
        filter: filter ?? {},
        orderBy: orderBy.length > 0 ? orderBy : undefined,
        groupBy: groupBy as ObjectRecordGroupBy,
        selectedFields,
        limit,
      },
      {
        authContext,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      },
    );

    return results.map((result) => ({
      groupByDimensionValues: result.groupByDimensionValues ?? [],
      aggregateValue: Number(result[aggregateFieldKey] ?? 0),
    }));
  }

  private getFieldMetadata(
    fieldMetadataId: string,
    fieldMetadataById: Partial<Record<string, FlatFieldMetadata>>,
  ): FlatFieldMetadata {
    const fieldMetadata = fieldMetadataById[fieldMetadataId];

    if (!isDefined(fieldMetadata)) {
      throw new ChartDataException(
        generateChartDataExceptionMessage(
          ChartDataExceptionMessageKey.FIELD_METADATA_NOT_FOUND,
          fieldMetadataId,
        ),
        ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    return fieldMetadata;
  }
}
