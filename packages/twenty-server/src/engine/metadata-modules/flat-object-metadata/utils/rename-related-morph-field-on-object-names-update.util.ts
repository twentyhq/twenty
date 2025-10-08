import {
  RelationType,
  type FieldMetadataType,
  type FromTo,
} from 'twenty-shared/types';
import { computeMorphRelationFieldName } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findObjectFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-object-fields-in-flat-field-metadata-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-object-metadata-many-to-one-target-morph-relation-flat-field-metadatas-or-throw.util';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

type RenameRelatedMorphFieldOnObjectNamesUpdateArgs = FromTo<
  FlatObjectMetadata,
  'flatObjectMetadata'
> &
  Pick<AllFlatEntityMaps, 'flatFieldMetadataMaps'>;
// TODO We should recompute each index here too
export const renameRelatedMorphFieldOnObjectNamesUpdate = ({
  fromFlatObjectMetadata,
  toFlatObjectMetadata,
  flatFieldMetadataMaps,
}: RenameRelatedMorphFieldOnObjectNamesUpdateArgs): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] => {
  const { objectFlatFieldMetadatas } = findObjectFlatFieldMetadatasOrThrow({
    flatFieldMetadataMaps,
    flatObjectMetadata: fromFlatObjectMetadata,
  });
  const manyToOneMorphRelationFlatFieldMetadatas =
    getFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrow({
      flatFieldMetadataMaps,
      objectFlatFieldMetadatas,
    });

  const updatedFlatFieldMetadatas =
    manyToOneMorphRelationFlatFieldMetadatas.map(
      (morphRelationFlatFieldMetadata) => {
        const isManyToOneRelationType =
          morphRelationFlatFieldMetadata.settings.relationType ===
          RelationType.MANY_TO_ONE;
        const initialMorphRelationFieldName =
          getMorphNameFromMorphFieldMetadataName({
            morphRelationFlatFieldMetadata,
            nameSingular: fromFlatObjectMetadata.nameSingular,
            namePlural: fromFlatObjectMetadata.namePlural,
          });

        const newMorphFieldName = computeMorphRelationFieldName({
          fieldName: initialMorphRelationFieldName,
          relationType: morphRelationFlatFieldMetadata.settings.relationType,
          targetObjectMetadataNameSingular: toFlatObjectMetadata.nameSingular,
          targetObjectMetadataNamePlural: toFlatObjectMetadata.namePlural,
        });
        const newJoinColumnName = isManyToOneRelationType
          ? computeMorphOrRelationFieldJoinColumnName({
              name: newMorphFieldName,
            })
          : undefined;

        return {
          ...morphRelationFlatFieldMetadata,
          name: newMorphFieldName,
          settings: {
            ...morphRelationFlatFieldMetadata.settings,
            joinColumnName: newJoinColumnName,
          },
        };
      },
    );

  return updatedFlatFieldMetadatas;
};
