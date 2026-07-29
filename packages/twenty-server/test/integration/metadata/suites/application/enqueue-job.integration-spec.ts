import gql from 'graphql-tag';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { v4 as uuidv4 } from 'uuid';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

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

  beforeAll(async () => {
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

    // Functions created from source belong to the workspace custom application.
    const { data: createData } = await createOneLogicFunction({
      input: { name: `enqueue-job-target-${uuidv4()}` },
      gqlFields: 'id universalIdentifier',
      expectToFail: false,
    });

    expect(createData.createOneLogicFunction.universalIdentifier).toBeDefined();

    logicFunctionId = createData.createOneLogicFunction.id;
    logicFunctionUniversalIdentifier =
      createData.createOneLogicFunction.universalIdentifier!;
  });

  afterAll(async () => {
    await deleteLogicFunction({
      input: { id: logicFunctionId },
      expectToFail: false,
    });
  });

  it('rejects requests that do not carry an APPLICATION_ACCESS token', async () => {
    const response = await makeMetadataAPIRequest({
      query: ENQUEUE_JOB,
      variables: { input: { logicFunctionUniversalIdentifier } },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('APPLICATION_ACCESS');
  });

  it('enqueues a logic function owned by the calling application', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: ENQUEUE_JOB,
        variables: {
          input: {
            logicFunctionUniversalIdentifier,
            payload: { a: 'enqueued', b: 1 },
            priority: 5,
          },
        },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.enqueueJob).toEqual({
      enqueued: true,
      logicFunctionUniversalIdentifier,
    });
  });

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
