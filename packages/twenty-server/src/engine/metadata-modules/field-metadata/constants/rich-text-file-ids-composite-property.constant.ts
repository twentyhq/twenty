import { type CompositeProperty, FieldMetadataType } from 'twenty-shared/types';

// Not declared on the composite type: only the ORM reads and writes this column, so no API surface exposes it.
export const RICH_TEXT_FILE_IDS_COMPOSITE_PROPERTY: CompositeProperty = {
  name: 'fileIds',
  type: FieldMetadataType.RAW_JSON,
  hidden: true,
  isRequired: false,
};
