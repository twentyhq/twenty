/* @license Enterprise */

import {
  FieldMetadataType,
  type RowLevelPermissionPredicate,
} from 'twenty-shared/types';
import {
  isDefined,
  isWorkspaceMemberFieldCompatibleWithRlsPredicate,
} from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { type AccessGroupValueLookupKey } from 'src/engine/permissions/internal/access-group/value-lookup/types/access-group-value-lookup-key.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';
import { findRelationJoinColumnsOrThrow } from 'src/engine/permissions/internal/rls/utils/find-relation-join-columns-or-throw.util';
import { isManyToOneFlatFieldMetadata } from 'src/engine/twenty-orm/utils/is-many-to-one-flat-field-metadata.util';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';

const SINGLE_VALUE_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.UUID,
  FieldMetadataType.SELECT,
  FieldMetadataType.RELATION,
];

const findSingleValueColumnName = ({
  fieldMetadata,
  flatFieldMetadataMaps,
}: {
  fieldMetadata: OrmFlatFieldMetadata | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): string | null => {
  if (
    !isDefined(fieldMetadata) ||
    !SINGLE_VALUE_FIELD_TYPES.includes(fieldMetadata.type)
  ) {
    return null;
  }

  if (fieldMetadata.type !== FieldMetadataType.RELATION) {
    return fieldMetadata.name;
  }

  return isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
    isManyToOneFlatFieldMetadata(fieldMetadata)
    ? findRelationJoinColumnsOrThrow({
        relationFieldMetadata: fieldMetadata,
        flatFieldMetadataMaps,
      }).sourceColumnName
    : null;
};

const isMemberValueComparableToField = ({
  predicate,
  fieldMetadata,
  flatFieldMetadataMaps,
}: {
  predicate: Pick<
    RowLevelPermissionPredicate,
    'workspaceMemberFieldMetadataId' | 'workspaceMemberSubFieldName'
  >;
  fieldMetadata: OrmFlatFieldMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): boolean => {
  const workspaceMemberFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: predicate.workspaceMemberFieldMetadataId ?? '',
    flatEntityMaps: flatFieldMetadataMaps,
  });

  return (
    isDefined(workspaceMemberFieldMetadata) &&
    !isDefined(predicate.workspaceMemberSubFieldName) &&
    SINGLE_VALUE_FIELD_TYPES.includes(workspaceMemberFieldMetadata.type) &&
    isWorkspaceMemberFieldCompatibleWithRlsPredicate({
      fieldType: fieldMetadata.type,
      workspaceMemberFieldType: workspaceMemberFieldMetadata.type,
    })
  );
};

export const resolveAccessGroupValueLookupKey = ({
  predicate,
  metadataMaps,
}: {
  predicate: RowLevelPermissionPredicate;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): AccessGroupValueLookupKey | null => {
  const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: predicate.fieldMetadataId,
    flatEntityMaps: metadataMaps.flatFieldMetadataMaps,
  });
  const columnName = findSingleValueColumnName({
    fieldMetadata,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
  });
  const isMemberBound = isDefined(predicate.workspaceMemberFieldMetadataId);

  if (
    !isDefined(fieldMetadata) ||
    !isDefined(columnName) ||
    isDefined(predicate.subFieldName) ||
    (isMemberBound &&
      !isMemberValueComparableToField({
        predicate,
        fieldMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      }))
  ) {
    return null;
  }

  const memberFieldKey = isMemberBound ? buildMemberFieldKey(predicate) : null;

  if (!isDefined(predicate.relationFieldMetadataId)) {
    return { memberFieldKey, columnName, relationHop: null };
  }

  const relationFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: predicate.relationFieldMetadataId,
    flatEntityMaps: metadataMaps.flatFieldMetadataMaps,
  });
  const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: relationFieldMetadata?.relationTargetObjectMetadataId ?? '',
    flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
  });

  if (
    !isRlsRelationHopEnabled(metadataMaps.featureFlagsMap) ||
    !isDefined(relationFieldMetadata) ||
    relationFieldMetadata.type !== FieldMetadataType.RELATION ||
    !isMorphOrRelationFlatFieldMetadata(relationFieldMetadata) ||
    !isDefined(targetFlatObjectMetadata)
  ) {
    return null;
  }

  return {
    memberFieldKey,
    columnName,
    relationHop: {
      targetFlatObjectMetadata,
      ...findRelationJoinColumnsOrThrow({
        relationFieldMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      }),
    },
  };
};
