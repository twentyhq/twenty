import { gql } from 'graphql-tag';
import { getNonServerAdminAccessToken } from 'test/integration/graphql/suites/admin-panel/utils/make-admin-panel-api-request-as-non-server-admin.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type GrantServerAdminCommand } from 'src/engine/core-modules/admin-panel/commands/grant-server-admin.command';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type ServerAdminLockService } from 'src/engine/core-modules/user/services/server-admin-lock.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const SCOTT_EMAIL = 'scott.forstall@apple.dev';

const getServerAdminsOperation = {
  query: gql`
    query GetServerAdmins {
      getServerAdmins {
        id
      }
    }
  `,
};

describe('server-admin:grant command', () => {
  let command: GrantServerAdminCommand;

  beforeAll(() => {
    command = getAppProviderByClassName<GrantServerAdminCommand>(
      'GrantServerAdminCommand',
    );
  });

  afterEach(async () => {
    await getCoreRepository<UserEntity>(UserEntity).update(
      { id: USER_DATA_SEED_IDS.SCOTT },
      { canAccessFullAdminPanel: false, canImpersonate: false },
    );

    await getAppProviderByClassName<CoreEntityCacheService>(
      'CoreEntityCacheService',
    ).invalidate('user', USER_DATA_SEED_IDS.SCOTT);
  });

  it('should grant server admin access that an open session picks up without a restart', async () => {
    const accessToken = await getNonServerAdminAccessToken();

    const deniedResponse = await makeAdminPanelApiRequest(
      getServerAdminsOperation,
      accessToken,
    );

    expect(deniedResponse.body.errors[0].extensions.code).toBe(
      ErrorCode.FORBIDDEN,
    );

    await command.run([], { email: SCOTT_EMAIL });

    const scott = await getCoreRepository<UserEntity>(UserEntity).findOneOrFail(
      { where: { id: USER_DATA_SEED_IDS.SCOTT } },
    );

    expect(scott.canAccessFullAdminPanel).toBe(true);
    expect(scott.canImpersonate).toBe(true);

    const allowedResponse = await makeAdminPanelApiRequest(
      getServerAdminsOperation,
      accessToken,
    );

    expect(allowedResponse.body.errors).toBeUndefined();
    expect(
      allowedResponse.body.data.getServerAdmins.map(
        ({ id }: { id: string }) => id,
      ),
    ).toContain(USER_DATA_SEED_IDS.SCOTT);
  });

  it('should refuse to grant while a user is being removed', async () => {
    await getAppProviderByClassName<ServerAdminLockService>(
      'ServerAdminLockService',
    ).runShared(async () => {
      await expect(
        command.run([], { email: SCOTT_EMAIL }),
      ).rejects.toMatchObject({
        message: 'Another server administrator change is in progress',
      });
    });

    const scott = await getCoreRepository<UserEntity>(UserEntity).findOneOrFail(
      { where: { id: USER_DATA_SEED_IDS.SCOTT } },
    );

    expect(scott.canAccessFullAdminPanel).toBe(false);
  });

  it('should fail when no active user has the email', async () => {
    await expect(
      command.run([], { email: 'nobody@example.com' }),
    ).rejects.toThrow('No active user found with email nobody@example.com');
  });
});
