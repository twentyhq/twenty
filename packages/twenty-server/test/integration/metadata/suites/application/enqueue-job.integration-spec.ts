import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import gql from 'graphql-tag';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { updateLogicFunctionSource } from 'test/integration/metadata/suites/logic-function/utils/update-logic-function-source.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { v4 as uuidv4 } from 'uuid';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const MARKER_DIRECTORY = join(tmpdir(), `enqueue-job-${uuidv4()}`);

const TARGET_SOURCE_CODE = `import { writeFileSync } from 'node:fs';

export const main = async (params: { markerPath: string }): Promise<object> => {
  writeFileSync(params.markerPath, 'ran', 'utf-8');

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

    const [{ data: createData }, { data: retryableCreateData }] =
      await Promise.all([
        createOneLogicFunction({
          input: { name: `enqueue-job-target-${uuidv4()}` },
          gqlFields: 'id universalIdentifier',
          expectToFail: false,
        }),
        createOneLogicFunction({
          input: { name: `enqueue-job-retryable-target-${uuidv4()}` },
          gqlFields: 'id universalIdentifier',
          expectToFail: false,
        }),
      ]);

    expect(createData.createOneLogicFunction.universalIdentifier).toBeDefined();
    expect(
      retryableCreateData.createOneLogicFunction.universalIdentifier,
    ).toBeDefined();

    logicFunctionId = createData.createOneLogicFunction.id;
    logicFunctionUniversalIdentifier =
      createData.createOneLogicFunction.universalIdentifier!;
    retryableLogicFunctionId = retryableCreateData.createOneLogicFunction.id;
    retryableLogicFunctionUniversalIdentifier =
      retryableCreateData.createOneLogicFunction.universalIdentifier!;

    await updateLogicFunctionSource({
      input: {
        id: retryableLogicFunctionId,
        update: { sourceHandlerCode: RETRYABLE_TARGET_SOURCE_CODE },
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
  });

  afterAll(async () => {
    await Promise.all([
      deleteLogicFunction({
        input: { id: logicFunctionId },
        expectToFail: false,
      }),
      deleteLogicFunction({
        input: { id: retryableLogicFunctionId },
        expectToFail: false,
      }),
    ]);

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
