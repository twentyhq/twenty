import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PermissionFlagExceptionCode } from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { isCallerTwentyStandardApp } from 'src/engine/metadata-modules/utils/is-caller-twenty-standard-app.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

export const validateFlatPermissionFlagDeletion = ({
  flatEntityToValidate: { universalIdentifier },
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatPermissionFlagMaps: optimisticFlatPermissionFlagMaps,
  },
  buildOptions,
}: UniversalFlatEntityValidationArgs<
  typeof ALL_METADATA_NAME.permissionFlag
>): FailedFlatEntityValidation<'permissionFlag', 'delete'> => {
  const validationResult = getEmptyFlatEntityValidationError({
    flatEntityMinimalInformation: {
      universalIdentifier,
    },
    metadataName: 'permissionFlag',
    type: 'delete',
  });

  const existing = findFlatEntityByUniversalIdentifier({
    universalIdentifier,
    flatEntityMaps: optimisticFlatPermissionFlagMaps,
  });

  if (!isDefined(existing)) {
    validationResult.errors.push({
      code: PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND,
      message: t`Permission flag definition to delete not found`,
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
      message: t`Cannot delete standard permission flag definition`,
      userFriendlyMessage: msg`Cannot delete standard permission flag definition`,
    });
  }

  return validationResult;
};
