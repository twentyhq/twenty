import {
  FieldMetadataType,
  MetadataReadability,
  type ObjectAccessInheritance,
  ObjectAccessInheritanceMatch,
  type ObjectAccessInheritanceRelationRef,
  ObjectAccessInheritanceRelationKind,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type InheritanceParentColumn = {
  fieldMetadataId: string;
  fieldName: string;
  joinColumnName: string;
  parentObjectMetadataId: string;
};

export type InheritanceBranch = {
  ref: ObjectAccessInheritanceRelationRef;
  isMorph: boolean;
  columns: InheritanceParentColumn[];
};

export type ObjectAccessInheritanceResolutionFailureCode =
  | 'MISSING_INHERITANCE'
  | 'EMPTY_INHERITANCE'
  | 'UNKNOWN_RELATION_REFERENCE'
  | 'RELATION_NOT_OWNED_BY_OBJECT'
  | 'UNSUPPORTED_RELATION_DIRECTION'
  | 'MORPH_FIELD_REFERENCED_AS_PLAIN_RELATION'
  | 'UNKNOWN_PARENT_OBJECT';

export type ObjectAccessInheritanceResolution =
  | {
      status: 'resolved';
      match: ObjectAccessInheritanceMatch;
      branches: InheritanceBranch[];
    }
  | {
      status: 'invalid';
      code: ObjectAccessInheritanceResolutionFailureCode;
      reference?: ObjectAccessInheritanceRelationRef;
    };

const describeReference = (ref: ObjectAccessInheritanceRelationRef): string =>
  ref.kind === ObjectAccessInheritanceRelationKind.MORPH
    ? `morph ${ref.morphId}`
    : `field ${ref.fieldUniversalIdentifier}`;

export const describeObjectAccessInheritanceFailure = (
  resolution: Extract<ObjectAccessInheritanceResolution, { status: 'invalid' }>,
): string => {
  const reference = isDefined(resolution.reference)
    ? ` (${describeReference(resolution.reference)})`
    : '';

  switch (resolution.code) {
    case 'MISSING_INHERITANCE':
      return 'an INHERITED object must declare its inheritance parameters';
    case 'EMPTY_INHERITANCE':
      return 'the inheritance declaration must select at least one relation';
    case 'UNKNOWN_RELATION_REFERENCE':
      return `the inheritance declaration references a relation that does not exist${reference}`;
    case 'RELATION_NOT_OWNED_BY_OBJECT':
      return `the inheritance declaration references a relation of another object${reference}`;
    case 'UNSUPPORTED_RELATION_DIRECTION':
      return `the inheritance declaration only supports outgoing to-one relations${reference}`;
    case 'MORPH_FIELD_REFERENCED_AS_PLAIN_RELATION':
      return `a morph relation must be referenced through its morph id, not one of its fields${reference}`;
    case 'UNKNOWN_PARENT_OBJECT':
      return `the inheritance declaration targets an object that does not exist${reference}`;
  }
};

// The standard application builds its maps before the object rows exist, so
// fieldIds is empty there and the object's fields are found by scanning instead
const getObjectFlatFieldMetadatas = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): OrmFlatFieldMetadata[] =>
  (flatObjectMetadata.fieldIds.length > 0
    ? getFlatFieldsFromFlatObjectMetadata(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      )
    : Object.values(flatFieldMetadataMaps.byUniversalIdentifier).filter(
        isDefined,
      )
  ).filter(
    (flatFieldMetadata) =>
      flatFieldMetadata.objectMetadataId === flatObjectMetadata.id,
  );

const isManyToOne = (flatFieldMetadata: OrmFlatFieldMetadata): boolean =>
  isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
  flatFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE;

