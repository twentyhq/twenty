import { PermissionFlagType } from 'twenty-shared/constants';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { getConnectedAccountAdministrationPermissionFlag } from 'src/engine/metadata-modules/connected-account/utils/get-connected-account-administration-permission-flag.util';

describe('getConnectedAccountAdministrationPermissionFlag', () => {
  it('requires the Applications permission for an app connection', () => {
    expect(
      getConnectedAccountAdministrationPermissionFlag(
        ConnectedAccountProvider.APP,
      ),
    ).toBe(PermissionFlagType.APPLICATIONS);
  });

  it('requires the Workspace permission for a group mailbox', () => {
    expect(
      getConnectedAccountAdministrationPermissionFlag(
        ConnectedAccountProvider.EMAIL_GROUP,
      ),
    ).toBe(PermissionFlagType.WORKSPACE);
  });

  it('requires the Workspace permission for an email provider', () => {
    expect(
      getConnectedAccountAdministrationPermissionFlag(
        ConnectedAccountProvider.GOOGLE,
      ),
    ).toBe(PermissionFlagType.WORKSPACE);
  });
});
