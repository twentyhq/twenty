import { msg } from '@lingui/core/macro';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';
import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { doesRoleRequireCustomRolesEntitlement } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/does-role-require-custom-roles-entitlement.util';

export const validateRoleIsEntitled = ({
  flatRole,
  billingEntitlements,
  buildOptions,
}: {
  flatRole: Pick<
    UniversalFlatRole,
    'universalIdentifier' | 'canBeAssignedToUsers' | 'canBeAssignedToApiKeys'
  >;
  billingEntitlements: BillingEntitlements;
  buildOptions: Pick<WorkspaceMigrationBuilderOptions, 'isSystemBuild'>;
}): FlatEntityValidationError[] => {
  if (
    buildOptions.isSystemBuild ||
    !doesRoleRequireCustomRolesEntitlement(flatRole) ||
    billingEntitlements[BillingEntitlementKey.CUSTOM_ROLES]
  ) {
    return [];
  }

  return [
    {
      code: PermissionsExceptionCode.CUSTOM_ROLES_NOT_ENTITLED,
      message: PermissionsExceptionMessage.CUSTOM_ROLES_NOT_ENTITLED,
      userFriendlyMessage: msg`Custom roles are part of the Organization plan.`,
    },
  ];
};
