import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const isRoleCreationEntitled = ({
  flatRole,
  billingEntitlements,
}: {
  flatRole: Pick<
    FlatRole,
    'universalIdentifier' | 'canBeAssignedToUsers' | 'canBeAssignedToApiKeys'
  >;
  billingEntitlements: BillingEntitlements;
}): boolean => {
  // Agents can't take Admin or Member, so agent-only roles stay open on every plan
  const isAgentOnlyRole =
    !flatRole.canBeAssignedToUsers && !flatRole.canBeAssignedToApiKeys;

  return (
    isAgentOnlyRole ||
    flatRole.universalIdentifier === MEMBER_ROLE_UNIVERSAL_IDENTIFIER ||
    billingEntitlements[BillingEntitlementKey.CUSTOM_ROLES] === true
  );
};
