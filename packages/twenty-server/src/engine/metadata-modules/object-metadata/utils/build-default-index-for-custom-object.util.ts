import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { type DefaultFlatFieldForCustomObjectMaps } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const buildDefaultIndexesForCustomObject = ({
  workspaceId,
  flatObjectMetadata,
  flatApplication,
  defaultFlatFieldForCustomObjectMaps,
  objectFlatFieldMetadatas,
}: {
  workspaceId: string;
  flatObjectMetadata: UniversalFlatObjectMetadata & { id: string };
  flatApplication: FlatApplication;
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
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      universalIdentifier: tsFlatVectorIndexId,
      updatedAt: createdAt.toISOString(),
      workspaceId,
      applicationId: flatApplication.id,
      applicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
    },
    flatObjectMetadata,
  });

  return {
    indexes: {
      tsVectorFlatIndex,
    },
  } as const satisfies { indexes: Record<string, FlatIndexMetadata> };
};
