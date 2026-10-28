import { PermissionFlagType } from 'twenty-shared/constants';
import { ConnectedAccountProvider } from 'twenty-shared/types';

export const getConnectedAccountAdministrationPermissionFlag = (
  provider: ConnectedAccountProvider,
): PermissionFlagType =>
  provider === ConnectedAccountProvider.APP
    ? PermissionFlagType.WORKSPACE_APPS
    : PermissionFlagType.WORKSPACE;
