import { randomUUID } from 'crypto';

import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createOneCronTrigger } from 'test/integration/metadata/suites/serverless-function/utils/create-one-cron-trigger.util';
import { createOneDatabaseEventTrigger } from 'test/integration/metadata/suites/serverless-function/utils/create-one-database-event-trigger.util';
import { createOneRouteTrigger } from 'test/integration/metadata/suites/serverless-function/utils/create-one-route-trigger.util';
import { createOneServerlessFunction } from 'test/integration/metadata/suites/serverless-function/utils/create-one-serverless-function.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';
import { HTTPMethod } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

describe('Successful user and workspace creation', () => {
  let createdUserAccessToken: string | undefined;

  afterEach(async () => {
    if (!isDefined(createdUserAccessToken)) {
      return;
    }

    await deleteUser({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });
  });

  beforeAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_CREATION_V2_ENABLED,
      value: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_CREATION_V2_ENABLED,
      value: true,
    });
  });

  it('should sign up a new user and create a new workspace successfully', async () => {
    const uniqueEmail = `test-${randomUUID()}@example.com`;

    const { data } = await signUp({
      input: {
        email: uniqueEmail,
        password: 'Test123!@#',
      },

      expectToFail: false,
    });

    createdUserAccessToken =
      data.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    // Mark email as verified to bypass email verification requirement
    await testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [uniqueEmail],
    );

    const {
      data: { signUpInNewWorkspace: signUpInNewWorkspaceData },
    } = await signUpInNewWorkspace({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    const {
      data: { getAuthTokensFromLoginToken: authTokensData },
    } = await getAuthTokensFromLoginToken({
      origin: signUpInNewWorkspaceData.workspace.workspaceUrls.subdomainUrl,
      loginToken: signUpInNewWorkspaceData.loginToken.token,
      expectToFail: false,
    });

    const newWorkspaceAccessToken =
      authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

    const {
      data: { activateWorkspace: activateWorkspaceData },
    } = await activateWorkspace({
      accessToken: newWorkspaceAccessToken,
      displayName: '42 answer',
      expectToFail: false,
    });

    expect(activateWorkspaceData.activationStatus).toBe(
      WorkspaceActivationStatus.ACTIVE,
    );

    const {
      data: { currentUser },
    } = await getCurrentUser({
      accessToken: newWorkspaceAccessToken,
      expectToFail: false,
    });

    jestExpectToBeDefined(currentUser.currentWorkspace);
    const { inviteHash: _, ...expectedCurrentWorkspace } =
      activateWorkspaceData;

    jestExpectToBeDefined(currentUser.currentWorkspace);
    expect(currentUser.currentWorkspace).toMatchObject(
      expectedCurrentWorkspace,
    );

    const {
      data: { findManyApplications: findManyApplicationsData },
    } = await findManyApplications({
      accessToken: newWorkspaceAccessToken,
      expectToFail: false,
    });

    expect(findManyApplicationsData.length).toBe(2);
    const twentyStandardApp = findManyApplicationsData.find(
      (application) =>
        application.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );

    jestExpectToBeDefined(twentyStandardApp);
    const {
      sourcePath: _sourcePath,
      sourceType: _sourceType,
      ...expectedStandardTwentyApplication
    } = TWENTY_STANDARD_APPLICATION;

    expect(twentyStandardApp).toMatchObject(expectedStandardTwentyApplication);

    const workpsaceCustomApplication = findManyApplicationsData.find(
      (application) =>
        application.id ===
        currentUser.currentWorkspace?.workspaceCustomApplicationId,
    );

    jestExpectToBeDefined(workpsaceCustomApplication);
    expect(workpsaceCustomApplication.universalIdentifier).toEqual(
      workpsaceCustomApplication.id,
    );
  });

  it('should delete workspace and related metadata entities when last user is deleted', async () => {
    const uniqueEmail = `test-delete-${randomUUID()}@example.com`;

    const { data } = await signUp({
      input: {
        email: uniqueEmail,
        password: 'Test123!@#',
      },
      expectToFail: false,
    });

    createdUserAccessToken =
      data.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    // Mark email as verified to bypass email verification requirement
    await testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [uniqueEmail],
    );

    const {
      data: { signUpInNewWorkspace: signUpInNewWorkspaceData },
    } = await signUpInNewWorkspace({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    const workspaceId = signUpInNewWorkspaceData.workspace.id;

    const {
      data: { getAuthTokensFromLoginToken: authTokensData },
    } = await getAuthTokensFromLoginToken({
      origin: signUpInNewWorkspaceData.workspace.workspaceUrls.subdomainUrl,
      loginToken: signUpInNewWorkspaceData.loginToken.token,
      expectToFail: false,
    });

    const newWorkspaceAccessToken =
      authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

    await activateWorkspace({
      accessToken: newWorkspaceAccessToken,
      displayName: 'Test Workspace for Deletion',
      expectToFail: false,
    });

    await createOneObjectMetadata({
      input: {
        nameSingular: 'workspaceEviction',
        namePlural: 'workspaceEvictions',
        labelPlural: 'whatevers',
        labelSingular: 'whatever',
        isLabelSyncedWithName: false,
      },
      token: newWorkspaceAccessToken,
      expectToFail: false,
    });

    // Create a serverless function with route, cron, and database event triggers
    const {
      data: { createOneServerlessFunction: serverlessFunction },
    } = await createOneServerlessFunction({
      input: {
        name: 'test-function-for-deletion',
        description: 'A test serverless function for workspace deletion test',
      },
      token: newWorkspaceAccessToken,
      expectToFail: false,
    });

    // Create a route trigger for the serverless function
    await createOneRouteTrigger({
      input: {
        path: '/test-route-for-deletion',
        isAuthRequired: true,
        httpMethod: HTTPMethod.GET,
        serverlessFunctionId: serverlessFunction.id,
      },
      token: newWorkspaceAccessToken,
      expectToFail: false,
    });

    // Create a cron trigger for the serverless function
    await createOneCronTrigger({
      input: {
        settings: {
          pattern: '0 0 * * *',
        },
        serverlessFunctionId: serverlessFunction.id,
      },
      token: newWorkspaceAccessToken,
      expectToFail: false,
    });

    // Create a database event trigger for the serverless function
    await createOneDatabaseEventTrigger({
      input: {
        settings: {
          eventName: 'company.created',
        },
        serverlessFunctionId: serverlessFunction.id,
      },
      token: newWorkspaceAccessToken,
      expectToFail: false,
    });

    const workspaceBeforeDeletion = await testDataSource.query(
      'SELECT * FROM core.workspace WHERE id = $1',
      [workspaceId],
    );

    expect(workspaceBeforeDeletion).toHaveLength(1);

    const tablesToVerify = [
      'dataSource',
      'objectMetadata',
      'fieldMetadata',
      'indexMetadata',
      'searchFieldMetadata',
      'workspaceMigration',
      'role',
      'roleTarget',
      'objectPermission',
      'fieldPermission',
      'permissionFlag',
      'serverlessFunction',
      'serverlessFunctionLayer',
      'agent',
      'remoteServer',
      'remoteTable',
      'databaseEventTrigger',
      'view',
      'viewField',
      'viewFilter',
      'viewFilterGroup',
      'viewGroup',
      'viewSort',
      'cronTrigger',
      'routeTrigger',
    ];

    let totalRecordsBefore = 0;

    for (const table of tablesToVerify) {
      const result = await testDataSource.query(
        `SELECT COUNT(*) as count FROM core."${table}" WHERE "workspaceId" = $1`,
        [workspaceId],
      );

      totalRecordsBefore += parseInt(result[0].count);
    }

    expect(totalRecordsBefore).toBeGreaterThan(0);

    await deleteUser({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    createdUserAccessToken = undefined;

    const workspaceAfterDeletion = await testDataSource.query(
      'SELECT * FROM core.workspace WHERE id = $1',
      [workspaceId],
    );

    expect(workspaceAfterDeletion).toHaveLength(0);

    for (const table of tablesToVerify) {
      const result = await testDataSource.query(
        `SELECT COUNT(*) as count FROM core."${table}" WHERE "workspaceId" = $1`,
        [workspaceId],
      );
      const count = parseInt(result[0].count);

      expect({ count, table }).toEqual({ count: 0, table });
    }
  });
});
