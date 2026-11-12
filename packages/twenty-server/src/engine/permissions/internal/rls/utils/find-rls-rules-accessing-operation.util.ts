/* @license Enterprise */

import {
  type ObjectRecordsOperationType,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsPermission,
  canRlsRuleAccessOperation,
  isDefined,
} from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getEnforcedOperationType } from 'src/engine/permissions/internal/role/utils/get-enforced-operation-type.util';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

// undefined when RLS does not decide: no rule on the object, or all records are accessible
export const findRlsRulesAccessingOperation = ({
  principals,
  metadataMaps,
  objectMetadataId,
  operationType,
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
  operationType: ObjectRecordsOperationType;
}): RowLevelRecordsPermissions[] | undefined => {
  const objectRecordsPermissions = getPermissionsPrincipalsRecordsPermissions({
    principals,
    metadataMaps,
  }).objects[objectMetadataId];
  const enforcedOperationType = getEnforcedOperationType({
    operationType,
    featureFlagsMap: metadataMaps.featureFlagsMap,
  });

  if (
    !isDefined(objectRecordsPermissions?.rowLevelRecordsPermissions) ||
    canAccessThroughAllRecordsPermission({
      objectRecordsPermissions,
      operationType: enforcedOperationType,
    })
  ) {
    return undefined;
  }

  return objectRecordsPermissions.rowLevelRecordsPermissions.filter((rule) =>
    canRlsRuleAccessOperation({ rule, operationType: enforcedOperationType }),
  );
};
