import { type CompositeProperty, FieldMetadataType } from 'twenty-shared/types';

import { RICH_TEXT_FILE_IDS_COMPOSITE_PROPERTY } from 'src/engine/metadata-modules/field-metadata/constants/rich-text-file-ids-composite-property.constant';

// Schema changes maintain these columns one release before any code reads them, so no workspace runs code that selects a column it lacks. See docs/UPGRADE_COMMANDS.md.
export const COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME: Partial<
  Record<FieldMetadataType, CompositeProperty[]>
> = {
  [FieldMetadataType.RICH_TEXT]: [RICH_TEXT_FILE_IDS_COMPOSITE_PROPERTY],
};
