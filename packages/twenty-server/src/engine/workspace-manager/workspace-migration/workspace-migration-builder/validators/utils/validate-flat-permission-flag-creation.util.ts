import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PERMISSION_FLAG_PERMISSION_TYPES } from 'src/engine/metadata-modules/permission-flag/constants/permission-flag-permission-type.constant';
import { PermissionFlagExceptionCode } from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

export const validateFlatPermissionFlagCreation = ({
  flatEntityToValidate: flatPermissionFlagToValidate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatPermissionFlagMaps: optimisticFlatPermissionFlagMaps,
  },
}: UniversalFlatEntityValidationArgs<
  typeof ALL_METADATA_NAME.permissionFlag
>): FailedFlatEntityValidation<'permissionFlag', 'create'> => {
  const validationResult = getEmptyFlatEntityValidationError({
    flatEntityMinimalInformation: {
      universalIdentifier: flatPermissionFlagToValidate.universalIdentifier,
      key: flatPermissionFlagToValidate.key,
    },
    metadataName: 'permissionFlag',
    type: 'create',
  });

  const existingByUniversalId = findFlatEntityByUniversalIdentifier({
    universalIdentifier: flatPermissionFlagToValidate.universalIdentifier,
    flatEntityMaps: optimisticFlatPermissionFlagMaps,
  });

  if (isDefined(existingByUniversalId)) {
    validationResult.errors.push({
      code: PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS,
      message: t`Permission flag definition with universal identifier ${flatPermissionFlagToValidate.universalIdentifier} already exists`,
      userFriendlyMessage: msg`Permission flag definition already exists`,
    });
  }

  if (!isNonEmptyString(flatPermissionFlagToValidate.key)) {
    validationResult.errors.push({
      code: PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_KEY,
      message: t`Permission flag definition key is required`,
      userFriendlyMessage: msg`Key is required`,
    });
  }

  const collidingPermissionFlag = Object.values(
    optimisticFlatPermissionFlagMaps.byUniversalIdentifier,
  ).find(
    (definition) =>
      isDefined(definition) &&
      definition.key === flatPermissionFlagToValidate.key &&
      definition.universalIdentifier !==
        flatPermissionFlagToValidate.universalIdentifier,
  );

  if (isDefined(collidingPermissionFlag)) {
    validationResult.errors.push({
      code: PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS,
      message: t`Permission flag definition with key "${flatPermissionFlagToValidate.key}" is already registered in this workspace.`,
      userFriendlyMessage: msg`Another application in this workspace has already registered a permission flag with this key.`,
    });
  }

  if (
    !PERMISSION_FLAG_PERMISSION_TYPES.includes(
      flatPermissionFlagToValidate.permissionType,
    )
  ) {
    validationResult.errors.push({
      code: PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_PERMISSION_TYPE,
      message: t`Permission flag definition permission type must be 'settings' or 'tool'`,
      userFriendlyMessage: msg`Invalid permission type`,
    });
  }

  return validationResult;
};
