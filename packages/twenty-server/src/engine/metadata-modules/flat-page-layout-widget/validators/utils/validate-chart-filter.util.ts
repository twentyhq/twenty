import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type UniversalChartFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { validateRecordFilterFieldLeaf } from 'src/engine/metadata-modules/flat-field-metadata/utils/validate-record-filter-field-leaf.util';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

type UniversalChartRecordFilter = NonNullable<
  UniversalChartFilter['recordFilters']
>[number];

const validateChartRecordFilter = ({
  recordFilter,
  widgetTitle,
  flatFieldMetadataMaps,
}: {
  recordFilter: UniversalChartRecordFilter;
  widgetTitle: string;
  flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
}): FlatPageLayoutWidgetValidationError[] => {
  const {
    fieldMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
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

  return validateRecordFilterFieldLeaf<FlatPageLayoutWidgetValidationError>({
    recordFilter,
    filterField,
    relationTargetField,
    buildUnsupportedOperandError: ({
      rawOperand,
      effectiveFieldType,
      allowedOperandsText,
    }) => ({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Operand "${rawOperand}" of a chart filter of widget "${widgetTitle}" is not supported on field type "${effectiveFieldType}". Supported operands: ${allowedOperandsText}.`,
      userFriendlyMessage: msg`Chart filter operand is not supported for this field type`,
      value: rawOperand,
    }),
    buildInvalidValueError: ({
      stringifiedValue,
      operand,
      filterType,
      hint,
    }) => ({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: isNonEmptyString(hint)
        ? t`Value "${stringifiedValue}" of a chart filter of widget "${widgetTitle}" is not valid for operand "${operand}" on field type "${filterType}". ${hint}`
        : t`Value "${stringifiedValue}" of a chart filter of widget "${widgetTitle}" is not valid for operand "${operand}" on field type "${filterType}".`,
      userFriendlyMessage: msg`Chart filter value is not valid for this operand`,
      value: recordFilter.value,
    }),
  });
};

export const validateChartFilter = ({
  filter,
  widgetTitle,
  flatFieldMetadataMaps,
}: {
  filter: UniversalChartFilter | undefined;
  widgetTitle: string;
  flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
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
