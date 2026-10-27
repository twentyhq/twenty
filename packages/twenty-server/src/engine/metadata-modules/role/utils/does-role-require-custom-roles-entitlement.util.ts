import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { NON_CUSTOM_ROLE_UNIVERSAL_IDENTIFIERS } from 'src/engine/metadata-modules/role/constants/non-custom-role-universal-identifiers.constant';

export const doesRoleRequireCustomRolesEntitlement = (
  flatRole: Pick<
    FlatRole,
    'universalIdentifier' | 'canBeAssignedToUsers' | 'canBeAssignedToApiKeys'
  >,
): boolean => {
  if (
    NON_CUSTOM_ROLE_UNIVERSAL_IDENTIFIERS.includes(flatRole.universalIdentifier)
  ) {
    return false;
  }

  // Agents can't take Admin or Member, so agent-only roles stay open on every plan
  return flatRole.canBeAssignedToUsers || flatRole.canBeAssignedToApiKeys;
};
