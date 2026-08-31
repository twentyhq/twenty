import { buildAppleWorkspaceOrigin } from 'test/integration/graphql/utils/build-apple-workspace-origin.util';
import { getLoginTokenFromCredentialsQueryFactory } from 'test/integration/graphql/utils/get-login-token-from-credentials.query-factory.util';
import { signUpInWorkspaceOperationFactory } from 'test/integration/graphql/utils/sign-up-in-workspace-operation-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const STORED_ADDRESS = 'tim@apple.dev';
const IDENTITY_PROVIDER_ADDRESS = 'Tim@Apple.Dev';
const PASSWORD = 'tim@apple.dev';

const countLiveUsersWithAddress = async (address: string): Promise<number> => {
  const rows = await global.testDataSource.query(
    'SELECT 1 FROM core."user" WHERE lower("email") = lower($1) AND "deletedAt" IS NULL',
    [address],
  );

  return rows.length;
};

describe('user identity is case-insensitive on email (integration)', () => {
  it('resolves the already-registered user when the address casing differs', async () => {
    const userRepository = getCoreRepository<UserEntity>(UserEntity);

    const user = await userRepository.findOne({
      where: { email: IDENTITY_PROVIDER_ADDRESS },
    });

    expect(user?.id).toBe(USER_DATA_SEED_IDS.TIM);
    expect(user?.email).toBe(STORED_ADDRESS);
  });

  it('issues a login token when signing in with a differently-cased address', async () => {
    const response = await makeMetadataAPIRequest(
      getLoginTokenFromCredentialsQueryFactory({
        email: IDENTITY_PROVIDER_ADDRESS,
        password: PASSWORD,
        origin: buildAppleWorkspaceOrigin(),
      }),
      null,
    ).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.getLoginTokenFromCredentials.loginToken.token,
    ).toBeDefined();
  });

  it('signs the existing user into the workspace instead of creating a second row', async () => {
    expect(await countLiveUsersWithAddress(STORED_ADDRESS)).toBe(1);

    const response = await makeMetadataAPIRequest(
      signUpInWorkspaceOperationFactory({
        email: IDENTITY_PROVIDER_ADDRESS,
        password: PASSWORD,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      }),
      null,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.signUpInWorkspace.workspace.id).toBe(
      SEED_APPLE_WORKSPACE_ID,
    );
    expect(await countLiveUsersWithAddress(STORED_ADDRESS)).toBe(1);
  });

  it('refuses a second account whose address differs only by casing', async () => {
    await expect(
      global.testDataSource.query(
        'INSERT INTO core."user" ("firstName", "lastName", "email") VALUES ($1, $2, $3)',
        ['Case', 'Clash', IDENTITY_PROVIDER_ADDRESS],
      ),
    ).rejects.toThrow(/UQ_USER_EMAIL/);

    expect(await countLiveUsersWithAddress(STORED_ADDRESS)).toBe(1);
  });
});
