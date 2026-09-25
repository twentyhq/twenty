import { Command, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { LessThan, MoreThan } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RECORD_DELETE_BATCH_SIZE } from 'src/engine/twenty-orm/constants/record-delete-batch-size.constant';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

@Command({
  name: 'workflow:delete-workflow-runs',
  description: 'Delete all workflow runs',
})
export class DeleteWorkflowRunsCommand extends ProvisionedWorkspaceCommandRunner {
  private createdBeforeDate: string | undefined;

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      try {
        const workflowRunRepository =
          this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
            'workflowRun',
            { shouldBypassPermissionChecks: true },
          );

        const createdBefore =
          this.createdBeforeDate || new Date().toISOString();

        const workflowRunCount = await workflowRunRepository.count({
          where: { createdAt: LessThan(createdBefore) },
        });

        if (!options.dryRun && workflowRunCount > 0) {
          await this.deleteWorkflowRunsCreatedBefore({
            workflowRunRepository,
            createdBefore,
          });
        }

        this.logger.log(
          `${options.dryRun ? ' (DRY RUN): ' : ''}Deleted ${workflowRunCount} workflow runs`,
        );
      } catch (error) {
        this.logger.error('Error while deleting workflowRun', error);
      }
    }, authContext);
  }

  private async deleteWorkflowRunsCreatedBefore({
    workflowRunRepository,
    createdBefore,
  }: {
    workflowRunRepository: WorkspaceRepository<WorkflowRunWorkspaceEntity>;
    createdBefore: string;
  }): Promise<void> {
    let lastWorkflowRunId: string | undefined;

    for (;;) {
      const workflowRuns = await workflowRunRepository.find({
        select: { id: true },
        where: {
          createdAt: LessThan(createdBefore),
          ...(isDefined(lastWorkflowRunId)
            ? { id: MoreThan(lastWorkflowRunId) }
            : {}),
        },
        order: { id: 'ASC' },
        take: RECORD_DELETE_BATCH_SIZE,
        // Soft-deleted runs older than the cutoff are deleted too
        withDeleted: true,
      });

      if (workflowRuns.length > 0) {
        await workflowRunRepository.delete(workflowRuns.map(({ id }) => id));
      }

      if (workflowRuns.length < RECORD_DELETE_BATCH_SIZE) {
        return;
      }

      lastWorkflowRunId = workflowRuns[workflowRuns.length - 1].id;
    }
  }
}
