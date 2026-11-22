import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type RevokeRoleWideAccessToChannelObjectsCommand } from 'src/engine/permissions/channel-visibility/commands/revoke-role-wide-access-to-channel-objects.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const CHANNEL_VISIBILITY_FLAGS = [
  FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
  FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED,
];

type ObjectPermissionRow = {
  roleLabel: string;
  canReadObjectRecords: boolean | null;
  canCreateObjectRecords: boolean | null;
  canUpdateObjectRecords: boolean | null;
  canSoftDeleteObjectRecords: boolean | null;
  canDestroyObjectRecords: boolean | null;
};

const setChannelVisibilityFlags = async (value: boolean) => {
  for (const featureFlag of CHANNEL_VISIBILITY_FLAGS) {
    await updateFeatureFlag({ featureFlag, value, expectToFail: false });
  }
};

const recomputeObjectPermissionCaches = () =>
  getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatObjectPermissionMaps',
    'rolesPermissions',
  ]);

describe('revoke role wide access to channel objects command (integration)', () => {
  let command: RevokeRoleWideAccessToChannelObjectsCommand;
  let messageObjectMetadataId: string;
  let agentRoleId: string;

  const runCommand = () =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

  const findMessageObjectPermissions = (): Promise<ObjectPermissionRow[]> =>
    global.testDataSource.query(
      `SELECT role.label AS "roleLabel", "canReadObjectRecords", "canCreateObjectRecords",
          "canUpdateObjectRecords", "canSoftDeleteObjectRecords", "canDestroyObjectRecords"
        FROM core."objectPermission" "objectPermission"
        JOIN core.role role ON role.id = "objectPermission"."roleId"
        WHERE "objectPermission"."objectMetadataId" = $1
        ORDER BY role.label`,
      [messageObjectMetadataId],
    );

  beforeAll(async () => {
    command =
      getAppProviderByClassName<RevokeRoleWideAccessToChannelObjectsCommand>(
        'RevokeRoleWideAccessToChannelObjectsCommand',
      );
    messageObjectMetadataId = await findObjectMetadataIdByName('message');

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Channel objects agent role',
        description: 'Role an agent reads messages with',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
      },
    });

    agentRoleId = data.createOneRole.id;
  });

  afterEach(async () => {
    await global.testDataSource.query(
      `DELETE FROM core."objectPermission" WHERE "objectMetadataId" = $1`,
      [messageObjectMetadataId],
    );
    await setChannelVisibilityFlags(false);
    await recomputeObjectPermissionCaches();
  });

  afterAll(async () => {
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: agentRoleId },
    });
  });

  it('leaves roles untouched while channel visibility is not enforced through individual roles', async () => {
    await runCommand();

    expect(await findMessageObjectPermissions()).toEqual([]);
  });

  it('revokes the role wide access of every user role, and only of user roles', async () => {
    await setChannelVisibilityFlags(true);

    await runCommand();

    const messageObjectPermissions = await findMessageObjectPermissions();
    const roleLabels = messageObjectPermissions.map(
      ({ roleLabel }) => roleLabel,
    );

    expect(roleLabels).toEqual(expect.arrayContaining(['Admin', 'Member']));
    expect(roleLabels).not.toContain('Channel objects agent role');
    expect(
      roleLabels.some((roleLabel) => roleLabel.startsWith('Individual role')),
    ).toBe(false);
    expect(messageObjectPermissions).toEqual(
      messageObjectPermissions.map(({ roleLabel }) => ({
        roleLabel,
        canReadObjectRecords: false,
        canCreateObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      })),
    );
  });

  it('changes nothing when run again', async () => {
    await setChannelVisibilityFlags(true);
    await runCommand();

    const messageObjectPermissions = await findMessageObjectPermissions();

    await recomputeObjectPermissionCaches();
    await runCommand();

    expect(await findMessageObjectPermissions()).toEqual(
      messageObjectPermissions,
    );
  });
});
