import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { isMarketplaceApplication } from 'src/engine/core-modules/application/application-manifest/utils/is-marketplace-application.util';
import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

const isMarketplaceApplicationBuild = (
  buildOptions: WorkspaceMigrationValidationBuildOptions,
): boolean => {
  if (buildOptions.isSystemBuild) {
    return false;
  }

  const { flatApplicationMaps } = buildOptions;
  const applicationId =
    flatApplicationMaps.idByUniversalIdentifier[
      buildOptions.applicationUniversalIdentifier
    ];
  const flatApplication = isDefined(applicationId)
    ? flatApplicationMaps.byId[applicationId]
    : undefined;

  return (
    isDefined(flatApplication) &&
    isMarketplaceApplication({
      universalIdentifier: flatApplication.universalIdentifier,
      sourceType: flatApplication.sourceType,
      workspaceCustomApplicationUniversalIdentifier:
        buildOptions.workspaceCustomApplicationUniversalIdentifier,
    })
  );
};

// Only a manifest sync knows the app's requested and agent roles, so other builds skip this check
export const getMarketplaceApplicationStandaloneRoleErrors = ({
  roleUniversalIdentifier,
  buildOptions,
}: {
  roleUniversalIdentifier: string;
  buildOptions: WorkspaceMigrationValidationBuildOptions;
}): FlatEntityValidationError[] => {
  const {
    applicationDefaultRoleUniversalIdentifier,
    applicationAgentRoleUniversalIdentifiers = [],
  } = buildOptions;

  if (
    !isDefined(applicationDefaultRoleUniversalIdentifier) ||
    roleUniversalIdentifier === applicationDefaultRoleUniversalIdentifier ||
    applicationAgentRoleUniversalIdentifiers.includes(
      roleUniversalIdentifier,
    ) ||
    !isMarketplaceApplicationBuild(buildOptions)
  ) {
    return [];
  }

  return [
    {
      code: PermissionsExceptionCode.MARKETPLACE_APPLICATION_STANDALONE_ROLE,
      message: t`A marketplace application can only declare its application role and its agents' roles`,
      userFriendlyMessage: msg`A marketplace application can only declare its application role and its agents' roles.`,
    },
  ];
};

export const getMarketplaceApplicationRoleRestrictionErrors = ({
  buildOptions,
}: {
  buildOptions: WorkspaceMigrationValidationBuildOptions;
}): FlatEntityValidationError[] =>
  isMarketplaceApplicationBuild(buildOptions)
    ? [
        {
          code: PermissionsExceptionCode.MARKETPLACE_APPLICATION_ROLE_RESTRICTION,
          message: t`A marketplace application cannot declare row-level rules or field permissions`,
          userFriendlyMessage: msg`A marketplace application cannot declare row-level rules or field permissions.`,
        },
      ]
    : [];
