import { v4 } from 'uuid';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

// Builds the searchFieldMetadata row linking a field to its object. Accepts both
// persisted and to-be-created fields since only the universalIdentifier is needed.
export const buildFlatSearchFieldMetadataForField = ({
  flatObjectMetadata,
  flatFieldMetadata,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'applicationUniversalIdentifier' | 'universalIdentifier'
  >;
  flatFieldMetadata: { universalIdentifier: string };
}): UniversalFlatSearchFieldMetadata => {
  const createdAt = new Date().toISOString();

  return {
    universalIdentifier: v4(),
    createdAt,
    updatedAt: createdAt,
    applicationUniversalIdentifier:
      flatObjectMetadata.applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
  };
};
