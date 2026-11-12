import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { findRlsRulesAccessingOperation } from 'src/engine/permissions/internal/rls/utils/find-rls-rules-accessing-operation.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

const OPERATION_TYPE_BY_FIELD_LIST = {
  unreadableFields: 'read',
  uneditableFields: 'update',
} as const;

// Rules listing nothing are returned too: one of them matching a record makes a field visible
export const findRlsRuleFields = ({
  principals,
  metadataMaps,
  objectMetadataId,
  fieldList,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: Pick<
    PermissionsMetadataMaps,
    | 'rolesPermissions'
    | 'flatObjectMetadataMaps'
    | 'flatFieldMetadataMaps'
    | 'featureFlagsMap'
  >;
  objectMetadataId: string;
  fieldList: 'unreadableFields' | 'uneditableFields';
}): {
  rowLevelPermissionRule: RlsRule;
  fieldMetadataIds: string[];
}[] => {
  const rlsRuleFields = (
    findRlsRulesAccessingOperation({
      principals,
      metadataMaps,
      objectMetadataId,
      operationType: OPERATION_TYPE_BY_FIELD_LIST[fieldList],
    }) ?? []
  ).map((rowLevelPermissionRule) => ({
    rowLevelPermissionRule,
    fieldMetadataIds: rowLevelPermissionRule[fieldList],
  }));

  return rlsRuleFields.some(({ fieldMetadataIds }) =>
    isNonEmptyArray(fieldMetadataIds),
  )
    ? rlsRuleFields
    : [];
};
