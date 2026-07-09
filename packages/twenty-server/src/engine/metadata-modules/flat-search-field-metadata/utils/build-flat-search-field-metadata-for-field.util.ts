import { getSearchFieldUniversalIdentifier } from 'twenty-shared/application';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

export const buildFlatSearchFieldMetadataForField = ({
  flatObjectMetadata,
  flatFieldMetadata,
  tsVectorFlatFieldMetadata,
  position,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'applicationUniversalIdentifier' | 'universalIdentifier'
  >;
  flatFieldMetadata: { universalIdentifier: string };
  tsVectorFlatFieldMetadata: { universalIdentifier: string };
  position: number;
}): UniversalFlatSearchFieldMetadata => {
  const createdAt = new Date().toISOString();

  return {
    universalIdentifier: getSearchFieldUniversalIdentifier({
      applicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
      fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
    }),
    createdAt,
    updatedAt: createdAt,
    position,
    isSystemSideEffect: true,
    applicationUniversalIdentifier:
      flatObjectMetadata.applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
    tsVectorFieldMetadataUniversalIdentifier:
      tsVectorFlatFieldMetadata.universalIdentifier,
  };
};
