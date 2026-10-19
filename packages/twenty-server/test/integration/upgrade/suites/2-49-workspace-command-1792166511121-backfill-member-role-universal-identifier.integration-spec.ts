import { v4 } from 'uuid';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type BackfillMemberRoleUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792166511121-backfill-member-role-universal-identifier.command';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/permissions/constants/member-role-universal-identifier.constants';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const FLAT_MAPS_REFERENCING_ROLE_UNIVERSAL_IDENTIFIER = (
  [
    'role',
    'roleTarget',
    'rolePermissionFlag',
    'objectPermission',
    'fieldPermission',
    'rowLevelPermissionPredicate',
    'rowLevelPermissionPredicateGroup',
  ] as const
).map(getMetadataFlatEntityMapsKey);

type RoleRow = { id: string; label: string; universalIdentifier: string };

describe('2-49 workspace command - backfill member role universal identifier (integration)', () => {
  let command: BackfillMemberRoleUniversalIdentifierCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let seededMemberRoleId: string;

  const findRoles = async (): Promise<RoleRow[]> =>
    global.testDataSource.query(
      `SELECT id, label, "universalIdentifier" FROM core."role" WHERE "workspaceId" = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

  const findRolesWithMemberUniversalIdentifier = async () =>
    (await findRoles()).filter(
      ({ universalIdentifier }) =>
        universalIdentifier === MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
    );

  const updateSeededMemberRole = async ({
    label,
    universalIdentifier,
  }: Pick<RoleRow, 'label' | 'universalIdentifier'>) => {
    await global.testDataSource.query(
      `UPDATE core."role" SET label = $1, "universalIdentifier" = $2 WHERE id = $3`,
      [label, universalIdentifier, seededMemberRoleId],
    );

    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      FLAT_MAPS_REFERENCING_ROLE_UNIVERSAL_IDENTIFIER,
    );
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<BackfillMemberRoleUniversalIdentifierCommand>(
        'BackfillMemberRoleUniversalIdentifierCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    const [seededMemberRole] = await findRolesWithMemberUniversalIdentifier();

    seededMemberRoleId = seededMemberRole.id;
  });

  afterAll(async () => {
    const createdMemberRoles = (
      await findRolesWithMemberUniversalIdentifier()
    ).filter(({ id }) => id !== seededMemberRoleId);

    for (const { id } of createdMemberRoles) {
      await global.testDataSource.query(
        `DELETE FROM core."role" WHERE id = $1`,
        [id],
      );
    }

    await updateSeededMemberRole({
      label: MEMBER_ROLE_LABEL,
      universalIdentifier: MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
    });
  });

  it('should stamp the existing Member role', async () => {
    await updateSeededMemberRole({
      label: MEMBER_ROLE_LABEL,
      universalIdentifier: v4(),
    });

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findRolesWithMemberUniversalIdentifier()).toEqual([
      expect.objectContaining({
        id: seededMemberRoleId,
        label: MEMBER_ROLE_LABEL,
      }),
    ]);
  });

  it('should create Member when the workspace has none', async () => {
    await updateSeededMemberRole({
      label: 'Renamed member',
      universalIdentifier: v4(),
    });

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    const memberRoles = await findRolesWithMemberUniversalIdentifier();

    expect(memberRoles).toHaveLength(1);
    expect(memberRoles[0].id).not.toBe(seededMemberRoleId);
    expect(memberRoles[0].label).toBe(MEMBER_ROLE_LABEL);
  });
});
