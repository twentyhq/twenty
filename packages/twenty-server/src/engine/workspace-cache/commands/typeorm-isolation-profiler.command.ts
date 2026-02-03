import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, Option } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';
import { EntitySchema } from 'typeorm';
import { EntitySchemaTransformer } from 'typeorm/entity-schema/EntitySchemaTransformer';
import { EntityMetadataBuilder } from 'typeorm/metadata-builder/EntityMetadataBuilder';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type ActiveOrSuspendedWorkspacesMigrationCommandOptions,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import { buildEntitySchemaMetadataMaps } from 'src/engine/twenty-orm/global-workspace-datasource/types/entity-schema-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { isDefined } from 'twenty-shared/utils';

type ProfilerCommandOptions =
  ActiveOrSuspendedWorkspacesMigrationCommandOptions & {
    testMode?: 'all' | 'entity-metadata' | 'query-runner' | 'cache-operations';
    iterations?: number;
  };

type HeapSnapshot = {
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
};

type IsolatedTestResult = {
  testName: string;
  beforeHeap: number;
  afterHeap: number;
  afterGcHeap: number | null;
  growthMB: number;
  retainedMB: number | null;
  iterations: number;
  perIterationMB: number;
};

@Injectable()
@Command({
  name: 'workspace:typeorm-isolation-profiler',
  description:
    'Profiles memory usage of isolated TypeORM operations to identify specific leak sources',
})
export class TypeORMIsolationProfilerCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner<ProfilerCommandOptions> {
  private testMode: ProfilerCommandOptions['testMode'] = 'all';
  private iterations = 10;
  private testResults: IsolatedTestResult[] = [];
  private gcAvailable = false;

  // Keep references to prevent GC during test (for accurate measurement)
  private retainedObjects: unknown[] = [];

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly entitySchemaFactory: EntitySchemaFactory,
    private readonly globalWorkspaceDataSourceService: GlobalWorkspaceDataSourceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  @Option({
    flags: '--test-mode <mode>',
    description:
      'Test mode: all, entity-metadata, query-runner, cache-operations (default: all)',
    required: false,
  })
  parseTestMode(
    val: string,
  ): 'all' | 'entity-metadata' | 'query-runner' | 'cache-operations' {
    const validModes = [
      'all',
      'entity-metadata',
      'query-runner',
      'cache-operations',
    ] as const;

    if (!validModes.includes(val as (typeof validModes)[number])) {
      throw new Error(`Invalid test mode. Valid values: ${validModes.join(', ')}`);
    }

    this.testMode = val as (typeof validModes)[number];

    return this.testMode;
  }

  @Option({
    flags: '--iterations <count>',
    description: 'Number of iterations per test (default: 10)',
    required: false,
  })
  parseIterations(val: string): number {
    const count = parseInt(val, 10);

    if (isNaN(count) || count < 1) {
      throw new Error('iterations must be a positive number');
    }

    this.iterations = count;

    return count;
  }

  private getHeapSnapshot(): HeapSnapshot {
    const memUsage = process.memoryUsage();

    return {
      heapUsedMB: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMB: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
      rssMB: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
    };
  }

  private forceGC(): boolean {
    if (typeof global.gc === 'function') {
      global.gc();

      return true;
    }

    return false;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: ProfilerCommandOptions,
  ): Promise<void> {
    this.gcAvailable = typeof global.gc === 'function';

    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('TypeORM ISOLATION PROFILER'));
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log('');
    this.logger.log(chalk.yellow('Configuration:'));
    this.logger.log(`  Test mode: ${this.testMode}`);
    this.logger.log(`  Iterations per test: ${this.iterations}`);
    this.logger.log(
      `  GC available: ${this.gcAvailable ? 'YES' : 'NO (run with NODE_OPTIONS="--expose-gc" for accurate measurements)'}`,
    );
    this.logger.log('');

    await super.runMigrationCommand(passedParams, options);

