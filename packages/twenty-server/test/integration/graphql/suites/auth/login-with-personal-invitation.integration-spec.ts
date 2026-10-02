import { randomUUID } from 'node:crypto';

import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const PASSWORD = 'tim@apple.dev';
const PASSWORD_HASH =
  '$2b$10$3LwXjJRtLsfx4hLuuXhxt.3mWgismTiZFCZSG3z9kDrSfsrBl0fT6';

const countAppleMemberships = async (userId: string): Promise<number> => {
  const rows = await global.testDataSource.query(
    'SELECT 1 FROM core."userWorkspace" WHERE "userId" = $1 AND "workspaceId" = $2 AND "deletedAt" IS NULL',
    [userId, SEED_APPLE_WORKSPACE_ID],
  );

  return rows.length;
};

describe('getLoginTokenFromCredentials with a personal invitation (integration)', () => {
  let email: string;
  let userId: string;

  beforeEach(async () => {
    email = `invited-login-${randomUUID()}@example.com`;

    const insertedRows = await global.testDataSource.query(
      `INSERT INTO core."user" ("firstName", "lastName", "email", "passwordHash", "isEmailVerified")
       VALUES ($1, $2, $3, $4, true)
       RETURNING "id"`,
      ['Invited', 'User', email, PASSWORD_HASH],
    );

    userId = insertedRows[0].id;

    await seedWorkspaceInvitation({
      email,
      value: `invited-login-token-${randomUUID()}`,
      expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
    });
  });

  afterEach(async () => {
    await deleteWorkspaceInvitationsByEmail({ email });
    await global.testDataSource.query(
      'DELETE FROM core."userWorkspace" WHERE "userId" = $1',
      [userId],
    );
    await global.testDataSource.query(
      'DELETE FROM core."user" WHERE "id" = $1',
      [userId],
    );
  });

  it('keeps the invitation and does not join the workspace on a wrong password', async () => {
    const response = await makeMetadataApiRequest(
      getLoginTokenFromCredentialsQueryFactory({
        email,
        password: 'wrong-password',
        origin: buildAppleWorkspaceOrigin(),
      }),
      null,
    );

    expect(response.body.data?.getLoginTokenFromCredentials).toBeFalsy();
    expect(response.body.errors).toHaveLength(1);
    expect(await findWorkspaceInvitationsByEmail({ email })).toHaveLength(1);
    expect(await countAppleMemberships(userId)).toBe(0);
  });

  it('joins the workspace through the invitation on the right password', async () => {
    const response = await makeMetadataApiRequest(
      getLoginTokenFromCredentialsQueryFactory({
        email,
        password: PASSWORD,
        origin: buildAppleWorkspaceOrigin(),
      }),
      null,
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.getLoginTokenFromCredentials.loginToken.token,
    ).toBeDefined();
    expect(await countAppleMemberships(userId)).toBe(1);
  });
});

describe('getLoginTokenFromCredentials without access to the workspace (integration)', () => {
  const email = `outsider-login-${Date.now()}@example.com`;
  let userId: string;

  beforeAll(async () => {
    const insertedRows = await global.testDataSource.query(
      `INSERT INTO core."user" ("firstName", "lastName", "email", "passwordHash", "isEmailVerified")
       VALUES ($1, $2, $3, $4, true)
       RETURNING "id"`,
      ['Outsider', 'User', email, PASSWORD_HASH],
    );

    userId = insertedRows[0].id;
  });

  afterAll(async () => {
    await global.testDataSource.query(
      'DELETE FROM core."user" WHERE "id" = $1',
      [userId],
    );
  });

  it.each([PASSWORD, 'wrong-password'])(
    'rejects as not a member whatever the password (%s)',
    async (password) => {
      const response = await makeMetadataApiRequest(
        getLoginTokenFromCredentialsQueryFactory({
          email,
          password,
          origin: buildAppleWorkspaceOrigin(),
        }),
        null,
      );

      expect(response.body.data?.getLoginTokenFromCredentials).toBeFalsy();
      expect(response.body.errors[0].message).toBe(
        'User is not a member of the workspace.',
      );
      expect(await countAppleMemberships(userId)).toBe(0);
    },
  );
});
