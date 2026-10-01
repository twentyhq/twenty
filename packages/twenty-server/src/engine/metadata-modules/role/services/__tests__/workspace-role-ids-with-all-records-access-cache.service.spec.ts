import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { WorkspaceRoleIdsWithAllRecordsAccessCacheService } from 'src/engine/metadata-modules/role/services/workspace-role-ids-with-all-records-access-cache.service';

const compute = () =>
  new WorkspaceRoleIdsWithAllRecordsAccessCacheService().computeForCache({
    workspaceId: 'workspace',
    rows: {
      role: [
        { id: 'admin', canUpdateAllSettings: true },
        { id: 'auditor', canUpdateAllSettings: false },
        { id: 'member', canUpdateAllSettings: false },
        { id: 'ai-user', canUpdateAllSettings: false },
        { id: 'legacy', canUpdateAllSettings: false },
      ],
      rolePermissionFlag: {
        byRoleId: new Map([
          ['auditor', [{ permissionFlagId: 'all-records' }]],
          ['ai-user', [{ permissionFlagId: 'ai' }]],
          [
            'legacy',
            [
              {
                permissionFlagId: null,
                flag: PermissionFlagType.ACCESS_ALL_RECORDS,
              },
            ],
          ],
        ]),
      },
      permissionFlag: [
        {
          id: 'all-records',
          universalIdentifier:
            SystemPermissionFlag[PermissionFlagType.ACCESS_ALL_RECORDS],
        },
        {
          id: 'ai',
          universalIdentifier: SystemPermissionFlag[PermissionFlagType.AI],
        },
      ],
    },
  } as never);

describe('WorkspaceRoleIdsWithAllRecordsAccessCacheService', () => {
  it('lists roles that administer every setting or hold the permission', () => {
    expect(compute()).toEqual(['admin', 'auditor', 'legacy']);
  });
});
