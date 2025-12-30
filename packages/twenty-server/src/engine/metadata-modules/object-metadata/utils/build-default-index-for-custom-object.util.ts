import { v4 } from 'uuid';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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
  flatObjectMetadata: FlatObjectMetadata;
  objectFlatFieldMetadatas: FlatFieldMetadata[];
  defaultFlatFieldForCustomObjectMaps: DefaultFlatFieldForCustomObjectMaps;
}) => {
  const tsFlatVectorIndexId = v4();
  const createdAt = new Date();
  const tsVectorFlatIndex = generateFlatIndexMetadataWithNameOrThrow({
    objectFlatFieldMetadatas,
    flatIndex: {
      createdAt: createdAt.toISOString(),
      flatIndexFieldMetadatas: [
        {
          createdAt: createdAt.toISOString(),
          fieldMetadataId:
            defaultFlatFieldForCustomObjectMaps.fields.searchVectorField.id,
          id: v4(),
          indexMetadataId: tsFlatVectorIndexId,
          order: 0,
          updatedAt: createdAt.toISOString(),
        },
      ],
      id: tsFlatVectorIndexId,
      indexType: IndexType.GIN,
      indexWhereClause: null,
      isCustom: false,
      isUnique: false,
      objectMetadataId: flatObjectMetadata.id,
      universalIdentifier: tsFlatVectorIndexId,
      updatedAt: createdAt.toISOString(),
      workspaceId,
      applicationId: flatObjectMetadata.applicationId ?? null,
    },
    flatObjectMetadata,
  });

  return {
    indexes: {
      tsVectorFlatIndex,
    },
  } as const satisfies { indexes: Record<string, FlatIndexMetadata> };
};
