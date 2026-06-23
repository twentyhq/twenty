import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateFlatIndexMetadataWithDeterministicUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index-metadata-with-deterministic-universal-identifier.util';
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
  const createdAt = new Date().toISOString();

  const tsVectorFlatIndex =
    generateFlatIndexMetadataWithDeterministicUniversalIdentifierOrThrow({
      flatObjectMetadata,
      objectFlatFieldMetadatas,
      flatIndex: {
        createdAt,
        updatedAt: createdAt,
        universalFlatIndexFieldMetadatas: [
          {
            createdAt,
            updatedAt: createdAt,
            fieldMetadataUniversalIdentifier:
              defaultFlatFieldForCustomObjectMaps.fields.searchVector
                .universalIdentifier,
            order: 0,
            subFieldName: null,
          },
        ],
        indexType: IndexType.GIN,
        indexWhereClause: null,
        isCustom: false,
        isUnique: false,
        isSystemSideEffect: true,
      },
    });

  return {
    indexes: {
      tsVectorFlatIndex,
    },
  } as const satisfies { indexes: Record<string, UniversalFlatIndexMetadata> };
};
