import { Command, Option } from 'nest-commander';
import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import {
  ActiveOrSuspendedWorkspaceCommandRunner,
  type ActiveOrSuspendedWorkspaceCommandOptions,
} from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

type FlatCacheFlushCommandOptions = ActiveOrSuspendedWorkspaceCommandOptions & {
  metadataName?: string[];
  allMetadata?: boolean;
};

@Command({
  name: 'cache:flat-cache-invalidate',
  description:
    'Flush flat entity cache for specific metadata names and workspaces',
})
export class FlatCacheInvalidateCommand extends ActiveOrSuspendedWorkspaceCommandRunner<FlatCacheFlushCommandOptions> {
  private flatMapsKeysToFlush: (keyof AllFlatEntityMaps)[] = [];

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(workspaceIteratorService);
  }

  @Option({
    flags: '--metadataName <metadataName>',
    description:
      'Metadata name(s) to flush cache for. Can be specified multiple times.',
    required: false,
  })
  parseMetadataName(val: string, previous?: string[]): string[] {
    const accumulator = previous ?? [];

    accumulator.push(val);

    return accumulator;
  }

  @Option({
    flags: '--all-metadata',
    description:
      'Flush cache for all metadata names. Takes precedence over --metadataName.',
    required: false,
  })
  parseAllMetadata(): boolean {
    return true;
  }

  override async run(
    passedParams: string[],
    options: FlatCacheFlushCommandOptions,
  ): Promise<void> {
    const metadataNames = options.metadataName ?? [];

    if (!options.allMetadata && metadataNames.length === 0) {
      this.logger.error(
        'Either --all-metadata or at least one --metadataName must be provided.',
      );

      return;
    }

    const validatedMetadataNames = this.validateAndExpandMetadataNames({
      inputMetadataNames: metadataNames,
      allMetadata: options.allMetadata,
    });

    if (validatedMetadataNames === null) {
      return;
    }

    this.flatMapsKeysToFlush = this.computeFlatMapsKeysWithRelated(
      validatedMetadataNames,
    );

    this.logger.log(
      `Will flush cache for the following flat maps keys: ${this.flatMapsKeysToFlush.join(', ')}`,
    );

    await super.run(passedParams, options);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: this.flatMapsKeysToFlush,
      workspaceId,
    });

    this.logger.log(
      `Successfully invalidated cache for workspace: ${workspaceId}`,
    );
  }

  private validateAndExpandMetadataNames({
    inputMetadataNames,
    allMetadata,
  }: {
    inputMetadataNames: string[];
    allMetadata?: boolean;
  }): AllMetadataName[] | null {
    const validMetadataNames = Object.keys(
      ALL_METADATA_NAME,
    ) as AllMetadataName[];

    if (allMetadata) {
      this.logger.log('Using all metadata names');

      return validMetadataNames;
    }

    const invalidNames = inputMetadataNames.filter(
      (name) => !validMetadataNames.includes(name as AllMetadataName),
    );

    if (invalidNames.length > 0) {
      this.logger.error(
        `Invalid metadata name(s) provided: ${invalidNames.join(', ')}`,
      );
      this.logger.error(
        `Valid metadata names are: ${validMetadataNames.join(', ')}, or use --all-metadata`,
      );

      return null;
    }

    return inputMetadataNames as AllMetadataName[];
  }

  private computeFlatMapsKeysWithRelated(
    metadataNames: AllMetadataName[],
  ): ReturnType<typeof getMetadataFlatEntityMapsKey>[] {
    const allMetadataNamesToFlush = [
      ...new Set([
        ...metadataNames,
        ...metadataNames.flatMap(getMetadataRelatedMetadataNames),
      ]),
    ];

    const allFlatMapsKeys = allMetadataNamesToFlush.map(
      getMetadataFlatEntityMapsKey,
    );

    return allFlatMapsKeys;
  }
}
