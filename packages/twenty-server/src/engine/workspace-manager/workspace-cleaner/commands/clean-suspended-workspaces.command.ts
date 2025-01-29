import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { BaseCommandOptions } from 'src/database/commands/base.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

@Command({
  name: 'workspace:clean',
  description: 'Clean suspended workspace',
})
export class CleanSuspendedWorkspacesCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    private readonly cleanerWorkspaceService: CleanerWorkspaceService,
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: BaseCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    await this.cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces(
      workspaceIds,
    );
  }
}