const toParentColumn = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: {
  flatFieldMetadata: OrmFlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): InheritanceParentColumn | undefined => {
  const parentObjectMetadataId = isMorphOrRelationFlatFieldMetadata(
    flatFieldMetadata,
  )
    ? flatFieldMetadata.relationTargetObjectMetadataId
    : undefined;

  if (!isDefined(parentObjectMetadataId)) {
    return undefined;
  }

  const parentFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatObjectMetadataMaps,
    flatEntityId: parentObjectMetadataId,
  });

  if (!isDefined(parentFlatObjectMetadata)) {
    return undefined;
  }

  return {
    fieldMetadataId: flatFieldMetadata.id,
    fieldName: flatFieldMetadata.name,
    joinColumnName: computeMorphOrRelationFieldJoinColumnName({
      name: flatFieldMetadata.name,
    }),
    parentObjectMetadataId,
  };
};

const resolveBranch = ({
  ref,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  ref: ObjectAccessInheritanceRelationRef;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}):
  | InheritanceBranch
  | Extract<ObjectAccessInheritanceResolution, { status: 'invalid' }> => {
  const invalid = (
    code: ObjectAccessInheritanceResolutionFailureCode,
  ): Extract<ObjectAccessInheritanceResolution, { status: 'invalid' }> => ({
    status: 'invalid',
    code,
    reference: ref,
  });

  if (ref.kind === ObjectAccessInheritanceRelationKind.MORPH) {
    const morphFlatFieldMetadatas = getObjectFlatFieldMetadatas({
      flatObjectMetadata,
      flatFieldMetadataMaps,
    }).filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
        flatFieldMetadata.morphId === ref.morphId,
    );

    if (!isNonEmptyArray(morphFlatFieldMetadatas)) {
      return invalid('UNKNOWN_RELATION_REFERENCE');
    }

    if (!morphFlatFieldMetadatas.every(isManyToOne)) {
      return invalid('UNSUPPORTED_RELATION_DIRECTION');
    }

    const columns = morphFlatFieldMetadatas.map((flatFieldMetadata) =>
      toParentColumn({ flatFieldMetadata, flatObjectMetadataMaps }),
    );

    if (!columns.every(isDefined)) {
      return invalid('UNKNOWN_PARENT_OBJECT');
    }

    return { ref, isMorph: true, columns };
  }

  const flatFieldMetadata =
    flatFieldMetadataMaps.byUniversalIdentifier[ref.fieldUniversalIdentifier];

  if (!isDefined(flatFieldMetadata)) {
    return invalid('UNKNOWN_RELATION_REFERENCE');
  }

  if (flatFieldMetadata.objectMetadataId !== flatObjectMetadata.id) {
    return invalid('RELATION_NOT_OWNED_BY_OBJECT');
  }

  if (flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION) {
    return invalid('MORPH_FIELD_REFERENCED_AS_PLAIN_RELATION');
  }

  if (!isManyToOne(flatFieldMetadata)) {
    return invalid('UNSUPPORTED_RELATION_DIRECTION');
  }

  const column = toParentColumn({ flatFieldMetadata, flatObjectMetadataMaps });

  if (!isDefined(column)) {
    return invalid('UNKNOWN_PARENT_OBJECT');
  }

  return { ref, isMorph: false, columns: [column] };
};

// The stored declaration names logical relations; the concrete columns, parent
// objects and morph variants are always derived from metadata so a new morph
// variant needs no second list to maintain
export const resolveObjectAccessInheritance = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): ObjectAccessInheritanceResolution => {
  const inheritance: ObjectAccessInheritance | null | undefined =
    flatObjectMetadata.inheritance;

  if (!isDefined(inheritance)) {
    return { status: 'invalid', code: 'MISSING_INHERITANCE' };
  }

  if (!isNonEmptyArray(inheritance.through)) {
    return { status: 'invalid', code: 'EMPTY_INHERITANCE' };
  }

  const branches: InheritanceBranch[] = [];

  for (const ref of inheritance.through) {
    const branch = resolveBranch({
      ref,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    });

    if ('status' in branch) {
      return branch;
    }

    branches.push(branch);
  }

  return {
    status: 'resolved',
    match: inheritance.match ?? ObjectAccessInheritanceMatch.ANY,
    branches,
  };
};

export const isInheritedFlatObjectMetadata = (
  flatObjectMetadata: Pick<FlatObjectMetadata, 'readability'>,
): boolean => flatObjectMetadata.readability === MetadataReadability.INHERITED;
