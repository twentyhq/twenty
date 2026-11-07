import { isNonEmptyString } from '@sniptt/guards';
import { isTimeZone } from 'class-validator';
import { BINDABLE_FIELD_FILTER_TYPES_BY_PAGE_LAYOUT_FILTER_TYPE } from 'twenty-shared/constants';
import {
  type DashboardFilterBinding,
  type FieldMetadataType,
  type PageLayoutFilterCondition,
  PageLayoutFilterType,
  type PageLayoutFilterValue,
} from 'twenty-shared/types';
import {
  buildDashboardFilterForWidget,
  getFilterTypeFromFieldType,
  isDefined,
  isRecordFilterValueValid,
} from 'twenty-shared/utils';
import { z } from 'zod';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFilterConditionValidationIssue } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-filter-condition-validation-issue.util';
import { PAGE_LAYOUT_FILTER_VALUE_SCHEMA } from 'src/engine/metadata-modules/flat-page-layout/constants/page-layout-filter-value-schema.constant';
import { VALUE_FORMAT_FIELD_TYPE_BY_PAGE_LAYOUT_FILTER_TYPE } from 'src/engine/metadata-modules/flat-page-layout/constants/value-format-field-type-by-page-layout-filter-type.constant';
import {
  ChartDataException,
  ChartDataExceptionCode,
  generateChartDataExceptionMessage,
} from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';

const DASHBOARD_FILTER_VALUES_SCHEMA = z.record(
  z.string(),
  PAGE_LAYOUT_FILTER_VALUE_SCHEMA,
);

const createInvalidDashboardFilterException = (context: string) =>
  new ChartDataException(
    generateChartDataExceptionMessage(
      ChartDataExceptionCode.INVALID_DASHBOARD_FILTER,
      context,
    ),
    ChartDataExceptionCode.INVALID_DASHBOARD_FILTER,
  );

const validateConditionOrThrow = ({
  condition: { operand, value },
  pageLayoutFilterId,
  valueFormatFieldType,
}: {
  condition: PageLayoutFilterCondition;
  pageLayoutFilterId: string;
  valueFormatFieldType: FieldMetadataType;
}) => {
  const issue = getFilterConditionValidationIssue({
    fieldType: valueFormatFieldType,
    operand,
    value,
  });

  if (issue?.kind === 'UNSUPPORTED_OPERAND') {
    throw createInvalidDashboardFilterException(
      `operand "${operand}" of filter "${pageLayoutFilterId}" is not supported. Supported operands: ${issue.allowedOperands.join(', ')}`,
    );
  }

  if (
    issue?.kind === 'INVALID_VALUE' ||
    !isRecordFilterValueValid({ operand, value })
  ) {
    const hint = isNonEmptyString(issue?.hint) ? ` ${issue.hint}` : '';

    throw createInvalidDashboardFilterException(
      `value "${value}" of filter "${pageLayoutFilterId}" is not valid for operand "${operand}".${hint}`,
    );
  }
};

const validateBindingOrThrow = ({
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

  const fieldFilterType = getFilterTypeFromFieldType(field.type);

  const pageLayoutFilterType = Object.values(PageLayoutFilterType).find(
    (type) =>
      BINDABLE_FIELD_FILTER_TYPES_BY_PAGE_LAYOUT_FILTER_TYPE[type].some(
        (bindableFieldFilterType) =>
          bindableFieldFilterType === fieldFilterType,
      ),
  );

  if (!isDefined(pageLayoutFilterType)) {
    throw createInvalidDashboardFilterException(
      `filter "${pageLayoutFilterId}" is bound to field "${field.name}", whose filter type ${fieldFilterType} cannot be bound to a dashboard filter`,
    );
  }

  for (const condition of value.conditions) {
    validateConditionOrThrow({
      condition,
      pageLayoutFilterId,
      valueFormatFieldType:
        VALUE_FORMAT_FIELD_TYPE_BY_PAGE_LAYOUT_FILTER_TYPE[
          pageLayoutFilterType
        ],
    });
  }

  return field;
};

export const buildDashboardChartFilterOrThrow = ({
  dashboardFilterValues,
  dashboardFilterBindings,
  timeZone,
  objectMetadataId,
  flatFieldMetadataMaps,
}: {
  dashboardFilterValues: unknown;
  dashboardFilterBindings: DashboardFilterBinding[] | null | undefined;
  timeZone: string;
  objectMetadataId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}) => {
  if (!isDefined(dashboardFilterValues)) {
    return undefined;
  }

  if (!isTimeZone(timeZone)) {
    throw createInvalidDashboardFilterException(
      `"${timeZone}" is not a valid IANA time zone`,
    );
  }

  const parsedValues = DASHBOARD_FILTER_VALUES_SCHEMA.safeParse(
    dashboardFilterValues,
  );

  if (!parsedValues.success) {
    throw createInvalidDashboardFilterException(
      `values are malformed: ${z.prettifyError(parsedValues.error)}`,
    );
  }

  const values = parsedValues.data;

  const boundBindings = (dashboardFilterBindings ?? []).filter(
    ({ pageLayoutFilterId }) => isDefined(values[pageLayoutFilterId]),
  );

  const boundFields = boundBindings.map((binding) =>
    validateBindingOrThrow({
      binding,
      value: values[binding.pageLayoutFilterId],
      objectMetadataId,
      flatFieldMetadataMaps,
    }),
  );

  return buildDashboardFilterForWidget({
    values,
    bindings: boundBindings,
    fields: boundFields,
    timeZone,
  });
};
