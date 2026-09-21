import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { updateLogicFunctionSource } from 'test/integration/metadata/suites/logic-function/utils/update-logic-function-source.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const MARKER_DIRECTORY = join(tmpdir(), `enqueue-job-${uuidv4()}`);

const TARGET_SOURCE_CODE = `import { writeFileSync } from 'node:fs';

export const main = async (params: { markerPath: string }): Promise<object> => {
  writeFileSync(params.markerPath, 'ran', 'utf-8');

  return { ok: true };
};`;

const APPENDING_TARGET_SOURCE_CODE = `import { appendFileSync } from 'node:fs';

export const main = async (params: { markerPath: string }): Promise<object> => {
  appendFileSync(params.markerPath, 'ran\\n', 'utf-8');

  return { ok: true };
};`;

const RETRYABLE_TARGET_SOURCE_CODE = `import { appendFileSync } from 'node:fs';

type RetryableTargetParams = {
  markerPath: string;
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
  appendFileSync(
    params.markerPath,
    context.retryCount + '/' + context.maxRetries + '\\n',
    'utf-8',
  );

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

    const { data: tokenData } = await generateApplicationToken({
      applicationId: otherWorkspaceApplication!.id,
      expectToFail: false,
      token: workspaceAccessToken,
    });

    return tokenData.generateApplicationToken.applicationAccessToken.token;
  };

  beforeAll(async () => {
    mkdirSync(MARKER_DIRECTORY, { recursive: true });

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

    const [{ data: customTokenData }, { data: standardTokenData }] =
      await Promise.all([
        generateApplicationToken({
          applicationId: customApplication!.id,
          expectToFail: false,
        }),
        generateApplicationToken({
          applicationId: standardApplication!.id,
          expectToFail: false,
        }),
      ]);

    customApplicationToken =
      customTokenData.generateApplicationToken.applicationAccessToken.token;
    standardApplicationToken =
      standardTokenData.generateApplicationToken.applicationAccessToken.token;

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
          markerPath: join(MARKER_DIRECTORY, 'retryable-build.txt'),
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
          markerPath: join(MARKER_DIRECTORY, 'appending-build.txt'),
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

    rmSync(MARKER_DIRECTORY, { recursive: true, force: true });
  });

  it('rejects requests that do not carry an APPLICATION_ACCESS token', async () => {
    const response = await makeMetadataAPIRequest({
      query: ENQUEUE_JOB,
      variables: { input: { logicFunctionUniversalIdentifier } },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('APPLICATION_ACCESS');
  });

  it('enqueues a logic function owned by the calling application and the worker runs it', async () => {
    const markerPath = join(MARKER_DIRECTORY, 'enqueued.txt');

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
        payload: { markerPath: join(MARKER_DIRECTORY, 'build.txt') },
      },
      expectToFail: false,
    });

    expect(buildData.executeOneLogicFunction.error).toBeNull();

    const response = await makeMetadataAPIRequest(
      {
        query: ENQUEUE_JOB,
        variables: {
          input: { logicFunctionUniversalIdentifier, payload: { markerPath } },
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
      expect(existsSync(markerPath)).toBe(true);
    });
  });

  it('caps application-requested retries independently from the overall queue budget', async () => {
    const markerPath = join(MARKER_DIRECTORY, 'application-retry-cap.txt');

    const response = await makeMetadataAPIRequest(
      {
        query: ENQUEUE_JOB,
        variables: {
          input: {
            logicFunctionUniversalIdentifier:
              retryableLogicFunctionUniversalIdentifier,
            payload: { markerPath, shouldRetry: true },
            retryLimit: 10,
          },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.enqueueJob.enqueued).toBe(true);

    await waitForAllJobsToFinish();

    expect(readFileSync(markerPath, 'utf-8').trim().split('\n')).toEqual([
      '0/3',
      '1/3',
      '2/3',
      '3/3',
    ]);
  }, 60_000);

  it('uses a smaller overall queue budget as the application retry maximum', async () => {
    const markerPath = join(MARKER_DIRECTORY, 'queue-retry-cap.txt');

    const response = await makeMetadataAPIRequest(
      {
        query: ENQUEUE_JOB,
        variables: {
          input: {
            logicFunctionUniversalIdentifier:
              retryableLogicFunctionUniversalIdentifier,
            payload: { markerPath, shouldRetry: true },
            retryLimit: 1,
          },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.enqueueJob.enqueued).toBe(true);

    await waitForAllJobsToFinish();

    expect(readFileSync(markerPath, 'utf-8').trim().split('\n')).toEqual([
      '0/1',
      '1/1',
    ]);
  }, 60_000);

  it('rejects a logic function that belongs to another application', async () => {
    const response = await makeMetadataAPIRequest(
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
    const response = await makeMetadataAPIRequest(
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
    const markerPaths = [
      join(MARKER_DIRECTORY, 'batch-0.txt'),
      join(MARKER_DIRECTORY, 'batch-1.txt'),
    ];

    const response = await makeMetadataAPIRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier,
            payloads: markerPaths.map((markerPath) => ({ markerPath })),
          },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.enqueueJobs).toEqual({
      enqueued: true,
      logicFunctionUniversalIdentifier,
      enqueuedJobsCount: markerPaths.length,
      jobIds: markerPaths.map(() => expect.any(String)),
    });

    await waitForAllJobsToFinish();

    await expectEventually(() => {
      for (const markerPath of markerPaths) {
        expect(existsSync(markerPath)).toBe(true);
      }
    });
  });

  it('rejects a batch targeting an unknown logic function', async () => {
    const response = await makeMetadataAPIRequest(
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
    const response = await makeMetadataAPIRequest(
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
    const markerPath = join(MARKER_DIRECTORY, 'job-status.txt');
    const jobId = `job-status-${uuidv4()}`;

    const enqueueResponse = await makeMetadataAPIRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier,
            jobs: [{ payload: { markerPath }, jobId }],
          },
        },
      },
      customApplicationToken,
    );

    expect(enqueueResponse.body.errors).toBeUndefined();
    expect(enqueueResponse.body.data.enqueueJobs.jobIds).toEqual([jobId]);

    await waitForAllJobsToFinish();

    const statusResponse = await makeMetadataAPIRequest(
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
    const response = await makeMetadataAPIRequest(
      { query: GET_JOBS, variables: { jobIds: [uuidv4()] } },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getJobs).toEqual([]);
  });

  it('does not run a caller-supplied job id a second time', async () => {
    const markerPath = join(MARKER_DIRECTORY, 'idempotent.txt');
    const jobId = `idempotent-${uuidv4()}`;
    const variables = {
      input: {
        logicFunctionUniversalIdentifier:
          appendingLogicFunctionUniversalIdentifier,
        jobs: [{ payload: { markerPath }, jobId }],
      },
    };

    const firstResponse = await makeMetadataAPIRequest(
      { query: ENQUEUE_JOBS, variables },
      customApplicationToken,
    );

    expect(firstResponse.body.errors).toBeUndefined();
    expect(firstResponse.body.data.enqueueJobs.jobIds).toEqual([jobId]);

    await waitForAllJobsToFinish();

    await expectEventually(() => {
      expect(existsSync(markerPath)).toBe(true);
    });

    const secondResponse = await makeMetadataAPIRequest(
      { query: ENQUEUE_JOBS, variables },
      customApplicationToken,
    );

    expect(secondResponse.body.errors).toBeUndefined();
    expect(secondResponse.body.data.enqueueJobs.jobIds).toEqual([jobId]);

    await waitForAllJobsToFinish();

    expect(readFileSync(markerPath, 'utf-8').trim().split('\n')).toEqual([
      'ran',
    ]);
  }, 60_000);

  it('does not expose a job to another workspace', async () => {
    const markerPath = join(MARKER_DIRECTORY, 'cross-workspace.txt');
    const jobId = `cross-workspace-${uuidv4()}`;

    const enqueueResponse = await makeMetadataAPIRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier,
            jobs: [{ payload: { markerPath }, jobId }],
          },
        },
      },
      customApplicationToken,
    );

    expect(enqueueResponse.body.errors).toBeUndefined();

    await waitForAllJobsToFinish();

    await expectEventually(() => {
      expect(existsSync(markerPath)).toBe(true);
    });

    const ownWorkspaceResponse = await makeMetadataAPIRequest(
      { query: GET_JOBS, variables: { jobIds: [jobId] } },
      customApplicationToken,
    );

    expect(ownWorkspaceResponse.body.errors).toBeUndefined();
    expect(ownWorkspaceResponse.body.data.getJobs).toHaveLength(1);

    const otherWorkspaceApplicationToken =
      await createOtherWorkspaceApplicationToken();

    const otherWorkspaceResponse = await makeMetadataAPIRequest(
      { query: GET_JOBS, variables: { jobIds: [jobId] } },
      otherWorkspaceApplicationToken,
    );

    expect(otherWorkspaceResponse.body.errors).toBeUndefined();
    expect(otherWorkspaceResponse.body.data.getJobs).toEqual([]);
  }, 120_000);

  it('rejects a batch that repeats a caller-supplied job id', async () => {
    const jobId = `duplicate-${uuidv4()}`;

    const response = await makeMetadataAPIRequest(
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
    const response = await makeMetadataAPIRequest(
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
    const response = await makeMetadataAPIRequest(
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
