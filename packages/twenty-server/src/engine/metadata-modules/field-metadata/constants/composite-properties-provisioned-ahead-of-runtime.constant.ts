import {
  type CompositeProperty,
  type FieldMetadataType,
} from 'twenty-shared/types';

// Schema changes create these columns one release before the composite type declares the property, so no workspace runs code that selects a column it lacks. See docs/UPGRADE_COMMANDS.md.
export const COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME: Partial<
  Record<FieldMetadataType, CompositeProperty[]>
> = {};
