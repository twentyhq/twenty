import { WorkspaceRoleIdsWithAllRecordsAccessCacheService } from 'src/engine/metadata-modules/role/services/workspace-role-ids-with-all-records-access-cache.service';

describe('WorkspaceRoleIdsWithAllRecordsAccessCacheService', () => {
  it('lists the roles that administer every setting', () => {
    expect(
      new WorkspaceRoleIdsWithAllRecordsAccessCacheService().computeForCache({
        workspaceId: 'workspace',
        rows: {
          role: [
            { id: 'admin', canUpdateAllSettings: true },
            { id: 'member', canUpdateAllSettings: false },
          ],
        },
      } as never),
    ).toEqual(['admin']);
  });
});
