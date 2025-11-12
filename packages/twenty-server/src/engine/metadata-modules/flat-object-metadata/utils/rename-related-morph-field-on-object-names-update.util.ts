import {
  FieldMetadataType,
  RelationType,
  type FromTo,
} from 'twenty-shared/types';
import { computeMorphRelationFieldName, CustomError, isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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

  const allMorphRelationFieldMetadatasWithRenamedObjectAsTarget = Object.values(
    flatFieldMetadataMaps.byId,
  ).filter(
    (field): field is FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> =>
      isDefined(field) &&
      field.type === FieldMetadataType.MORPH_RELATION &&
      field.relationTargetObjectMetadataId === toFlatObjectMetadata.id,
  );

  const updatedFlatFieldMetadatas =
  allMorphRelationFieldMetadatasWithRenamedObjectAsTarget.map(
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

        if(!isDefined(toFlatObjectMetadata.nameSingular) || !isDefined(toFlatObjectMetadata.namePlural)) {
          throw new CustomError('toFlatObjectMetadata.nameSingular and toFlatObjectMetadata.namePlural are required', 'TO_OBJECT_METADATA_NAME_SINGULAR_AND_PLURAL_REQUIRED_TO_COMPUTE_MORPH_RELATION_FIELD_NAME');
        }

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
