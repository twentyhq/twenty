import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type ActiveOrSuspendedWorkspacesMigrationCommandOptions,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ValidatorCommandOptions = ActiveOrSuspendedWorkspacesMigrationCommandOptions & {
  invalidationsPerWorkspace?: number;
};

type CacheStats = {
  totalEntries: number;
  totalVersions: number;
  entriesWithMultipleVersions: number;
  maxVersionsInEntry: number;
};

@Injectable()
@Command({
  name: 'workspace:cache-memory-leak-validator',
  description:
    'Validates the memory leak hypothesis in WorkspaceCacheService by simulating invalidateAndRecompute calls',
})
export class WorkspaceCacheMemoryLeakValidatorCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner<ValidatorCommandOptions> {
  private invalidationsPerWorkspace = 5;
  private initialStats: CacheStats | null = null;
  private processedWorkspaces = 0;
  private statsHistory: Array<{ workspace: number; stats: CacheStats }> = [];

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  @Option({
    flags: '--invalidations-per-workspace <count>',
    description: 'Number of invalidateAndRecompute calls per workspace (default: 5)',
    required: false,
  })
  parseInvalidationsPerWorkspace(val: string): number {
    const count = parseInt(val, 10);

    if (isNaN(count) || count <= 0) {
      throw new Error('invalidations-per-workspace must be a positive number');
    }

    this.invalidationsPerWorkspace = count;

    return count;
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ValidatorCommandOptions,
  ): Promise<void> {
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('WORKSPACE CACHE MEMORY LEAK VALIDATOR'));
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log('');
    this.logger.log(
      `Configuration: ${this.invalidationsPerWorkspace} invalidations per workspace`,
    );
    this.logger.log('');

    // Capture initial state
    this.initialStats = this.getCacheStats();
    this.logger.log(chalk.yellow('Initial cache state:'));
    this.logCacheStats(this.initialStats);
    this.logger.log('');

    await super.runMigrationCommand(passedParams, options);

