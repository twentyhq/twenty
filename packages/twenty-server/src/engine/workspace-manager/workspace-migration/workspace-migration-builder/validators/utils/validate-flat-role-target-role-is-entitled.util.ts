import { msg, t } from '@lingui/core/macro';
import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

const ROLE_UNIVERSAL_IDENTIFIERS_ASSIGNABLE_WITHOUT_ENTITLEMENT = [
  STANDARD_ROLE.admin.universalIdentifier,
  MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
];

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
    ROLE_UNIVERSAL_IDENTIFIERS_ASSIGNABLE_WITHOUT_ENTITLEMENT.includes(
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
