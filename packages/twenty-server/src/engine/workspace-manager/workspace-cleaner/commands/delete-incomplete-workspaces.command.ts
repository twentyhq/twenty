import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';
import { FindOptionsWhere, In, Repository } from 'typeorm';

import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { getDryRunLogHeader } from 'src/utils/get-dry-run-log-header';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';

type DeleteIncompleteWorkspacesCommandOptions = {
  dryRun?: boolean;
  workspaceIds?: string[];
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
    private readonly dataSourceService: DataSourceService,
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
    flags: '-w, --workspace-ids [workspace_ids]',
    description: 'comma separated workspace ids',
    required: false,
  })
  parseWorkspaceIds(value: string): string[] {
    return value.split(',');
  }

  async run(
    _passedParam: string[],
    options: DeleteIncompleteWorkspacesCommandOptions,
  ): Promise<void> {
    const where: FindOptionsWhere<Workspace> = {
      subscriptionStatus: 'incomplete',
    };

    if (options.workspaceIds) {
      where.id = In(options.workspaceIds);
    }

    const incompleteWorkspaces = await this.workspaceRepository.findBy(where);
    const dataSources =
      await this.dataSourceService.getManyDataSourceMetadata();
    const workspaceIdsWithSchema = dataSources.map(
      (dataSource) => dataSource.workspaceId,
    );
    const incompleteWorkspacesToDelete = incompleteWorkspaces.filter(
      (incompleteWorkspace) =>
        workspaceIdsWithSchema.includes(incompleteWorkspace.id),
    );

    if (incompleteWorkspacesToDelete.length) {
      this.logger.log(
        `Running Deleting incomplete workspaces on ${incompleteWorkspacesToDelete.length} workspaces`,
      );
    }

    for (const incompleteWorkspace of incompleteWorkspacesToDelete) {
      this.logger.log(
        `${getDryRunLogHeader(options.dryRun)}Deleting workspace ${
          incompleteWorkspace.id
        } name: '${incompleteWorkspace.displayName}'`,
      );
      if (!options.dryRun) {
        await this.workspaceService.solfDeleteWorkspace(incompleteWorkspace.id);
      }
    }
  }
}
