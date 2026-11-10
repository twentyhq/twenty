import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const findRlsRuleFieldsByRole = ({
  principals,
  metadataMaps,
  objectMetadataId,
  fieldList,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: Pick<PermissionsMetadataMaps, 'rolesPermissions'>;
  objectMetadataId: string;
  fieldList: 'unreadableFields' | 'uneditableFields';
}): { roleId: string; fieldMetadataIds: string[] }[] => {
  const roleId = principals.mainPrincipal.roleId;
  const fieldMetadataIds =
    metadataMaps.rolesPermissions[roleId]?.objects[objectMetadataId]
      ?.rowLevelRecordsPermissions?.[fieldList];

  return isNonEmptyArray(fieldMetadataIds)
    ? [{ roleId, fieldMetadataIds }]
    : [];
};
