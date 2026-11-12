/* @license Enterprise */

import {
  FieldMetadataType,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type RowLevelPermissionMemberFieldValues } from 'src/engine/permissions/internal/rls/types/row-level-permission-member-field-values.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';

const LIST_MEMBER_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.ARRAY,
];

export const resolveMemberFieldValuesPredicateValue = ({
  memberFieldValues,
  predicate,
  workspaceMemberFieldMetadata,
}: {
  memberFieldValues: RowLevelPermissionMemberFieldValues;
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
