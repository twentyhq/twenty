import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type InheritedReadabilityParent = {
  fieldMetadataId: string;
  joinColumnName: string;
  parentFlatObjectMetadata: FlatObjectMetadata;
};

const isManyToOneFieldOfObject =
  (flatObjectMetadata: FlatObjectMetadata) =>
  (
    flatFieldMetadata: OrmFlatFieldMetadata | undefined,
  ): flatFieldMetadata is OrmFlatFieldMetadata<MorphOrRelationFieldMetadataType> =>
    isDefined(flatFieldMetadata) &&
    flatFieldMetadata.objectMetadataId === flatObjectMetadata.id &&
    isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
    flatFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE;

const getObjectFlatFieldMetadatas = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): (OrmFlatFieldMetadata | undefined)[] =>
  flatObjectMetadata.fieldIds.length > 0
    ? getFlatFieldsFromFlatObjectMetadata(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      )
    : Object.values(flatFieldMetadataMaps.byUniversalIdentifier);

export const resolveInheritedReadabilityParents = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): InheritedReadabilityParent[] => {
  const declaredFlatFieldMetadatas = (
    flatObjectMetadata.readabilityParentFieldUniversalIdentifiers ?? []
  )
    .map(
      (universalIdentifier) =>
        flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
    )
    .filter(isManyToOneFieldOfObject(flatObjectMetadata));

  const declaredMorphIds = new Set(
    declaredFlatFieldMetadatas
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION,
      )
      .map((flatFieldMetadata) => flatFieldMetadata.morphId)
      .filter(isDefined),
  );

  const morphSiblingFlatFieldMetadatas =
    declaredMorphIds.size === 0
      ? []
      : getObjectFlatFieldMetadatas({
          flatObjectMetadata,
          flatFieldMetadataMaps,
        })
          .filter(isManyToOneFieldOfObject(flatObjectMetadata))
          .filter(
            (flatFieldMetadata) =>
              flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
              isDefined(flatFieldMetadata.morphId) &&
              declaredMorphIds.has(flatFieldMetadata.morphId),
          );

  const parentFlatFieldMetadatas = [
    ...declaredFlatFieldMetadatas,
    ...morphSiblingFlatFieldMetadatas,
  ].filter(
    (flatFieldMetadata, index, flatFieldMetadatas) =>
      flatFieldMetadatas.findIndex(
        (candidate) => candidate.id === flatFieldMetadata.id,
      ) === index,
  );

  return parentFlatFieldMetadatas.flatMap((flatFieldMetadata) => {
    const parentFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
    });

    if (!isDefined(parentFlatObjectMetadata)) {
      return [];
    }

    return [
      {
        fieldMetadataId: flatFieldMetadata.id,
        joinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: flatFieldMetadata.name,
        }),
        parentFlatObjectMetadata,
      },
    ];
  });
};
