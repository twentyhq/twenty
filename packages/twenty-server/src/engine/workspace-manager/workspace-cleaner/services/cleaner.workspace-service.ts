import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { render } from '@react-email/render';
import { differenceInDays } from 'date-fns';
import {
  CleanSuspendedWorkspaceEmail,
  WarnSuspendedWorkspaceEmail,
} from 'twenty-emails';
import { isDefined, WorkspaceActivationStatus } from 'twenty-shared';
import { In, Repository } from 'typeorm';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { USER_WORKSPACE_DELETION_WARNING_SENT_KEY } from 'src/engine/workspace-manager/workspace-cleaner/constants/user-workspace-deletion-warning-sent-key.constant';
import {
  WorkspaceCleanerException,
  WorkspaceCleanerExceptionCode,
} from 'src/engine/workspace-manager/workspace-cleaner/exceptions/workspace-cleaner.exception';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class CleanerWorkspaceService {
  private readonly logger = new Logger(CleanerWorkspaceService.name);
  private readonly inactiveDaysBeforeSoftDelete: number;
  private readonly inactiveDaysBeforeDelete: number;
  private readonly inactiveDaysBeforeWarn: number;
  private readonly maxNumberOfWorkspacesDeletedPerExecution: number;

  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly environmentService: EnvironmentService,
    private readonly userVarsService: UserVarsService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    this.inactiveDaysBeforeSoftDelete = this.environmentService.get(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION',
    );
    this.inactiveDaysBeforeDelete = this.environmentService.get(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION',
    );
    this.inactiveDaysBeforeWarn = this.environmentService.get(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION',
    );
    this.maxNumberOfWorkspacesDeletedPerExecution = this.environmentService.get(
      'MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION',
    );
  }

  async computeWorkspaceBillingInactivity(
    workspace: Workspace,
  ): Promise<number> {
    try {
      const lastSubscription =
        await this.billingSubscriptionRepository.findOneOrFail({
          where: { workspaceId: workspace.id },
          order: { updatedAt: 'DESC' },
        });

      const daysSinceBillingInactivity = differenceInDays(
        new Date(),
        lastSubscription.updatedAt,
      );

      return daysSinceBillingInactivity;
    } catch {
      throw new WorkspaceCleanerException(
        `No billing subscription found for workspace ${workspace.id} ${workspace.displayName}`,
        WorkspaceCleanerExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND,
      );
    }
  }

  async checkIfAtLeastOneWorkspaceMemberWarned(
    workspaceMembers: WorkspaceMemberWorkspaceEntity[],
    workspaceId: string,
  ) {
    for (const workspaceMember of workspaceMembers) {
      const workspaceMemberWarned = await this.userVarsService.get({
        userId: workspaceMember.userId,
        workspaceId: workspaceId,
        key: USER_WORKSPACE_DELETION_WARNING_SENT_KEY,
      });

      if (workspaceMemberWarned) {
        return true;
      }
    }

    return false;
  }

  async sendWarningEmail(
    workspaceMember: WorkspaceMemberWorkspaceEntity,
    workspaceDisplayName: string | undefined,
    daysSinceInactive: number,
  ) {
    const emailData = {
      daysSinceInactive,
      inactiveDaysBeforeDelete: this.inactiveDaysBeforeSoftDelete,
      userName: `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`,
      workspaceDisplayName: `${workspaceDisplayName}`,
    };
    const emailTemplate = WarnSuspendedWorkspaceEmail(emailData);
    const html = render(emailTemplate, { pretty: true });
    const text = render(emailTemplate, { plainText: true });

    this.emailService.send({
      to: workspaceMember.userEmail,
      bcc: this.environmentService.get('EMAIL_SYSTEM_ADDRESS'),
      from: `${this.environmentService.get(
        'EMAIL_FROM_NAME',
      )} <${this.environmentService.get('EMAIL_FROM_ADDRESS')}>`,
      subject: 'Action needed to prevent workspace deletion',
      html,
      text,
    });
  }

  async warnWorkspaceMembers(
    workspace: Workspace,
    daysSinceInactive: number,
    dryRun: boolean,
  ) {
    const workspaceMembers =
      await this.userService.loadWorkspaceMembers(workspace);

    const workspaceMembersWarned =
      await this.checkIfAtLeastOneWorkspaceMemberWarned(
        workspaceMembers,
        workspace.id,
      );

    if (workspaceMembersWarned) {
      this.logger.log(
        `${dryRun ? 'DRY RUN - ' : ''}Workspace ${workspace.id} ${workspace.displayName} already warned`,
      );

      return;
    }

    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}Sending ${workspace.id} ${
        workspace.displayName
      } suspended since ${daysSinceInactive} days emails to users ['${workspaceMembers
        .map((workspaceUser) => workspaceUser.userId)
        .join(', ')}']`,
    );

    if (!dryRun) {
      for (const workspaceMember of workspaceMembers) {
        await this.userVarsService.set({
          userId: workspaceMember.userId,
          workspaceId: workspace.id,
          key: USER_WORKSPACE_DELETION_WARNING_SENT_KEY,
          value: true,
        });

        await this.sendWarningEmail(
          workspaceMember,
          workspace.displayName,
          daysSinceInactive,
        );
      }
    }
  }

  async sendCleaningEmail(
    workspaceMember: WorkspaceMemberWorkspaceEntity,
    workspaceDisplayName: string,
    daysSinceInactive: number,
  ) {
    const emailData = {
      daysSinceInactive: daysSinceInactive,
      userName: `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`,
      workspaceDisplayName,
    };
    const emailTemplate = CleanSuspendedWorkspaceEmail(emailData);
    const html = render(emailTemplate, { pretty: true });
    const text = render(emailTemplate, { plainText: true });

    this.emailService.send({
      to: workspaceMember.userEmail,
      bcc: this.environmentService.get('EMAIL_SYSTEM_ADDRESS'),
      from: `${this.environmentService.get(
        'EMAIL_FROM_NAME',
      )} <${this.environmentService.get('EMAIL_FROM_ADDRESS')}>`,
      subject: 'Your workspace has been deleted',
      html,
      text,
    });
  }

  async informWorkspaceMembersAndSoftDeleteWorkspace(
    workspace: Workspace,
    daysSinceInactive: number,
    dryRun: boolean,
  ) {
    if (isDefined(workspace.deletedAt)) {
      this.logger.log(
        `${dryRun ? 'DRY RUN - ' : ''}Workspace ${workspace.id} ${
          workspace.displayName
        } already soft deleted`,
      );

      return;
    }

    const workspaceMembers =
      await this.userService.loadWorkspaceMembers(workspace);

    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}Sending workspace ${workspace.id} ${
        workspace.displayName
      } deletion emails to users ['${workspaceMembers
        .map((workspaceUser) => workspaceUser.userId)
        .join(', ')}']`,
    );

    if (!dryRun) {
      for (const workspaceMember of workspaceMembers) {
        await this.userVarsService.delete({
          userId: workspaceMember.userId,
          workspaceId: workspace.id,
          key: USER_WORKSPACE_DELETION_WARNING_SENT_KEY,
        });

        await this.sendCleaningEmail(
          workspaceMember,
          workspace.displayName || '',
          daysSinceInactive,
        );
      }

      await this.workspaceService.deleteWorkspace(workspace.id, true);
    }
    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}Soft deleting Workspace ${workspace.id} ${workspace.displayName}`,
    );
  }

  async batchWarnOrCleanSuspendedWorkspaces(
    workspaceIds: string[],
    dryRun = false,
  ): Promise<void> {
    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}batchWarnOrCleanSuspendedWorkspaces running...`,
    );

    const workspaces = await this.workspaceRepository.find({
      where: {
        id: In(workspaceIds),
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      },
      withDeleted: true,
    });

    let deletedWorkspacesCount = 0;

    for (const workspace of workspaces) {
      try {
        const workspaceInactivity =
          await this.computeWorkspaceBillingInactivity(workspace);

        const daysSinceSoftDeleted = workspace.deletedAt
          ? differenceInDays(new Date(), workspace.deletedAt)
          : 0;

        if (
          daysSinceSoftDeleted >
            this.inactiveDaysBeforeDelete - this.inactiveDaysBeforeSoftDelete &&
          deletedWorkspacesCount < this.maxNumberOfWorkspacesDeletedPerExecution
        ) {
          this.logger.log(
            `${dryRun ? 'DRY RUN - ' : ''}Destroying workspace ${workspace.id} ${workspace.displayName}`,
          );
          if (!dryRun) {
            await this.workspaceService.deleteWorkspace(workspace.id);
          }
          deletedWorkspacesCount++;

          continue;
        }
        if (
          workspaceInactivity > this.inactiveDaysBeforeSoftDelete &&
          !isDefined(workspace.deletedAt)
        ) {
          await this.informWorkspaceMembersAndSoftDeleteWorkspace(
            workspace,
            workspaceInactivity,
            dryRun,
          );

          continue;
        }
        if (
          workspaceInactivity > this.inactiveDaysBeforeWarn &&
          workspaceInactivity <= this.inactiveDaysBeforeSoftDelete
        ) {
          await this.warnWorkspaceMembers(
            workspace,
            workspaceInactivity,
            dryRun,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error while processing workspace ${workspace.id} ${workspace.displayName}: ${error}`,
        );
      }

      await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
        workspace.id,
      );
    }
    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}batchWarnOrCleanSuspendedWorkspaces done!`,
    );
  }
}
