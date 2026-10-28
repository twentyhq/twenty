import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { fromFlatPermissionFlagToPermissionFlagDto } from 'src/engine/metadata-modules/flat-permission-flag/utils/from-flat-permission-flag-to-permission-flag-dto.util';

const buildFlatPermissionFlag = (
  overrides: Pick<FlatPermissionFlag, 'universalIdentifier' | 'key'>,
): FlatPermissionFlag => ({
  id: 'permission-flag-id',
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-id',
  label: 'Workspace Apps',
  description: 'Install and manage workspace apps',
  icon: 'IconApps',
  permissionType: 'settings',
  rolePermissionFlagIds: [],
  rolePermissionFlagUniversalIdentifiers: [],
  createdAt: '2026-05-13T00:00:00.000Z',
  updatedAt: '2026-05-14T00:00:00.000Z',
  ...overrides,
});

describe('fromFlatPermissionFlagToPermissionFlagDto', () => {
  it('upgrade:2-53:rename-app-permission-flag-keys exposes the current key of a standard flag still stored under its previous key', () => {
    expect(
      fromFlatPermissionFlagToPermissionFlagDto(
        buildFlatPermissionFlag({
          universalIdentifier: SystemPermissionFlag.WORKSPACE_APPS,
          key: 'APPLICATIONS',
        }),
      ),
    ).toEqual({
      id: 'permission-flag-id',
      universalIdentifier: SystemPermissionFlag.WORKSPACE_APPS,
      key: PermissionFlagType.WORKSPACE_APPS,
      label: 'Workspace Apps',
      description: 'Install and manage workspace apps',
      icon: 'IconApps',
      permissionType: 'settings',
      workspaceId: 'workspace-id',
      applicationId: 'application-id',
      createdAt: new Date('2026-05-13T00:00:00.000Z'),
      updatedAt: new Date('2026-05-14T00:00:00.000Z'),
    });
  });

  it('exposes the stored key of an app-defined flag', () => {
    expect(
      fromFlatPermissionFlagToPermissionFlagDto(
        buildFlatPermissionFlag({
          universalIdentifier: '0b6c3a51-7a54-4ef6-8d4e-0f3f0a4b9b1e',
          key: 'CAN_EXPORT_INVOICES',
        }),
      ).key,
    ).toBe('CAN_EXPORT_INVOICES');
  });
});
