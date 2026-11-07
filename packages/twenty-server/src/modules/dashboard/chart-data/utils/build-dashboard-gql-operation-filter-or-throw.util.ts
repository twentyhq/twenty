import { isNonEmptyString } from '@sniptt/guards';
import {
  BINDABLE_FIELD_FILTER_TYPES_BY_PAGE_LAYOUT_FILTER_TYPE,
  type CalendarStartDay,
} from 'twenty-shared/constants';
import {
  type DashboardFilterBinding,
  type FilterableAndTSVectorFieldType,
  FirstDayOfTheWeek,
  type PageLayoutFilterCondition,
  PageLayoutFilterType,
  type PageLayoutFilterValue,
} from 'twenty-shared/types';
import {
  buildDashboardFilterForWidget,
  convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek,
  getFilterTypeFromFieldType,
  InvalidDashboardFilterError,
  isDefined,
  isFieldBindableToDashboardFilter,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { VALUE_FORMAT_FIELD_TYPE_BY_PAGE_LAYOUT_FILTER_TYPE } from 'src/engine/metadata-modules/flat-page-layout/constants/value-format-field-type-by-page-layout-filter-type.constant';
import { getPageLayoutFilterConditionValidationIssue } from 'src/engine/metadata-modules/flat-page-layout/utils/get-page-layout-filter-condition-validation-issue.util';
import { type DashboardFilterValueInput } from 'src/modules/dashboard/chart-data/dtos/inputs/dashboard-filter-value.input';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { convertChartFilterToGqlOperationFilter } from 'src/modules/dashboard/chart-data/utils/convert-chart-filter-to-gql-operation-filter.util';

const PAGE_LAYOUT_FILTER_TYPE_BY_BINDABLE_FIELD_FILTER_TYPE = new Map(
  Object.values(PageLayoutFilterType).flatMap((pageLayoutFilterType) =>
    BINDABLE_FIELD_FILTER_TYPES_BY_PAGE_LAYOUT_FILTER_TYPE[
      pageLayoutFilterType
    ].map(
      (
        fieldFilterType,
      ): [FilterableAndTSVectorFieldType, PageLayoutFilterType] => [
        fieldFilterType,
        pageLayoutFilterType,
      ],
    ),
  ),
);

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

const getBoundFlatFieldMetadataOrThrow = ({
  binding: { pageLayoutFilterId, fieldMetadataId },
  value,
  objectMetadataId,
  flatFieldMetadataMaps,
}: {
  binding: DashboardFilterBinding;
  value: PageLayoutFilterValue;
  objectMetadataId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): FlatFieldMetadata => {
  const field = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(field) || field.objectMetadataId !== objectMetadataId) {
    throw createInvalidDashboardFilterException(
      `filter "${pageLayoutFilterId}" is bound to field "${fieldMetadataId}", which is not a field of the widget's object`,
    );
  }

  const pageLayoutFilterType =
    PAGE_LAYOUT_FILTER_TYPE_BY_BINDABLE_FIELD_FILTER_TYPE.get(
      getFilterTypeFromFieldType(field.type),
    );

  if (
    !isDefined(pageLayoutFilterType) ||
    !isFieldBindableToDashboardFilter({
      field,
      filterType: pageLayoutFilterType,
    })
  ) {
    throw createInvalidDashboardFilterException(
      `filter "${pageLayoutFilterId}" is bound to field "${field.name}", which cannot be bound to a dashboard filter`,
    );
  }

  for (const condition of value.conditions) {
    validateConditionOrThrow({
      condition,
      pageLayoutFilterId,
      pageLayoutFilterType,
    });
  }

  return field;
};

export const buildDashboardGqlOperationFilterOrThrow = ({
  dashboardFilterValues,
  dashboardFilterTimeZone,
  dashboardFilterBindings,
  firstDayOfTheWeek,
  objectMetadataId,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  currentWorkspaceMemberId,
}: {
  dashboardFilterValues: DashboardFilterValueInput[] | null | undefined;
  dashboardFilterTimeZone: string | null | undefined;
  dashboardFilterBindings: DashboardFilterBinding[] | null | undefined;
  firstDayOfTheWeek: CalendarStartDay;
  objectMetadataId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  currentWorkspaceMemberId?: string;
}): ObjectRecordFilter => {
  if (!isDefined(dashboardFilterValues)) {
    return {};
  }

  if (!isDefined(dashboardFilterTimeZone)) {
    throw createInvalidDashboardFilterException(
      'a time zone is required with dashboard filter values',
    );
  }

  const values: Record<string, PageLayoutFilterValue> = Object.fromEntries(
    dashboardFilterValues.map(({ pageLayoutFilterId, conditions }) => [
      pageLayoutFilterId,
      { conditions },
    ]),
  );

  const boundFields = (dashboardFilterBindings ?? [])
    .filter(({ pageLayoutFilterId }) => isDefined(values[pageLayoutFilterId]))
    .map((binding) =>
      getBoundFlatFieldMetadataOrThrow({
        binding,
        value: values[binding.pageLayoutFilterId],
        objectMetadataId,
        flatFieldMetadataMaps,
      }),
    );

  const { recordFilters, unresolvedBindings } =
    buildDashboardFilterForWidgetOrThrow({
      values,
      bindings: dashboardFilterBindings,
      fields: boundFields,
      timeZone: dashboardFilterTimeZone,
      firstDayOfTheWeek: convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
        firstDayOfTheWeek,
        FirstDayOfTheWeek.MONDAY,
      ),
    });

  if (isNonEmptyArray(unresolvedBindings)) {
    throw createInvalidDashboardFilterException(
      `filters ${unresolvedBindings.map(({ pageLayoutFilterId }) => `"${pageLayoutFilterId}"`).join(', ')} are bound to fields that could not be resolved`,
    );
  }

  return convertChartFilterToGqlOperationFilter({
    filter: { recordFilters },
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    // IS_TODAY passes through the builder and resolves in this time zone
    userTimezone: dashboardFilterTimeZone,
    currentWorkspaceMemberId,
  });
};
