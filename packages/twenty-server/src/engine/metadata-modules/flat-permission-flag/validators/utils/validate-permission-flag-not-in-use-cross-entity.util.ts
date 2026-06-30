import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { PermissionFlagExceptionCode } from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';
import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalDeletePermissionFlagAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag/types/workspace-migration-permission-flag-action.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

export const validatePermissionFlagNotInUseCrossEntity = ({
  optimisticUniversalFlatMaps,
  deletedPermissionFlagActions,
}: {
  optimisticUniversalFlatMaps: Pick<
    AllUniversalFlatEntityMaps,
    'flatRolePermissionFlagMaps'
  >;
  deletedPermissionFlagActions: UniversalDeletePermissionFlagAction[];
}): Pick<OrchestratorFailureReport, 'permissionFlag'> => {
  const validationErrors: Pick<OrchestratorFailureReport, 'permissionFlag'> = {
    permissionFlag: [],
  };

  if (deletedPermissionFlagActions.length === 0) {
    return validationErrors;
  }

  const survivingRolePermissionFlags = Object.values(
    optimisticUniversalFlatMaps.flatRolePermissionFlagMaps
      .byUniversalIdentifier,
  ).filter(isDefined);

  for (const deleteAction of deletedPermissionFlagActions) {
    const isStillReferenced = survivingRolePermissionFlags.some(
      (rolePermissionFlag) =>
        rolePermissionFlag.permissionFlagUniversalIdentifier ===
        deleteAction.universalIdentifier,
    );

    if (!isStillReferenced) {
      continue;
    }

    const flagKey =
      deleteAction.flatEntity?.key ?? deleteAction.universalIdentifier;

    const failedValidation = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: deleteAction.universalIdentifier,
        key: deleteAction.flatEntity?.key,
      },
      metadataName: 'permissionFlag',
      type: 'delete',
    });

    failedValidation.errors.push({
      code: PermissionFlagExceptionCode.PERMISSION_FLAG_IN_USE,
      message: t`Permission flag definition with key ${flagKey} is still assigned to a role`,
      userFriendlyMessage: msg`Remove this permission from all roles before deleting it`,
    });

    validationErrors.permissionFlag.push(failedValidation);
  }

  return validationErrors;
};
