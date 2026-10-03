import { computeRoleIdsWithAllRecordsAccess } from 'src/engine/metadata-modules/role/utils/compute-role-ids-with-all-records-access.util';

describe('computeRoleIdsWithAllRecordsAccess', () => {
  it('lists the roles that administer every setting', () => {
    expect(
      computeRoleIdsWithAllRecordsAccess({
        flatRoleMaps: {
          byUniversalIdentifier: {
            'admin-universal-identifier': {
              id: 'admin',
              canUpdateAllSettings: true,
            },
            'member-universal-identifier': {
              id: 'member',
              canUpdateAllSettings: false,
            },
            'missing-universal-identifier': undefined,
          },
        },
      }),
    ).toEqual(['admin']);
  });

  it('returns an empty list when no role administers every setting', () => {
    expect(
      computeRoleIdsWithAllRecordsAccess({
        flatRoleMaps: { byUniversalIdentifier: {} },
      }),
    ).toEqual([]);
  });
});
