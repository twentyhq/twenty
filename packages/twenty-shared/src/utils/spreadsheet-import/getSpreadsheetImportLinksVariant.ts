import { FieldMetadataType } from '@/types/FieldMetadataType';
import {
  type FieldLinksVariant,
  type FieldMetadataSettings,
} from '@/types/FieldMetadataSettings';
import { type SpreadsheetImportFieldMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldMetadata';

export const getSpreadsheetImportLinksVariant = (
  field: Pick<SpreadsheetImportFieldMetadata, 'type' | 'settings'>,
): FieldLinksVariant | undefined =>
  field.type === FieldMetadataType.LINKS
    ? (field.settings as FieldMetadataSettings<FieldMetadataType.LINKS> | null)
        ?.type
    : undefined;
