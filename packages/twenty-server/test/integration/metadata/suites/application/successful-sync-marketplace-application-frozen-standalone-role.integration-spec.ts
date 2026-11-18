import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

jest.setTimeout(120000);

const APP_ID = uuidv4();
const REQUESTED_ROLE_ID = uuidv4();
const MEMBER_ROLE_ID = uuidv4();
const NEW_STANDALONE_ROLE_ID = uuidv4();
const AGENT_ID = uuidv4();
const COMPANY = STANDARD_OBJECTS.company;

const REQUESTED_ROLE = {
  universalIdentifier: REQUESTED_ROLE_ID,
  label: 'Requested',
};

const MEMBER_ROLE = {
  universalIdentifier: MEMBER_ROLE_ID,
  label: 'Member role',
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: true,
  objectPermissions: [
    {
      objectUniversalIdentifier: COMPANY.universalIdentifier,
      canReadObjectRecords: true,
    },
  ],
};

const buildManifest = (overrides: Pick<Manifest, 'roles' | 'agents'>) =>
  buildBaseManifest({ appId: APP_ID, roleId: REQUESTED_ROLE_ID, overrides });

type MemberRoleState = {
  label: string;
  canReadObjectRecords: boolean | null;
  canUpdateObjectRecords: boolean | null;
};

const findMemberRoleState = async (): Promise<MemberRoleState | undefined> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT role.label, "objectPermission"."canReadObjectRecords",
            "objectPermission"."canUpdateObjectRecords"
     FROM core."role" role
     LEFT JOIN core."objectPermission" "objectPermission"
       ON "objectPermission"."roleId" = role.id
     WHERE role."universalIdentifier" = $1 AND role."workspaceId" = $2`,
    [MEMBER_ROLE_ID, SEED_APPLE_WORKSPACE_ID],
  );

  return row;
};

const findJonyRoleId = async (): Promise<string> => {
  const [{ roleId }] = await globalThis.testDataSource.query(
    `SELECT "roleTarget"."roleId"
     FROM core."roleTarget" "roleTarget"
     JOIN core."userWorkspace" "userWorkspace"
       ON "userWorkspace".id = "roleTarget"."userWorkspaceId"
     WHERE "userWorkspace"."userId" = $1 AND "roleTarget"."workspaceId" = $2`,
    [USER_DATA_SEED_IDS.JONY, SEED_APPLE_WORKSPACE_ID],
  );

  return roleId;
};

const countRoles = async (universalIdentifier: string) => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT count(*)::int AS count FROM core."role"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  return count;
};

describe('Marketplace application standalone roles are frozen on sync', () => {
  let jonyOriginalRoleId: string;
  let memberRoleId: string;
  let installedMemberRoleState: MemberRoleState | undefined;

  beforeAll(async () => {
    jonyOriginalRoleId = await findJonyRoleId();

    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'Standalone role application',
      description: 'Application whose installed role becomes standalone',
      sourcePath: 'test-marketplace-application-frozen-standalone-role',
    });

    // An agent role is the only way left for an app to install this role
    await syncApplication({
      manifest: buildManifest({
        roles: [REQUESTED_ROLE, MEMBER_ROLE],
        agents: [
          {
            universalIdentifier: AGENT_ID,
            name: 'member-agent',
            label: 'Member agent',
            prompt: 'You are a test agent.',
            roleUniversalIdentifier: MEMBER_ROLE_ID,
          },
        ],
      }),
      expectToFail: false,
    });

    const [{ id }] = await globalThis.testDataSource.query(
      `SELECT id FROM core."role" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [MEMBER_ROLE_ID, SEED_APPLE_WORKSPACE_ID],
    );

    memberRoleId = id;
    installedMemberRoleState = await findMemberRoleState();

    await updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: memberRoleId,
      },
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      input: {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        roleId: jonyOriginalRoleId,
      },
      expectToFail: false,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_ID,
    });
  });

  it('keeps an installed standalone role and its member when the manifest changes it', async () => {
    await syncApplication({
      manifest: buildManifest({
        roles: [
          REQUESTED_ROLE,
          {
            ...MEMBER_ROLE,
            label: 'Widened member role',
            objectPermissions: [
              {
                objectUniversalIdentifier: COMPANY.universalIdentifier,
                canReadObjectRecords: true,
                canUpdateObjectRecords: true,
              },
            ],
          },
        ],
        agents: [],
      }),
      expectToFail: false,
    });

    expect(installedMemberRoleState).toMatchObject({
      label: 'Member role',
      canReadObjectRecords: true,
    });
    expect(await findMemberRoleState()).toEqual(installedMemberRoleState);
    expect(await findJonyRoleId()).toBe(memberRoleId);
  });

  it('keeps an installed standalone role and its member when the manifest drops it', async () => {
    await syncApplication({
      manifest: buildManifest({ roles: [REQUESTED_ROLE], agents: [] }),
      expectToFail: false,
    });

    expect(await findMemberRoleState()).toEqual(installedMemberRoleState);
    expect(await findJonyRoleId()).toBe(memberRoleId);
  });

  it('does not create a new standalone role', async () => {
    await syncApplication({
      manifest: buildManifest({
        roles: [
          REQUESTED_ROLE,
          { universalIdentifier: NEW_STANDALONE_ROLE_ID, label: 'New role' },
        ],
        agents: [],
      }),
      expectToFail: false,
    });

    expect(await countRoles(NEW_STANDALONE_ROLE_ID)).toBe(0);
  });
});
