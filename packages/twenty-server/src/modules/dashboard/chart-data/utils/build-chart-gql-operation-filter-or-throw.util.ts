import { isNonEmptyString } from '@sniptt/guards';
import { type CalendarStartDay } from 'twenty-shared/constants';
import {
  type ChartFilter,
  type DashboardFilterBinding,
  type DashboardFilterValue,
  FirstDayOfTheWeek,
  type PageLayoutFilterCondition,
  type PageLayoutFilterType,
} from 'twenty-shared/types';
import {
  buildDashboardFilterForWidget,
  combineFilters,
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  InvalidDashboardFilterError,
  isDefined,
  isFieldBindableToDashboardFilter,
  isNonEmptyArray,
  replaceWidgetFilterPeriodsWithDashboardFilter,
} from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { VALUE_FORMAT_FIELD_TYPE_BY_PAGE_LAYOUT_FILTER_TYPE } from 'src/engine/metadata-modules/flat-page-layout/constants/value-format-field-type-by-page-layout-filter-type.constant';
import { getPageLayoutFilterConditionValidationIssue } from 'src/engine/metadata-modules/flat-page-layout/utils/get-page-layout-filter-condition-validation-issue.util';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { convertChartFilterToGqlOperationFilter } from 'src/modules/dashboard/chart-data/utils/convert-chart-filter-to-gql-operation-filter.util';

const createInvalidDashboardFilterException = (context: string) =>
  new ChartDataException(
    generateChartDataExceptionMessage(
      ChartDataExceptionCode.INVALID_DASHBOARD_FILTER,
      context,
    ),
    ChartDataExceptionCode.INVALID_DASHBOARD_FILTER,
  );

const buildDashboardFilterForWidgetOrThrow = (
  input: Parameters<typeof buildDashboardFilterForWidget>[0],
) => {
  try {
    return buildDashboardFilterForWidget(input);
  } catch (error) {
    if (error instanceof InvalidDashboardFilterError) {
      throw createInvalidDashboardFilterException(error.message);
    }

    throw error;
  }
};

const validateConditionOrThrow = ({
  condition: { operand, value },
  pageLayoutFilterId,
  pageLayoutFilterType,
}: {
  condition: PageLayoutFilterCondition;
  pageLayoutFilterId: string;
  pageLayoutFilterType: PageLayoutFilterType;
}) => {
  const issue = getPageLayoutFilterConditionValidationIssue({
    condition: { operand, value },
    valueFormatFieldType:
      VALUE_FORMAT_FIELD_TYPE_BY_PAGE_LAYOUT_FILTER_TYPE[pageLayoutFilterType],
  });

  if (!isDefined(issue)) {
    return;
  }

  if (issue.kind === 'UNSUPPORTED_OPERAND') {
    throw createInvalidDashboardFilterException(
      `operand "${operand}" of filter "${pageLayoutFilterId}" is not supported. Supported operands: ${issue.allowedOperands.join(', ')}`,
    );
  }

  const hint =
    issue.kind === 'INVALID_VALUE' && isNonEmptyString(issue.hint)
      ? ` ${issue.hint}`
      : '';

  throw createInvalidDashboardFilterException(
    `value "${value}" of filter "${pageLayoutFilterId}" is not valid for operand "${operand}".${hint}`,
  );
};

const validateOverrideFieldOrThrow = ({
  pageLayoutFilterId,
  pageLayoutFilterType,
  fieldMetadataId,
  objectMetadataId,
  flatFieldMetadataMaps,
}: {
  pageLayoutFilterId: string;
  pageLayoutFilterType: PageLayoutFilterType;
  fieldMetadataId: string;
  objectMetadataId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}) => {
  const field = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(field) || field.objectMetadataId !== objectMetadataId) {
    throw createInvalidDashboardFilterException(
      `filter "${pageLayoutFilterId}" is bound to field "${fieldMetadataId}", which is not a field of the widget's object`,
    );
  }

  if (
    !isFieldBindableToDashboardFilter({
      field,
      filterType: pageLayoutFilterType,
    })
  ) {
    throw createInvalidDashboardFilterException(
      `filter "${pageLayoutFilterId}" is bound to field "${field.name}", which cannot be bound to a dashboard filter`,
    );
  }
};

export const buildChartGqlOperationFilterOrThrow = ({
  widgetFilter,
  widgetTimeZone,
  dashboardFilterValues,
  viewerTimeZone,
  dashboardFilterBindings,
  groupByFieldMetadataIds,
  widgetFilterFieldMetadataIds,
  firstDayOfTheWeek,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  currentWorkspaceMemberId,
}: {
  widgetFilter?: ChartFilter;
  widgetTimeZone: string;
  dashboardFilterValues: DashboardFilterValue[] | null | undefined;
  viewerTimeZone: string | null | undefined;
  dashboardFilterBindings: DashboardFilterBinding[] | null | undefined;
  groupByFieldMetadataIds: string[];
  widgetFilterFieldMetadataIds: string[];
  firstDayOfTheWeek: CalendarStartDay;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  currentWorkspaceMemberId?: string;
}): ObjectRecordFilter => {
  const convertFilter = (filter: ChartFilter | undefined, timeZone: string) =>
    convertChartFilterToGqlOperationFilter({
      filter,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      userTimezone: timeZone,
      currentWorkspaceMemberId,
    });

  if (!isNonEmptyArray(dashboardFilterValues)) {
    return convertFilter(widgetFilter, widgetTimeZone);
  }

  // A missing time zone fails the builder's time zone check
  const timeZone = viewerTimeZone ?? '';

  const objectFlatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  for (const {
    pageLayoutFilterId,
    type,
    conditions,
  } of dashboardFilterValues) {
    for (const condition of conditions) {
      validateConditionOrThrow({
        condition,
        pageLayoutFilterId,
        pageLayoutFilterType: type,
      });
    }

    const overrideFieldMetadataId = dashboardFilterBindings?.find(
      (binding) => binding.pageLayoutFilterId === pageLayoutFilterId,
    )?.fieldMetadataId;

    if (isDefined(overrideFieldMetadataId)) {
      validateOverrideFieldOrThrow({
        pageLayoutFilterId,
        pageLayoutFilterType: type,
        fieldMetadataId: overrideFieldMetadataId,
        objectMetadataId: flatObjectMetadata.id,
        flatFieldMetadataMaps,
      });
    }
  }

  const { recordFilters, appliedFields } = buildDashboardFilterForWidgetOrThrow(
    {
      values: dashboardFilterValues,
      bindings: dashboardFilterBindings,
      groupByFieldMetadataIds,
      widgetFilterFieldMetadataIds,
      fields: objectFlatFieldMetadatas,
      timeZone,
      firstDayOfTheWeek: convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
        firstDayOfTheWeek,
        FirstDayOfTheWeek.MONDAY,
      ),
    },
  );

  const { filter: widgetFilterWithoutReplacedPeriods } =
    replaceWidgetFilterPeriodsWithDashboardFilter({
      filter: widgetFilter,
      fieldMetadataIds: appliedFields.map(
        ({ fieldMetadataId }) => fieldMetadataId,
      ),
    });

  return combineFilters([
    convertFilter(widgetFilterWithoutReplacedPeriods, widgetTimeZone),
    convertFilter({ recordFilters }, timeZone),
  ]);
};
