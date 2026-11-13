import { Command, Option } from 'nest-commander';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  ProvisionedWorkspaceCommandRunner,
  type ProvisionedWorkspaceCommandOptions,
} from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { OBJECT_REBUILD_MINIMUM_USED_COLUMN_SLOT_COUNT } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/object-rebuild-minimum-used-column-slot-count.constant';
import { DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';

type RebuildWorkspaceObjectCommandOptions =
  ProvisionedWorkspaceCommandOptions & {
    objectNameSingular?: string[];
    minimumUsedColumnSlotCount?: number;
  };

@Command({
  name: 'workspace:rebuild-object',
  description:
    'Schedule the rebuild of object tables to free the column slots held by dropped columns (Postgres allows 1600 per table and never reuses them)',
})
export class RebuildWorkspaceObjectCommand extends ProvisionedWorkspaceCommandRunner<RebuildWorkspaceObjectCommandOptions> {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    private readonly deferredWorkspaceOperationRunnerService: DeferredWorkspaceOperationRunnerService,
  ) {
    super(workspaceIteratorService);
  }

  @Option({
    flags: '--object-name-singular <objectNameSingular>',
    description:
      'Object to rebuild. Can be specified multiple times. Defaults to every object whose table is at or above --minimum-used-column-slot-count.',
    required: false,
  })
  parseObjectNameSingular(value: string, previous?: string[]): string[] {
    return [...(previous ?? []), value];
  }

  @Option({
    flags: '--minimum-used-column-slot-count <count>',
    description: `Used column slots from which an object is rebuilt when no --object-name-singular is given (default ${OBJECT_REBUILD_MINIMUM_USED_COLUMN_SLOT_COUNT})`,
    required: false,
  })
  parseMinimumUsedColumnSlotCount(value: string): number {
    return parseInt(value, 10);
  }

  override async run(
    passedParams: string[],
    options: RebuildWorkspaceObjectCommandOptions,
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
  }: RunOnWorkspaceArgs<RebuildWorkspaceObjectCommandOptions>): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const flatObjectMetadatas = this.selectFlatObjectMetadatasOrThrow({
      flatObjectMetadatas: Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      ).filter(isDefined),
      objectNamesSingular: options.objectNameSingular,
    });

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const columnSlotUsages =
        await this.workspaceSchemaManagerService.tableManager.findColumnSlotUsages(
          { queryRunner, schemaName },
        );
      const columnSlotUsageByTableName = new Map(
        columnSlotUsages.map((columnSlotUsage) => [
          columnSlotUsage.tableName,
          columnSlotUsage,
        ]),
      );
      const minimumUsedColumnSlotCount = isNonEmptyArray(
        options.objectNameSingular,
      )
        ? 0
        : (options.minimumUsedColumnSlotCount ??
          OBJECT_REBUILD_MINIMUM_USED_COLUMN_SLOT_COUNT);

      let scheduledRebuildCount = 0;

      for (const flatObjectMetadata of flatObjectMetadatas) {
        const columnSlotUsage = columnSlotUsageByTableName.get(
          computeObjectTargetTable(flatObjectMetadata),
        );

        if (
          !isDefined(columnSlotUsage) ||
          columnSlotUsage.droppedColumnCount === 0 ||
          columnSlotUsage.usedColumnSlotCount < minimumUsedColumnSlotCount
        ) {
          continue;
        }

        const objectDescription = `object ${flatObjectMetadata.nameSingular} (${columnSlotUsage.usedColumnSlotCount} column slots used, ${columnSlotUsage.droppedColumnCount} held by dropped columns) in workspace ${workspaceId}`;

        if (options.dryRun) {
          this.logger.log(
            `[DRY RUN] Would schedule the rebuild of ${objectDescription}`,
          );

          continue;
        }

        await this.deferredWorkspaceOperationRunnerService.persist({
          deferredOperations: [
            {
              name: 'rebuild_object',
              payload: { objectMetadataId: flatObjectMetadata.id },
            },
          ],
          workspaceId,
          applicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
          queryRunner,
        });

        scheduledRebuildCount++;

        this.logger.log(`Scheduled the rebuild of ${objectDescription}`);
      }

      if (scheduledRebuildCount > 0) {
        await this.deferredWorkspaceOperationRunnerService.enqueue(workspaceId);
      }
    } finally {
      await queryRunner.release();
    }
  }

  private selectFlatObjectMetadatasOrThrow({
    flatObjectMetadatas,
    objectNamesSingular,
  }: {
    flatObjectMetadatas: FlatObjectMetadata[];
    objectNamesSingular?: string[];
  }): FlatObjectMetadata[] {
    if (!isNonEmptyArray(objectNamesSingular)) {
      return flatObjectMetadatas;
    }

    const flatObjectMetadataByNameSingular = new Map(
      flatObjectMetadatas.map((flatObjectMetadata) => [
        flatObjectMetadata.nameSingular,
        flatObjectMetadata,
      ]),
    );

    return objectNamesSingular.map((objectNameSingular) => {
      const flatObjectMetadata =
        flatObjectMetadataByNameSingular.get(objectNameSingular);

      if (!isDefined(flatObjectMetadata)) {
        throw new ObjectMetadataException(
          `Object ${objectNameSingular} not found`,
          ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      return flatObjectMetadata;
    });
  }
}
