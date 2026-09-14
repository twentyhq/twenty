import { PermissionFlagType } from 'twenty-shared/constants';
import { ConnectedAccountProvider } from 'twenty-shared/types';

// A workspace-shared connection is administered from the settings page that owns
// it: app connections live under Settings > Applications, every other shared row
// is a group mailbox, which is a workspace-wide preference.
export const getConnectedAccountAdministrationPermissionFlag = (
  provider: ConnectedAccountProvider,
): PermissionFlagType =>
  provider === ConnectedAccountProvider.APP
    ? PermissionFlagType.APPLICATIONS
    : PermissionFlagType.WORKSPACE;
