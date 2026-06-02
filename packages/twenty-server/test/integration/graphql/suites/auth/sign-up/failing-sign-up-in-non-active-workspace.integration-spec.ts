import request from 'supertest';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { signUpOperationFactory } from 'test/integration/graphql/utils/sign-up-operation-factory.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

describe('signUpInWorkspace into a non-active workspace (integration)', () => {
  const existingUserEmail = `existing-non-active-${Date.now()}@example.com`;
  const password = 'Test123!@#';

  beforeAll(async () => {
    await signUp({
      input: { email: existingUserEmail, password },
      expectToFail: false,
    });

    await testDataSource.query(
      'UPDATE core.workspace SET "activationStatus" = $1 WHERE id = $2',
      [WorkspaceActivationStatus.SUSPENDED, SEED_APPLE_WORKSPACE_ID],
    );
  });

  afterAll(async () => {
    await testDataSource.query(
      'UPDATE core.workspace SET "activationStatus" = $1 WHERE id = $2',
      [WorkspaceActivationStatus.ACTIVE, SEED_APPLE_WORKSPACE_ID],
    );

    await testDataSource.query('DELETE FROM core."user" WHERE email = $1', [
      existingUserEmail,
    ]);
  });

  it('rejects an existing user joining a suspended workspace with the workspace-readiness message', async () => {
    const response = await client.post('/metadata').send(
      signUpOperationFactory({
        email: existingUserEmail,
        password,
      }),
    );

    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  });

  it('rejects a brand-new user joining a suspended workspace with the workspace-readiness message', async () => {
    const response = await client.post('/metadata').send(
      signUpOperationFactory({
        email: `new-non-active-${Date.now()}@example.com`,
        password,
      }),
    );

    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  });
});
