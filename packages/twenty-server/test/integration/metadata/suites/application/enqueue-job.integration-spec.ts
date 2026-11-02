import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { updateLogicFunctionSource } from 'test/integration/metadata/suites/logic-function/utils/update-logic-function-source.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { type MarkerServer } from 'test/integration/types/marker-server.type';
import { startMarkerServer } from 'test/integration/utils/start-marker-server.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import { AUTH_PRINCIPAL_REFUSED_MESSAGE } from 'src/engine/guards/constants/auth-principal-refused-message.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

let markerServer: MarkerServer;

const TARGET_SOURCE_CODE = `export const main = async (params: { markerUrl: string }): Promise<object> => {
  await fetch(params.markerUrl, { method: 'POST', body: 'ran' });

  return { ok: true };
};`;

const APPENDING_TARGET_SOURCE_CODE = `export const main = async (params: { markerUrl: string }): Promise<object> => {
  await fetch(params.markerUrl, { method: 'POST', body: 'ran\\n' });

  return { ok: true };
};`;

const RETRYABLE_TARGET_SOURCE_CODE = `type RetryableTargetParams = {
  markerUrl: string;
  shouldRetry: boolean;
};

type RetryContext = {
  retryCount: number;
  maxRetries: number;
};

export const main = async (
  params: RetryableTargetParams,
  context: RetryContext,
): Promise<object> => {
  await fetch(params.markerUrl, {
    method: 'POST',
    body: context.retryCount + '/' + context.maxRetries + '\\n',
  });

  if (params.shouldRetry) {
    const retryableError = new Error('Dependency is temporarily unavailable');

    retryableError.name = 'RetryableLogicFunctionError';

    throw retryableError;
  }

  return { ok: true };
};`;

const ENQUEUE_JOB = gql`
  mutation EnqueueJob($input: EnqueueJobInput!) {
    enqueueJob(input: $input) {
      enqueued
      logicFunctionUniversalIdentifier
      jobId
    }
  }
`;

const ENQUEUE_JOBS = gql`
  mutation EnqueueJobs($input: EnqueueJobsInput!) {
    enqueueJobs(input: $input) {
      enqueued
      logicFunctionUniversalIdentifier
      enqueuedJobsCount
      jobIds
    }
  }
`;

const GET_JOBS = gql`
  query GetJobs($jobIds: [String!]!) {
    getJobs(jobIds: $jobIds) {
      jobId
      state
      attemptsMade
      failedReason
      enqueuedAt
      startedAt
      finishedAt
    }
  }
`;

