import { v4 } from 'uuid';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { type DefaultFlatFieldForCustomObjectMaps } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const buildDefaultIndexesForCustomObject = ({
  flatObjectMetadata,
  defaultFlatFieldForCustomObjectMaps,
  objectFlatFieldMetadatas,
}: {
  flatObjectMetadata: UniversalFlatObjectMetadata & { id: string };
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  defaultFlatFieldForCustomObjectMaps: DefaultFlatFieldForCustomObjectMaps;
}) => {
  const tsFlatVectorIndexUniversalIdentifier = v4();
  const createdAt = new Date();
  const tsVectorFlatIndex = generateFlatIndexMetadataWithNameOrThrow({
    objectFlatFieldMetadatas,
    flatIndex: {
      createdAt: createdAt.toISOString(),
      universalFlatIndexFieldMetadatas: [
        {
          createdAt: createdAt.toISOString(),
          fieldMetadataUniversalIdentifier:
            defaultFlatFieldForCustomObjectMaps.fields.searchVector
              .universalIdentifier,
          indexMetadataUniversalIdentifier:
            tsFlatVectorIndexUniversalIdentifier,
          order: 0,
          updatedAt: createdAt.toISOString(),
        },
      ],

      indexType: IndexType.GIN,
      indexWhereClause: null,
      isCustom: false,
      isUnique: false,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      universalIdentifier: tsFlatVectorIndexUniversalIdentifier,
      updatedAt: createdAt.toISOString(),
      applicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
    },
    flatObjectMetadata,
  });

  return {
    indexes: {
      tsVectorFlatIndex,
    },
  } as const satisfies { indexes: Record<string, UniversalFlatIndexMetadata> };
};
