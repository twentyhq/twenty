import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';

// OAuth-only applications have no role yet, so they act with the role of the member they act for
export const resolveApplicationRoleId = ({
  application,
  userRoleId,
}: {
  application: Pick<FlatApplication, 'defaultRoleId' | 'sourceType'>;
  userRoleId?: string;
}): string | undefined => {
  if (isDefined(application.defaultRoleId)) {
    return application.defaultRoleId;
  }

  return isOAuthOnlyApplication(application) ? userRoleId : undefined;
};
