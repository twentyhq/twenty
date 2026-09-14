import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';
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

type RelationFlatFieldMetadata =
  OrmFlatFieldMetadata<MorphOrRelationFieldMetadataType>;

export type InheritedReadabilityColumnParent = {
  kind: 'column';
  fieldMetadataId: string;
  joinColumnName: string;
  parentFlatObjectMetadata: FlatObjectMetadata;
};

export type InheritedReadabilityChildrenParent = {
  kind: 'children';
  fieldMetadataId: string;
  childJoinColumnName: string;
  childFlatObjectMetadata: FlatObjectMetadata;
};

export type InheritedReadabilityParent =
  | InheritedReadabilityColumnParent
  | InheritedReadabilityChildrenParent;

export type InheritedReadabilityParentLink = Pick<
  InheritedReadabilityColumnParent,
  'joinColumnName' | 'parentFlatObjectMetadata'
>;

const isRelationFieldOfObject =
  (flatObjectMetadata: FlatObjectMetadata) =>
  (
    flatFieldMetadata: OrmFlatFieldMetadata | undefined,
  ): flatFieldMetadata is RelationFlatFieldMetadata =>
    isDefined(flatFieldMetadata) &&
    flatFieldMetadata.objectMetadataId === flatObjectMetadata.id &&
    isMorphOrRelationFlatFieldMetadata(flatFieldMetadata);

const isManyToOne = (flatFieldMetadata: RelationFlatFieldMetadata): boolean =>
  flatFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE;

const isOneToMany = (flatFieldMetadata: RelationFlatFieldMetadata): boolean =>
  flatFieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY;

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

const resolveColumnParents = ({
  flatObjectMetadata,
  declaredFlatFieldMetadatas,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  declaredFlatFieldMetadatas: RelationFlatFieldMetadata[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): InheritedReadabilityColumnParent[] => {
  const declaredManyToOneFlatFieldMetadatas =
    declaredFlatFieldMetadatas.filter(isManyToOne);

  const declaredMorphIds = new Set(
    declaredManyToOneFlatFieldMetadatas
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
          .filter(isRelationFieldOfObject(flatObjectMetadata))
          .filter(isManyToOne)
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
        !isManyToOne(childFlatFieldMetadata)
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
  const declaredFlatFieldMetadatas = (
    flatObjectMetadata.readabilityParentFieldUniversalIdentifiers ?? []
  )
    .map(
      (universalIdentifier) =>
        flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
    )
    .filter(isRelationFieldOfObject(flatObjectMetadata));

  return [
    ...resolveColumnParents({
      flatObjectMetadata,
      declaredFlatFieldMetadatas,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    }),
    ...resolveChildrenParents({
      declaredFlatFieldMetadatas,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    }),
  ];
};

// The records of other objects that inherit their readability through the rows
// of this object: writing such a row grants access to the record it points at
export const resolveInheritedReadabilityChildLinks = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): InheritedReadabilityParentLink[] =>
  getObjectFlatFieldMetadatas({ flatObjectMetadata, flatFieldMetadataMaps })
    .filter(isRelationFieldOfObject(flatObjectMetadata))
    .filter(isManyToOne)
    .flatMap((flatFieldMetadata) => {
      const parentFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
      });
      const parentFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: flatFieldMetadata.relationTargetFieldMetadataId,
      });

      if (
        !isDefined(parentFlatObjectMetadata) ||
        !isDefined(parentFlatFieldMetadata) ||
        parentFlatObjectMetadata.readability !==
          MetadataReadability.INHERITED ||
        !(
          parentFlatObjectMetadata.readabilityParentFieldUniversalIdentifiers ??
          []
        ).includes(parentFlatFieldMetadata.universalIdentifier)
      ) {
        return [];
      }

      return [
        {
          joinColumnName: computeMorphOrRelationFieldJoinColumnName({
            name: flatFieldMetadata.name,
          }),
          parentFlatObjectMetadata,
        },
      ];
    });
