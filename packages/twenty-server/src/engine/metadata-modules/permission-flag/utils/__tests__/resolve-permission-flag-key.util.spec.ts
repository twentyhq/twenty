import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { resolvePermissionFlagKey } from 'src/engine/metadata-modules/permission-flag/utils/resolve-permission-flag-key.util';

describe('resolvePermissionFlagKey', () => {
  it.each<[string, PermissionFlagType]>([
    ['APPLICATIONS', PermissionFlagType.WORKSPACE_APPS],
    ['CONNECTED_ACCOUNTS', PermissionFlagType.USER_APPS],
  ])(
    'returns the current key of a standard flag still stored as %s',
    (storedKey, expectedKey) => {
      expect(
        resolvePermissionFlagKey({
          universalIdentifier: SystemPermissionFlag[expectedKey],
          key: storedKey,
        }),
      ).toBe(expectedKey);
    },
  );

  it('returns the key of a standard flag already stored under its current key', () => {
    expect(
      resolvePermissionFlagKey({
        universalIdentifier: SystemPermissionFlag.WORKSPACE_APPS,
        key: PermissionFlagType.WORKSPACE_APPS,
      }),
    ).toBe(PermissionFlagType.WORKSPACE_APPS);
  });

  it('returns the stored key of an app-defined flag', () => {
    expect(
      resolvePermissionFlagKey({
        universalIdentifier: '0b6c3a51-7a54-4ef6-8d4e-0f3f0a4b9b1e',
        key: 'CAN_EXPORT_INVOICES',
      }),
    ).toBe('CAN_EXPORT_INVOICES');
  });

  it('does not map a legacy key on an app-defined flag to a standard key', () => {
    expect(
      resolvePermissionFlagKey({
        universalIdentifier: '0b6c3a51-7a54-4ef6-8d4e-0f3f0a4b9b1e',
        key: 'APPLICATIONS',
      }),
    ).toBe('APPLICATIONS');
  });
});
