import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  SharingRuleException,
  SharingRuleExceptionCode,
} from 'src/engine/metadata-modules/sharing-rule/exceptions/sharing-rule.exception';

export const resolveSharingRuleGranteeRoleUniversalIdentifierOrThrow = ({
  granteeRoleId,
  flatRoleMaps,
}: {
  granteeRoleId: string | null | undefined;
  flatRoleMaps: AllFlatEntityMaps['flatRoleMaps'];
}): string | null => {
  if (!isDefined(granteeRoleId)) {
    return null;
  }

  const flatRole = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: granteeRoleId,
    flatEntityMaps: flatRoleMaps,
  });

  if (!isDefined(flatRole)) {
    throw new SharingRuleException(
      'Grantee role not found',
      SharingRuleExceptionCode.ROLE_NOT_FOUND,
    );
  }

  return flatRole.universalIdentifier;
};
