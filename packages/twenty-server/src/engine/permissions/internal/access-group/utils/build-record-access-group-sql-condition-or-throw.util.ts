/* @license Enterprise */

import {
  type RlsRuleSharedPredicate,
  SHARED_PREDICATE_MEMBER_FIELD_KEY,
} from 'src/engine/permissions/internal/access-group/utils/find-rls-rule-shared-predicate.util';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildRecordFilterForRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';
import { renderRlsRecordFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-rls-record-filter-to-sql.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

type SharedPredicateWithValue = Omit<RlsRuleSharedPredicate, 'values'> & {
  value: string;
};

const isSharedPredicateWithValue = (
  value: unknown,
): value is SharedPredicateWithValue =>
  isPlainObject(value) && 'fieldMetadataId' in value && 'value' in value;

// null when the group reaches every record of the object
export const buildRecordAccessGroupSQLConditionOrThrow = ({
  accessGroup,
  flatObjectMetadata,
  tableAlias,
  metadataMaps,
}: {
  accessGroup: Pick<
    AccessGroup,
    'roleId' | 'rowLevelPermissionPredicateGroupId' | 'memberFieldValues'
  >;
  flatObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): SQLCondition | null => {
  const sharedPredicate =
    accessGroup.memberFieldValues?.[SHARED_PREDICATE_MEMBER_FIELD_KEY];
  // a shared group outlives the role it was first built from, so it carries its own predicate
  const rowLevelPermissionRule = isSharedPredicateWithValue(sharedPredicate)
    ? {
        predicates: [
          {
            id: SHARED_PREDICATE_MEMBER_FIELD_KEY,
            fieldMetadataId: sharedPredicate.fieldMetadataId,
            relationFieldMetadataId: sharedPredicate.relationFieldMetadataId,
            objectMetadataId: sharedPredicate.objectMetadataId,
            operand: sharedPredicate.operand,
            subFieldName: sharedPredicate.subFieldName,
            value: [sharedPredicate.value],
            rowLevelPermissionPredicateGroupId: null,
            workspaceMemberFieldMetadataId: null,
            workspaceMemberSubFieldName: null,
            roleId: accessGroup.roleId,
          },
        ],
        predicateGroups: [],
      }
    : metadataMaps.rolesPermissions[accessGroup.roleId]?.objects[
        flatObjectMetadata.id
      ]?.rowLevelRecordsPermissions?.find(
        ({ ruleId }) =>
          ruleId === accessGroup.rowLevelPermissionPredicateGroupId,
      );
  const recordFilter = buildRecordFilterForRule({
    rowLevelPermissionRule,
    memberFieldValues: isSharedPredicateWithValue(sharedPredicate)
      ? {}
      : (accessGroup.memberFieldValues ?? {}),
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatFieldMetadataOptionMaps: metadataMaps.flatFieldMetadataOptionMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    isRelationHopEnabled: isRlsRelationHopEnabled(metadataMaps.featureFlagsMap),
  });

  if (!isDefined(recordFilter)) {
    return null;
  }

  return renderRlsRecordFilterToSql({
    recordFilter,
    tableAlias,
    objectMetadata: flatObjectMetadata,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
  });
};
