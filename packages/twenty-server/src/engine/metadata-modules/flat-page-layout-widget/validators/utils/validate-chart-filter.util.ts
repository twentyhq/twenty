import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  FieldMetadataType,
  type FilterableAndTSVectorFieldType,
  type UniversalChartFilter,
} from 'twenty-shared/types';
import {
  FILTER_OPERANDS_MAP,
  getFilterOperandsForFilterableFieldType,
  getFilterValueValidationIssue,
  isDefined,
} from 'twenty-shared/utils';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

type UniversalChartRecordFilter = NonNullable<
  UniversalChartFilter['recordFilters']
>[number];

const isFilterableFieldType = (
  fieldType: FieldMetadataType,
): fieldType is FilterableAndTSVectorFieldType =>
  fieldType in FILTER_OPERANDS_MAP;

const getEffectiveFieldType = ({
  fieldType,
  relationTargetFieldType,
}: {
  fieldType: FieldMetadataType;
  relationTargetFieldType: FieldMetadataType | undefined;
}): FieldMetadataType =>
  fieldType === FieldMetadataType.RELATION && isDefined(relationTargetFieldType)
    ? relationTargetFieldType
    : fieldType;

const validateChartRecordFilter = ({
  recordFilter,
  widgetTitle,
  flatFieldMetadataMaps,
}: {
  recordFilter: UniversalChartRecordFilter;
  widgetTitle: string;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): FlatPageLayoutWidgetValidationError[] => {
  const {
    fieldMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
    operand: rawOperand,
    subFieldName,
    value,
  } = recordFilter;

  if (!isDefined(fieldMetadataUniversalIdentifier)) {
    return [
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`A chart filter of widget "${widgetTitle}" has no field metadata universal identifier`,
        userFriendlyMessage: msg`A chart filter has no field`,
      },
    ];
  }

  const filterField = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier: fieldMetadataUniversalIdentifier,
  });

  // A missing field is already reported when the action is transpiled
  if (!isDefined(filterField)) {
    return [];
  }

  const relationTargetField = isDefined(
    relationTargetFieldMetadataUniversalIdentifier,
  )
    ? findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
      })
    : undefined;

  const effectiveFieldType = getEffectiveFieldType({
    fieldType: filterField.type,
    relationTargetFieldType: relationTargetField?.type,
  });

  if (!isFilterableFieldType(effectiveFieldType)) {
    return [];
  }

  const allowedOperands = getFilterOperandsForFilterableFieldType({
    filterType: effectiveFieldType,
    subFieldName,
  });

  const operand = allowedOperands.find(
    (allowedOperand) => allowedOperand === rawOperand,
  );

  if (!isDefined(operand)) {
    const allowedOperandsText = allowedOperands.join(', ');

    return [
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Operand "${rawOperand}" of a chart filter of widget "${widgetTitle}" is not supported on field type "${effectiveFieldType}". Supported operands: ${allowedOperandsText}.`,
        userFriendlyMessage: msg`Chart filter operand is not supported for this field type`,
        value: rawOperand,
      },
    ];
  }

  const issue = getFilterValueValidationIssue({
    fieldType: effectiveFieldType,
    operand,
    subFieldName,
    value,
  });

  if (!isDefined(issue)) {
    return [];
  }

  const { stringifiedValue, filterType, hint } = issue;

  return [
    {
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: isNonEmptyString(hint)
        ? t`Value "${stringifiedValue}" of a chart filter of widget "${widgetTitle}" is not valid for operand "${operand}" on field type "${filterType}". ${hint}`
        : t`Value "${stringifiedValue}" of a chart filter of widget "${widgetTitle}" is not valid for operand "${operand}" on field type "${filterType}".`,
      userFriendlyMessage: msg`Chart filter value is not valid for this operand`,
      value,
    },
  ];
};

export const validateChartFilter = ({
  filter,
  widgetTitle,
  flatFieldMetadataMaps,
}: {
  filter: UniversalChartFilter | undefined;
  widgetTitle: string;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): FlatPageLayoutWidgetValidationError[] => {
  const recordFilters = filter?.recordFilters;

  if (!isDefined(recordFilters)) {
    return [];
  }

  return recordFilters.flatMap((recordFilter) =>
    validateChartRecordFilter({
      recordFilter,
      widgetTitle,
      flatFieldMetadataMaps,
    }),
  );
};
