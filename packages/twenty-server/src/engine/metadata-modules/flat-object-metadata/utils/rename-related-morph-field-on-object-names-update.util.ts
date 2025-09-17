import {
  RelationType,
  type FieldMetadataType,
  type FromTo,
} from 'twenty-shared/types';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { computeMorphRelationFieldName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-relation-field-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-object-metadata-many-to-one-target-morph-relation-flat-field-metadatas-or-throw.util';

const searchAndReplaceLast = ({
  replace,
  search,
  source,
}: {
  source: string;
  search: string;
  replace: string;
}) => {
  const lastIndex = source.lastIndexOf(search);

  if (lastIndex === -1) return source;

  return (
    source.slice(0, lastIndex) +
    replace +
    source.slice(lastIndex + search.length)
  );
};

type RenameRelatedMorphFieldOnObjectNamesUpdateArgs = FromTo<
  FlatObjectMetadata,
  'flatObjectMetadata'
> & {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};
// We should recompute each index here too
export const renameRelatedMorphFieldOnObjectNamesUpdate = ({
  fromFlatObjectMetadata,
  existingFlatObjectMetadataMaps,
  toFlatObjectMetadata,
}: RenameRelatedMorphFieldOnObjectNamesUpdateArgs): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] => {
  const manyToOneMorphRelationFlatFieldMetadatas =
    getFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrow({
      flatObjectMetadata: fromFlatObjectMetadata,
      existingFlatObjectMetadataMaps,
    });

  const updatedFlatFieldMetadatas =
    manyToOneMorphRelationFlatFieldMetadatas.map(
      (morphRelationFlatFieldMetadata) => {
        const isManyToOneRelationType =
          morphRelationFlatFieldMetadata.settings.relationType ===
          RelationType.MANY_TO_ONE;
        const initialMorphRelationFieldName = searchAndReplaceLast({
          source: morphRelationFlatFieldMetadata.name,
          replace: '',
          search: isManyToOneRelationType
            ? fromFlatObjectMetadata.nameSingular
            : fromFlatObjectMetadata.namePlural,
        });
        const newMorphFieldName = computeMorphRelationFieldName({
          fieldName: initialMorphRelationFieldName,
          relationType: morphRelationFlatFieldMetadata.settings.relationType,
          targetObjectMetadata: toFlatObjectMetadata,
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
