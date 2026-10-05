import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PERMISSION_FLAG_PERMISSION_TYPES } from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-permission-type.constant';
import { PermissionFlagExceptionCode } from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { isCallerTwentyStandardApp } from 'src/engine/metadata-modules/utils/is-caller-twenty-standard-app.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';

export const validateFlatPermissionFlagUpdate = ({
  universalIdentifier,
  flatEntityUpdate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatPermissionFlagMaps: optimisticFlatPermissionFlagMaps,
  },
  buildOptions,
}: FlatEntityUpdateValidationArgs<
  typeof ALL_METADATA_NAME.permissionFlag
>): FailedFlatEntityValidation<'permissionFlag', 'update'> => {
  const validationResult = getEmptyFlatEntityValidationError({
    flatEntityMinimalInformation: {
      universalIdentifier,
    },
    metadataName: 'permissionFlag',
    type: 'update',
  });

  const existing = findFlatEntityByUniversalIdentifier({
    universalIdentifier,
    flatEntityMaps: optimisticFlatPermissionFlagMaps,
  });

  if (!isDefined(existing)) {
    validationResult.errors.push({
      code: PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND,
      message: t`Permission flag definition to update not found`,
      userFriendlyMessage: msg`Permission flag definition not found`,
    });

    return validationResult;
  }

  if (
    !isCallerTwentyStandardApp(buildOptions) &&
    belongsToTwentyStandardApp({
      universalIdentifier: existing.universalIdentifier,
      applicationUniversalIdentifier: existing.applicationUniversalIdentifier,
    })
  ) {
    validationResult.errors.push({
      code: PermissionFlagExceptionCode.PERMISSION_FLAG_IS_STANDARD,
      message: t`Cannot update standard permission flag definition`,
      userFriendlyMessage: msg`Cannot update standard permission flag definition`,
    });
  }

  if (
    isDefined(flatEntityUpdate.key) &&
    flatEntityUpdate.key !== existing.key
  ) {
    validationResult.errors.push({
      code: PermissionFlagExceptionCode.PERMISSION_FLAG_KEY_IMMUTABLE,
      message: t`Permission flag definition key cannot be changed after creation`,
      userFriendlyMessage: msg`Key cannot be changed`,
    });
  }

  if (
    isDefined(flatEntityUpdate.permissionType) &&
    !PERMISSION_FLAG_PERMISSION_TYPES.includes(flatEntityUpdate.permissionType)
  ) {
    validationResult.errors.push({
      code: PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_PERMISSION_TYPE,
      message: t`Permission flag definition permission type must be 'settings' or 'tool'`,
      userFriendlyMessage: msg`Invalid permission type`,
    });
  }

  return validationResult;
};
