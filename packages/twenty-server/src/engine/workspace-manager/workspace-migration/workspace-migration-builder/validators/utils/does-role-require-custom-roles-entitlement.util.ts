import { NON_CUSTOM_ROLE_UNIVERSAL_IDENTIFIERS } from 'src/engine/metadata-modules/role/constants/non-custom-role-universal-identifiers.constant';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

export const doesRoleRequireCustomRolesEntitlement = (
  flatRole: Pick<
    UniversalFlatRole,
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
