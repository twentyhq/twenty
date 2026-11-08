import { getApplicationGrantRoleUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

// Temporary: to be checked through the grant's application target once validation order allows it
export const isApplicationGrantRole = ({
  flatRole,
  grantedApplicationUniversalIdentifier,
}: {
  flatRole: Pick<UniversalFlatRole, 'universalIdentifier'> | undefined;
  grantedApplicationUniversalIdentifier: string;
}): boolean =>
  isDefined(flatRole) &&
  flatRole.universalIdentifier ===
    getApplicationGrantRoleUniversalIdentifier({
      grantedApplicationUniversalIdentifier,
    });
