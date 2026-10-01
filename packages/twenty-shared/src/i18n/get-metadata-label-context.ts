import {
  type TranslatableMetadataName,
  type TranslatablePropertyName,
} from './translatable-properties-by-metadata-name';

// Authoring sites repeat this as literal msg contexts since lingui extraction cannot evaluate a call.
export const getMetadataLabelContext = <T extends TranslatableMetadataName>(
  metadataName: T,
  property: TranslatablePropertyName<T>,
): string => `${metadataName}.${property}`;
