import { type FieldMetadataType, type FromTo } from 'twenty-shared/types';
import { computeMorphRelationFieldJoinColumnName } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatObjectMetadataManyToOneTargetMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-object-metadata-morph-relation-flat-field-metadatas.util';

type RenameFlatObjectMetadataManyToOneMorphRelationTargetFlatFieldMetadatasSettingsJoinColumnNameArgs =
  FromTo<FlatObjectMetadata, 'flatObjectMetadata'> & {
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  };
export const renameFlatObjectMetadataManyToOneMorphRelationTargetFlatFieldMetadatasSettingsJoinColumnName =
  ({
    fromFlatObjectMetadata,
    toFlatObjectMetadata,
    existingFlatObjectMetadataMaps,
  }: RenameFlatObjectMetadataManyToOneMorphRelationTargetFlatFieldMetadatasSettingsJoinColumnNameArgs): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] => {
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
