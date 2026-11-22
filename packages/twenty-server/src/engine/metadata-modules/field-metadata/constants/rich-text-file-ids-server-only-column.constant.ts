import { FieldMetadataType } from 'twenty-shared/types';

import { type ServerOnlyCompositeColumn } from 'src/engine/metadata-modules/field-metadata/types/server-only-composite-column.type';

export const RICH_TEXT_FILE_IDS_SERVER_ONLY_COLUMN: ServerOnlyCompositeColumn =
  {
    name: 'fileIds',
    type: FieldMetadataType.RAW_JSON,
  };
