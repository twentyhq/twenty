import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, Option } from 'nest-commander';
import { Repository, EntitySchema, EntityMetadata } from 'typeorm';
import { EntitySchemaTransformer } from 'typeorm/entity-schema/EntitySchemaTransformer';
import { EntityMetadataBuilder } from 'typeorm/metadata-builder/EntityMetadataBuilder';
import * as v8 from 'v8';

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
import { buildEntitySchemaMetadataMaps } from 'src/engine/twenty-orm/global-workspace-datasource/types/entity-schema-metadata.type';
import { isDefined } from 'twenty-shared/utils';

type AnalyzerCommandOptions = ActiveOrSuspendedWorkspacesMigrationCommandOptions & {
  iterations?: number;
  detailed?: boolean;
};

type ObjectSizeInfo = {
  name: string;
  shallowSize: number;
  estimatedDeepSize: number;
  fieldCount: number;
  relationCount: number;
  columnCount: number;
};

type IterationMetrics = {
  iteration: number;
  heapBefore: number;
  heapAfter: number;
  heapGrowth: number;
  entityMetadataCount: number;
  totalColumnsInMetadata: number;
  totalRelationsInMetadata: number;
};

type WorkspaceAnalysis = {
  workspaceId: string;
  objectCount: number;
  fieldCount: number;
  entitySchemaCount: number;
  iterations: IterationMetrics[];
  objectSizes: ObjectSizeInfo[];
  retainedAfterRelease: number | null;
};

