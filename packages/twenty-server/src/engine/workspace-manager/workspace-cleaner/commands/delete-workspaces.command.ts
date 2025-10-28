import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { In, Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getDryRunLogHeader } from 'src/utils/get-dry-run-log-header';

type DeleteWorkspacesCommandOptions = {
  dryRun?: boolean;
  workspaceIds: string[];
};

@Command({
  name: 'workspace:delete',
  description: 'Delete workspace',
})
export class DeleteWorkspacesCommand extends CommandRunner {
  private readonly logger = new Logger(DeleteWorkspacesCommand.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
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
    required: true,
  })
  parseWorkspaceIds(value: string): string[] {
    return value.split(',');
  }

  async run(
    _passedParam: string[],
    options: DeleteWorkspacesCommandOptions,
  ): Promise<void> {
    const workspaces = await this.workspaceRepository.find({
      where: { id: In(options.workspaceIds) },
    });

    const dataSources =
      await this.dataSourceService.getManyDataSourceMetadata();

    const workspaceIdsWithSchema = dataSources.map(
      (dataSource) => dataSource.workspaceId,
    );

    const workspacesToDelete = workspaces.filter((WorkspaceEntity) =>
      workspaceIdsWithSchema.includes(WorkspaceEntity.id),
    );

    if (workspacesToDelete.length) {
      this.logger.log(
        `Running Deleting  workspaces on ${workspacesToDelete.length} workspaces`,
      );
    }

    for (const workspace of workspacesToDelete) {
      this.logger.log(
        `${getDryRunLogHeader(options.dryRun)}Deleting workspace ${
          workspace.id
        } name: '${workspace.displayName}'`,
      );
      // const workspaceServiceInstance =
      //   await this.loadServiceWithWorkspaceContext.load(
      //     this.workspaceService,
      //     workspace.id,
      //   );

      // if (!options.dryRun) {
      //   await workspaceServiceInstance.softDeleteWorkspace(workspace.id);
      // }
    }
  }
}
