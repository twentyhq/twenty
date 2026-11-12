import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { type RlsRule } from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';
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
  rowLevelPermissionRule: RlsRule;
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
