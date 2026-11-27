import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { randomUUID } from 'crypto';

import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import {
  findApplicationGrantRole,
  findApplicationIdByUniversalIdentifier,
} from 'test/integration/metadata/suites/application-grant-role/utils/find-application-grant-role.util';
import { findApplicationRoleIds } from 'test/integration/metadata/suites/application-grant-role/utils/find-application-role-ids.util';
import { loginAsTwentyCli } from 'test/integration/metadata/suites/application/utils/login-as-twenty-cli.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

jest.setTimeout(120000);

const findGrantRoleByApplicationUniversalIdentifier = async ({
  universalIdentifier,
  workspaceId,
  token,
}: {
  universalIdentifier: string;
  workspaceId: string;
  token?: string;
}) => {
  const applicationId = await findApplicationIdByUniversalIdentifier({
    universalIdentifier,
    token,
  });

  expect(applicationId).toBeDefined();

  return findApplicationGrantRole({
    applicationId: applicationId!,
    workspaceId,
  });
};

describe('Application grants of twenty-standard and of exempt applications', () => {
  describe('in a new workspace', () => {
    let workspaceId: string | undefined;
    let workspaceAccessToken: string | undefined;

    beforeAll(async () => {
      jest.useRealTimers();

      const email = `test-${randomUUID()}@example.com`;
      const { data: signUpData } = await signUp({
        input: { email, password: 'Test123!@#' },
        expectToFail: false,
      });

      await globalThis.testDataSource.query(
        'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
        [email],
      );

      const {
        data: { signUpInNewWorkspace: newWorkspaceData },
      } = await signUpInNewWorkspace({
        accessToken:
          signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token,
        expectToFail: false,
      });

      workspaceId = newWorkspaceData.workspace.id;

      const {
        data: { getAuthTokensFromLoginToken: authTokensData },
      } = await getAuthTokensFromLoginToken({
        origin: newWorkspaceData.workspace.workspaceUrls.subdomainUrl,
        loginToken: newWorkspaceData.loginToken.token,
        expectToFail: false,
      });

      workspaceAccessToken =
        authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

      await activateWorkspace({
        accessToken: workspaceAccessToken,
        expectToFail: false,
      });
    });

    afterAll(async () => {
      if (isDefined(workspaceId)) {
        await getAppProviderByClassName<WorkspaceService>(
          'WorkspaceService',
        ).deleteWorkspace(workspaceId);
      }

      jest.useFakeTimers();
    });

    it('gives twenty-standard no requested role and no grant', async () => {
      expect(
        await findApplicationRoleIds({
          input: {
            universalIdentifier:
              TWENTY_STANDARD_APPLICATION.universalIdentifier,
          },
          token: workspaceAccessToken,
        }),
      ).toMatchObject({ requestedRoleId: null, grantRoleId: null });
      expect(
        await findGrantRoleByApplicationUniversalIdentifier({
          universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
          workspaceId: workspaceId!,
          token: workspaceAccessToken,
        }),
      ).toBeUndefined();
    });

    it('gives the workspace custom application no grant', async () => {
      const grant = await findApplicationGrantRole({
        applicationId:
          await findWorkspaceCustomApplicationId(workspaceAccessToken),
        workspaceId: workspaceId!,
      });

      expect(grant).toBeUndefined();
    });
  });

  describe('for an OAuth-only application', () => {
    beforeAll(async () => {
      jest.useRealTimers();
      await loginAsTwentyCli();
    });

    afterAll(async () => {
      await uninstallApplication({
        universalIdentifier:
          TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        expectToFail: false,
      });
      jest.useFakeTimers();
    });

    it('gives no grant', async () => {
      const grant = await findGrantRoleByApplicationUniversalIdentifier({
        universalIdentifier:
          TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });

      expect(grant).toBeUndefined();
    });
  });
});
