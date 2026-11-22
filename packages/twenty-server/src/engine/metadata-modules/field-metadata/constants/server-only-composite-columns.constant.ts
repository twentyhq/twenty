import { FieldMetadataType } from 'twenty-shared/types';

import { RICH_TEXT_FILE_IDS_SERVER_ONLY_COLUMN } from 'src/engine/metadata-modules/field-metadata/constants/rich-text-file-ids-server-only-column.constant';
import { type ServerOnlyCompositeColumn } from 'src/engine/metadata-modules/field-metadata/types/server-only-composite-column.type';

// Not declared on the composite type, so no API surface exposes them. See docs/UPGRADE_COMMANDS.md.
export const SERVER_ONLY_COMPOSITE_COLUMNS: Partial<
  Record<FieldMetadataType, ServerOnlyCompositeColumn[]>
> = {
  [FieldMetadataType.RICH_TEXT]: [RICH_TEXT_FILE_IDS_SERVER_ONLY_COLUMN],
};
