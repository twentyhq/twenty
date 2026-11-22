import { RICH_TEXT_FILE_IDS_SERVER_ONLY_COLUMN } from 'src/engine/metadata-modules/field-metadata/constants/rich-text-file-ids-server-only-column.constant';
import { computeServerOnlyCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-server-only-composite-column-name.util';

export const computeRichTextFileIdsColumnName = (fieldName: string): string =>
  computeServerOnlyCompositeColumnName({
    fieldName,
    columnName: RICH_TEXT_FILE_IDS_SERVER_ONLY_COLUMN.name,
  });
