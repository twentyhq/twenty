import { v4 } from 'uuid';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

export const buildFlatSearchFieldMetadataForField = ({
  flatObjectMetadata,
  flatFieldMetadata,
  position,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'applicationUniversalIdentifier' | 'universalIdentifier'
  >;
  flatFieldMetadata: { universalIdentifier: string };
  position: number;
}): UniversalFlatSearchFieldMetadata => {
  const createdAt = new Date().toISOString();

  return {
    universalIdentifier: v4(),
    createdAt,
    updatedAt: createdAt,
    position,
    applicationUniversalIdentifier:
      flatObjectMetadata.applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
  };
};
