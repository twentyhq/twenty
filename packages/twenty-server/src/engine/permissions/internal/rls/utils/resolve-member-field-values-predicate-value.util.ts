/* @license Enterprise */

import {
  FieldMetadataType,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MULTI_VALUE_MEMBER_FIELD_TYPES } from 'src/engine/metadata-modules/row-level-permission-predicate/constants/multi-value-member-field-types.constant';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';

const LIST_MEMBER_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.SELECT,
  ...MULTI_VALUE_MEMBER_FIELD_TYPES,
];

export const resolveMemberFieldValuesPredicateValue = ({
  memberFieldValues,
  predicate,
  workspaceMemberFieldMetadata,
}: {
  memberFieldValues: RlsMemberFieldValues;
  predicate: Pick<
    RowLevelPermissionPredicate,
    'workspaceMemberFieldMetadataId' | 'workspaceMemberSubFieldName'
  >;
  workspaceMemberFieldMetadata: Pick<OrmFlatFieldMetadata, 'type'>;
}): RowLevelPermissionPredicateValue => {
  const value = memberFieldValues[buildMemberFieldKey(predicate)];

  if (!isDefined(value)) {
    return null;
  }

  return typeof value === 'string' &&
    LIST_MEMBER_FIELD_TYPES.includes(workspaceMemberFieldMetadata.type)
    ? [value]
    : value;
};
