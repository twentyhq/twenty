import { randomUUID } from 'crypto';

import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const RUN_AS_WORKSPACE_MEMBER_PATH = '/app/tokens/run-as-workspace-member';

const ROLED_APP_UNIVERSAL_IDENTIFIER = randomUUID();
const ROLED_APP_ROLE_UNIVERSAL_IDENTIFIER = randomUUID();
const ROLELESS_APP_UNIVERSAL_IDENTIFIER = randomUUID();

// APPLE_JANE_ADMIN_ACCESS_TOKEN is issued for Jane, so a token generated with
// it is delegated to her.
const DELEGATED_WORKSPACE_MEMBER_ID = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE;
const OTHER_WORKSPACE_MEMBER_ID = WORKSPACE_MEMBER_DATA_SEED_IDS.JONY;

const buildRolelessManifest = (): Manifest => ({
  ...buildBaseManifest({
    appId: ROLELESS_APP_UNIVERSAL_IDENTIFIER,
    roleId: randomUUID(),
  }),
  application: {
    universalIdentifier: ROLELESS_APP_UNIVERSAL_IDENTIFIER,
    defaultRoleUniversalIdentifier: undefined,
    displayName: 'Roleless Test Application',
    description: 'Application that declares no role',
    applicationVariables: {},
    packageJsonChecksum: null,
    yarnLockChecksum: null,
  },
  roles: [],
});

const findApplicationId = async (
  universalIdentifier: string,
): Promise<string> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT id FROM core."application"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [universalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  return rows[0]?.id;
};

const installApplication = async ({
  universalIdentifier,
  name,
  manifest,
}: {
  universalIdentifier: string;
  name: string;
  manifest: Manifest;
}): Promise<string> => {
  await setupApplicationForSync({
    applicationUniversalIdentifier: universalIdentifier,
    name,
    description: name,
    sourcePath: name,
  });

  // setupApplicationForSync leaves fake timers installed.
  jest.useRealTimers();

  const { errors } = await syncApplication({ manifest, expectToFail: false });

  expect(errors).toBeUndefined();

  return findApplicationId(universalIdentifier);
};

const runAsWorkspaceMember = ({
  token,
  workspaceMemberId,
}: {
  token?: string;
  workspaceMemberId: unknown;
}) => {
  const httpRequest = request(global.app.getHttpServer())
    .post(RUN_AS_WORKSPACE_MEMBER_PATH)
    .send({ workspaceMemberId });

  return token
    ? httpRequest.set('Authorization', `Bearer ${token}`)
    : httpRequest;
};

describe('POST /app/tokens/run-as-workspace-member', () => {
  let applicationOnlyToken: string;
  let delegatedToken: string;
  let rolelessApplicationOnlyToken: string;

  beforeAll(async () => {
    const roledApplicationId = await installApplication({
      universalIdentifier: ROLED_APP_UNIVERSAL_IDENTIFIER,
      name: 'run-as-member-roled',
      manifest: buildBaseManifest({
        appId: ROLED_APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLED_APP_ROLE_UNIVERSAL_IDENTIFIER,
      }),
    });

    expect(roledApplicationId).toBeTruthy();

    const rolelessApplicationId = await installApplication({
      universalIdentifier: ROLELESS_APP_UNIVERSAL_IDENTIFIER,
      name: 'run-as-member-roleless',
      manifest: buildRolelessManifest(),
    });

    expect(rolelessApplicationId).toBeTruthy();

    // An API key carries no user, so the token it generates is application-only.
    const applicationOnly = await generateApplicationToken({
      applicationId: roledApplicationId,
      expectToFail: false,
      token: API_KEY_ACCESS_TOKEN,
    });

    applicationOnlyToken =
      applicationOnly.data.generateApplicationToken.applicationAccessToken
        .token;

    const delegated = await generateApplicationToken({
      applicationId: roledApplicationId,
      expectToFail: false,
    });

    delegatedToken =
      delegated.data.generateApplicationToken.applicationAccessToken.token;

    const rolelessApplicationOnly = await generateApplicationToken({
      applicationId: rolelessApplicationId,
      expectToFail: false,
      token: API_KEY_ACCESS_TOKEN,
    });

    rolelessApplicationOnlyToken =
      rolelessApplicationOnly.data.generateApplicationToken
        .applicationAccessToken.token;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: ROLED_APP_UNIVERSAL_IDENTIFIER,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: ROLELESS_APP_UNIVERSAL_IDENTIFIER,
    });
  }, 120000);

  it('should issue a token for any member when the caller is application-only', async () => {
    const response = await runAsWorkspaceMember({
      token: applicationOnlyToken,
      workspaceMemberId: OTHER_WORKSPACE_MEMBER_ID,
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');
    expect(response.body.token.length).toBeGreaterThan(0);
  });

  it('should issue a token when a delegated caller asks for its own member', async () => {
    const response = await runAsWorkspaceMember({
      token: delegatedToken,
      workspaceMemberId: DELEGATED_WORKSPACE_MEMBER_ID,
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');
  });

  it('should refuse a delegated caller asking for another member', async () => {
    const response = await runAsWorkspaceMember({
      token: delegatedToken,
      workspaceMemberId: OTHER_WORKSPACE_MEMBER_ID,
    });

    expect(response.status).toBe(403);
    expect(response.body.token).toBeUndefined();
  });

  // Without a role of its own the application would read with the member's
  // full role instead of the intersection of both.
  it('should refuse an application that declares no default role', async () => {
    const response = await runAsWorkspaceMember({
      token: rolelessApplicationOnlyToken,
      workspaceMemberId: OTHER_WORKSPACE_MEMBER_ID,
    });

    expect(response.status).toBe(403);
    expect(response.body.token).toBeUndefined();
  });

  it('should refuse a user access token', async () => {
    const response = await runAsWorkspaceMember({
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      workspaceMemberId: DELEGATED_WORKSPACE_MEMBER_ID,
    });

    expect(response.status).toBe(403);
    expect(response.body.token).toBeUndefined();
  });

  it('should not find a workspace member that does not exist', async () => {
    const response = await runAsWorkspaceMember({
      token: applicationOnlyToken,
      workspaceMemberId: randomUUID(),
    });

    expect(response.status).toBe(404);
    expect(response.body.token).toBeUndefined();
  });

  it('should reject a workspace member id that is not a uuid', async () => {
    const response = await runAsWorkspaceMember({
      token: applicationOnlyToken,
      workspaceMemberId: 'not-a-uuid',
    });

    expect(response.status).toBe(400);
    expect(response.body.token).toBeUndefined();
  });

  it('should reject an unauthenticated request', async () => {
    const response = await runAsWorkspaceMember({
      workspaceMemberId: OTHER_WORKSPACE_MEMBER_ID,
    });

    expect(response.status).toBe(403);
    expect(response.body.token).toBeUndefined();
  });
});
