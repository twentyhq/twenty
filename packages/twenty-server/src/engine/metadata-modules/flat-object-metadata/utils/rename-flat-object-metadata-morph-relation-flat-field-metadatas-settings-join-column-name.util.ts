import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatObjectMetadataManyToOneTargetMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-object-metadata-morph-relation-flat-field-metadatas.util';
import { FromTo } from 'twenty-shared/types';
import { computeMorphRelationFieldJoinColumnName } from 'twenty-shared/utils';

type TmpArgs = FromTo<FlatObjectMetadata, 'flatObjectMetadata'> & {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const renameFlatObjectMetadataManyToOneMorphRelationTargetFlatFieldMetadatasSettingsJoinColumnName =
  ({
    fromFlatObjectMetadata,
    toFlatObjectMetadata,
    existingFlatObjectMetadataMaps,
  }: TmpArgs): FlatFieldMetadata[] => {
    const manyToOneMorphRelationFlatFieldMetadatas =
      getFlatObjectMetadataManyToOneTargetMorphRelationFlatFieldMetadatasOrThrow(
        {
          flatObjectMetadata: fromFlatObjectMetadata,
          existingFlatObjectMetadataMaps,
        },
      );

    const updatedFlatFieldMetadatas =
      manyToOneMorphRelationFlatFieldMetadatas.flatMap(
        (morphRelationFlatFieldMetadata) => {
          const newJoinColumnName = computeMorphRelationFieldJoinColumnName({
            name: morphRelationFlatFieldMetadata.name,
            targetObjectMetadataNameSingular: toFlatObjectMetadata.nameSingular,
          });

          return {
            ...morphRelationFlatFieldMetadata,
            settings: {
              ...morphRelationFlatFieldMetadata.settings,
              joinColumnName: newJoinColumnName,
            },
          };
        },
      );

    return updatedFlatFieldMetadatas;
  };
