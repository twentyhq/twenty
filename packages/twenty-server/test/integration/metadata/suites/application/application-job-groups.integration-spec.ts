import gql from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import {
  type JobGroupManifest,
  type LogicFunctionManifest,
  type Manifest,
} from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = 'd1a6c0b2-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'd1a6c0b2-0002-4000-a000-000000000002';
const PACED_LOGIC_FUNCTION_ID = 'd1a6c0b2-0003-4000-a000-000000000003';
const UNPACED_LOGIC_FUNCTION_ID = 'd1a6c0b2-0006-4000-a000-000000000006';

const API_JOB_GROUP: JobGroupManifest = {
  universalIdentifier: 'd1a6c0b2-0004-4000-a000-000000000004',
  name: 'api',
  limiter: { max: 1, durationMs: 60_000 },
};

const BACKFILL_JOB_GROUP: JobGroupManifest = {
  universalIdentifier: 'd1a6c0b2-0007-4000-a000-000000000007',
  name: 'backfill',
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

const buildLogicFunctionManifest = ({
  universalIdentifier,
  jobGroupUniversalIdentifiers,
}: {
  universalIdentifier: string;
  jobGroupUniversalIdentifiers: string[];
}): LogicFunctionManifest => ({
  universalIdentifier,
  name: `Logic function ${universalIdentifier}`,
  handlerName: 'handler',
  sourceHandlerPath: `src/${universalIdentifier}.ts`,
  builtHandlerPath: `dist/${universalIdentifier}.mjs`,
  builtHandlerChecksum: `checksum-${universalIdentifier}`,
  jobGroupUniversalIdentifiers,
});

const buildManifest = ({
  jobGroups,
  jobGroupUniversalIdentifiers,
  overrides,
}: {
  jobGroups: JobGroupManifest[];
  jobGroupUniversalIdentifiers: string[];
  overrides?: Partial<Manifest>;
}): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      ...overrides,
      jobGroups,
      logicFunctions: [
        buildLogicFunctionManifest({
          universalIdentifier: PACED_LOGIC_FUNCTION_ID,
          jobGroupUniversalIdentifiers,
        }),
        buildLogicFunctionManifest({
          universalIdentifier: UNPACED_LOGIC_FUNCTION_ID,
          jobGroupUniversalIdentifiers: [],
        }),
      ],
    },
  });

const readStoredJobGroups = async () => {
  const jobGroups = await globalThis.testDataSource.query(
    `SELECT "jobGroup"."universalIdentifier", "jobGroup".name, "jobGroup".limiter
     FROM core."jobGroup" "jobGroup"
     JOIN core."application" application
       ON application.id = "jobGroup"."applicationId"
     WHERE application."universalIdentifier" = $1
       AND application."workspaceId" = $2
     ORDER BY "jobGroup".name`,
    [TEST_APP_ID, SEED_APPLE_WORKSPACE_ID],
  );
  const [logicFunction] = await globalThis.testDataSource.query(
    `SELECT "jobGroupUniversalIdentifiers"
     FROM core."logicFunction"
     WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [PACED_LOGIC_FUNCTION_ID, SEED_APPLE_WORKSPACE_ID],
  );

  return {
    jobGroups,
    jobGroupUniversalIdentifiers: logicFunction?.jobGroupUniversalIdentifiers,
  };
};

const STORED_JOB_GROUPS = {
  jobGroups: [API_JOB_GROUP, BACKFILL_JOB_GROUP],
  jobGroupUniversalIdentifiers: [API_JOB_GROUP.universalIdentifier],
};

describe('Application job groups', () => {
  let applicationToken: string;

  const enqueueTwoJobs = async ({
    logicFunctionUniversalIdentifier,
    jobGroupUniversalIdentifiers,
  }: {
    logicFunctionUniversalIdentifier: string;
    jobGroupUniversalIdentifiers?: string[];
  }) => {
    const jobIds = [`paced-${uuidv4()}`, `paced-${uuidv4()}`];

    const enqueueResponse = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier,
            jobGroupUniversalIdentifiers,
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

    return jobsResponse.body.data.getJobs.find(
      ({ jobId }: { jobId: string }) => jobId === jobIds[1],
    )?.state;
  };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Job Groups App',
      description: 'App for testing job groups',
      sourcePath: 'test-job-groups',
    });

    await syncApplication({
      manifest: buildManifest({
        jobGroups: [API_JOB_GROUP, BACKFILL_JOB_GROUP],
        jobGroupUniversalIdentifiers: [API_JOB_GROUP.universalIdentifier],
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

  it('stores the job groups of the application and the job groups of its logic functions', async () => {
    expect(await readStoredJobGroups()).toEqual(STORED_JOB_GROUPS);
  });

  it('refuses a manifest whose logic function references an unknown job group', async () => {
    const unknownJobGroupUniversalIdentifier = uuidv4();

    const { errors } = await syncApplication({
      manifest: buildManifest({
        jobGroups: [API_JOB_GROUP, BACKFILL_JOB_GROUP],
        jobGroupUniversalIdentifiers: [unknownJobGroupUniversalIdentifier],
      }),
      expectToFail: true,
    });

    expect(errors[0].message).toContain(
      `references the unknown job group ${unknownJobGroupUniversalIdentifier}`,
    );
    expect(await readStoredJobGroups()).toEqual(STORED_JOB_GROUPS);
  }, 60_000);

  it('keeps the job groups and their logic functions when the metadata sync fails', async () => {
    await syncApplication({
      manifest: buildManifest({
        jobGroups: [],
        jobGroupUniversalIdentifiers: [],
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

    expect(await readStoredJobGroups()).toEqual(STORED_JOB_GROUPS);
  }, 60_000);

  it('refuses to enqueue jobs with a job group that is not in the application', async () => {
    const unknownJobGroupUniversalIdentifier = uuidv4();

    const response = await makeMetadataApiRequest(
      {
        query: ENQUEUE_JOBS,
        variables: {
          input: {
            logicFunctionUniversalIdentifier: UNPACED_LOGIC_FUNCTION_ID,
            jobGroupUniversalIdentifiers: [unknownJobGroupUniversalIdentifier],
            jobs: [{ payload: {} }],
          },
        },
      },
      applicationToken,
    );

    expect(response.body.errors[0].message).toContain(
      `Job groups not found in this application: ${unknownJobGroupUniversalIdentifier}`,
    );
  });

  it('delays the jobs of a logic function by the limiter of its job group', async () => {
    expect(
      await enqueueTwoJobs({
        logicFunctionUniversalIdentifier: PACED_LOGIC_FUNCTION_ID,
      }),
    ).toBe('DELAYED');
  });

  it('delays the jobs of a call by the limiter of the job groups it passes', async () => {
    expect(
      await enqueueTwoJobs({
        logicFunctionUniversalIdentifier: UNPACED_LOGIC_FUNCTION_ID,
      }),
    ).not.toBe('DELAYED');

    expect(
      await enqueueTwoJobs({
        logicFunctionUniversalIdentifier: UNPACED_LOGIC_FUNCTION_ID,
        jobGroupUniversalIdentifiers: [BACKFILL_JOB_GROUP.universalIdentifier],
      }),
    ).toBe('DELAYED');
  });

  it('deletes the job groups the manifest no longer declares', async () => {
    await syncApplication({
      manifest: buildManifest({
        jobGroups: [],
        jobGroupUniversalIdentifiers: [],
      }),
      expectToFail: false,
    });

    expect(await readStoredJobGroups()).toEqual({
      jobGroups: [],
      jobGroupUniversalIdentifiers: [],
    });
  }, 60_000);
});
