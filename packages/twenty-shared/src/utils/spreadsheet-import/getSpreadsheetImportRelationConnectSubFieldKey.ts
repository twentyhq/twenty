import { type SpreadsheetImportFieldMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldMetadata';
import { isDefined } from '@/utils/validation/isDefined';

export const getSpreadsheetImportRelationConnectSubFieldKey = (
  fieldMetadataItem: Pick<SpreadsheetImportFieldMetadata, 'name'>,
  uniqueConstraintField: Pick<SpreadsheetImportFieldMetadata, 'name'>,
  compositeSubFieldKey?: string,
) =>
  `${isDefined(compositeSubFieldKey) ? `${compositeSubFieldKey}-${uniqueConstraintField.name}` : uniqueConstraintField.name} (${fieldMetadataItem.name})`;
