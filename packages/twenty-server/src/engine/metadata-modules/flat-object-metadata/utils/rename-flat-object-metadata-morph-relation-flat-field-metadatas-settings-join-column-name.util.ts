import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatObjectMetadataMorphRelationFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-object-metadata-morph-relation-flat-field-metadatas.util';
import { FromTo } from 'twenty-shared/types';
import { computeMorphRelationFieldJoinColumnName } from 'twenty-shared/utils';

type TmpArgs = FromTo<FlatObjectMetadata, 'flatObjectMetadata'>;
export const renameFlatObjectMetadataMorphRelationFlatFieldMetadatasSettingsJoinColumnName =
  ({ fromFlatObjectMetadata, toFlatObjectMetadata }: TmpArgs) => {
    const manyToOneMorphRelationFlatFieldMetadatas =
      getFlatObjectMetadataMorphRelationFlatFieldMetadatas({
        flatObjectMetadata: fromFlatObjectMetadata,
      }).filter(
        (morphRelationFlatFieldMetadata) =>
          morphRelationFlatFieldMetadata.settings.relationType ===
          RelationType.MANY_TO_ONE,
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
