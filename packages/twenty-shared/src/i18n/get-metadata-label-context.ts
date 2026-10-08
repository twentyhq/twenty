import {
  type TranslatableMetadataName,
  type TranslatablePropertyName,
} from './translatable-properties-by-metadata-name';

// Keyed per role since many languages word the same English label differently ('Company' as object vs field).
// Authoring sites repeat this as literal msg contexts (lingui cannot evaluate a call); the standard catalog guard spec pins them.
export const getMetadataLabelContext = <T extends TranslatableMetadataName>(
  metadataName: T,
  property: TranslatablePropertyName<T>,
): string => `${metadataName}.${property}`;
