import {
  canAccessThroughAllRecordsPermission,
  canRlsRuleAccessOperation,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

const OPERATION_TYPE_BY_FIELD_LIST = {
  unreadableFields: 'read',
  uneditableFields: 'update',
} as const;

// A field is hidden on a record only when every rule matching it lists the field,
// so rules listing nothing are returned too
export const findRlsRuleFields = ({
  principals,
  metadataMaps,
  objectMetadataId,
  fieldList,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: Pick<PermissionsMetadataMaps, 'rolesPermissions'>;
  objectMetadataId: string;
  fieldList: 'unreadableFields' | 'uneditableFields';
}): {
  rowLevelPermissionRule: RlsRule;
  fieldMetadataIds: string[];
}[] => {
  const objectRecordsPermissions =
    metadataMaps.rolesPermissions[principals.mainPrincipal.roleId]?.objects[
      objectMetadataId
    ];
  const operationType = OPERATION_TYPE_BY_FIELD_LIST[fieldList];

  if (
    canAccessThroughAllRecordsPermission({
      objectRecordsPermissions,
      operationType,
    })
  ) {
    return [];
  }

  const rlsRuleFields = (
    objectRecordsPermissions?.rowLevelRecordsPermissions ?? []
  )
    .filter((rule) => canRlsRuleAccessOperation({ rule, operationType }))
    .map((rowLevelPermissionRule) => ({
      rowLevelPermissionRule,
      fieldMetadataIds: rowLevelPermissionRule[fieldList],
    }));

  return rlsRuleFields.some(({ fieldMetadataIds }) =>
    isNonEmptyArray(fieldMetadataIds),
  )
    ? rlsRuleFields
    : [];
};
