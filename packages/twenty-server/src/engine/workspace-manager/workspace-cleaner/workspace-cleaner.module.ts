import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { CleanOnboardingWorkspacesCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-onboarding-workspaces.command';
import { CleanOnboardingWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-onboarding-workspaces.cron.command';
import { CleanSuspendedWorkspacesCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-suspended-workspaces.command';
import { CleanSuspendedWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-suspended-workspaces.cron.command';
import { DeleteWorkspacesCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/delete-workspaces.command';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Workspace, UserWorkspace, BillingSubscription],
      'core',
    ),
    WorkspaceModule,
    DataSourceModule,
    UserVarsModule,
    UserModule,
    EmailModule,
    BillingModule,
  ],
  providers: [
    DeleteWorkspacesCommand,
    CleanSuspendedWorkspacesCommand,
    CleanSuspendedWorkspacesCronCommand,
    CleanOnboardingWorkspacesCommand,
    CleanOnboardingWorkspacesCronCommand,
    CleanerWorkspaceService,
  ],
  exports: [CleanerWorkspaceService],
})
export class WorkspaceCleanerModule {}