describe('enqueueJob (e2e)', () => {
  let customApplicationToken: string;
  let standardApplicationToken: string;
  let logicFunctionId: string;
  let logicFunctionUniversalIdentifier: string;
  let retryableLogicFunctionId: string;
  let retryableLogicFunctionUniversalIdentifier: string;
  let appendingLogicFunctionId: string;
  let appendingLogicFunctionUniversalIdentifier: string;
  let otherWorkspaceUserAccessToken: string | undefined;

  const createOtherWorkspaceApplicationToken = async () => {
    const email = `enqueue-job-other-workspace-${randomUUID()}@example.com`;

    const { data: signUpData } = await signUp({
      input: { email, password: 'Test123!@#' },
      expectToFail: false,
    });

    otherWorkspaceUserAccessToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    await globalThis.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [email],
    );

    const { data: newWorkspaceData } = await signUpInNewWorkspace({
      accessToken: otherWorkspaceUserAccessToken,
      expectToFail: false,
    });

    const { data: authTokensData } = await getAuthTokensFromLoginToken({
      loginToken: newWorkspaceData.signUpInNewWorkspace.loginToken.token,
      origin:
        newWorkspaceData.signUpInNewWorkspace.workspace.workspaceUrls
          .subdomainUrl,
      expectToFail: false,
    });

    const workspaceAccessToken =
      authTokensData.getAuthTokensFromLoginToken.tokens
        .accessOrWorkspaceAgnosticToken.token;

    await activateWorkspace({
      accessToken: workspaceAccessToken,
      expectToFail: false,
    });

    const { data: applicationsData } = await findManyApplications({
      accessToken: workspaceAccessToken,
      expectToFail: false,
    });

    const otherWorkspaceApplication =
      applicationsData.findManyApplications.find(
        (application) => application.name === WORKSPACE_CUSTOM_APPLICATION_NAME,
      );

    expect(otherWorkspaceApplication).toBeDefined();

    const tokenPair = await generateApplicationTokenPair({
      workspaceId: newWorkspaceData.signUpInNewWorkspace.workspace.id,
      applicationId: otherWorkspaceApplication!.id,
    });

    return tokenPair.applicationAccessToken.token;
  };

  beforeAll(async () => {
    markerServer = await startMarkerServer();

    const { data } = await findManyApplications({ expectToFail: false });

    const customApplication = data.findManyApplications.find(
      (application) => application.name === WORKSPACE_CUSTOM_APPLICATION_NAME,
    );
    const standardApplication = data.findManyApplications.find(
      (application) =>
        application.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );

    expect(customApplication).toBeDefined();
    expect(standardApplication).toBeDefined();

    const [customTokenPair, standardTokenPair] = await Promise.all([
      generateAppleAdminApplicationTokenPair({
        applicationId: customApplication!.id,
      }),
      generateAppleAdminApplicationTokenPair({
        applicationId: standardApplication!.id,
      }),
    ]);

    customApplicationToken = customTokenPair.applicationAccessToken.token;
    standardApplicationToken = standardTokenPair.applicationAccessToken.token;

    const { data: createData } = await createOneLogicFunction({
      input: { name: `enqueue-job-target-${uuidv4()}` },
      gqlFields: 'id universalIdentifier',
      expectToFail: false,
    });
    const { data: retryableCreateData } = await createOneLogicFunction({
      input: { name: `enqueue-job-retryable-target-${uuidv4()}` },
      gqlFields: 'id universalIdentifier',
      expectToFail: false,
    });
    const { data: appendingCreateData } = await createOneLogicFunction({
      input: { name: `enqueue-job-appending-target-${uuidv4()}` },
      gqlFields: 'id universalIdentifier',
      expectToFail: false,
    });

    expect(createData.createOneLogicFunction.universalIdentifier).toBeDefined();
    expect(
      retryableCreateData.createOneLogicFunction.universalIdentifier,
    ).toBeDefined();
    expect(
      appendingCreateData.createOneLogicFunction.universalIdentifier,
    ).toBeDefined();

    logicFunctionId = createData.createOneLogicFunction.id;
    logicFunctionUniversalIdentifier =
      createData.createOneLogicFunction.universalIdentifier!;
    retryableLogicFunctionId = retryableCreateData.createOneLogicFunction.id;
    retryableLogicFunctionUniversalIdentifier =
      retryableCreateData.createOneLogicFunction.universalIdentifier!;
    appendingLogicFunctionId = appendingCreateData.createOneLogicFunction.id;
    appendingLogicFunctionUniversalIdentifier =
      appendingCreateData.createOneLogicFunction.universalIdentifier!;

    await updateLogicFunctionSource({
      input: {
        id: retryableLogicFunctionId,
        update: { sourceHandlerCode: RETRYABLE_TARGET_SOURCE_CODE },
      },
      expectToFail: false,
    });

    await updateLogicFunctionSource({
      input: {
        id: appendingLogicFunctionId,
        update: { sourceHandlerCode: APPENDING_TARGET_SOURCE_CODE },
      },
      expectToFail: false,
    });

    const { data: retryableBuildData } = await executeLogicFunction({
      input: {
        id: retryableLogicFunctionId,
        payload: {
          markerUrl: markerServer.markerUrl('retryable-build'),
          shouldRetry: false,
        },
      },
      expectToFail: false,
    });

    expect(retryableBuildData.executeOneLogicFunction.error).toBeNull();

    const { data: appendingBuildData } = await executeLogicFunction({
      input: {
        id: appendingLogicFunctionId,
        payload: {
          markerUrl: markerServer.markerUrl('appending-build'),
        },
      },
      expectToFail: false,
    });

    expect(appendingBuildData.executeOneLogicFunction.error).toBeNull();
  });

  afterAll(async () => {
    const teardownErrors: unknown[] = [];

    for (const id of [
      logicFunctionId,
      retryableLogicFunctionId,
      appendingLogicFunctionId,
    ]) {
      try {
        await deleteLogicFunction({ input: { id }, expectToFail: false });
      } catch (error) {
        teardownErrors.push(error);
      }
    }

    if (teardownErrors.length > 0) {
      throw teardownErrors[0];
    }

    if (isDefined(otherWorkspaceUserAccessToken)) {
      await deleteUser({ accessToken: otherWorkspaceUserAccessToken });
    }

    await markerServer.close();
  });

  it('rejects requests that do not carry an APPLICATION_ACCESS token', async () => {
    const response = await makeMetadataApiRequest({
      query: ENQUEUE_JOB,
      variables: { input: { logicFunctionUniversalIdentifier } },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(response.body.errors[0].message).toBe(
      AUTH_PRINCIPAL_REFUSED_MESSAGE,
    );
  });

  it('enqueues a logic function owned by the calling application and the worker runs it', async () => {
    const markerUrl = markerServer.markerUrl('enqueued');

    await updateLogicFunctionSource({
      input: {
        id: logicFunctionId,
        update: { sourceHandlerCode: TARGET_SOURCE_CODE },
      },
      expectToFail: false,
    });

    const { data: buildData } = await executeLogicFunction({
      input: {
        id: logicFunctionId,
        payload: { markerUrl: markerServer.markerUrl('build') },
      },
      expectToFail: false,
    });

    expect(buildData.executeOneLogicFunction.error).toBeNull();

    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOB,
        variables: {
          input: { logicFunctionUniversalIdentifier, payload: { markerUrl } },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.enqueueJob).toEqual({
      enqueued: true,
      logicFunctionUniversalIdentifier,
      jobId: expect.any(String),
    });

    await waitForAllJobsToFinish();

    await expectEventually(() => {
      expect(markerServer.hasMarker(markerUrl)).toBe(true);
    });
  });

  it('caps application-requested retries independently from the overall queue budget', async () => {
    const markerUrl = markerServer.markerUrl('application-retry-cap');

    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOB,
        variables: {
          input: {
            logicFunctionUniversalIdentifier:
              retryableLogicFunctionUniversalIdentifier,
            payload: { markerUrl, shouldRetry: true },
            retryLimit: 10,
          },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.enqueueJob.enqueued).toBe(true);

    await waitForAllJobsToFinish();

    expect(markerServer.readMarker(markerUrl).trim().split('\n')).toEqual([
      '0/3',
      '1/3',
      '2/3',
      '3/3',
    ]);
  }, 60_000);

  it('uses a smaller overall queue budget as the application retry maximum', async () => {
    const markerUrl = markerServer.markerUrl('queue-retry-cap');

    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOB,
        variables: {
          input: {
            logicFunctionUniversalIdentifier:
              retryableLogicFunctionUniversalIdentifier,
            payload: { markerUrl, shouldRetry: true },
            retryLimit: 1,
          },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.enqueueJob.enqueued).toBe(true);

    await waitForAllJobsToFinish();

    expect(markerServer.readMarker(markerUrl).trim().split('\n')).toEqual([
      '0/1',
      '1/1',
    ]);
  }, 60_000);

  it('rejects a logic function that belongs to another application', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOB,
        variables: {
          input: { logicFunctionUniversalIdentifier },
        },
      },
      standardApplicationToken,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('not found');
  });

  it('rejects an unknown logic function', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOB,
        variables: {
          input: { logicFunctionUniversalIdentifier: uuidv4() },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('not found');
  });

  it('enqueues a batch of payloads in a single call and the worker runs them all', async () => {
    const markerUrls = [
      markerServer.markerUrl('batch-0'),
      markerServer.markerUrl('batch-1'),
    ];

    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier,
            payloads: markerUrls.map((markerUrl) => ({ markerUrl })),
          },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.enqueueJobs).toEqual({
      enqueued: true,
      logicFunctionUniversalIdentifier,
      enqueuedJobsCount: markerUrls.length,
      jobIds: markerUrls.map(() => expect.any(String)),
    });

    await waitForAllJobsToFinish();

    await expectEventually(() => {
      for (const markerUrl of markerUrls) {
        expect(markerServer.hasMarker(markerUrl)).toBe(true);
      }
    });
  });

  it('rejects a batch targeting an unknown logic function', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier: uuidv4(),
            payloads: [{}],
          },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('not found');
  });

  it('rejects an empty batch', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: { logicFunctionUniversalIdentifier, payloads: [] },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('payloads');
  });

  it('reports a caller-supplied job id as completed once the worker ran it', async () => {
    const markerUrl = markerServer.markerUrl('job-status');
    const jobId = `job-status-${uuidv4()}`;

    const enqueueResponse = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier,
            jobs: [{ payload: { markerUrl }, jobId }],
          },
        },
      },
      customApplicationToken,
    );

    expect(enqueueResponse.body.errors).toBeUndefined();
    expect(enqueueResponse.body.data.enqueueJobs.jobIds).toEqual([jobId]);

    await waitForAllJobsToFinish();

    const statusResponse = await makeMetadataApiRequest(
      { query: GET_JOBS, variables: { jobIds: [jobId] } },
      customApplicationToken,
    );

    expect(statusResponse.body.errors).toBeUndefined();
    expect(statusResponse.body.data.getJobs).toHaveLength(1);
    expect(statusResponse.body.data.getJobs[0]).toMatchObject({
      jobId,
      state: 'COMPLETED',
    });
  });

  it('omits unknown job ids instead of failing the whole read', async () => {
    const response = await makeMetadataApiRequest(
      { query: GET_JOBS, variables: { jobIds: [uuidv4()] } },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getJobs).toEqual([]);
  });

  it('does not run a caller-supplied job id a second time', async () => {
    const markerUrl = markerServer.markerUrl('idempotent');
    const jobId = `idempotent-${uuidv4()}`;
    const variables = {
      input: {
        logicFunctionUniversalIdentifier:
          appendingLogicFunctionUniversalIdentifier,
        jobs: [{ payload: { markerUrl }, jobId }],
      },
    };

    const firstResponse = await makeMetadataApiRequest(
      { query: ENQUEUE_JOBS, variables },
      customApplicationToken,
    );

    expect(firstResponse.body.errors).toBeUndefined();
    expect(firstResponse.body.data.enqueueJobs.jobIds).toEqual([jobId]);

    await waitForAllJobsToFinish();

    await expectEventually(() => {
      expect(markerServer.hasMarker(markerUrl)).toBe(true);
    });

    const secondResponse = await makeMetadataApiRequest(
      { query: ENQUEUE_JOBS, variables },
      customApplicationToken,
    );

    expect(secondResponse.body.errors).toBeUndefined();
    expect(secondResponse.body.data.enqueueJobs.jobIds).toEqual([jobId]);

    await waitForAllJobsToFinish();

    expect(markerServer.readMarker(markerUrl).trim().split('\n')).toEqual([
      'ran',
    ]);
  }, 60_000);

  it('does not expose a job to another workspace', async () => {
    const markerUrl = markerServer.markerUrl('cross-workspace');
    const jobId = `cross-workspace-${uuidv4()}`;

    const enqueueResponse = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier,
            jobs: [{ payload: { markerUrl }, jobId }],
          },
        },
      },
      customApplicationToken,
    );

    expect(enqueueResponse.body.errors).toBeUndefined();

    await waitForAllJobsToFinish();

    await expectEventually(() => {
      expect(markerServer.hasMarker(markerUrl)).toBe(true);
    });

    const ownWorkspaceResponse = await makeMetadataApiRequest(
      { query: GET_JOBS, variables: { jobIds: [jobId] } },
      customApplicationToken,
    );

    expect(ownWorkspaceResponse.body.errors).toBeUndefined();
    expect(ownWorkspaceResponse.body.data.getJobs).toHaveLength(1);

    const otherWorkspaceApplicationToken =
      await createOtherWorkspaceApplicationToken();

    const otherWorkspaceResponse = await makeMetadataApiRequest(
      { query: GET_JOBS, variables: { jobIds: [jobId] } },
      otherWorkspaceApplicationToken,
    );

    expect(otherWorkspaceResponse.body.errors).toBeUndefined();
    expect(otherWorkspaceResponse.body.data.getJobs).toEqual([]);
  }, 120_000);

  it('rejects a batch that repeats a caller-supplied job id', async () => {
    const jobId = `duplicate-${uuidv4()}`;

    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier,
            jobs: [
              { payload: {}, jobId },
              { payload: {}, jobId },
            ],
          },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('unique');
  });

  it('rejects a batch that sets both payloads and jobs', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier,
            payloads: [{}],
            jobs: [{ payload: {} }],
          },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('not both');
  });

  it('rejects job options outside of their allowed range', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOB,
        variables: {
          input: { logicFunctionUniversalIdentifier, retryLimit: 99 },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('retryLimit');
  });
});
