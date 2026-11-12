import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type RowLevelPermissionRule } from 'src/engine/permissions/internal/rls/utils/build-row-level-permission-record-filter.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

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
  rowLevelPermissionRule: RowLevelPermissionRule;
  fieldMetadataIds: string[];
}[] =>
  (
    metadataMaps.rolesPermissions[principals.mainPrincipal.roleId]?.objects[
      objectMetadataId
    ]?.rowLevelRecordsPermissions ?? []
  ).flatMap((rowLevelPermissionRule) =>
    isNonEmptyArray(rowLevelPermissionRule[fieldList])
      ? [
          {
            rowLevelPermissionRule,
            fieldMetadataIds: rowLevelPermissionRule[fieldList],
          },
        ]
      : [],
  );
