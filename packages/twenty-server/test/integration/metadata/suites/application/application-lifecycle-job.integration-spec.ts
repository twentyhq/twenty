import { Queue } from 'bullmq';
import gql from 'graphql-tag';
import IORedis from 'ioredis';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { v4 as uuidv4 } from 'uuid';

import { JobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueJobIdPrefix } from 'src/engine/core-modules/message-queue/utils/get-queue-job-id-prefix.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TRIGGER_INSTALL_APPLICATION_JOB = gql`
  mutation TriggerInstallApplicationJob(
    $input: TriggerInstallApplicationJobInput!
  ) {
    triggerInstallApplicationJob(input: $input) {
      jobId
    }
  }
`;

const TRIGGER_UNINSTALL_APPLICATION_JOB = gql`
  mutation TriggerUninstallApplicationJob(
    $input: TriggerUninstallApplicationJobInput!
  ) {
    triggerUninstallApplicationJob(input: $input) {
      jobId
    }
  }
`;

const FIND_UNINSTALL_APPLICATION_JOB_STATUS = gql`
  query FindUninstallApplicationJobStatus(
    $universalIdentifier: String!
    $jobId: String
  ) {
    findUninstallApplicationJobStatus(
      universalIdentifier: $universalIdentifier
      jobId: $jobId
    ) {
      jobId
      state
      failedReason
    }
  }
`;

describe('Application lifecycle jobs', () => {
  let appId: string;
  let roleId: string;
  let redisConnection: IORedis;
  let workspaceQueue: Queue;

  const triggerUninstallApplicationJob = async () => {
    const response = await makeMetadataAPIRequest({
      query: TRIGGER_UNINSTALL_APPLICATION_JOB,
      variables: { input: { universalIdentifier: appId } },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.triggerUninstallApplicationJob.jobId as string;
  };

  const findUninstallApplicationJobStatus = async (jobId?: string) => {
    const response = await makeMetadataAPIRequest({
      query: FIND_UNINSTALL_APPLICATION_JOB_STATUS,
      variables: { universalIdentifier: appId, jobId },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.findUninstallApplicationJobStatus;
  };

  beforeAll(() => {
    redisConnection = new IORedis(
      process.env.REDIS_QUEUE_URL ??
        process.env.REDIS_URL ??
        'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );
    workspaceQueue = new Queue(MessageQueue.workspaceQueue, {
      connection: redisConnection,
    });
  });

  afterAll(async () => {
    await workspaceQueue.close();
    await redisConnection.quit();
  });

  beforeEach(async () => {
    appId = uuidv4();
    roleId = uuidv4();

    await setupApplicationForSync({
      applicationUniversalIdentifier: appId,
      name: 'Lifecycle job test application',
      description: 'App for testing install and uninstall jobs',
      sourcePath: 'test-lifecycle-jobs',
    });

    await syncApplication({
      manifest: buildBaseManifest({ appId, roleId }),
      expectToFail: false,
    });

    // setupApplicationForSync leaves fake timers on, which would stall the
    // polling in waitForAllJobsToFinish
    jest.useRealTimers();
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: appId,
    });
  });

  it('uninstalls an installed application through a queue job and reads the job back', async () => {
    const jobId = await triggerUninstallApplicationJob();

    expect(getQueueJobIdPrefix(jobId)).toBe(
      `uninstall-application.${SEED_APPLE_WORKSPACE_ID}.${appId}`,
    );

    await waitForAllJobsToFinish();

    expect(await findUninstallApplicationJobStatus(jobId)).toMatchObject({
      jobId,
      state: JobStateEnum.COMPLETED,
    });
    expect(await findUninstallApplicationJobStatus()).toBeNull();

    const { data } = await findManyApplications({ expectToFail: false });

    expect(
      data.findManyApplications.some(
        (application) => application.universalIdentifier === appId,
      ),
    ).toBe(false);
  }, 60000);

  it('reports the waiting uninstall job and refuses a conflicting install', async () => {
    // Pausing the queue keeps the job waiting so the in-flight paths can be
    // observed deterministically
    await workspaceQueue.pause();

    try {
      const jobId = await triggerUninstallApplicationJob();

      expect(await findUninstallApplicationJobStatus()).toMatchObject({
        jobId,
        state: JobStateEnum.WAITING,
      });

      expect(await triggerUninstallApplicationJob()).toBe(jobId);

      const installResponse = await makeMetadataAPIRequest({
        query: TRIGGER_INSTALL_APPLICATION_JOB,
        variables: { input: { universalIdentifier: appId } },
      });

      expect(installResponse.body.errors).toHaveLength(1);
      expect(installResponse.body.errors[0].message).toBe(
        `Cannot install application ${appId} while its uninstall is in progress`,
      );
    } finally {
      await workspaceQueue.resume();
    }

    await waitForAllJobsToFinish();
  }, 60000);
});