    this.generateReport();
  }

  override async runOnWorkspace({
    workspaceId,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      chalk.blue(
        `\n[${index + 1}/${total}] Testing workspace: ${workspaceId}`,
      ),
    );

    // Run isolated tests based on mode
    if (this.testMode === 'all' || this.testMode === 'entity-metadata') {
      await this.testEntityMetadataCreation(workspaceId);
    }

    if (this.testMode === 'all' || this.testMode === 'query-runner') {
      await this.testQueryRunnerLifecycle(workspaceId);
    }

    if (this.testMode === 'all' || this.testMode === 'cache-operations') {
      await this.testCacheOperations(workspaceId);
    }

    // Clear retained objects after tests
    this.retainedObjects = [];
    if (this.gcAvailable) {
      this.forceGC();
    }
  }

  private async testEntityMetadataCreation(
    workspaceId: string,
  ): Promise<void> {
    this.logger.log(chalk.yellow('\n  Test: EntityMetadata Creation'));

    // Get metadata from database
    const [objectMetadatas, fieldMetadatas] = await Promise.all([
      this.objectMetadataRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.fieldMetadataRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
    ]);

    if (objectMetadatas.length === 0) {
      this.logger.log('    Skipping - no object metadata found');

      return;
    }

    const { objectMetadataMaps, fieldMetadataMaps } =
      buildEntitySchemaMetadataMaps(objectMetadatas, fieldMetadatas);

    // Create entity schemas
    const entitySchemas = Object.values(objectMetadataMaps.byId)
      .filter(isDefined)
      .map((objectMetadata) =>
        this.entitySchemaFactory.create(
          workspaceId,
          objectMetadata,
          objectMetadataMaps,
          fieldMetadataMaps,
        ),
      );

    // Clear any GC-able memory before test
    if (this.gcAvailable) {
      this.forceGC();
      await this.sleep(100);
    }

    const beforeHeap = this.getHeapSnapshot();
    const createdMetadatas: unknown[] = [];

    // Test: Create EntityMetadata multiple times
    const dataSource =
      this.globalWorkspaceDataSourceService.getGlobalWorkspaceDataSource();

    for (let i = 0; i < this.iterations; i++) {
      const transformer = new EntitySchemaTransformer();
      const metadataArgsStorage = transformer.transform(
        entitySchemas as EntitySchema[],
      );
      const entityMetadataBuilder = new EntityMetadataBuilder(
        dataSource,
        metadataArgsStorage,
      );
      const metadata = entityMetadataBuilder.build();

      // Keep reference to prevent premature GC
      createdMetadatas.push(metadata);
    }

    const afterHeap = this.getHeapSnapshot();

    // Now clear references and GC
    createdMetadatas.length = 0;

    let afterGcHeap: number | null = null;

    if (this.gcAvailable) {
      this.forceGC();
      await this.sleep(100);
      afterGcHeap = this.getHeapSnapshot().heapUsedMB;
    }

    const growthMB = afterHeap.heapUsedMB - beforeHeap.heapUsedMB;
    const retainedMB = afterGcHeap !== null ? afterGcHeap - beforeHeap.heapUsedMB : null;
    const perIterationMB = growthMB / this.iterations;

    this.testResults.push({
      testName: `EntityMetadata Creation (${workspaceId.slice(0, 8)})`,
      beforeHeap: beforeHeap.heapUsedMB,
      afterHeap: afterHeap.heapUsedMB,
      afterGcHeap,
      growthMB,
      retainedMB,
      iterations: this.iterations,
      perIterationMB,
    });

    this.logger.log(
      `    Before: ${beforeHeap.heapUsedMB}MB, After: ${afterHeap.heapUsedMB}MB`,
    );
    this.logger.log(
      `    Growth: ${growthMB.toFixed(2)}MB total, ${perIterationMB.toFixed(2)}MB per iteration`,
    );
    if (retainedMB !== null) {
      this.logger.log(
        `    Retained after GC: ${retainedMB.toFixed(2)}MB (${((retainedMB / growthMB) * 100).toFixed(1)}% retained)`,
      );
    }
  }

  private async testQueryRunnerLifecycle(workspaceId: string): Promise<void> {
    this.logger.log(chalk.yellow('\n  Test: QueryRunner Lifecycle'));

    if (this.gcAvailable) {
      this.forceGC();
      await this.sleep(100);
    }

    const beforeHeap = this.getHeapSnapshot();
    const queryRunners: unknown[] = [];

    // Test: Create and release query runners
    for (let i = 0; i < this.iterations; i++) {
      const queryRunner = this.coreDataSource.createQueryRunner();

      await queryRunner.connect();

      // Run a simple query
      await queryRunner.query('SELECT 1');

      // Release the runner
      await queryRunner.release();

      // Keep a reference to see if it's truly released
      queryRunners.push(queryRunner);
    }

    const afterHeap = this.getHeapSnapshot();

    // Clear references
    queryRunners.length = 0;

    let afterGcHeap: number | null = null;

    if (this.gcAvailable) {
      this.forceGC();
      await this.sleep(100);
      afterGcHeap = this.getHeapSnapshot().heapUsedMB;
    }

    const growthMB = afterHeap.heapUsedMB - beforeHeap.heapUsedMB;
    const retainedMB = afterGcHeap !== null ? afterGcHeap - beforeHeap.heapUsedMB : null;
    const perIterationMB = growthMB / this.iterations;

    this.testResults.push({
      testName: `QueryRunner Lifecycle (${workspaceId.slice(0, 8)})`,
      beforeHeap: beforeHeap.heapUsedMB,
      afterHeap: afterHeap.heapUsedMB,
      afterGcHeap,
      growthMB,
      retainedMB,
      iterations: this.iterations,
      perIterationMB,
    });

    this.logger.log(
      `    Before: ${beforeHeap.heapUsedMB}MB, After: ${afterHeap.heapUsedMB}MB`,
    );
    this.logger.log(
      `    Growth: ${growthMB.toFixed(2)}MB total, ${perIterationMB.toFixed(2)}MB per iteration`,
    );
    if (retainedMB !== null) {
      this.logger.log(
        `    Retained after GC: ${retainedMB.toFixed(2)}MB`,
      );
    }
  }

  private async testCacheOperations(workspaceId: string): Promise<void> {
    this.logger.log(chalk.yellow('\n  Test: Cache Operations (getOrRecompute + invalidateAndRecompute)'));

    if (this.gcAvailable) {
      this.forceGC();
      await this.sleep(100);
    }

    const beforeHeap = this.getHeapSnapshot();

    // Test: Repeated cache get and invalidate cycles
    const cacheKeys = [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'ORMEntityMetadatas',
    ] as const;

    try {
      for (let i = 0; i < this.iterations; i++) {
        // Get from cache (will compute if not present)
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          ...cacheKeys,
        ]);

        // Invalidate and recompute
        await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          ...cacheKeys,
        ]);
      }
    } catch (error) {
      this.logger.log(`    Error during cache operations: ${error}`);

      return;
    }

    const afterHeap = this.getHeapSnapshot();

    let afterGcHeap: number | null = null;

    if (this.gcAvailable) {
      this.forceGC();
      await this.sleep(100);
      afterGcHeap = this.getHeapSnapshot().heapUsedMB;
    }

    const growthMB = afterHeap.heapUsedMB - beforeHeap.heapUsedMB;
    const retainedMB = afterGcHeap !== null ? afterGcHeap - beforeHeap.heapUsedMB : null;
    const perIterationMB = growthMB / this.iterations;

    this.testResults.push({
      testName: `Cache Operations (${workspaceId.slice(0, 8)})`,
      beforeHeap: beforeHeap.heapUsedMB,
      afterHeap: afterHeap.heapUsedMB,
      afterGcHeap,
      growthMB,
      retainedMB,
      iterations: this.iterations,
      perIterationMB,
    });

    this.logger.log(
      `    Before: ${beforeHeap.heapUsedMB}MB, After: ${afterHeap.heapUsedMB}MB`,
    );
    this.logger.log(
      `    Growth: ${growthMB.toFixed(2)}MB total, ${perIterationMB.toFixed(2)}MB per iteration`,
    );
    if (retainedMB !== null) {
      this.logger.log(
        `    Retained after GC: ${retainedMB.toFixed(2)}MB`,
      );
    }
  }

  private generateReport(): void {
    this.logger.log('');
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('ISOLATION PROFILING REPORT'));
    this.logger.log(chalk.cyan('='.repeat(80)));

    if (this.testResults.length === 0) {
      this.logger.log(chalk.yellow('No test results collected'));

      return;
    }

    // Group results by test type
    const byTestType = new Map<string, IsolatedTestResult[]>();

    for (const result of this.testResults) {
      const testType = result.testName.split(' (')[0];
      const existing = byTestType.get(testType) ?? [];

      existing.push(result);
      byTestType.set(testType, existing);
    }

    // Report each test type
    for (const [testType, results] of byTestType) {
      this.logger.log('');
      this.logger.log(chalk.yellow(`${testType}:`));

      const avgGrowth =
        results.reduce((sum, r) => sum + r.growthMB, 0) / results.length;
      const avgPerIteration =
        results.reduce((sum, r) => sum + r.perIterationMB, 0) / results.length;

      this.logger.log(`  Avg growth per workspace: ${avgGrowth.toFixed(2)}MB`);
      this.logger.log(
        `  Avg per iteration: ${avgPerIteration.toFixed(2)}MB`,
      );

      if (results.some((r) => r.retainedMB !== null)) {
        const retainedResults = results.filter((r) => r.retainedMB !== null);
        const avgRetained =
          retainedResults.reduce((sum, r) => sum + (r.retainedMB ?? 0), 0) /
          retainedResults.length;
        const avgRetainedPct =
          (retainedResults.reduce(
            (sum, r) => sum + (r.retainedMB ?? 0) / r.growthMB,
            0,
          ) /
            retainedResults.length) *
          100;

        this.logger.log(
          `  Avg retained after GC: ${avgRetained.toFixed(2)}MB (${avgRetainedPct.toFixed(1)}%)`,
        );

        if (avgRetainedPct > 50) {
          this.logger.log(
            chalk.red(`  ⚠️ HIGH RETENTION: ${avgRetainedPct.toFixed(1)}% of allocated memory is not being released!`),
          );
        }
      }
    }

    // Summary and recommendations
    this.logger.log('');
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('ANALYSIS & RECOMMENDATIONS'));
    this.logger.log(chalk.cyan('='.repeat(80)));

    // Find the biggest contributor
    const allTestTypes = Array.from(byTestType.entries());
    const sortedByGrowth = allTestTypes.sort((a, b) => {
      const avgA = a[1].reduce((sum, r) => sum + r.perIterationMB, 0) / a[1].length;
      const avgB = b[1].reduce((sum, r) => sum + r.perIterationMB, 0) / b[1].length;

      return avgB - avgA;
    });

    if (sortedByGrowth.length > 0) {
      const [topTest, topResults] = sortedByGrowth[0];
      const topAvg =
        topResults.reduce((sum, r) => sum + r.perIterationMB, 0) /
        topResults.length;

      this.logger.log('');
      this.logger.log(
        chalk.yellow(`Biggest memory contributor: ${topTest}`),
      );
      this.logger.log(`  Average: ${topAvg.toFixed(2)}MB per iteration`);

      if (topTest.includes('EntityMetadata')) {
        this.logger.log('');
        this.logger.log(chalk.cyan('Recommendations for EntityMetadata:'));
        this.logger.log(
          '  1. TypeORM EntityMetadataBuilder creates objects that reference the DataSource',
        );
        this.logger.log(
          '  2. Consider caching EntityMetadata at the DataSource level, not per-workspace',
        );
        this.logger.log(
          '  3. Investigate if EntityMetadata can be cleared from DataSource when workspace is unloaded',
        );
        this.logger.log(
          '  4. For bulk operations, consider processing in batches with explicit cleanup',
        );
      } else if (topTest.includes('QueryRunner')) {
        this.logger.log('');
        this.logger.log(chalk.cyan('Recommendations for QueryRunner:'));
        this.logger.log(
          '  1. Ensure all query runners are properly released after use',
        );
        this.logger.log(
          '  2. Check for any try/catch blocks that might skip release()',
        );
        this.logger.log(
          '  3. Consider using connection pooling more aggressively',
        );
      } else if (topTest.includes('Cache')) {
        this.logger.log('');
        this.logger.log(chalk.cyan('Recommendations for Cache Operations:'));
        this.logger.log(
          '  1. The fix in this PR (deleteFromLocalCache) should help',
        );
        this.logger.log(
          '  2. Consider adding cache entry limits per workspace',
        );
        this.logger.log(
          '  3. Implement LRU eviction for workspace caches',
        );
      }
    }

    // Projected impact
    this.logger.log('');
    this.logger.log(chalk.yellow('Memory Projections for 100 Workspaces:'));

    let totalProjectedGrowth = 0;

    for (const [testType, results] of byTestType) {
      const avgPerWorkspace =
        results.reduce((sum, r) => sum + r.growthMB, 0) / results.length;

      totalProjectedGrowth += avgPerWorkspace;
      this.logger.log(
        `  ${testType}: ${(avgPerWorkspace * 100).toFixed(0)}MB`,
      );
    }

    this.logger.log('');
    this.logger.log(
      chalk.yellow(
        `  Total projected for 100 workspaces: ${(totalProjectedGrowth * 100).toFixed(0)}MB`,
      ),
    );

    if (totalProjectedGrowth * 100 > 3000) {
      this.logger.log(
        chalk.red(
          '  ⚠️ This exceeds the 3GB threshold that caused the OOM!',
        ),
      );
    }
  }
}
