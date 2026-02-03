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

type ProfilerCommandOptions = ActiveOrSuspendedWorkspacesMigrationCommandOptions & {
  simulateInvalidations?: number;
  forceGcBetweenWorkspaces?: boolean;
};

type HeapSnapshot = {
  timestamp: number;
  heapUsedMB: number;
  heapTotalMB: number;
  externalMB: number;
  arrayBuffersMB: number;
  rssMB: number;
};

type WorkspaceMetrics = {
  workspaceId: string;
  index: number;
  beforeHeap: HeapSnapshot;
  afterInitialGet: HeapSnapshot;
  afterInvalidations: HeapSnapshot;
  afterGc: HeapSnapshot | null;
  heapGrowthMB: number;
  retainedAfterGcMB: number | null;
};

@Injectable()
@Command({
  name: 'workspace:typeorm-memory-profiler',
  description:
    'Profiles actual heap memory usage during workspace cache operations to identify TypeORM memory issues',
})
export class TypeORMMemoryProfilerCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner<ProfilerCommandOptions> {
  private simulateInvalidations = 1;
  private forceGcBetweenWorkspaces = false;
  private workspaceMetrics: WorkspaceMetrics[] = [];
  private initialHeap: HeapSnapshot | null = null;
  private gcAvailable = false;

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
    flags: '--simulate-invalidations <count>',
    description: 'Number of invalidateAndRecompute calls per workspace (default: 1)',
    required: false,
  })
  parseSimulateInvalidations(val: string): number {
    const count = parseInt(val, 10);

    if (isNaN(count) || count < 0) {
      throw new Error('simulate-invalidations must be a non-negative number');
    }

    this.simulateInvalidations = count;

    return count;
  }

  @Option({
    flags: '--force-gc',
    description: 'Force garbage collection between workspaces (requires --expose-gc flag)',
    required: false,
  })
  parseForceGc(): boolean {
    this.forceGcBetweenWorkspaces = true;

    return true;
  }

  private getHeapSnapshot(): HeapSnapshot {
    const memUsage = process.memoryUsage();

    return {
      timestamp: Date.now(),
      heapUsedMB: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMB: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
      externalMB: Math.round((memUsage.external / 1024 / 1024) * 100) / 100,
      arrayBuffersMB: Math.round((memUsage.arrayBuffers / 1024 / 1024) * 100) / 100,
      rssMB: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
    };
  }

  private formatHeapSnapshot(snapshot: HeapSnapshot): string {
    return `heap: ${snapshot.heapUsedMB}MB / ${snapshot.heapTotalMB}MB, RSS: ${snapshot.rssMB}MB, external: ${snapshot.externalMB}MB`;
  }

  private forceGarbageCollection(): boolean {
    if (typeof global.gc === 'function') {
      global.gc();

      return true;
    }

    return false;
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ProfilerCommandOptions,
  ): Promise<void> {
    this.gcAvailable = typeof global.gc === 'function';

    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('TypeORM MEMORY PROFILER'));
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log('');
    this.logger.log(chalk.yellow('Configuration:'));
    this.logger.log(`  Invalidations per workspace: ${this.simulateInvalidations}`);
    this.logger.log(`  Force GC between workspaces: ${this.forceGcBetweenWorkspaces}`);
    this.logger.log(`  GC available: ${this.gcAvailable ? 'YES' : 'NO (run with --expose-gc for accurate measurements)'}`);
    this.logger.log('');

    // Force GC before starting to get clean baseline
    if (this.gcAvailable) {
      this.forceGarbageCollection();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.initialHeap = this.getHeapSnapshot();
    this.logger.log(chalk.yellow('Initial memory state:'));
    this.logger.log(`  ${this.formatHeapSnapshot(this.initialHeap)}`);
    this.logger.log('');

    await super.runMigrationCommand(passedParams, options);

    // Final report
    this.generateReport();
  }

  override async runOnWorkspace({
    workspaceId,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    const beforeHeap = this.getHeapSnapshot();

    this.logger.log(
      chalk.blue(`\n[${index + 1}/${total}] Processing workspace: ${workspaceId}`),
    );
    this.logger.log(`  Before: ${this.formatHeapSnapshot(beforeHeap)}`);

    // Step 1: Initial getOrRecompute (simulates normal cache access)
    let afterInitialGet: HeapSnapshot;

    try {
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatApplicationMaps',
        'ORMEntityMetadatas',
        'rolesPermissions',
        'featureFlagsMap',
        'userWorkspaceRoleMap',
        'flatIndexMaps',
      ]);

      afterInitialGet = this.getHeapSnapshot();
      this.logger.log(
        `  After getOrRecompute: ${this.formatHeapSnapshot(afterInitialGet)} (+${(afterInitialGet.heapUsedMB - beforeHeap.heapUsedMB).toFixed(2)}MB)`,
      );
    } catch (error) {
      this.logger.log(`  Skipping workspace - getOrRecompute failed: ${error}`);

      return;
    }

    // Step 2: Simulate invalidations (as happens in migration commands)
    let afterInvalidations = afterInitialGet;

    for (let i = 0; i < this.simulateInvalidations; i++) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatApplicationMaps',
        'ORMEntityMetadatas',
        'featureFlagsMap',
      ]);

      afterInvalidations = this.getHeapSnapshot();
      this.logger.log(
        `  After invalidation ${i + 1}: ${this.formatHeapSnapshot(afterInvalidations)} (+${(afterInvalidations.heapUsedMB - afterInitialGet.heapUsedMB).toFixed(2)}MB)`,
      );
    }

    // Step 3: Force GC and measure retained memory
    let afterGc: HeapSnapshot | null = null;
    let retainedAfterGcMB: number | null = null;

    if (this.forceGcBetweenWorkspaces && this.gcAvailable) {
      this.forceGarbageCollection();
      await new Promise((resolve) => setTimeout(resolve, 50));
      afterGc = this.getHeapSnapshot();
      retainedAfterGcMB = afterGc.heapUsedMB - beforeHeap.heapUsedMB;
      this.logger.log(
        `  After GC: ${this.formatHeapSnapshot(afterGc)} (retained: +${retainedAfterGcMB.toFixed(2)}MB)`,
      );
    }

    const heapGrowthMB = afterInvalidations.heapUsedMB - beforeHeap.heapUsedMB;

    this.workspaceMetrics.push({
      workspaceId,
      index,
      beforeHeap,
      afterInitialGet,
      afterInvalidations,
      afterGc,
      heapGrowthMB,
      retainedAfterGcMB,
    });
  }

  private generateReport(): void {
    if (!this.initialHeap) {
      return;
    }

    // Force final GC
    if (this.gcAvailable) {
      this.forceGarbageCollection();
    }

    const finalHeap = this.getHeapSnapshot();

    this.logger.log('');
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('MEMORY PROFILING REPORT'));
    this.logger.log(chalk.cyan('='.repeat(80)));

    this.logger.log('');
    this.logger.log(chalk.yellow('Overall Memory Growth:'));
    this.logger.log(`  Initial heap: ${this.initialHeap.heapUsedMB}MB`);
    this.logger.log(`  Final heap: ${finalHeap.heapUsedMB}MB`);
    this.logger.log(
      `  Total growth: ${(finalHeap.heapUsedMB - this.initialHeap.heapUsedMB).toFixed(2)}MB`,
    );
    this.logger.log(`  Workspaces processed: ${this.workspaceMetrics.length}`);

    if (this.workspaceMetrics.length > 0) {
      const avgGrowthPerWorkspace =
        (finalHeap.heapUsedMB - this.initialHeap.heapUsedMB) / this.workspaceMetrics.length;

      this.logger.log(`  Avg growth per workspace: ${avgGrowthPerWorkspace.toFixed(2)}MB`);

      // Calculate growth from getOrRecompute vs invalidations
      const totalGetGrowth = this.workspaceMetrics.reduce(
        (sum, m) => sum + (m.afterInitialGet.heapUsedMB - m.beforeHeap.heapUsedMB),
        0,
      );
      const totalInvalidationGrowth = this.workspaceMetrics.reduce(
        (sum, m) => sum + (m.afterInvalidations.heapUsedMB - m.afterInitialGet.heapUsedMB),
        0,
      );

      this.logger.log('');
      this.logger.log(chalk.yellow('Growth Breakdown:'));
      this.logger.log(`  From getOrRecompute: ${totalGetGrowth.toFixed(2)}MB total`);
      this.logger.log(
        `  From invalidations: ${totalInvalidationGrowth.toFixed(2)}MB total`,
      );
      this.logger.log(
        `  Avg getOrRecompute growth: ${(totalGetGrowth / this.workspaceMetrics.length).toFixed(2)}MB per workspace`,
      );

      if (this.simulateInvalidations > 0) {
        this.logger.log(
          `  Avg invalidation growth: ${(totalInvalidationGrowth / this.workspaceMetrics.length).toFixed(2)}MB per workspace (${this.simulateInvalidations} invalidations each)`,
        );
      }

      // If GC data is available
      if (this.forceGcBetweenWorkspaces && this.gcAvailable) {
        const retainedMetrics = this.workspaceMetrics.filter((m) => m.retainedAfterGcMB !== null);

        if (retainedMetrics.length > 0) {
          const totalRetained = retainedMetrics.reduce(
            (sum, m) => sum + (m.retainedAfterGcMB ?? 0),
            0,
          );
          const avgRetained = totalRetained / retainedMetrics.length;

          this.logger.log('');
          this.logger.log(chalk.yellow('Retained Memory (after GC):'));
          this.logger.log(`  Total retained: ${totalRetained.toFixed(2)}MB`);
          this.logger.log(`  Avg retained per workspace: ${avgRetained.toFixed(2)}MB`);
        }
      }

      // Top memory consumers
      this.logger.log('');
      this.logger.log(chalk.yellow('Per-Workspace Memory Growth (sorted by growth):'));

      const sorted = [...this.workspaceMetrics].sort(
        (a, b) => b.heapGrowthMB - a.heapGrowthMB,
      );
      const top10 = sorted.slice(0, 10);

      for (const m of top10) {
        this.logger.log(
          `  Workspace ${m.index + 1} (${m.workspaceId.slice(0, 8)}...): +${m.heapGrowthMB.toFixed(2)}MB (get: +${(m.afterInitialGet.heapUsedMB - m.beforeHeap.heapUsedMB).toFixed(2)}MB, invalidations: +${(m.afterInvalidations.heapUsedMB - m.afterInitialGet.heapUsedMB).toFixed(2)}MB)`,
        );
      }

      // Memory growth timeline
      this.logger.log('');
      this.logger.log(chalk.yellow('Heap Timeline (every 10 workspaces):'));

      for (let i = 0; i < this.workspaceMetrics.length; i += 10) {
        const m = this.workspaceMetrics[i];

        this.logger.log(
          `  After workspace ${m.index + 1}: ${m.afterInvalidations.heapUsedMB}MB heap, ${m.afterInvalidations.rssMB}MB RSS`,
        );
      }

      // Final workspace if not already shown
      if (this.workspaceMetrics.length % 10 !== 1) {
        const last = this.workspaceMetrics[this.workspaceMetrics.length - 1];

        this.logger.log(
          `  After workspace ${last.index + 1}: ${last.afterInvalidations.heapUsedMB}MB heap, ${last.afterInvalidations.rssMB}MB RSS`,
        );
      }
    }

    // Estimate for 100 workspaces
    if (this.workspaceMetrics.length > 0) {
      const avgGrowthPerWorkspace =
        (finalHeap.heapUsedMB - this.initialHeap.heapUsedMB) / this.workspaceMetrics.length;

      this.logger.log('');
      this.logger.log(chalk.yellow('Projections:'));
      this.logger.log(
        `  Estimated memory for 100 workspaces: ${(this.initialHeap.heapUsedMB + avgGrowthPerWorkspace * 100).toFixed(0)}MB`,
      );
      this.logger.log(
        `  Estimated memory for 500 workspaces: ${(this.initialHeap.heapUsedMB + avgGrowthPerWorkspace * 500).toFixed(0)}MB`,
      );
      this.logger.log(
        `  Estimated memory for 1000 workspaces: ${(this.initialHeap.heapUsedMB + avgGrowthPerWorkspace * 1000).toFixed(0)}MB`,
      );
    }

    // Conclusions
    this.logger.log('');
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('ANALYSIS'));
    this.logger.log(chalk.cyan('='.repeat(80)));

    const totalGrowth = finalHeap.heapUsedMB - this.initialHeap.heapUsedMB;
    const workspaceCount = this.workspaceMetrics.length;

    if (workspaceCount > 0) {
      const avgGrowth = totalGrowth / workspaceCount;

      // Determine severity
      if (avgGrowth > 10) {
        this.logger.log(
          chalk.red(`⚠️  HIGH MEMORY GROWTH: ${avgGrowth.toFixed(2)}MB per workspace`),
        );
        this.logger.log(
          chalk.red('   This will likely cause OOM for large workspace counts'),
        );
      } else if (avgGrowth > 2) {
        this.logger.log(
          chalk.yellow(`⚠️  MODERATE MEMORY GROWTH: ${avgGrowth.toFixed(2)}MB per workspace`),
        );
        this.logger.log(chalk.yellow('   May cause issues at scale (hundreds of workspaces)'));
      } else {
        this.logger.log(
          chalk.green(`✓ LOW MEMORY GROWTH: ${avgGrowth.toFixed(2)}MB per workspace`),
        );
        this.logger.log(chalk.green('   Memory usage appears acceptable'));
      }

      // Specific findings
      const totalGetGrowth = this.workspaceMetrics.reduce(
        (sum, m) => sum + (m.afterInitialGet.heapUsedMB - m.beforeHeap.heapUsedMB),
        0,
      );
      const totalInvalidationGrowth = this.workspaceMetrics.reduce(
        (sum, m) => sum + (m.afterInvalidations.heapUsedMB - m.afterInitialGet.heapUsedMB),
        0,
      );

      this.logger.log('');
      if (totalGetGrowth > totalInvalidationGrowth * 2) {
        this.logger.log(
          chalk.yellow('→ Most growth comes from getOrRecompute, not invalidations'),
        );
        this.logger.log(
          chalk.yellow('   TypeORM EntityMetadata creation is likely the main contributor'),
        );
      } else if (totalInvalidationGrowth > totalGetGrowth) {
        this.logger.log(
          chalk.yellow('→ Invalidations are causing more growth than initial fetch'),
        );
        this.logger.log(chalk.yellow('   This suggests cache cleanup may not be releasing memory'));
      }
    }
  }
}
