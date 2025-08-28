import { InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import { LessThan, Repository } from 'typeorm';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

@Command({
  name: 'workflow:delete-workflow-runs',
  description: 'Delete all workflow runs',
})
export class DeleteWorkflowRunsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private createdBeforeDate: string | undefined;

  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  @Option({
    flags: '--created-before [created_before]',
    description:
      'created before. Delete workflow runs created before that date (YYYY-MM-DD)',
    required: false,
  })
  parseCreatedBefore(val: string): string | undefined {
    const date = new Date(val);

    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${val}`);
    }

    const createdBeforeDate = date.toISOString();

    this.createdBeforeDate = createdBeforeDate;

    return createdBeforeDate;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    try {
      const workflowRunRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
          workspaceId,
          'workflowRun',
          { shouldBypassPermissionChecks: true },
        );

      const createdAtCondition = {
        createdAt: LessThan(this.createdBeforeDate || new Date().toISOString()),
      };

      const workflowRunCount = await workflowRunRepository.count({
        where: createdAtCondition,
      });

      if (!options.dryRun && workflowRunCount > 0) {
        await workflowRunRepository.delete(createdAtCondition);
      }

      this.logger.log(
        `${options.dryRun ? ' (DRY RUN): ' : ''}Deleted ${workflowRunCount} workflow runs`,
      );
    } catch (error) {
      this.logger.error('Error while deleting workflowRun', error);
    }
  }
}
