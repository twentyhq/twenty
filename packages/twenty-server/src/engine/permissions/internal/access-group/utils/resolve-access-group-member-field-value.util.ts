/* @license Enterprise */

import {
  FieldMetadataType,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type AccessGroupMemberFieldValues } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildAccessGroupMemberFieldKey } from 'src/engine/permissions/internal/access-group/utils/build-access-group-member-field-key.util';

const LIST_MEMBER_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.ARRAY,
];

// A group keeps one value of a member's list, so it is wrapped back into the list a member would give
export const resolveAccessGroupMemberFieldValue = ({
  memberFieldValues,
  predicate,
  workspaceMemberFieldMetadata,
}: {
  memberFieldValues: AccessGroupMemberFieldValues;
  predicate: Pick<
    RowLevelPermissionPredicate,
    'workspaceMemberFieldMetadataId' | 'workspaceMemberSubFieldName'
  >;
  workspaceMemberFieldMetadata: Pick<OrmFlatFieldMetadata, 'type'>;
}): RowLevelPermissionPredicateValue => {
  const value = memberFieldValues[buildAccessGroupMemberFieldKey(predicate)];

  if (!isDefined(value)) {
    return null;
  }

  return typeof value === 'string' &&
    LIST_MEMBER_FIELD_TYPES.includes(workspaceMemberFieldMetadata.type)
    ? [value]
    : value;
};
