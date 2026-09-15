import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type InheritedReadabilityChildrenParent } from 'src/engine/twenty-orm/types/inherited-readability-children-parent.type';
import { type InheritedReadabilityColumnParent } from 'src/engine/twenty-orm/types/inherited-readability-column-parent.type';
import { type InheritedReadabilityParent } from 'src/engine/twenty-orm/types/inherited-readability-parent.type';
import { getRelationFlatFieldMetadatasOfObject } from 'src/engine/twenty-orm/utils/get-relation-flat-field-metadatas-of-object.util';
import { isManyToOneFlatFieldMetadata } from 'src/engine/twenty-orm/utils/is-many-to-one-flat-field-metadata.util';

type RelationFlatFieldMetadata =
  OrmFlatFieldMetadata<MorphOrRelationFieldMetadataType>;

const isOneToMany = (flatFieldMetadata: RelationFlatFieldMetadata): boolean =>
  flatFieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY;

const resolveColumnParents = ({
  relationFlatFieldMetadatas,
  declaredFlatFieldMetadatas,
  flatObjectMetadataMaps,
}: {
  relationFlatFieldMetadatas: RelationFlatFieldMetadata[];
  declaredFlatFieldMetadatas: RelationFlatFieldMetadata[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): InheritedReadabilityColumnParent[] => {
  const declaredManyToOneFlatFieldMetadatas = declaredFlatFieldMetadatas.filter(
    isManyToOneFlatFieldMetadata,
  );

  const declaredMorphIds = new Set(
    declaredManyToOneFlatFieldMetadatas
      .filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION,
      )
      .map((flatFieldMetadata) => flatFieldMetadata.morphId)
      .filter(isDefined),
  );

  const morphSiblingFlatFieldMetadatas = relationFlatFieldMetadatas
    .filter(isManyToOneFlatFieldMetadata)
    .filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(flatFieldMetadata.morphId) &&
        declaredMorphIds.has(flatFieldMetadata.morphId),
    );

  const parentFlatFieldMetadatas = [
    ...declaredManyToOneFlatFieldMetadatas,
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
        kind: 'column' as const,
        fieldMetadataId: flatFieldMetadata.id,
        joinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: flatFieldMetadata.name,
        }),
        parentFlatObjectMetadata,
      },
    ];
  });
};

const resolveChildrenParents = ({
  declaredFlatFieldMetadatas,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  declaredFlatFieldMetadatas: RelationFlatFieldMetadata[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): InheritedReadabilityChildrenParent[] =>
  declaredFlatFieldMetadatas
    .filter(isOneToMany)
    .flatMap((flatFieldMetadata) => {
      const childFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
      });
      const childFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: flatFieldMetadata.relationTargetFieldMetadataId,
      });

      if (
        !isDefined(childFlatObjectMetadata) ||
        !isDefined(childFlatFieldMetadata) ||
        !isMorphOrRelationFlatFieldMetadata(childFlatFieldMetadata) ||
        !isManyToOneFlatFieldMetadata(childFlatFieldMetadata)
      ) {
        return [];
      }

      return [
        {
          kind: 'children' as const,
          fieldMetadataId: flatFieldMetadata.id,
          childJoinColumnName: computeMorphOrRelationFieldJoinColumnName({
            name: childFlatFieldMetadata.name,
          }),
          childFlatObjectMetadata,
        },
      ];
    });

export const resolveInheritedReadabilityParents = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): InheritedReadabilityParent[] => {
  const relationFlatFieldMetadatas = getRelationFlatFieldMetadatasOfObject({
    flatObjectMetadata,
    flatFieldMetadataMaps,
  });
  const declaredFlatFieldMetadatas = (
    flatObjectMetadata.readabilityParentFieldUniversalIdentifiers ?? []
  ).flatMap((universalIdentifier) =>
    relationFlatFieldMetadatas.filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.universalIdentifier === universalIdentifier,
    ),
  );

  return [
    ...resolveColumnParents({
      relationFlatFieldMetadatas,
      declaredFlatFieldMetadatas,
      flatObjectMetadataMaps,
    }),
    ...resolveChildrenParents({
      declaredFlatFieldMetadatas,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    }),
  ];
};
