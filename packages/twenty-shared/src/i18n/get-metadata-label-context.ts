import {
  type TranslatableMetadataName,
  type TranslatablePropertyName,
} from './translatable-properties-by-metadata-name';

// Message context for a metadata label, e.g. 'fieldMetadata.label'. The same
// English string can label different roles ('Company' is an object name and a
// field label), and many languages need different words for them, so catalog
// entries are keyed per role. Authoring sites repeat this rule as literal msg
// contexts because lingui extraction cannot evaluate a call; the standard
// catalog guard spec is what pins them to the ids the read path computes.
export const getMetadataLabelContext = <T extends TranslatableMetadataName>(
  metadataName: T,
  property: TranslatablePropertyName<T>,
): string => `${metadataName}.${property}`;
