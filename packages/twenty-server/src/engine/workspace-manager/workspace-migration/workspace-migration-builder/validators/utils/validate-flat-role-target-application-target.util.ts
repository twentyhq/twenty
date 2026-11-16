import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

type ValidateFlatRoleTargetApplicationTargetArgs = {
  flatRole: UniversalFlatRole;
  flatRoleTarget: UniversalFlatRoleTarget;
  flatRoleTargetMaps: MetadataUniversalFlatEntityMaps<'roleTarget'>;
  buildOptions: WorkspaceMigrationValidationBuildOptions;
};

export const validateFlatRoleTargetApplicationTarget = ({
  flatRole,
  flatRoleTarget,
  flatRoleTargetMaps,
  buildOptions: {
    applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    flatApplicationMaps,
  },
}: ValidateFlatRoleTargetApplicationTargetArgs): FlatEntityValidationError[] => {
  const { targetApplicationUniversalIdentifier } = flatRoleTarget;

  if (!isDefined(targetApplicationUniversalIdentifier)) {
    return [];
  }

  const errors: FlatEntityValidationError[] = [];

  if (
    applicationUniversalIdentifier !==
      workspaceCustomApplicationUniversalIdentifier ||
    flatRoleTarget.applicationUniversalIdentifier !==
      workspaceCustomApplicationUniversalIdentifier
  ) {
    errors.push({
      code: RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
      message: t`Only the workspace custom application can assign roles to applications`,
      userFriendlyMessage: msg`Only the workspace can assign roles to applications`,
    });
  }

  if (
    flatRole.applicationUniversalIdentifier !==
    workspaceCustomApplicationUniversalIdentifier
  ) {
    const roleLabel = flatRole.label;

    errors.push({
      code: RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
      message: t`Role "${roleLabel}" must be owned by the workspace custom application to be assigned to an application`,
      userFriendlyMessage: msg`Role "${roleLabel}" cannot be assigned to applications`,
    });
  }

  const targetFlatApplication = findActiveFlatApplicationByUniversalIdentifier(
    flatApplicationMaps,
    targetApplicationUniversalIdentifier,
  );

  if (!isDefined(targetFlatApplication)) {
    errors.push({
      code: RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA,
      message: t`Target application not found`,
      userFriendlyMessage: msg`Target application not found`,
    });
  } else if (
    targetApplicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier ||
    isOAuthOnlyApplication(targetFlatApplication)
  ) {
    const applicationName = targetFlatApplication.name;

    errors.push({
      code: RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
      message: t`Application "${applicationName}" cannot be assigned a role: only installed applications can`,
      userFriendlyMessage: msg`Application "${applicationName}" cannot be assigned a role`,
    });
  }

  const hasOtherRoleTargetForSameApplication = Object.values(
    flatRoleTargetMaps.byUniversalIdentifier,
  ).some(
    (otherFlatRoleTarget) =>
      isDefined(otherFlatRoleTarget) &&
      otherFlatRoleTarget.universalIdentifier !==
        flatRoleTarget.universalIdentifier &&
      otherFlatRoleTarget.targetApplicationUniversalIdentifier ===
        targetApplicationUniversalIdentifier,
  );

  if (hasOtherRoleTargetForSameApplication) {
    errors.push({
      code: RoleTargetExceptionCode.INVALID_ROLE_TARGET_DATA,
      message: t`Application already has a role assigned`,
      userFriendlyMessage: msg`Application already has a role assigned`,
    });
  }

  return errors;
};
