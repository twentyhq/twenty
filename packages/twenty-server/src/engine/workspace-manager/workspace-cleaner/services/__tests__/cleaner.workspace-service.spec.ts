import { subDays } from 'date-fns';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
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

const CONFIG: Record<string, unknown> = {
  WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION: 14,
  WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION: 21,
  WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION: 7,
  MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION: 5,
  IS_BILLING_ENABLED: false,
};

describe('CleanerWorkspaceService', () => {
  const workspaceService = {
    deleteWorkspace: jest.fn(),
    handleRemoveWorkspaceMember: jest.fn(),
  };
  const twentyConfigService = {
    get: jest.fn((key: string) => CONFIG[key]),
  };
  const workspaceRepository = {
    find: jest.fn(),
  };
  const keyValuePairRepository = {
    find: jest.fn(),
  };
  const userWorkspaceRepository = {
    find: jest.fn(),
  };
  const workspaceDestroyQueueService = {
    add: jest.fn(),
  };

  const createService = () =>
    new CleanerWorkspaceService(
      workspaceService as unknown as WorkspaceService,
      twentyConfigService as unknown as TwentyConfigService,
      {} as UserVarsService,
      {} as UserService,
      {} as EmailService,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      keyValuePairRepository as unknown as Repository<KeyValuePairEntity>,
      {} as WorkspaceScopedRepository<BillingSubscriptionEntity>,
      {} as BillingSubscriptionService,
      userWorkspaceRepository as unknown as Repository<UserWorkspaceEntity>,
      {} as I18nService,
      {} as WorkspaceDomainsService,
      workspaceDestroyQueueService as unknown as MessageQueueService,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    keyValuePairRepository.find.mockResolvedValue([]);
    userWorkspaceRepository.find.mockResolvedValue([]);
    workspaceDestroyQueueService.add.mockResolvedValue('job-id');
  });

  describe('batchCleanOnboardingWorkspaces', () => {
    it('should enqueue the destruction of a soft deleted onboarding workspace', async () => {
      workspaceRepository.find.mockResolvedValue([
        { id: 'workspace-id', deletedAt: new Date() },
      ]);

      await createService().batchCleanOnboardingWorkspaces(['workspace-id']);

      expect(workspaceDestroyQueueService.add).toHaveBeenCalledWith(
        DestroySoftDeletedWorkspaceJob.name,
        { workspaceId: 'workspace-id' },
        { id: 'destroy-soft-deleted-workspace-workspace-id' },
      );
      expect(workspaceService.deleteWorkspace).not.toHaveBeenCalled();
    });

    it('should soft delete an onboarding workspace that is not deleted yet', async () => {
      workspaceRepository.find.mockResolvedValue([
        { id: 'workspace-id', deletedAt: null },
      ]);

      await createService().batchCleanOnboardingWorkspaces(['workspace-id']);

      expect(workspaceService.deleteWorkspace).toHaveBeenCalledWith(
        'workspace-id',
        true,
      );
      expect(workspaceDestroyQueueService.add).not.toHaveBeenCalled();
    });

    it('should enqueue nothing on a dry run', async () => {
      workspaceRepository.find.mockResolvedValue([
        { id: 'workspace-id', deletedAt: new Date() },
      ]);

      await createService().batchCleanOnboardingWorkspaces(
        ['workspace-id'],
        true,
      );

      expect(workspaceDestroyQueueService.add).not.toHaveBeenCalled();
      expect(workspaceService.deleteWorkspace).not.toHaveBeenCalled();
    });
  });

  describe('batchWarnOrCleanSuspendedWorkspaces', () => {
    it('should enqueue the destruction of a suspended workspace past its grace period', async () => {
      workspaceRepository.find.mockResolvedValue([
        {
          id: 'workspace-id',
          activationStatus: WorkspaceActivationStatus.SUSPENDED,
          deletedAt: subDays(new Date(), 30),
        },
      ]);

      await createService().batchWarnOrCleanSuspendedWorkspaces({
        workspaceIds: ['workspace-id'],
      });

      expect(workspaceDestroyQueueService.add).toHaveBeenCalledWith(
        DestroySoftDeletedWorkspaceJob.name,
        { workspaceId: 'workspace-id' },
        { id: 'destroy-soft-deleted-workspace-workspace-id' },
      );
      expect(workspaceService.deleteWorkspace).not.toHaveBeenCalled();
    });
  });
});
