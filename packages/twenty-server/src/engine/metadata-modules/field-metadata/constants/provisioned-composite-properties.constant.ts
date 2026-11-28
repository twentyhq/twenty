import {
  type CompositeProperty,
  type FieldMetadataType,
} from 'twenty-shared/types';

// Their columns exist one release before the composite type declares them. See docs/UPGRADE_COMMANDS.md.
export const PROVISIONED_COMPOSITE_PROPERTIES: Partial<
  Record<FieldMetadataType, CompositeProperty[]>
> = {};
