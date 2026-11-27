import { msg, t } from '@lingui/core/macro';

import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { isMarketplaceApplicationBuild } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-marketplace-application-build.util';

export const getMarketplaceApplicationRoleRestrictionErrors = ({
  buildOptions,
}: {
  buildOptions: Pick<
    WorkspaceMigrationValidationBuildOptions,
    'isSystemBuild' | 'isMarketplaceApplication'
  >;
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
