import {
  RelationType,
  type FieldMetadataType,
  type FromTo,
} from 'twenty-shared/types';
import { computeMorphRelationFieldName } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findFieldRelatedIndexes } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-field-related-index.util';
import { recomputeIndexOnFlatFieldMetadataNameUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-index-on-flat-field-metadata-name-update.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-object-metadata-many-to-one-target-morph-relation-flat-field-metadatas-or-throw.util';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

type UpdateMorphFlatFieldNameArgs = FromTo<
  FlatObjectMetadata,
  'relationTargetFlatObjectMetadata'
> & {
  fromMorphFlatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
};
const updateMorphFlatFieldName = ({
  fromMorphFlatFieldMetadata,
  fromRelationTargetFlatObjectMetadata,
  toRelationTargetFlatObjectMetadata,
}: UpdateMorphFlatFieldNameArgs): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> => {
  const isManyToOneRelationType =
    fromMorphFlatFieldMetadata.settings.relationType ===
    RelationType.MANY_TO_ONE;
  const initialMorphRelationFieldName = getMorphNameFromMorphFieldMetadataName({
    morphRelationFlatFieldMetadata: fromMorphFlatFieldMetadata,
    nameSingular: fromRelationTargetFlatObjectMetadata.nameSingular,
    namePlural: fromRelationTargetFlatObjectMetadata.namePlural,
  });

  const newMorphFieldName = computeMorphRelationFieldName({
    fieldName: initialMorphRelationFieldName,
    relationType: fromMorphFlatFieldMetadata.settings.relationType,
    targetObjectMetadataNameSingular:
      toRelationTargetFlatObjectMetadata.nameSingular,
    targetObjectMetadataNamePlural:
      toRelationTargetFlatObjectMetadata.namePlural,
  });

  const newJoinColumnName = isManyToOneRelationType
    ? computeMorphOrRelationFieldJoinColumnName({
        name: newMorphFieldName,
      })
    : undefined;

  return {
    ...fromMorphFlatFieldMetadata,
    name: newMorphFieldName,
    settings: {
      ...fromMorphFlatFieldMetadata.settings,
      joinColumnName: newJoinColumnName,
    },
  };
};

type RenameRelatedMorphFieldOnObjectNamesUpdateArgs = FromTo<
  FlatObjectMetadata,
  'flatObjectMetadata'
> &
  Pick<
    AllFlatEntityMaps,
    'flatFieldMetadataMaps' | 'flatObjectMetadataMaps' | 'flatIndexMaps'
  >;

type RenameRelatedMorphFieldOnObjectNamesUpdateReturnType = {
  morphFlatFieldMetadatasToUpdate: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[];
  morphRelatedFlatIndexesToUpdate: FlatIndexMetadata[];
};
export const renameRelatedMorphFieldOnObjectNamesUpdate = ({
  fromFlatObjectMetadata,
  toFlatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatIndexMaps,
}: RenameRelatedMorphFieldOnObjectNamesUpdateArgs): RenameRelatedMorphFieldOnObjectNamesUpdateReturnType => {
  const objectFlatFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: fromFlatObjectMetadata.fieldMetadataIds,
    });

  const allMorphRelationFlatFieldMetadatas =
    getFlatObjectMetadataTargetMorphRelationFlatFieldMetadatasOrThrow({
      flatFieldMetadataMaps,
      objectFlatFieldMetadatas,
    });

  const initialAccumulator: RenameRelatedMorphFieldOnObjectNamesUpdateReturnType =
    {
      morphRelatedFlatIndexesToUpdate: [],
      morphFlatFieldMetadatasToUpdate: [],
    };

  return allMorphRelationFlatFieldMetadatas.reduce(
    (acc, fromMorphFlatFieldMetadata) => {
      const morphFlatFieldMetadataTo = updateMorphFlatFieldName({
        fromMorphFlatFieldMetadata,
        fromRelationTargetFlatObjectMetadata: fromFlatObjectMetadata,
        toRelationTargetFlatObjectMetadata: toFlatObjectMetadata,
      });

      const morphFieldParentFlatObject =
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: fromMorphFlatFieldMetadata.objectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });
      const relatedIndexes = findFieldRelatedIndexes({
        flatFieldMetadata: fromMorphFlatFieldMetadata,
        flatObjectMetadata: morphFieldParentFlatObject,
        flatIndexMaps,
      });

      const flatIndexesToUpdate = recomputeIndexOnFlatFieldMetadataNameUpdate({
        flatFieldMetadataMaps,
        flatObjectMetadata: morphFieldParentFlatObject,
        fromFlatFieldMetadata: fromMorphFlatFieldMetadata,
        toFlatFieldMetadata: {
          name: morphFlatFieldMetadataTo.name,
          isUnique: morphFlatFieldMetadataTo.isUnique,
        },
        relatedFlatIndexMetadata: relatedIndexes,
      });

      return {
        ...acc,
        morphRelatedFlatIndexesToUpdate: [
          ...acc.morphRelatedFlatIndexesToUpdate,
          ...flatIndexesToUpdate,
        ],
        morphFlatFieldMetadatasToUpdate: [
          ...acc.morphFlatFieldMetadatasToUpdate,
          morphFlatFieldMetadataTo,
        ],
      };
    },
    initialAccumulator,
  );
};
