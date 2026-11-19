import { getDeclaredLegacyRoleRecordsPermissionsKeys } from '@/application/utils/getDeclaredLegacyRoleRecordsPermissionsKeys';

describe('getDeclaredLegacyRoleRecordsPermissionsKeys', () => {
  it('should list the legacy properties a role declares', () => {
    expect(
      getDeclaredLegacyRoleRecordsPermissionsKeys({
        role: {
          canReadAllObjectRecords: false,
          objectPermissions: [{ objectUniversalIdentifier: 'company' }],
        },
      }),
    ).toEqual(['canReadAllObjectRecords', 'objectPermissions']);
  });

  it('should not count the empty arrays an older build always writes', () => {
    expect(
      getDeclaredLegacyRoleRecordsPermissionsKeys({
        role: {
          objectPermissions: [],
          fieldPermissions: [],
          rowLevelPermissionPredicates: [],
          rowLevelPermissionPredicateGroups: [],
        },
      }),
    ).toEqual([]);
  });
});
