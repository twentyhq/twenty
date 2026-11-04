import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';
import { NON_CUSTOM_ROLE_UNIVERSAL_IDENTIFIERS } from 'src/engine/metadata-modules/role/constants/non-custom-role-universal-identifiers.constant';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

type ValidateFlatRoleTargetRoleIsEntitledArgs = {
  flatRole: Pick<UniversalFlatRole, 'universalIdentifier' | 'label'>;
  flatRoleTarget: Pick<UniversalFlatRoleTarget, 'agentUniversalIdentifier'>;
  billingEntitlements: BillingEntitlements;
  buildOptions: Pick<WorkspaceMigrationBuilderOptions, 'isSystemBuild'>;
};

export const validateFlatRoleTargetRoleIsEntitled = ({
  flatRole,
  flatRoleTarget,
  billingEntitlements,
  buildOptions,
}: ValidateFlatRoleTargetRoleIsEntitledArgs):
  | FlatEntityValidationError
  | undefined => {
  if (
    buildOptions.isSystemBuild ||
    isDefined(flatRoleTarget.agentUniversalIdentifier) ||
    NON_CUSTOM_ROLE_UNIVERSAL_IDENTIFIERS.includes(
      flatRole.universalIdentifier,
    ) ||
    billingEntitlements[BillingEntitlementKey.CUSTOM_ROLES]
  ) {
    return undefined;
  }

  const roleLabel = flatRole.label;

  return {
    code: RoleTargetExceptionCode.CUSTOM_ROLES_NOT_ENTITLED,
    message: t`Role "${roleLabel}" cannot be assigned: custom roles require the Organization plan`,
    userFriendlyMessage: msg`Custom roles are part of the Organization plan. Upgrade to assign "${roleLabel}".`,
  };
};
