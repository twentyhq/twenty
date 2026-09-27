import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/constants/CompositeFieldSubFieldLabels';
import { type SpreadsheetImportFieldMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldMetadata';
import { isSpreadsheetImportCompositeFieldType } from '@/utils/spreadsheet-import/isSpreadsheetImportCompositeFieldType';
import { isDefined } from '@/utils/validation/isDefined';

export const getSpreadsheetImportRelationConnectSubFieldLabel = (
  fieldMetadataItem: Pick<SpreadsheetImportFieldMetadata, 'label'>,
  uniqueFieldMetadataItem: Pick<
    SpreadsheetImportFieldMetadata,
    'label' | 'type'
  >,
  compositeSubFieldKey?: string,
) => {
  const compositeSubFieldLabel =
    isSpreadsheetImportCompositeFieldType(uniqueFieldMetadataItem.type) &&
    isDefined(compositeSubFieldKey)
      ? COMPOSITE_FIELD_SUB_FIELD_LABELS[uniqueFieldMetadataItem.type][
          compositeSubFieldKey
        ]
      : undefined;

  return `${fieldMetadataItem.label} / ${uniqueFieldMetadataItem.label}${compositeSubFieldLabel ? ` / ${compositeSubFieldLabel}` : ''}`;
};
