import { getApplicationGrantRoleUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

// Temporary: to be checked through the grant's application target once validation order allows it
export const isApplicationGrantRole = ({
  flatRole,
  grantedApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatRole:
    | Pick<
        UniversalFlatRole,
        'universalIdentifier' | 'applicationUniversalIdentifier'
      >
    | undefined;
  grantedApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): boolean =>
  isDefined(flatRole) &&
  flatRole.applicationUniversalIdentifier ===
    workspaceCustomApplicationUniversalIdentifier &&
  flatRole.universalIdentifier ===
    getApplicationGrantRoleUniversalIdentifier({
      grantedApplicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    });