    // Final summary
    this.logger.log('');
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('FINAL SUMMARY'));
    this.logger.log(chalk.cyan('='.repeat(80)));

    const finalStats = this.getCacheStats();

    this.logger.log('');
    this.logger.log(chalk.yellow('Initial state:'));
    this.logCacheStats(this.initialStats);

    this.logger.log('');
    this.logger.log(chalk.yellow('Final state:'));
    this.logCacheStats(finalStats);

    this.logger.log('');
    this.logger.log(chalk.yellow('Growth analysis:'));
    this.logger.log(
      `  Total entries growth: ${this.initialStats.totalEntries} → ${finalStats.totalEntries} (${finalStats.totalEntries - this.initialStats.totalEntries} new)`,
    );
    this.logger.log(
      `  Total versions growth: ${this.initialStats.totalVersions} → ${finalStats.totalVersions} (${finalStats.totalVersions - this.initialStats.totalVersions} new)`,
    );
    this.logger.log(
      `  Max versions in single entry: ${this.initialStats.maxVersionsInEntry} → ${finalStats.maxVersionsInEntry}`,
    );

    // Calculate expected vs actual
    // After proper cleanup: each workspace should have at most 1 version per cache key
    // With the bug: versions accumulate (invalidationsPerWorkspace + 1 per workspace per key)
    const totalInvalidations =
      this.processedWorkspaces * this.invalidationsPerWorkspace;

    this.logger.log('');
    this.logger.log(chalk.yellow('Leak detection:'));
    this.logger.log(`  Workspaces processed: ${this.processedWorkspaces}`);
    this.logger.log(`  Total invalidations performed: ${totalInvalidations}`);

    const versionGrowth = finalStats.totalVersions - this.initialStats.totalVersions;
    const entriesWithMultipleVersionsGrowth =
      finalStats.entriesWithMultipleVersions -
      this.initialStats.entriesWithMultipleVersions;

    if (finalStats.maxVersionsInEntry > 1 || entriesWithMultipleVersionsGrowth > 0) {
      this.logger.log('');
      this.logger.log(
        chalk.red('⚠️  MEMORY LEAK DETECTED: Multiple versions accumulating in cache entries'),
      );
      this.logger.log(
        chalk.red(
          `   ${finalStats.entriesWithMultipleVersions} entries have multiple versions`,
        ),
      );
      this.logger.log(
        chalk.red(`   Max versions in a single entry: ${finalStats.maxVersionsInEntry}`),
      );
    } else {
      this.logger.log('');
      this.logger.log(
        chalk.green('✓ No memory leak detected: Cache entries properly cleaned up'),
      );
    }

    // Log version growth per workspace
    if (this.statsHistory.length > 0) {
      this.logger.log('');
      this.logger.log(chalk.yellow('Version growth timeline:'));

      for (const entry of this.statsHistory) {
        this.logger.log(
          `  After workspace ${entry.workspace}: ${entry.stats.totalVersions} total versions, ${entry.stats.entriesWithMultipleVersions} entries with multiple versions, max ${entry.stats.maxVersionsInEntry} versions`,
        );
      }
    }
  }

  override async runOnWorkspace({
    workspaceId,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.processedWorkspaces++;

    const beforeStats = this.getCacheStats();

    this.logger.log(
      chalk.blue(
        `\n[${index + 1}/${total}] Processing workspace: ${workspaceId}`,
      ),
    );
    this.logger.log(`  Before: ${beforeStats.totalVersions} total versions`);

    // First, do a getOrRecompute to populate cache (simulating normal access)
    try {
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

      this.logger.log('  Initial getOrRecompute completed');
    } catch {
      this.logger.log('  Initial getOrRecompute failed (workspace may not have data source)');

      return;
    }

    const afterInitialGet = this.getCacheStats();

    this.logger.log(
      `  After initial get: ${afterInitialGet.totalVersions} total versions`,
    );

    // Now simulate multiple invalidateAndRecompute calls (as happens in migrations)
    for (let i = 0; i < this.invalidationsPerWorkspace; i++) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

      const afterInvalidation = this.getCacheStats();

      this.logger.log(
        `  After invalidation ${i + 1}: ${afterInvalidation.totalVersions} total versions, ${afterInvalidation.entriesWithMultipleVersions} entries with multiple versions`,
      );
    }

    const afterStats = this.getCacheStats();

    this.logger.log(
      `  Final: ${afterStats.totalVersions} total versions (growth: +${afterStats.totalVersions - beforeStats.totalVersions})`,
    );

    this.statsHistory.push({
      workspace: this.processedWorkspaces,
      stats: afterStats,
    });
  }

  private getCacheStats(): CacheStats {
    // Access the private localCache through reflection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const localCache = (this.workspaceCacheService as any).localCache as Map<
      string,
      { versions: Map<string, unknown>; latestHash: string; lastHashCheckedAt: number }
    >;

    let totalVersions = 0;
    let entriesWithMultipleVersions = 0;
    let maxVersionsInEntry = 0;

    for (const entry of localCache.values()) {
      const versionCount = entry.versions.size;

      totalVersions += versionCount;

      if (versionCount > 1) {
        entriesWithMultipleVersions++;
      }

      if (versionCount > maxVersionsInEntry) {
        maxVersionsInEntry = versionCount;
      }
    }

    return {
      totalEntries: localCache.size,
      totalVersions,
      entriesWithMultipleVersions,
      maxVersionsInEntry,
    };
  }

  private logCacheStats(stats: CacheStats): void {
    this.logger.log(`  Total cache entries: ${stats.totalEntries}`);
    this.logger.log(`  Total versions across all entries: ${stats.totalVersions}`);
    this.logger.log(
      `  Entries with multiple versions: ${stats.entriesWithMultipleVersions}`,
    );
    this.logger.log(`  Max versions in a single entry: ${stats.maxVersionsInEntry}`);
  }
}
