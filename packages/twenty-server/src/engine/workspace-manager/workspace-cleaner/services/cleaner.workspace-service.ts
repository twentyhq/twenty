import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { differenceInDays } from 'date-fns';
import {
  CleanSuspendedWorkspaceEmail,
  WarnSuspendedWorkspaceEmail,
} from 'twenty-emails';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
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
    private readonly twentyConfigService: TwentyConfigService,
    private readonly userVarsService: UserVarsService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly i18nService: I18nService,
    private readonly metricsService: MetricsService,
  ) {
    this.inactiveDaysBeforeSoftDelete = this.twentyConfigService.get(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION',
    );
    this.inactiveDaysBeforeDelete = this.twentyConfigService.get(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION',
    );
    this.inactiveDaysBeforeWarn = this.twentyConfigService.get(
      'WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION',
    );
    this.maxNumberOfWorkspacesDeletedPerExecution =
      this.twentyConfigService.get(
        'MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION',
      );
  }

  async computeWorkspaceBillingInactivity(
    workspace: WorkspaceEntity,
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
      locale: workspaceMember.locale,
    };
    const emailTemplate = WarnSuspendedWorkspaceEmail(emailData);
    const html = await render(emailTemplate, { pretty: true });
    const text = await render(emailTemplate, { plainText: true });

    const workspaceDeletionMsg = msg`Action needed to prevent workspace deletion`;
    const i18n = this.i18nService.getI18nInstance(workspaceMember.locale);
    const subject = i18n._(workspaceDeletionMsg);

    if (!isDefined(workspaceMember.userEmail)) {
      throw new Error('Workspace member email is missing');
    }

    this.emailService.send({
      to: workspaceMember.userEmail,
      from: `${this.twentyConfigService.get(
        'EMAIL_FROM_NAME',
      )} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
      subject,
      html,
      text,
    });
  }

  async warnWorkspaceMembers(
    workspace: WorkspaceEntity,
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
      locale: workspaceMember.locale,
    };
    const emailTemplate = CleanSuspendedWorkspaceEmail(emailData);
    const html = await render(emailTemplate, { pretty: true });
    const text = await render(emailTemplate, { plainText: true });

    if (!isDefined(workspaceMember.userEmail)) {
      throw new Error('Workspace member email is missing');
    }

    this.emailService.send({
      to: workspaceMember.userEmail,
      from: `${this.twentyConfigService.get(
        'EMAIL_FROM_NAME',
      )} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
      subject: 'Your workspace has been deleted',
      html,
      text,
    });
  }

  async informWorkspaceMembersAndSoftDeleteWorkspace(
    workspace: WorkspaceEntity,
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

  async batchCleanOnboardingWorkspaces(
    workspaceIds: string[],
    dryRun = false,
  ): Promise<void> {
    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}batchCleanOnboardingWorkspaces running...`,
    );

    const workspaces = await this.workspaceRepository.find({
      where: {
        id: In(workspaceIds),
        activationStatus: In([
          WorkspaceActivationStatus.PENDING_CREATION,
          WorkspaceActivationStatus.ONGOING_CREATION,
        ]),
      },
      withDeleted: true,
    });

    if (workspaces.length !== 0) {
      if (!dryRun) {
        for (const workspace of workspaces) {
          const userWorkspaces = await this.userWorkspaceRepository.find({
            where: {
              workspaceId: workspace.id,
            },
            withDeleted: true,
          });

          for (const userWorkspace of userWorkspaces) {
            await this.workspaceService.handleRemoveWorkspaceMember(
              workspace.id,
              userWorkspace.userId,
            );
          }

          await this.workspaceRepository.delete(workspace.id);
        }
      }

      this.logger.log(
        `${dryRun ? 'DRY RUN - ' : ''}batchCleanOnboardingWorkspaces done with ${workspaces.length} workspaces!`,
      );
    }
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

    for (const [index, workspace] of workspaces.entries()) {
      this.logger.log(
        `${dryRun ? 'DRY RUN - ' : ''}Processing workspace ${workspace.id} - ${index + 1}/${workspaces.length}`,
      );

      try {
        const isSoftDeletedWorkspace = isDefined(workspace.deletedAt);

        if (isSoftDeletedWorkspace) {
          const daysSinceSoftDeleted = workspace.deletedAt
            ? differenceInDays(new Date(), workspace.deletedAt)
            : 0;

          if (
            daysSinceSoftDeleted >
              this.inactiveDaysBeforeDelete -
                this.inactiveDaysBeforeSoftDelete &&
            deletedWorkspacesCount <
              this.maxNumberOfWorkspacesDeletedPerExecution
          ) {
            this.logger.log(
              `${dryRun ? 'DRY RUN - ' : ''}Destroying workspace ${workspace.id} ${workspace.displayName}`,
            );
            if (!dryRun) {
              await this.workspaceService.deleteWorkspace(workspace.id);
              this.metricsService.incrementCounter({
                key: MetricsKeys.CronJobDeletedWorkspace,
                shouldStoreInCache: false,
              });
            }
            deletedWorkspacesCount++;
          }
          continue;
        }

        const workspaceInactivity =
          await this.computeWorkspaceBillingInactivity(workspace);

        if (workspaceInactivity > this.inactiveDaysBeforeSoftDelete) {
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
    }
    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}batchWarnOrCleanSuspendedWorkspaces done!`,
    );
  }

  async destroyBillingDeactivatedAndSoftDeletedWorkspaces(
    workspaceIds: string[],
    dryRun = false,
  ): Promise<void> {
    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}destroyBillingDeactivatedAndSoftDeletedWorkspaces running...`,
    );

    const workspaces = await this.workspaceRepository.find({
      where: {
        id: In(workspaceIds),
      },
      withDeleted: true,
    });

    for (const workspace of workspaces) {
      if (!isDefined(workspace.deletedAt)) {
        this.logger.warn(
          `${dryRun ? 'DRY RUN - ' : ''}Workspace ${workspace.id} is not soft deleted, skipping`,
        );

        continue;
      }

      if (this.twentyConfigService.get('IS_BILLING_ENABLED')) {
        const activeBillingSubscription =
          await this.billingSubscriptionRepository.findOne({
            where: {
              workspaceId: workspace.id,
              status: In([
                SubscriptionStatus.Active,
                SubscriptionStatus.Trialing,
              ]),
            },
          });

        if (isDefined(activeBillingSubscription)) {
          this.logger.warn(
            `${dryRun ? 'DRY RUN - ' : ''}Workspace ${workspace.id} has an active billing subscription, skipping`,
          );

          continue;
        }
      }

      this.logger.log(
        `${dryRun ? 'DRY RUN - ' : ''}Destroying workspace ${workspace.id}`,
      );

      if (!dryRun) {
        await this.workspaceService.deleteWorkspace(workspace.id);
      }

      this.logger.log(
        `${dryRun ? 'DRY RUN - ' : ''}Destroyed workspace ${workspace.id}`,
      );
    }
  }
}
