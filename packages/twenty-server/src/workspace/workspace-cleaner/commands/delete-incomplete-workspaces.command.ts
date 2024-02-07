import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { WorkspaceService } from 'src/core/workspace/services/workspace.service';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { getDryRunLogHeader } from 'src/utils/get-dry-run-log-header';

type DeleteIncompleteWorkspacesCommandOptions = {
  dryRun?: boolean;
  workspaceId?: string;
};

@Command({
  name: 'workspace:delete-incomplete',
  description: 'Delete incomplete workspaces',
})
export class DeleteIncompleteWorkspacesCommand extends CommandRunner {
  private readonly logger = new Logger(DeleteIncompleteWorkspacesCommand.name);
  constructor(
    private readonly workspaceService: WorkspaceService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {
    super();
  }

  @Option({
    flags: '-d, --dry-run [dry run]',
    description: 'Dry run: Log delete actions without executing them.',
    required: false,
  })
  dryRun(value: string): boolean {
    return Boolean(value);
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: DeleteIncompleteWorkspacesCommandOptions,
  ): Promise<void> {
    const where: { subscriptionStatus: 'incomplete'; id?: string } = {
      subscriptionStatus: 'incomplete',
    };

    if (options.workspaceId) {
      where.id = options.workspaceId;
    }
    const incompleteWorkspaces = await this.workspaceRepository.findBy(where);

    for (const incompleteWorkspace of incompleteWorkspaces) {
      if (!options.dryRun) {
        await this.workspaceService.deleteWorkspace(incompleteWorkspace.id);
      }
      this.logger.log(
        `${getDryRunLogHeader(options.dryRun)}Workspace ${
          incompleteWorkspace.id
        } deleted`,
      );
    }
  }
}
