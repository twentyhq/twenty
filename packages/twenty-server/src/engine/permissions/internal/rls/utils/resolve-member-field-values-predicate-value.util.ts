/* @license Enterprise */

import {
  FieldMetadataType,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';
import { isDefined, isFieldMetadataArrayKind } from 'twenty-shared/utils';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';
import { buildMemberFieldKey } from 'src/engine/permissions/internal/rls/utils/build-member-field-key.util';

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
    (workspaceMemberFieldMetadata.type === FieldMetadataType.SELECT ||
      isFieldMetadataArrayKind(workspaceMemberFieldMetadata.type))
    ? [value]
    : value;
};
