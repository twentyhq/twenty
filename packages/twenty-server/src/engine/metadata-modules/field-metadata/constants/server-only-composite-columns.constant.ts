import { FieldMetadataType } from 'twenty-shared/types';

import { type ServerOnlyCompositeColumn } from 'src/engine/metadata-modules/field-metadata/types/server-only-composite-column.type';

// Columns of a composite field that only the server reads: the composite type does not declare them, so no API surface exposes them. See docs/UPGRADE_COMMANDS.md.
export const SERVER_ONLY_COMPOSITE_COLUMNS: Partial<
  Record<FieldMetadataType, ServerOnlyCompositeColumn[]>
> = {
  [FieldMetadataType.RICH_TEXT]: [
    { name: 'fileIds', type: FieldMetadataType.RAW_JSON },
  ],
};
