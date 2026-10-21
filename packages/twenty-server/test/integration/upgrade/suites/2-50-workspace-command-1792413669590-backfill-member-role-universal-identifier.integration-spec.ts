import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type BackfillMemberRoleUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-50/2-50-workspace-command-1792413669590-backfill-member-role-universal-identifier.command';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

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

describe('2-50 workspace command - backfill member role universal identifier (integration)', () => {
  let command: BackfillMemberRoleUniversalIdentifierCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let seededMemberRoleId: string;
  let applicationMemberRoleId: string | undefined;

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

  const refreshRoleMaps = () =>
    workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      FLAT_MAPS_REFERENCING_ROLE_UNIVERSAL_IDENTIFIER,
    );

  const updateSeededMemberRole = async ({
    label,
    universalIdentifier,
  }: Pick<RoleRow, 'label' | 'universalIdentifier'>) => {
    await global.testDataSource.query(
      `UPDATE core."role" SET label = $1, "universalIdentifier" = $2 WHERE id = $3`,
      [label, universalIdentifier, seededMemberRoleId],
    );

    await refreshRoleMaps();
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

  afterEach(async () => {
    const createdRoleIds = [
      ...(await findRolesWithMemberUniversalIdentifier())
        .map(({ id }) => id)
        .filter((id) => id !== seededMemberRoleId),
      ...(isDefined(applicationMemberRoleId) ? [applicationMemberRoleId] : []),
    ];

    for (const id of createdRoleIds) {
      await global.testDataSource.query(
        `DELETE FROM core."role" WHERE id = $1`,
        [id],
      );
    }

    applicationMemberRoleId = undefined;

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

  it('should create Member under another label when an application owns the Member label', async () => {
    await updateSeededMemberRole({
      label: 'Renamed member',
      universalIdentifier: v4(),
    });

    const { data } = await createOneRole({
      expectToFail: false,
      input: { label: MEMBER_ROLE_LABEL },
    });

    applicationMemberRoleId = data.createOneRole.id;

    await global.testDataSource.query(
      `UPDATE core."role" SET "applicationId" = (SELECT id FROM core."application" WHERE "workspaceId" = $1 AND "universalIdentifier" = $2) WHERE id = $3`,
      [
        SEED_APPLE_WORKSPACE_ID,
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
        applicationMemberRoleId,
      ],
    );
    await refreshRoleMaps();

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findRolesWithMemberUniversalIdentifier()).toEqual([
      expect.objectContaining({ label: 'Workspace Member' }),
    ]);
  });
});
