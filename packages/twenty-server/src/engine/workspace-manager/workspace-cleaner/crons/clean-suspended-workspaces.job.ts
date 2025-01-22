import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared';
import { Repository } from 'typeorm';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

const MILLISECONDS_IN_ONE_DAY = 1000 * 3600 * 24;

@Processor(MessageQueue.cronQueue)
export class CleanSuspendedWorkspacesJob {
  private readonly logger = new Logger(CleanSuspendedWorkspacesJob.name);
  private readonly inactiveDaysBeforeDelete: number;
  private readonly inactiveDaysBeforeWarn: number;

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {
    this.inactiveDaysBeforeDelete = this.environmentService.get(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION',
    );
    this.inactiveDaysBeforeWarn = this.environmentService.get(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION',
    );
  }

  async computeWorkspaceBillingInactivity(
    workspace: Workspace,
  ): Promise<number | null> {
    try {
      const lastSubscription =
        await this.billingSubscriptionRepository.findOneOrFail({
          where: { workspaceId: workspace.id },
          order: { updatedAt: 'DESC' },
        });

      const daysSinceBillingInactivity = Math.floor(
        (new Date().getTime() - lastSubscription.updatedAt.getTime()) /
          MILLISECONDS_IN_ONE_DAY,
      );

      return daysSinceBillingInactivity;
    } catch {
      this.logger.error(
        `No billing subscription found for workspace ${workspace.id} ${workspace.displayName}`,
      );

      return null;
    }
  }

  warnWorkspaceMembers(workspace: Workspace) {
    // TODO: issue #284
    // fetch workspace members
    // send email warning for deletion in (this.inactiveDaysBeforeDelete - this.inactiveDaysBeforeWarn) days (cci @twenty.com)

    this.logger.log(
      `Warning Workspace ${workspace.id} ${workspace.displayName}`,
    );
  }

  async informWorkspaceMembersAndDeleteWorkspace(workspace: Workspace) {
    // TODO: issue #285
    // fetch workspace members
    // send email informing about deletion (cci @twenty.com)
    // remove clean-inactive-workspace.job.ts and .. files

    await this.workspaceService.deleteWorkspace(workspace.id);
    this.logger.log(
      `Cleaning Workspace ${workspace.id} ${workspace.displayName}`,
    );
  }

  @Process(CleanSuspendedWorkspacesJob.name)
  async handle(): Promise<void> {
    this.logger.log(`Job running...`);

    const suspendedWorkspaces = await this.workspaceRepository.find({
      where: { activationStatus: WorkspaceActivationStatus.SUSPENDED },
    });

    await Promise.all(
      suspendedWorkspaces.map(async (workspace) => {
        const workspaceInactivity =
          await this.computeWorkspaceBillingInactivity(workspace);

        if (
          workspaceInactivity &&
          workspaceInactivity > this.inactiveDaysBeforeDelete
        ) {
          await this.informWorkspaceMembersAndDeleteWorkspace(workspace);
        } else if (workspaceInactivity === this.inactiveDaysBeforeWarn) {
          this.warnWorkspaceMembers(workspace);
        }
      }),
    );

    this.logger.log(`Job done!`);
  }
}
