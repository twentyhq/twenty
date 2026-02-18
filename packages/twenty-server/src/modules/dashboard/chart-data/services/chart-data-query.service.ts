import { Injectable } from '@nestjs/common';

import { CalendarStartDay } from 'twenty-shared/constants';
import {
  AggregateOperations,
  ObjectRecordGroupByDateGranularity,
  OrderByWithGroupBy,
} from 'twenty-shared/types';
import {
  isDefined,
  isFieldMetadataArrayKind,
  isFieldMetadataDateKind,
} from 'twenty-shared/utils';

import { ObjectRecordGroupBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { ChartFilter } from 'src/engine/metadata-modules/page-layout-widget/types/chart-filter.type';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from 'src/modules/dashboard/chart-data/constants/graph-default-date-granularity.constant';
import { GRAPH_DEFAULT_ORDER_BY } from 'src/modules/dashboard/chart-data/constants/graph-default-order-by.constant';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { GroupByRawResult } from 'src/modules/dashboard/chart-data/types/group-by-raw-result.type';
import { buildAggregateFieldKey } from 'src/modules/dashboard/chart-data/utils/build-aggregate-field-key.util';
import {
  buildGroupByFieldObject,
  type GroupByFieldObject,
} from 'src/modules/dashboard/chart-data/utils/build-group-by-field-object.util';
import { convertChartFilterToGqlOperationFilter } from 'src/modules/dashboard/chart-data/utils/convert-chart-filter-to-gql-operation-filter.util';
import { getFieldMetadata } from 'src/modules/dashboard/chart-data/utils/get-field-metadata.util';
import { getGroupByOrderBy } from 'src/modules/dashboard/chart-data/utils/get-group-by-order-by.util';
import { isRelationNestedFieldDateKind } from 'src/modules/dashboard/chart-data/utils/is-relation-nested-field-date-kind.util';
import { transformAggregateValue } from 'src/modules/dashboard/chart-data/utils/transform-aggregate-value.util';

type ExecuteGroupByQueryParams = {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  objectIdByNameSingular: Record<string, string>;
  authContext: AuthContext;
  groupByFieldMetadataId: string;
  groupBySubFieldName?: string | null;
  aggregateFieldMetadataId: string;
  aggregateOperation: AggregateOperations;
  filter?: ChartFilter;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  userTimezone: string;
  firstDayOfTheWeek: CalendarStartDay;
  limit: number;
  secondaryGroupByFieldMetadataId?: string;
  secondaryGroupBySubFieldName?: string | null;
  secondaryDateGranularity?: ObjectRecordGroupByDateGranularity;
  primaryAxisOrderBy?: GraphOrderBy;
  secondaryAxisOrderBy?: GraphOrderBy;
  splitMultiValueFields?: boolean;
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
    primaryAxisOrderBy,
    secondaryGroupByFieldMetadataId,
    secondaryGroupBySubFieldName,
    secondaryDateGranularity,
    secondaryAxisOrderBy,
    splitMultiValueFields,
  }: ExecuteGroupByQueryParams): Promise<GroupByRawResult[]> {
    const gqlOperationFilter = convertChartFilterToGqlOperationFilter({
      filter,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      userTimezone,
    });

    const primaryGroupByField = getFieldMetadata(
      groupByFieldMetadataId,
      flatFieldMetadataMaps,
    );

    const aggregateField = getFieldMetadata(
      aggregateFieldMetadataId,
      flatFieldMetadataMaps,
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

    const shouldSplitMultiValueFields = splitMultiValueFields ?? true;

    const shouldUnnestPrimary =
      shouldSplitMultiValueFields &&
      isFieldMetadataArrayKind(primaryGroupByField.type);

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
        shouldUnnest: shouldUnnestPrimary,
      }),
    );

    const orderBy: OrderByWithGroupBy = [];

    const primaryOrderBy = getGroupByOrderBy({
      graphOrderBy: primaryAxisOrderBy ?? GRAPH_DEFAULT_ORDER_BY,
      groupByFieldMetadata: primaryGroupByField,
      groupBySubFieldName,
      aggregateOperation,
      aggregateFieldMetadata: aggregateField,
      dateGranularity: shouldApplyPrimaryDateGranularity
        ? (dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY)
        : undefined,
    });

    if (isDefined(primaryOrderBy)) {
      orderBy.push(primaryOrderBy);
    }

    if (isDefined(secondaryGroupByFieldMetadataId)) {
      const secondaryGroupByField = getFieldMetadata(
        secondaryGroupByFieldMetadataId,
        flatFieldMetadataMaps,
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

      const shouldUnnestSecondary =
        shouldSplitMultiValueFields &&
        isFieldMetadataArrayKind(secondaryGroupByField.type);

      if (shouldUnnestPrimary && shouldUnnestSecondary) {
        throw new ChartDataException(
          generateChartDataExceptionMessage(
            ChartDataExceptionCode.INVALID_WIDGET_CONFIGURATION,
            'Split multiple values can only be enabled when one grouped field is multi-value.',
          ),
          ChartDataExceptionCode.INVALID_WIDGET_CONFIGURATION,
        );
      }

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
          shouldUnnest: shouldUnnestSecondary,
        }),
      );

      if (isDefined(secondaryAxisOrderBy)) {
        const secondaryOrderByItem = getGroupByOrderBy({
          graphOrderBy: secondaryAxisOrderBy,
          groupByFieldMetadata: secondaryGroupByField,
          groupBySubFieldName: secondaryGroupBySubFieldName,
          aggregateOperation,
          aggregateFieldMetadata: aggregateField,
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
        filter: gqlOperationFilter,
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
      aggregateValue: transformAggregateValue({
        rawValue: result[aggregateFieldKey],
        aggregateFieldType: aggregateField.type,
        aggregateOperation,
      }),
    }));
  }
}
