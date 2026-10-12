import { Queue } from 'bullmq';
import gql from 'graphql-tag';
import IORedis from 'ioredis';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { v4 as uuidv4 } from 'uuid';

import { JobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueJobIdPrefix } from 'src/engine/core-modules/message-queue/utils/get-queue-job-id-prefix.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TRIGGER_INSTALL_APPLICATION = gql`
  mutation TriggerInstallApplication($input: TriggerInstallApplicationInput!) {
    triggerInstallApplication(input: $input) {
      jobId
    }
  }
`;

const TRIGGER_UNINSTALL_APPLICATION = gql`
  mutation TriggerUninstallApplication(
    $input: TriggerUninstallApplicationInput!
  ) {
    triggerUninstallApplication(input: $input) {
      jobId
    }
  }
`;

const TRIGGER_UPGRADE_APPLICATION = gql`
  mutation TriggerUpgradeApplication($input: TriggerUpgradeApplicationInput!) {
    triggerUpgradeApplication(input: $input) {
      jobId
    }
  }
`;

const FIND_UPGRADE_APPLICATION_JOB_STATUS = gql`
  query FindUpgradeApplicationJobStatus($universalIdentifier: String!) {
    findUpgradeApplicationJobStatus(universalIdentifier: $universalIdentifier) {
      jobId
      state
      failedReason
    }
  }
`;

const FIND_UNINSTALL_APPLICATION_JOB_STATUS = gql`
  query FindUninstallApplicationJobStatus($universalIdentifier: String!) {
    findUninstallApplicationJobStatus(
      universalIdentifier: $universalIdentifier
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

  const triggerUninstallApplication = async () => {
    const response = await makeMetadataApiRequest({
      query: TRIGGER_UNINSTALL_APPLICATION,
      variables: { input: { universalIdentifier: appId } },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.triggerUninstallApplication.jobId as string;
  };

  const findUninstallApplicationJobStatus = async () => {
    const response = await makeMetadataApiRequest({
      query: FIND_UNINSTALL_APPLICATION_JOB_STATUS,
      variables: { universalIdentifier: appId },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.findUninstallApplicationJobStatus;
  };

  const triggerUpgradeApplication = () =>
    makeMetadataApiRequest({
      query: TRIGGER_UPGRADE_APPLICATION,
      variables: {
        input: { universalIdentifier: appId, targetVersion: '1.0.0' },
      },
    });

  const findUpgradeApplicationJobStatus = async () => {
    const response = await makeMetadataApiRequest({
      query: FIND_UPGRADE_APPLICATION_JOB_STATUS,
      variables: { universalIdentifier: appId },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.findUpgradeApplicationJobStatus;
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

    jest.useRealTimers();
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: appId,
    });
  });

  it('uninstalls an installed application through a queue job and reads the job back', async () => {
    const jobId = await triggerUninstallApplication();

    expect(getQueueJobIdPrefix(jobId)).toBe(
      `uninstall-application.${SEED_APPLE_WORKSPACE_ID}.${appId}`,
    );

    await waitForAllJobsToFinish();

    expect(await findUninstallApplicationJobStatus()).toBeNull();

    const { data } = await findManyApplications({ expectToFail: false });

    expect(
      data.findManyApplications.some(
        (application) => application.universalIdentifier === appId,
      ),
    ).toBe(false);
  }, 60000);

  it('reports the waiting uninstall job and refuses a conflicting install', async () => {
    await workspaceQueue.pause();

    try {
      const jobId = await triggerUninstallApplication();

      expect(await findUninstallApplicationJobStatus()).toMatchObject({
        jobId,
        state: JobStateEnum.PRIORITIZED,
      });

      expect(await triggerUninstallApplication()).toBe(jobId);

      const installResponse = await makeMetadataApiRequest({
        query: TRIGGER_INSTALL_APPLICATION,
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

  it('reports the waiting upgrade job and refuses a conflicting uninstall', async () => {
    await workspaceQueue.pause();

    try {
      const upgradeResponse = await triggerUpgradeApplication();

      expect(upgradeResponse.body.errors).toBeUndefined();

      const jobId = upgradeResponse.body.data.triggerUpgradeApplication
        .jobId as string;

      expect(getQueueJobIdPrefix(jobId)).toBe(
        `upgrade-application.${SEED_APPLE_WORKSPACE_ID}.${appId}`,
      );

      expect(await findUpgradeApplicationJobStatus()).toMatchObject({
        jobId,
        state: JobStateEnum.PRIORITIZED,
      });

      const uninstallResponse = await makeMetadataApiRequest({
        query: TRIGGER_UNINSTALL_APPLICATION,
        variables: { input: { universalIdentifier: appId } },
      });

      expect(uninstallResponse.body.errors).toHaveLength(1);
      expect(uninstallResponse.body.errors[0].message).toBe(
        `Cannot uninstall application ${appId} while its upgrade is in progress`,
      );
    } finally {
      await workspaceQueue.resume();
    }

    await waitForAllJobsToFinish();

    expect(await findUpgradeApplicationJobStatus()).toBeNull();
  }, 60000);

  it('refuses an upgrade while the uninstall is in progress', async () => {
    await workspaceQueue.pause();

    try {
      await triggerUninstallApplication();

      const upgradeResponse = await triggerUpgradeApplication();

      expect(upgradeResponse.body.errors).toHaveLength(1);
      expect(upgradeResponse.body.errors[0].message).toBe(
        `Cannot upgrade application ${appId} while its uninstall is in progress`,
      );
    } finally {
      await workspaceQueue.resume();
    }

    await waitForAllJobsToFinish();
  }, 60000);

  it('refuses an upgrade while the install is in progress', async () => {
    await workspaceQueue.pause();

    try {
      const installResponse = await makeMetadataApiRequest({
        query: TRIGGER_INSTALL_APPLICATION,
        variables: { input: { universalIdentifier: appId } },
      });

      expect(installResponse.body.errors).toBeUndefined();

      const upgradeResponse = await triggerUpgradeApplication();

      expect(upgradeResponse.body.errors).toHaveLength(1);
      expect(upgradeResponse.body.errors[0].message).toBe(
        `Cannot upgrade application ${appId} while its install is in progress`,
      );
    } finally {
      await workspaceQueue.resume();
    }

    await waitForAllJobsToFinish();
  }, 60000);

  it('refuses an install while the upgrade is in progress', async () => {
    await workspaceQueue.pause();

    try {
      const upgradeResponse = await triggerUpgradeApplication();

      expect(upgradeResponse.body.errors).toBeUndefined();

      const installResponse = await makeMetadataApiRequest({
        query: TRIGGER_INSTALL_APPLICATION,
        variables: { input: { universalIdentifier: appId } },
      });

      expect(installResponse.body.errors).toHaveLength(1);
      expect(installResponse.body.errors[0].message).toBe(
        `Cannot install application ${appId} while its upgrade is in progress`,
      );
    } finally {
      await workspaceQueue.resume();
    }

    await waitForAllJobsToFinish();
  }, 60000);
});
