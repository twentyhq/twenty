import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { resolvePermissionFlagKey } from 'src/engine/metadata-modules/permission-flag/utils/resolve-permission-flag-key.util';

describe('upgrade:2-53:rename-app-permission-flag-keys resolvePermissionFlagKey', () => {
  it('returns the code key of a standard flag stored under a different key', () => {
    expect(
      resolvePermissionFlagKey({
        universalIdentifier: SystemPermissionFlag.APPLICATIONS,
        key: 'WORKSPACE_APPS',
      }),
    ).toBe(PermissionFlagType.APPLICATIONS);
  });

  it('returns the key of a standard flag stored under its code key', () => {
    expect(
      resolvePermissionFlagKey({
        universalIdentifier: SystemPermissionFlag.CONNECTED_ACCOUNTS,
        key: PermissionFlagType.CONNECTED_ACCOUNTS,
      }),
    ).toBe(PermissionFlagType.CONNECTED_ACCOUNTS);
  });

  it.each(['CAN_EXPORT_INVOICES', PermissionFlagType.APPLICATIONS])(
    'returns the stored key %s of a flag outside the standard set',
    (storedKey) => {
      expect(
        resolvePermissionFlagKey({
          universalIdentifier: '0b6c3a51-7a54-4ef6-8d4e-0f3f0a4b9b1e',
          key: storedKey,
        }),
      ).toBe(storedKey);
    },
  );
});
