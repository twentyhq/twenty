import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const WORKSPACE_CLEANUP_RETRY_INTERVAL_MS = 25;
const WORKSPACE_CLEANUP_RETRY_LIMIT = 200;

const IS_APPLICATION_STOPPED = gql`
  query IsApplicationStopped($applicationUniversalIdentifier: String!) {
    isApplicationStopped(
      applicationUniversalIdentifier: $applicationUniversalIdentifier
    )
  }
`;

describe('Workspace deletion application token', () => {
  let applicationAccessToken: string;
  let applicationId: string;
  let applicationTokenService: ApplicationTokenService;
  let userAccessToken: string | undefined;
  let workspaceId: string | undefined;
  let workspaceService: WorkspaceService;

  const queryApplicationStoppedState = (token: string) =>
    makeMetadataAPIRequest(
      {
        query: IS_APPLICATION_STOPPED,
        variables: {
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION.universalIdentifier,
        },
      },
      token,
    );

  const hardDeleteWorkspaceForCleanup = async (
    workspaceIdToCleanup: string,
  ) => {
    for (let attempt = 1; attempt <= WORKSPACE_CLEANUP_RETRY_LIMIT; attempt++) {
      try {
        await workspaceService.deleteWorkspace(workspaceIdToCleanup);

        return;
      } catch (error) {
        const shouldRetry =
          error instanceof WorkspaceException &&
          error.code ===
            WorkspaceExceptionCode.APPLICATION_UNINSTALL_IN_PROGRESS &&
          attempt < WORKSPACE_CLEANUP_RETRY_LIMIT;

        if (!shouldRetry) {
          throw error;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, WORKSPACE_CLEANUP_RETRY_INTERVAL_MS),
        );
      }
    }
  };

  const softDeleteWorkspaceAndGenerateDeletionToken = async () => {
    if (!isDefined(workspaceId)) {
      throw new Error('Expected the test workspace to exist');
    }

    await workspaceService.deleteWorkspace(workspaceId, true);

    const [softDeletedWorkspace] = await globalThis.testDataSource.query(
      'SELECT "deletedAt" FROM core."workspace" WHERE id = $1',
      [workspaceId],
    );
    const workspaceDeletionRequestTimestamp = new Date(
      softDeletedWorkspace.deletedAt,
    ).toISOString();
    const deletionToken =
      await applicationTokenService.generateWorkspaceDeletionApplicationAccessToken(
        {
          applicationId,
          workspaceId,
          workspaceDeletionRequestTimestamp,
        },
      );

    return { deletionToken, workspaceDeletionRequestTimestamp };
  };

  beforeEach(async () => {
    jest.useRealTimers();

    userAccessToken = undefined;
    workspaceId = undefined;
    applicationTokenService =
      getAppProviderByClassName<ApplicationTokenService>(
        'ApplicationTokenService',
      );
    workspaceService =
      getAppProviderByClassName<WorkspaceService>('WorkspaceService');

    const uniqueEmail = `test-${randomUUID()}@example.com`;
    const { data: signUpData } = await signUp({
      input: { email: uniqueEmail, password: 'Test123!@#' },
      expectToFail: false,
    });

    userAccessToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    await globalThis.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [uniqueEmail],
    );

    const {
      data: { signUpInNewWorkspace: newWorkspaceData },
    } = await signUpInNewWorkspace({
      accessToken: userAccessToken,
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
    const workspaceAccessToken =
      authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

    await activateWorkspace({
      accessToken: workspaceAccessToken,
      expectToFail: false,
    });

    const { data: applicationsData } = await findManyApplications({
      accessToken: workspaceAccessToken,
      expectToFail: false,
    });
    const standardApplication = applicationsData.findManyApplications.find(
      (application) =>
        application.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );

    expect(standardApplication).toBeDefined();

    if (!isDefined(standardApplication)) {
      throw new Error('Expected the standard application to be installed');
    }

    applicationId = standardApplication.id;

    const { data: applicationTokenData } = await generateApplicationToken({
      applicationId,
      expectToFail: false,
      token: workspaceAccessToken,
    });

    applicationAccessToken =
      applicationTokenData.generateApplicationToken.applicationAccessToken
        .token;
  }, 120000);

  afterEach(async () => {
    try {
      if (isDefined(workspaceId)) {
        const [workspaceToCleanup] = await globalThis.testDataSource.query(
          'SELECT id FROM core."workspace" WHERE id = $1',
          [workspaceId],
        );

        if (isDefined(workspaceToCleanup)) {
          await hardDeleteWorkspaceForCleanup(workspaceId);
        }
      }
    } finally {
      if (isDefined(userAccessToken)) {
        await deleteUser({ accessToken: userAccessToken });
      }
    }
  });

  it('rejects a normal application token after soft deletion', async () => {
    if (!isDefined(workspaceId)) {
      throw new Error('Expected the test workspace to exist');
    }

    const activeWorkspaceResponse = await queryApplicationStoppedState(
      applicationAccessToken,
    );

    expect(activeWorkspaceResponse.body.errors).toBeUndefined();
    expect(activeWorkspaceResponse.body.data.isApplicationStopped).toBe(false);

    await workspaceService.deleteWorkspace(workspaceId, true);

    const normalTokenAfterDeletionResponse = await queryApplicationStoppedState(
      applicationAccessToken,
    );

    expect(normalTokenAfterDeletionResponse.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          extensions: expect.objectContaining({ code: 'UNAUTHENTICATED' }),
          message: 'Workspace not found',
        }),
      ]),
    );
  }, 120000);

  it('accepts a token scoped to the current deletion request', async () => {
    const { deletionToken } =
      await softDeleteWorkspaceAndGenerateDeletionToken();

    const currentDeletionTokenResponse = await queryApplicationStoppedState(
      deletionToken.token,
    );

    expect(currentDeletionTokenResponse.body.errors).toBeUndefined();
    expect(currentDeletionTokenResponse.body.data.isApplicationStopped).toBe(
      false,
    );
  }, 120000);

  it('rejects a deletion token after the deletion request changes', async () => {
    if (!isDefined(workspaceId)) {
      throw new Error('Expected the test workspace to exist');
    }

    const { deletionToken, workspaceDeletionRequestTimestamp } =
      await softDeleteWorkspaceAndGenerateDeletionToken();

    const nextWorkspaceDeletionRequestTimestamp = new Date(
      new Date(workspaceDeletionRequestTimestamp).getTime() + 1000,
    );

    await globalThis.testDataSource.query(
      'UPDATE core."workspace" SET "deletedAt" = $2 WHERE id = $1',
      [workspaceId, nextWorkspaceDeletionRequestTimestamp],
    );

    try {
      const staleDeletionTokenResponse = await queryApplicationStoppedState(
        deletionToken.token,
      );

      expect(staleDeletionTokenResponse.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            extensions: expect.objectContaining({ code: 'FORBIDDEN' }),
            message: 'Workspace deletion request not found',
          }),
        ]),
      );
    } finally {
      await globalThis.testDataSource.query(
        'UPDATE core."workspace" SET "deletedAt" = $2 WHERE id = $1',
        [workspaceId, workspaceDeletionRequestTimestamp],
      );
    }
  }, 120000);
});
