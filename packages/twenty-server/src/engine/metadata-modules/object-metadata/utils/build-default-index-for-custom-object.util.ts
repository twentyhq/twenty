import { v4 } from 'uuid';

import { FlatFieldMetadataSecond } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { FlatObjectMetadataSecond } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { type DefaultFlatFieldForCustomObjectMaps } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';

export const buildDefaultIndexesForCustomObject = ({
  workspaceId,
  flatObjectMetadata,
  defaultFlatFieldForCustomObjectMaps,
  objectFlatFieldMetadatas,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadataSecond;
  objectFlatFieldMetadatas: FlatFieldMetadataSecond[];
  defaultFlatFieldForCustomObjectMaps: DefaultFlatFieldForCustomObjectMaps;
}) => {
  const tsFlatVectorIndexId = v4();
  const createdAt = new Date();
  const tsVectorFlatIndex = generateFlatIndexMetadataWithNameOrThrow({
    objectFlatFieldMetadatas,
    flatIndex: {
      createdAt,
      flatIndexFieldMetadatas: [
        {
          createdAt,
          fieldMetadataId:
            defaultFlatFieldForCustomObjectMaps.fields.searchVectorField.id,
          id: v4(),
          indexMetadataId: tsFlatVectorIndexId,
          order: 0,
          updatedAt: createdAt,
        },
      ],
      id: tsFlatVectorIndexId,
      indexType: IndexType.GIN,
      indexWhereClause: null,
      isCustom: false,
      isUnique: false,
      objectMetadataId: flatObjectMetadata.id,
      universalIdentifier: tsFlatVectorIndexId,
      updatedAt: createdAt,
      workspaceId,
    },
    flatObjectMetadata,
  });

  return {
    indexes: {
      tsVectorFlatIndex,
    },
  } as const satisfies { indexes: Record<string, FlatIndexMetadata> };
};
