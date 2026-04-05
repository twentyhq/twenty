import { Command, Option } from 'nest-commander';
import { LessThan } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

@Command({
  name: 'workflow:delete-workflow-runs',
  description: 'Delete all workflow runs',
})
export class DeleteWorkflowRunsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  private createdBeforeDate: string | undefined;

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
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
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      try {
        const workflowRunRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
            workspaceId,
            'workflowRun',
            { shouldBypassPermissionChecks: true },
          );

        const createdAtCondition = {
          createdAt: LessThan(
            this.createdBeforeDate || new Date().toISOString(),
          ),
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
    }, authContext);
  }
}