@Injectable()
@Command({
  name: 'workspace:entity-metadata-memory-analyzer',
  description:
    'Analyzes TypeORM EntityMetadata memory usage with detailed object-level breakdown',
})
export class EntityMetadataMemoryAnalyzerCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner<AnalyzerCommandOptions> {
  private iterations = 3;
  private detailed = false;
  private analyses: WorkspaceAnalysis[] = [];
  private gcAvailable = false;
  private entityMetadataRefs: WeakRef<EntityMetadata[]>[] = [];

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly entitySchemaFactory: EntitySchemaFactory,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  @Option({
    flags: '--iterations <count>',
    description: 'Number of EntityMetadata build iterations per workspace (default: 3)',
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

  @Option({
    flags: '--detailed',
    description: 'Show detailed per-object memory breakdown',
    required: false,
  })
  parseDetailed(): boolean {
    this.detailed = true;

    return true;
  }

  private getHeapUsed(): number {
    return Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
  }

  private getV8HeapStats() {
    return v8.getHeapStatistics();
  }

  private forceGc(): boolean {
    if (typeof global.gc === 'function') {
      global.gc();

      return true;
    }

    return false;
  }

  // Estimate object size by counting properties recursively (simplified)
  private estimateObjectSize(obj: unknown, seen = new WeakSet()): number {
    if (obj === null || obj === undefined) {
      return 0;
    }

    if (typeof obj !== 'object') {
      if (typeof obj === 'string') {
        return obj.length * 2; // UTF-16
      }
      if (typeof obj === 'number') {
        return 8;
      }
      if (typeof obj === 'boolean') {
        return 4;
      }

      return 8;
    }

    if (seen.has(obj as object)) {
      return 0; // circular reference
    }

    seen.add(obj as object);

    let size = 0;

    if (Array.isArray(obj)) {
      size += 24; // array overhead
      for (const item of obj) {
        size += this.estimateObjectSize(item, seen);
      }
    } else if (obj instanceof Map) {
      size += 48; // Map overhead
      for (const [key, value] of obj) {
        size += this.estimateObjectSize(key, seen);
        size += this.estimateObjectSize(value, seen);
      }
    } else if (obj instanceof Set) {
      size += 48; // Set overhead
      for (const value of obj) {
        size += this.estimateObjectSize(value, seen);
      }
    } else {
      size += 16; // object overhead
      const keys = Object.keys(obj as object);

      for (const key of keys) {
        size += key.length * 2 + 8; // key string + pointer
        size += this.estimateObjectSize((obj as Record<string, unknown>)[key], seen);
      }
    }

    return size;
  }

  private analyzeEntityMetadata(metadata: EntityMetadata): ObjectSizeInfo {
    const shallowSize =
      Object.keys(metadata).length * 16 + // property pointers
      (metadata.name?.length ?? 0) * 2 +
      (metadata.tableName?.length ?? 0) * 2 +
      (metadata.schema?.length ?? 0) * 2;

    // Estimate deep size (limited depth to avoid circular refs)
    const estimatedDeepSize = this.estimateObjectSize(metadata);

    return {
      name: metadata.name,
      shallowSize,
      estimatedDeepSize,
      fieldCount: metadata.columns?.length ?? 0,
      relationCount: metadata.relations?.length ?? 0,
      columnCount: metadata.columns?.length ?? 0,
    };
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: AnalyzerCommandOptions,
  ): Promise<void> {
    this.gcAvailable = typeof global.gc === 'function';

    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('TypeORM EntityMetadata MEMORY ANALYZER'));
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log('');
    this.logger.log(chalk.yellow('Configuration:'));
    this.logger.log(`  Iterations per workspace: ${this.iterations}`);
    this.logger.log(`  Detailed mode: ${this.detailed}`);
    this.logger.log(`  GC available: ${this.gcAvailable ? 'YES' : 'NO (run with --expose-gc)'}`);
    this.logger.log('');

    const initialV8Stats = this.getV8HeapStats();

    this.logger.log(chalk.yellow('Initial V8 Heap Statistics:'));
    this.logger.log(`  Total heap size: ${Math.round(initialV8Stats.total_heap_size / 1024 / 1024)}MB`);
    this.logger.log(`  Used heap size: ${Math.round(initialV8Stats.used_heap_size / 1024 / 1024)}MB`);
    this.logger.log(`  Heap size limit: ${Math.round(initialV8Stats.heap_size_limit / 1024 / 1024)}MB`);
    this.logger.log(`  Malloced memory: ${Math.round(initialV8Stats.malloced_memory / 1024 / 1024)}MB`);
    this.logger.log(`  External memory: ${Math.round(initialV8Stats.external_memory / 1024 / 1024)}MB`);
    this.logger.log('');

    if (this.gcAvailable) {
      this.forceGc();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const initialHeap = this.getHeapUsed();

    this.logger.log(`Initial heap used: ${initialHeap}MB`);
    this.logger.log('');

    await super.runMigrationCommand(passedParams, options);

    this.generateFinalReport(initialHeap);
  }

  override async runOnWorkspace({
    workspaceId,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(chalk.blue(`\n[${index + 1}/${total}] Analyzing workspace: ${workspaceId}`));

    // Fetch metadata
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

    this.logger.log(`  Objects: ${objectMetadatas.length}, Fields: ${fieldMetadatas.length}`);

    if (objectMetadatas.length === 0) {
      this.logger.log(`  Skipping - no objects`);

      return;
    }

    // Build entity schemas
    const { objectMetadataMaps, fieldMetadataMaps } =
      buildEntitySchemaMetadataMaps(objectMetadatas, fieldMetadatas);

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

    this.logger.log(`  Entity schemas created: ${entitySchemas.length}`);

    const iterations: IterationMetrics[] = [];
    const objectSizes: ObjectSizeInfo[] = [];
    let lastEntityMetadatas: EntityMetadata[] | null = null;

    // Run multiple iterations to measure memory growth per build
    for (let i = 0; i < this.iterations; i++) {
      if (this.gcAvailable) {
        this.forceGc();
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const heapBefore = this.getHeapUsed();

      // Build EntityMetadatas (this is what happens during invalidateAndRecompute)
      const entityMetadatas = await this.buildEntityMetadatas(entitySchemas);

      const heapAfter = this.getHeapUsed();
      const heapGrowth = Math.round((heapAfter - heapBefore) * 100) / 100;

      // Collect detailed object sizes on first iteration
      if (i === 0 && this.detailed) {
        for (const metadata of entityMetadatas) {
          objectSizes.push(this.analyzeEntityMetadata(metadata));
        }
      }

      // Count columns and relations
      let totalColumns = 0;
      let totalRelations = 0;

      for (const em of entityMetadatas) {
        totalColumns += em.columns?.length ?? 0;
        totalRelations += em.relations?.length ?? 0;
      }

      iterations.push({
        iteration: i + 1,
        heapBefore,
        heapAfter,
        heapGrowth,
        entityMetadataCount: entityMetadatas.length,
        totalColumnsInMetadata: totalColumns,
        totalRelationsInMetadata: totalRelations,
      });

      this.logger.log(
        `  Iteration ${i + 1}: heap ${heapBefore}MB → ${heapAfter}MB (Δ ${heapGrowth >= 0 ? '+' : ''}${heapGrowth}MB), ${entityMetadatas.length} entities, ${totalColumns} columns, ${totalRelations} relations`,
      );

      // Keep reference to last one to analyze retention
      lastEntityMetadatas = entityMetadatas;

      // Store weak reference to track GC
      this.entityMetadataRefs.push(new WeakRef(entityMetadatas));
    }

    // Test memory release
    let retainedAfterRelease: number | null = null;

    if (this.gcAvailable && lastEntityMetadatas) {
      const heapBeforeRelease = this.getHeapUsed();

      // Clear the reference
      lastEntityMetadatas = null;

      // Force GC
      this.forceGc();
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.forceGc();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const heapAfterRelease = this.getHeapUsed();

      retainedAfterRelease = Math.round((heapAfterRelease - heapBeforeRelease) * 100) / 100;
      this.logger.log(
        `  After releasing refs & GC: ${heapAfterRelease}MB (released: ${retainedAfterRelease <= 0 ? Math.abs(retainedAfterRelease) : 0}MB)`,
      );
    }

    this.analyses.push({
      workspaceId,
      objectCount: objectMetadatas.length,
      fieldCount: fieldMetadatas.length,
      entitySchemaCount: entitySchemas.length,
      iterations,
      objectSizes,
      retainedAfterRelease,
    });
  }

  private async buildEntityMetadatas(
    entitySchemas: EntitySchema[],
  ): Promise<EntityMetadata[]> {
    const transformer = new EntitySchemaTransformer();
    const metadataArgsStorage = transformer.transform(entitySchemas);

    const dataSource =
      await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();
    const entityMetadataBuilder = new EntityMetadataBuilder(
      dataSource,
      metadataArgsStorage,
    );

    return entityMetadataBuilder.build();
  }

  private generateFinalReport(initialHeap: number): void {
    if (this.gcAvailable) {
      this.forceGc();
    }

    const finalHeap = this.getHeapUsed();
    const finalV8Stats = this.getV8HeapStats();

    this.logger.log('');
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('DETAILED MEMORY ANALYSIS REPORT'));
    this.logger.log(chalk.cyan('='.repeat(80)));

    // Summary
    this.logger.log('');
    this.logger.log(chalk.yellow('Overall Summary:'));
    this.logger.log(`  Workspaces analyzed: ${this.analyses.length}`);
    this.logger.log(`  Initial heap: ${initialHeap}MB`);
    this.logger.log(`  Final heap: ${finalHeap}MB`);
    this.logger.log(`  Total growth: ${(finalHeap - initialHeap).toFixed(2)}MB`);

    if (this.analyses.length === 0) {
      return;
    }

    // Aggregate statistics
    let totalObjects = 0;
    let totalFields = 0;
    let totalEntitySchemas = 0;
    let totalIterationGrowth = 0;
    let iterationCount = 0;

    for (const analysis of this.analyses) {
      totalObjects += analysis.objectCount;
      totalFields += analysis.fieldCount;
      totalEntitySchemas += analysis.entitySchemaCount;

      for (const iteration of analysis.iterations) {
        totalIterationGrowth += iteration.heapGrowth;
        iterationCount++;
      }
    }

    const avgGrowthPerIteration = iterationCount > 0 ? totalIterationGrowth / iterationCount : 0;
    const avgGrowthPerWorkspace = totalIterationGrowth / this.analyses.length;

    this.logger.log('');
    this.logger.log(chalk.yellow('Aggregate Statistics:'));
    this.logger.log(`  Total objects across workspaces: ${totalObjects}`);
    this.logger.log(`  Total fields across workspaces: ${totalFields}`);
    this.logger.log(`  Total entity schemas built: ${totalEntitySchemas}`);
    this.logger.log(`  Average heap growth per EntityMetadata build: ${avgGrowthPerIteration.toFixed(2)}MB`);
    this.logger.log(`  Average heap growth per workspace (${this.iterations} iterations): ${avgGrowthPerWorkspace.toFixed(2)}MB`);

    // Per-iteration analysis
    this.logger.log('');
    this.logger.log(chalk.yellow('Memory Growth by Iteration (all workspaces):'));

    const growthByIteration = new Map<number, number[]>();

    for (const analysis of this.analyses) {
      for (const iteration of analysis.iterations) {
        const existing = growthByIteration.get(iteration.iteration) ?? [];

        existing.push(iteration.heapGrowth);
        growthByIteration.set(iteration.iteration, existing);
      }
    }

    for (const [iterNum, growths] of growthByIteration) {
      const avg = growths.reduce((a, b) => a + b, 0) / growths.length;
      const min = Math.min(...growths);
      const max = Math.max(...growths);

      this.logger.log(
        `  Iteration ${iterNum}: avg=${avg.toFixed(2)}MB, min=${min.toFixed(2)}MB, max=${max.toFixed(2)}MB`,
      );
    }

    // Check if successive iterations show memory accumulation
    this.logger.log('');
    this.logger.log(chalk.yellow('Memory Accumulation Test:'));

    let accumulatesMemory = false;
    const firstIterGrowths = growthByIteration.get(1) ?? [];
    const lastIterGrowths = growthByIteration.get(this.iterations) ?? [];

    if (firstIterGrowths.length > 0 && lastIterGrowths.length > 0) {
      const firstAvg = firstIterGrowths.reduce((a, b) => a + b, 0) / firstIterGrowths.length;
      const lastAvg = lastIterGrowths.reduce((a, b) => a + b, 0) / lastIterGrowths.length;

      this.logger.log(`  First iteration avg growth: ${firstAvg.toFixed(2)}MB`);
      this.logger.log(`  Last iteration avg growth: ${lastAvg.toFixed(2)}MB`);

      if (Math.abs(lastAvg - firstAvg) < 0.5) {
        this.logger.log(chalk.green('  ✓ Memory growth is consistent across iterations (no accumulation)'));
      } else if (lastAvg > firstAvg * 1.2) {
        accumulatesMemory = true;
        this.logger.log(chalk.red('  ⚠️ Later iterations use MORE memory - suggests accumulation!'));
      } else {
        this.logger.log(chalk.green('  ✓ Memory growth decreases in later iterations (good - GC working)'));
      }
    }

    // Detailed object breakdown
    if (this.detailed && this.analyses.some((a) => a.objectSizes.length > 0)) {
      this.logger.log('');
      this.logger.log(chalk.yellow('Detailed EntityMetadata Size Breakdown (first workspace):'));

      const firstWithSizes = this.analyses.find((a) => a.objectSizes.length > 0);

      if (firstWithSizes) {
        const sortedBySize = [...firstWithSizes.objectSizes].sort(
          (a, b) => b.estimatedDeepSize - a.estimatedDeepSize,
        );

        let totalEstimatedSize = 0;

        for (const info of sortedBySize) {
          totalEstimatedSize += info.estimatedDeepSize;
        }

        this.logger.log(`  Total estimated EntityMetadata[] size: ${(totalEstimatedSize / 1024 / 1024).toFixed(2)}MB`);
        this.logger.log('');
        this.logger.log('  Top 10 largest EntityMetadata objects:');

        for (const info of sortedBySize.slice(0, 10)) {
          this.logger.log(
            `    ${info.name}: ~${(info.estimatedDeepSize / 1024).toFixed(1)}KB (${info.columnCount} cols, ${info.relationCount} rels)`,
          );
        }

        // Summary statistics
        const avgSizeKB = totalEstimatedSize / sortedBySize.length / 1024;

        this.logger.log('');
        this.logger.log(`  Average EntityMetadata size: ${avgSizeKB.toFixed(1)}KB`);
        this.logger.log(`  For 29 standard objects + custom: ~${(avgSizeKB * 30 / 1024).toFixed(2)}MB per workspace`);
      }
    }

    // Final V8 stats
    this.logger.log('');
    this.logger.log(chalk.yellow('Final V8 Heap Statistics:'));
    this.logger.log(`  Total heap size: ${Math.round(finalV8Stats.total_heap_size / 1024 / 1024)}MB`);
    this.logger.log(`  Used heap size: ${Math.round(finalV8Stats.used_heap_size / 1024 / 1024)}MB`);
    this.logger.log(`  External memory: ${Math.round(finalV8Stats.external_memory / 1024 / 1024)}MB`);

    // Projections
    this.logger.log('');
    this.logger.log(chalk.yellow('Memory Projections (without proper cleanup):'));

    const perWorkspaceGrowth = avgGrowthPerWorkspace;

    this.logger.log(`  Per workspace growth (${this.iterations} invalidations): ${perWorkspaceGrowth.toFixed(2)}MB`);
    this.logger.log(`  100 workspaces: ~${(initialHeap + perWorkspaceGrowth * 100).toFixed(0)}MB`);
    this.logger.log(`  500 workspaces: ~${(initialHeap + perWorkspaceGrowth * 500).toFixed(0)}MB`);
    this.logger.log(`  1000 workspaces: ~${(initialHeap + perWorkspaceGrowth * 1000).toFixed(0)}MB`);

    // Conclusions
    this.logger.log('');
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('CONCLUSIONS & RECOMMENDATIONS'));
    this.logger.log(chalk.cyan('='.repeat(80)));

    const isHighGrowth = avgGrowthPerIteration > 5;
    const isModerateGrowth = avgGrowthPerIteration > 1;

    if (isHighGrowth) {
      this.logger.log(chalk.red(`\n⚠️  HIGH MEMORY GROWTH: ${avgGrowthPerIteration.toFixed(2)}MB per EntityMetadata build`));
      this.logger.log(chalk.red('    This WILL cause OOM at scale.'));
    } else if (isModerateGrowth) {
      this.logger.log(chalk.yellow(`\n⚠️  MODERATE MEMORY GROWTH: ${avgGrowthPerIteration.toFixed(2)}MB per build`));
      this.logger.log(chalk.yellow('    May cause issues at hundreds of workspaces.'));
    } else {
      this.logger.log(chalk.green(`\n✓ LOW MEMORY GROWTH: ${avgGrowthPerIteration.toFixed(2)}MB per build`));
      this.logger.log(chalk.green('    Memory appears manageable.'));
    }

    this.logger.log('');
    this.logger.log(chalk.yellow('Key Findings:'));
    this.logger.log(`  1. Each EntityMetadata build allocates ~${avgGrowthPerIteration.toFixed(2)}MB`);
    this.logger.log(`  2. TypeORM creates new objects for: EntitySchemaTransformer, MetadataArgsStorage, EntityMetadataBuilder`);
    this.logger.log(`  3. EntityMetadata[] contains circular references (DataSource, relations back to entities)`);

    if (accumulatesMemory) {
      this.logger.log(chalk.red(`  4. Memory ACCUMULATES across builds - GC is not reclaiming properly!`));
    }

    this.logger.log('');
    this.logger.log(chalk.yellow('Recommendations:'));
    this.logger.log('  1. BATCH PROCESSING: Process workspaces in batches with explicit GC between batches');
    this.logger.log('  2. CACHE REUSE: Consider reusing EntitySchemaTransformer instance');
    this.logger.log('  3. LAZY LOADING: Build EntityMetadata only when actually needed, not during cache refresh');
    this.logger.log('  4. DATASOURCE LIFECYCLE: Investigate if DataSource references prevent GC of EntityMetadata');
    this.logger.log('  5. WORKER ISOLATION: Run bulk migrations in child processes with memory limits');
  }
}
