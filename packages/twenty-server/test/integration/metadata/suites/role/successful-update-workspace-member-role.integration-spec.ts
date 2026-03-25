import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Workspace member role update should succeed', () => {
  let adminRoleId: string;
  let guestRoleId: string;
  let memberRoleId: string;
  let shouldRestorePhilRole: boolean = false;

  beforeAll(async () => {
    // Get the Admin, Guest, and Member role IDs
    const adminRole = await findOneRoleByLabel({ label: 'Admin' });
    const guestRole = await findOneRoleByLabel({ label: 'Guest' });
    const memberRole = await findOneRoleByLabel({ label: 'Member' });

    adminRoleId = adminRole.id;
    guestRoleId = guestRole.id;
    memberRoleId = memberRole.id;
  });

  afterEach(async () => {
    if (shouldRestorePhilRole) {
      await updateWorkspaceMemberRole({
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
          roleId: guestRoleId,
        },
      });
    }

    shouldRestorePhilRole = false;
  });

  it('should update Phil from Guest to Admin role', async () => {
    const { data: updateAdminData } = await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
        roleId: adminRoleId,
      },
      gqlFields: `
          id
          name {
            firstName
            lastName
          }
          userEmail
          roles {
            id
            label
            icon
          }
        `,
    });

    shouldRestorePhilRole = true;

    expect(updateAdminData.updateWorkspaceMemberRole).toMatchObject({
      id: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
      name: {
        firstName: 'Phil',
        lastName: 'Schiler',
      },
    });
    jestExpectToBeDefined(updateAdminData.updateWorkspaceMemberRole.roles);
    expect(updateAdminData.updateWorkspaceMemberRole.roles).toHaveLength(1);
    expect(updateAdminData.updateWorkspaceMemberRole.roles[0]).toMatchObject({
      id: adminRoleId,
      label: 'Admin',
    });

    const { data } = await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
        roleId: memberRoleId,
      },
      gqlFields: `
          id
          name {
            firstName
            lastName
          }
          userEmail
          roles {
            id
            label
            icon
          }
        `,
    });

    expect(data.updateWorkspaceMemberRole).toMatchObject({
      id: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
      name: {
        firstName: 'Phil',
        lastName: 'Schiler',
      },
    });
    jestExpectToBeDefined(data.updateWorkspaceMemberRole.roles);
    expect(data.updateWorkspaceMemberRole.roles).toHaveLength(1);
    expect(data.updateWorkspaceMemberRole.roles[0]).toMatchObject({
      id: memberRoleId,
      label: 'Member',
    });
  });
});
