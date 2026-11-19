import gql from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import {
  type JobConfigManifest,
  type Manifest,
} from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = 'd1a6c0b2-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'd1a6c0b2-0002-4000-a000-000000000002';
const TEST_LOGIC_FUNCTION_ID = 'd1a6c0b2-0003-4000-a000-000000000003';

const API_JOB_CONFIG: JobConfigManifest = {
  universalIdentifier: 'd1a6c0b2-0004-4000-a000-000000000004',
  key: 'api',
  limiter: { max: 1, durationMs: 60_000 },
};

const ENQUEUE_JOBS = gql`
  mutation EnqueueJobs($input: EnqueueJobsInput!) {
    enqueueJobs(input: $input) {
      jobIds
    }
  }
`;

const GET_JOBS = gql`
  query GetJobs($jobIds: [String!]!) {
    getJobs(jobIds: $jobIds) {
      jobId
      state
    }
  }
`;

const buildManifest = ({
  jobConfigs,
  jobConfigKeys,
  overrides,
}: {
  jobConfigs: JobConfigManifest[];
  jobConfigKeys: string[];
  overrides?: Partial<Manifest>;
}): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      ...overrides,
      jobConfigs,
      logicFunctions: [
        {
          universalIdentifier: TEST_LOGIC_FUNCTION_ID,
          name: 'Call the API',
          handlerName: 'handler',
          sourceHandlerPath: 'src/call-api.ts',
          builtHandlerPath: 'dist/call-api.mjs',
          builtHandlerChecksum: 'checksum-call-api',
          jobConfigKeys,
        },
      ],
    },
  });

const readStoredJobConfigs = async () => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT application."jobConfigs", "logicFunction"."jobConfigKeys"
     FROM core."application" application
     JOIN core."logicFunction" "logicFunction"
       ON "logicFunction"."applicationId" = application.id
     WHERE application."universalIdentifier" = $1
       AND application."workspaceId" = $2
       AND "logicFunction"."universalIdentifier" = $3`,
    [TEST_APP_ID, SEED_APPLE_WORKSPACE_ID, TEST_LOGIC_FUNCTION_ID],
  );

  return row;
};

describe('Application job configs', () => {
  let applicationToken: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Job Configs App',
      description: 'App for testing job configs',
      sourcePath: 'test-job-configs',
    });

    await syncApplication({
      manifest: buildManifest({
        jobConfigs: [API_JOB_CONFIG],
        jobConfigKeys: ['api'],
      }),
      expectToFail: false,
    });

    const [{ id: applicationId }] = await globalThis.testDataSource.query(
      `SELECT id FROM core."application"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [TEST_APP_ID, SEED_APPLE_WORKSPACE_ID],
    );

    const tokenPair = await generateAppleAdminApplicationTokenPair({
      applicationId,
    });

    applicationToken = tokenPair.applicationAccessToken.token;
  }, 60_000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('stores the job configs of the application and the keys of its logic functions', async () => {
    expect(await readStoredJobConfigs()).toEqual({
      jobConfigs: [API_JOB_CONFIG],
      jobConfigKeys: ['api'],
    });
  });

  it('refuses a manifest whose logic function references an unknown job config key', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        jobConfigs: [API_JOB_CONFIG],
        jobConfigKeys: ['unknown'],
      }),
      expectToFail: true,
    });

    expect(errors[0].message).toContain(
      'references the unknown job config key "unknown"',
    );
    expect(await readStoredJobConfigs()).toEqual({
      jobConfigs: [API_JOB_CONFIG],
      jobConfigKeys: ['api'],
    });
  }, 60_000);

  it('keeps the job configs of the logic functions when the metadata sync fails', async () => {
    await syncApplication({
      manifest: buildManifest({
        jobConfigs: [],
        jobConfigKeys: [],
        overrides: {
          navigationMenuItems: [
            {
              universalIdentifier: 'd1a6c0b2-0005-4000-a000-000000000005',
              type: NavigationMenuItemType.LINK,
              position: 0,
              name: 'Link without url',
            },
          ],
        },
      }),
      expectToFail: true,
    });

    expect(await readStoredJobConfigs()).toEqual({
      jobConfigs: [API_JOB_CONFIG],
      jobConfigKeys: ['api'],
    });
  }, 60_000);

  it('refuses to enqueue a job with an unknown job config key', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier: TEST_LOGIC_FUNCTION_ID,
            jobs: [{ payload: {}, jobConfigKey: 'unknown' }],
          },
        },
      },
      applicationToken,
    );

    expect(response.body.errors[0].message).toContain(
      'Unknown job config keys: unknown',
    );
  });

  it('delays the jobs of a logic function by the limiter of its job config', async () => {
    const jobIds = [`paced-${uuidv4()}`, `paced-${uuidv4()}`];

    const enqueueResponse = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier: TEST_LOGIC_FUNCTION_ID,
            jobs: jobIds.map((jobId) => ({ payload: {}, jobId })),
          },
        },
      },
      applicationToken,
    );

    expect(enqueueResponse.body.errors).toBeUndefined();

    const jobsResponse = await makeMetadataApiRequest(
      { query: GET_JOBS, variables: { jobIds } },
      applicationToken,
    );

    expect(
      jobsResponse.body.data.getJobs.find(
        ({ jobId }: { jobId: string }) => jobId === jobIds[1],
      )?.state,
    ).toBe('DELAYED');
  });

  it('drops a job config once no logic function uses it', async () => {
    await syncApplication({
      manifest: buildManifest({ jobConfigs: [], jobConfigKeys: [] }),
      expectToFail: false,
    });

    expect(await readStoredJobConfigs()).toEqual({
      jobConfigs: [],
      jobConfigKeys: [],
    });
  }, 60_000);
});
