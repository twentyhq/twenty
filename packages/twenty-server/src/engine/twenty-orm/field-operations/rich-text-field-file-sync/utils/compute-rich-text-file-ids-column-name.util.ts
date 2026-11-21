import { RICH_TEXT_FILE_IDS_COMPOSITE_PROPERTY } from 'src/engine/metadata-modules/field-metadata/constants/rich-text-file-ids-composite-property.constant';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

export const computeRichTextFileIdsColumnName = (fieldName: string): string =>
  computeCompositeColumnName(fieldName, RICH_TEXT_FILE_IDS_COMPOSITE_PROPERTY);
