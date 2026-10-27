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

  return flatRole.canBeAssignedToUsers || flatRole.canBeAssignedToApiKeys;
};
