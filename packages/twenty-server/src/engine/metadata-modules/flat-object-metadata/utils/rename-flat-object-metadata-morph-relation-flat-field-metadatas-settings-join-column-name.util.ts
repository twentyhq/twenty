import { type FieldMetadataType, type FromTo } from 'twenty-shared/types';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatObjectMetadataManyToOneTargetMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-object-metadata-many-to-one-target-morph-relation-flat-field-metadatas-or-throw.util';

type RenameFlatObjectMetadataManyToOneMorphRelationTargetFlatFieldMetadatasSettingsJoinColumnNameArgs =
  FromTo<FlatObjectMetadata, 'flatObjectMetadata'> & {
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  };
export const renameFlatObjectMetadataManyToOneMorphRelationTargetFlatFieldMetadatasSettingsJoinColumnName =
  ({
    fromFlatObjectMetadata,
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
      manyToOneMorphRelationFlatFieldMetadatas.map(
        (morphRelationFlatFieldMetadata) => {
          const newJoinColumnName = computeMorphOrRelationFieldJoinColumnName({
            name: morphRelationFlatFieldMetadata.name,
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
