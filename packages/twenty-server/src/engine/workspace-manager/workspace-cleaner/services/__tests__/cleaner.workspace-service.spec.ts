import { type Repository } from 'typeorm';

import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { type WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { type EmailService } from 'src/engine/core-modules/email/email.service';
import { type I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type UserService } from 'src/engine/core-modules/user/services/user.service';
import { type UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { DestroySoftDeletedWorkspaceJob } from 'src/engine/workspace-manager/workspace-cleaner/jobs/destroy-soft-deleted-workspace.job';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

const NOW = new Date('2026-09-22T09:00:00.000Z');
const INACTIVE_DAYS_BEFORE_SOFT_DELETE = 15;
const INACTIVE_DAYS_BEFORE_DELETE = 30;
const MAX_WORKSPACES_DELETED_PER_EXECUTION = 2;

const daysAgo = (days: number) =>
  new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

describe('CleanerWorkspaceService', () => {
  const workspaceRepository = { find: jest.fn() };
  const keyValuePairRepository = { find: jest.fn() };
  const messageQueueService = { add: jest.fn() };
  const twentyConfigService = {
    get: jest.fn((key: string) =>
      ({
        WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION:
          INACTIVE_DAYS_BEFORE_SOFT_DELETE,
        WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION: INACTIVE_DAYS_BEFORE_DELETE,
        WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION: 7,
        MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION:
          MAX_WORKSPACES_DELETED_PER_EXECUTION,
      })[key],
    ),
  };

  const createService = () =>
    new CleanerWorkspaceService(
      {} as unknown as WorkspaceService,
      twentyConfigService as unknown as TwentyConfigService,
      {} as unknown as UserVarsService,
      {} as unknown as UserService,
      {} as unknown as EmailService,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      keyValuePairRepository as unknown as Repository<KeyValuePairEntity>,
      {} as unknown as WorkspaceScopedRepository<BillingSubscriptionEntity>,
      {} as unknown as BillingSubscriptionService,
      {} as unknown as Repository<UserWorkspaceEntity>,
      {} as unknown as I18nService,
      {} as unknown as WorkspaceDomainsService,
      messageQueueService as unknown as MessageQueueService,
    );

  const givenWorkspaces = (workspaces: Partial<WorkspaceEntity>[]) => {
    workspaceRepository.find.mockResolvedValue(workspaces);
    keyValuePairRepository.find.mockResolvedValue([]);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.setSystemTime(NOW);
  });

  it('should enqueue a destruction job for a workspace past the grace period', async () => {
    givenWorkspaces([{ id: 'workspace-id', deletedAt: daysAgo(20) }]);

    await createService().batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: ['workspace-id'],
    });

    expect(messageQueueService.add).toHaveBeenCalledWith(
      DestroySoftDeletedWorkspaceJob.name,
      { workspaceId: 'workspace-id' },
      {
        deduplication: {
          id: 'destroy-soft-deleted-workspace:workspace-id',
        },
      },
    );
  });

  it('should not enqueue a destruction job while within the grace period', async () => {
    givenWorkspaces([{ id: 'workspace-id', deletedAt: daysAgo(5) }]);

    await createService().batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: ['workspace-id'],
    });

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('should stop enqueuing once the per-execution limit is reached', async () => {
    givenWorkspaces([
      { id: 'first', deletedAt: daysAgo(20) },
      { id: 'second', deletedAt: daysAgo(20) },
      { id: 'third', deletedAt: daysAgo(20) },
    ]);

    await createService().batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: ['first', 'second', 'third'],
    });

    expect(messageQueueService.add).toHaveBeenCalledTimes(
      MAX_WORKSPACES_DELETED_PER_EXECUTION,
    );
  });

  it('should not enqueue a destruction job on a dry run', async () => {
    givenWorkspaces([{ id: 'workspace-id', deletedAt: daysAgo(20) }]);

    await createService().batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: ['workspace-id'],
      dryRun: true,
    });

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('should enqueue a destruction job within the grace period when it is ignored', async () => {
    givenWorkspaces([{ id: 'workspace-id', deletedAt: daysAgo(5) }]);

    await createService().batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: ['workspace-id'],
      ignoreDestroyGracePeriod: true,
    });

    expect(messageQueueService.add).toHaveBeenCalledTimes(1);
  });
});
