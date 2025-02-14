import { InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import { WorkspaceActivationStatus } from 'twenty-shared';
import { In, Repository } from 'typeorm';

import {
  BaseCommandOptions,
  BaseCommandRunner,
} from 'src/database/commands/base.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

@Command({
  name: 'workspace:clean',
  description: 'Clean suspended workspace',
})
export class CleanSuspendedWorkspacesCommand extends BaseCommandRunner {
  private workspaceIds: string[] = [];

  constructor(
    private readonly cleanerWorkspaceService: CleanerWorkspaceService,
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description:
      'workspace id. Command runs on all suspended workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(val: string): string[] {
    this.workspaceIds.push(val);

    return this.workspaceIds;
  }

  async fetchSuspendedWorkspaceIds(): Promise<string[]> {
    const suspendedWorkspaces = await this.workspaceRepository.find({
      select: ['id'],
      where: {
        activationStatus: In([WorkspaceActivationStatus.SUSPENDED]),
      },
      withDeleted: true,
    });

    return suspendedWorkspaces.map((workspace) => workspace.id);
  }

  override async executeBaseCommand(
    _passedParams: string[],
    options: BaseCommandOptions,
  ): Promise<void> {
    const { dryRun } = options;

    const suspendedWorkspaceIds =
      this.workspaceIds.length > 0
        ? this.workspaceIds
        : await this.fetchSuspendedWorkspaceIds();

    this.logger.log(
      `${dryRun ? 'DRY RUN - ' : ''}Cleaning ${suspendedWorkspaceIds.length} suspended workspaces`,
    );

    await this.cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces(
      suspendedWorkspaceIds,
      dryRun,
    );
  }
}
