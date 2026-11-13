import { Command, Option } from 'nest-commander';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  ProvisionedWorkspaceCommandRunner,
  type ProvisionedWorkspaceCommandOptions,
} from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WORKSPACE_TABLE_REBUILD_DEFAULT_MINIMUM_USED_COLUMN_SLOT_COUNT } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/workspace-table-rebuild-default-minimum-used-column-slot-count.constant';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import { WorkspaceTableRebuildService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-table-rebuild.service';
import { type WorkspaceTableColumnSlotUsage } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-table-column-slot-usage.type';

type RebuildWorkspaceTableCommandOptions =
  ProvisionedWorkspaceCommandOptions & {
    tableName?: string[];
    minimumUsedColumnSlotCount?: number;
  };

@Command({
  name: 'workspace:rebuild-table',
  description:
    'Recreate workspace tables to free the column slots held by dropped columns (Postgres allows 1600 per table and never reuses them)',
})
export class RebuildWorkspaceTableCommand extends ProvisionedWorkspaceCommandRunner<RebuildWorkspaceTableCommandOptions> {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceTableRebuildService: WorkspaceTableRebuildService,
  ) {
    super(workspaceIteratorService);
  }

  @Option({
    flags: '--table-name <tableName>',
    description:
      'Table to rebuild. Can be specified multiple times. Defaults to every table at or above --minimum-used-column-slot-count.',
    required: false,
  })
  parseTableName(value: string, previous?: string[]): string[] {
    return [...(previous ?? []), value];
  }

  @Option({
    flags: '--minimum-used-column-slot-count <count>',
    description: `Used column slots from which a table is rebuilt when no --table-name is given (default ${WORKSPACE_TABLE_REBUILD_DEFAULT_MINIMUM_USED_COLUMN_SLOT_COUNT})`,
    required: false,
  })
  parseMinimumUsedColumnSlotCount(value: string): number {
    return parseInt(value, 10);
  }

  override async run(
    passedParams: string[],
    options: RebuildWorkspaceTableCommandOptions,
  ): Promise<void> {
    if (!isDefined(options.workspaceId) || options.workspaceId.size === 0) {
      this.logger.error(
        'At least one --workspace-id must be provided: a rebuild locks the table while its rows are copied.',
      );

      return;
    }

    await super.run(passedParams, options);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs<RebuildWorkspaceTableCommandOptions>): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const columnSlotUsages =
        await this.workspaceTableRebuildService.findColumnSlotUsages({
          queryRunner,
          schemaName,
        });

      const columnSlotUsagesToRebuild = this.selectColumnSlotUsagesOrThrow({
        columnSlotUsages,
        schemaName,
        options,
      });

      for (const columnSlotUsage of columnSlotUsagesToRebuild) {
        const { tableName, usedColumnSlotCount, droppedColumnCount } =
          columnSlotUsage;
        const tableDescription = `${schemaName}.${tableName} (${usedColumnSlotCount} column slots used, ${droppedColumnCount} held by dropped columns) in workspace ${workspaceId}`;

        if (options.dryRun) {
          this.logger.log(`[DRY RUN] Would rebuild ${tableDescription}`);

          continue;
        }

        await this.workspaceTableRebuildService.rebuildTable({
          queryRunner,
          schemaName,
          tableName,
        });

        this.logger.log(`Rebuilt ${tableDescription}`);
      }
    } finally {
      await queryRunner.release();
    }
  }

  private selectColumnSlotUsagesOrThrow({
    columnSlotUsages,
    schemaName,
    options,
  }: {
    columnSlotUsages: WorkspaceTableColumnSlotUsage[];
    schemaName: string;
    options: Pick<
      RebuildWorkspaceTableCommandOptions,
      'tableName' | 'minimumUsedColumnSlotCount'
    >;
  }): WorkspaceTableColumnSlotUsage[] {
    const columnSlotUsagesWithDroppedColumns = columnSlotUsages.filter(
      ({ droppedColumnCount }) => droppedColumnCount > 0,
    );

    if (!isNonEmptyArray(options.tableName)) {
      const minimumUsedColumnSlotCount =
        options.minimumUsedColumnSlotCount ??
        WORKSPACE_TABLE_REBUILD_DEFAULT_MINIMUM_USED_COLUMN_SLOT_COUNT;

      return columnSlotUsagesWithDroppedColumns.filter(
        ({ usedColumnSlotCount }) =>
          usedColumnSlotCount >= minimumUsedColumnSlotCount,
      );
    }

    const existingTableNames = new Set(
      columnSlotUsages.map(({ tableName }) => tableName),
    );
    const missingTableNames = options.tableName.filter(
      (tableName) => !existingTableNames.has(tableName),
    );

    if (isNonEmptyArray(missingTableNames)) {
      throw new WorkspaceMigrationRunnerException({
        message: `Table(s) ${missingTableNames.join(', ')} not found in schema ${schemaName}`,
        code: WorkspaceMigrationRunnerExceptionCode.TABLE_NOT_FOUND,
      });
    }

    const requestedTableNames = new Set(options.tableName);

    return columnSlotUsagesWithDroppedColumns.filter(({ tableName }) =>
      requestedTableNames.has(tableName),
    );
  }
}
