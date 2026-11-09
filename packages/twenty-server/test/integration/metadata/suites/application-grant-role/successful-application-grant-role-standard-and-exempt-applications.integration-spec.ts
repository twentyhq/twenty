import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { randomUUID } from 'crypto';

import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import {
  findApplicationGrantRole,
  findApplicationIdByUniversalIdentifier,
  findRolePermissionSnapshot,
} from 'test/integration/metadata/suites/application-grant-role/utils/find-application-grant-role.util';
import { loginAsTwentyCli } from 'test/integration/metadata/suites/application/utils/login-as-twenty-cli.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

jest.setTimeout(120000);

const findAdminRoleId = async (workspaceId: string): Promise<string> => {
  const [adminRole] = await globalThis.testDataSource.query(
    `SELECT id FROM core."role" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [STANDARD_ROLE.admin.universalIdentifier, workspaceId],
  );

  return adminRole.id;
};

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

    it('gives twenty-standard a grant equal to Admin', async () => {
      const grant = await findGrantRoleByApplicationUniversalIdentifier({
        universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
        workspaceId: workspaceId!,
        token: workspaceAccessToken,
      });

      expect(grant?.role).toMatchObject({
        applicationId:
          await findWorkspaceCustomApplicationId(workspaceAccessToken),
        isEditable: false,
        canBeAssignedToApplications: true,
      });
      expect(await findRolePermissionSnapshot(grant!.role.id)).toEqual(
        await findRolePermissionSnapshot(await findAdminRoleId(workspaceId!)),
      );
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
