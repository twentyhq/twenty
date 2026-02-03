import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, Option } from 'nest-commander';
import { Repository, EntitySchema, EntityMetadata, DataSource } from 'typeorm';
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
  repeatWorkspace?: number;
  holdReferences?: boolean;
};

// Simulates what happens when we store EntityMetadata in the cache
type StoredMetadata = {
  workspaceId: string;
  iteration: number;
  entityMetadatas: EntityMetadata[];
  createdAt: number;
};

@Injectable()
@Command({
  name: 'workspace:entity-metadata-retention-analyzer',
  description:
    'Analyzes memory retention of TypeORM EntityMetadata when stored (simulates cache behavior)',
})
export class EntityMetadataRetentionAnalyzerCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner<AnalyzerCommandOptions> {
  private repeatWorkspace = 20;
  private holdReferences = true;
  private storedMetadatas: StoredMetadata[] = [];
  private gcAvailable = false;
  private dataSource: DataSource | null = null;

  // Track memory at each step
  private memoryTimeline: Array<{
    step: string;
    heapUsed: number;
    storedCount: number;
  }> = [];

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
    flags: '--repeat-workspace <count>',
    description: 'Number of times to repeat the same workspace (simulates many workspaces)',
    required: false,
  })
  parseRepeatWorkspace(val: string): number {
    const count = parseInt(val, 10);

    if (isNaN(count) || count < 1) {
      throw new Error('repeat-workspace must be a positive number');
    }

    this.repeatWorkspace = count;

    return count;
  }

  @Option({
    flags: '--no-hold-references',
    description: 'Do not hold references to EntityMetadata (test GC behavior)',
    required: false,
  })
  parseNoHoldReferences(): boolean {
    this.holdReferences = false;

    return false;
  }

  private getHeapUsed(): number {
    return Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
  }

  private forceGc(): boolean {
    if (typeof global.gc === 'function') {
      global.gc();

      return true;
    }

    return false;
  }

  private recordMemory(step: string): void {
    this.memoryTimeline.push({
      step,
      heapUsed: this.getHeapUsed(),
      storedCount: this.storedMetadatas.length,
    });
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: AnalyzerCommandOptions,
  ): Promise<void> {
    this.gcAvailable = typeof global.gc === 'function';

    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('EntityMetadata RETENTION ANALYZER'));
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log('');
    this.logger.log(chalk.yellow('Purpose: Simulate cache behavior and measure memory retention'));
    this.logger.log('');
    this.logger.log(chalk.yellow('Configuration:'));
    this.logger.log(`  Repeat workspace: ${this.repeatWorkspace} times`);
    this.logger.log(`  Hold references: ${this.holdReferences}`);
    this.logger.log(`  GC available: ${this.gcAvailable ? 'YES' : 'NO'}`);
    this.logger.log('');

    // Get the DataSource once
    this.dataSource = await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

    if (this.gcAvailable) {
      this.forceGc();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.recordMemory('initial');
    this.logger.log(`Initial heap: ${this.getHeapUsed()}MB`);
    this.logger.log('');

    await super.runMigrationCommand(passedParams, options);

    this.generateRetentionReport();
  }

  override async runOnWorkspace({
    workspaceId,
    index,
    total,
  }: RunOnWorkspaceArgs): Promise<void> {
    // Only use first workspace but repeat it many times
    if (index > 0) {
      return;
    }

    this.logger.log(chalk.blue(`\nUsing workspace: ${workspaceId}`));
    this.logger.log(`Simulating ${this.repeatWorkspace} invalidations...`);

    // Fetch metadata once
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

    // Build entity schemas once
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

    this.logger.log(`  Entity schemas: ${entitySchemas.length}`);
    this.logger.log('');

    // Simulate repeated invalidations (like in migration command)
    for (let i = 0; i < this.repeatWorkspace; i++) {
      // Build EntityMetadatas (this is what happens during each invalidateAndRecompute)
      const entityMetadatas = await this.buildEntityMetadatas(entitySchemas);

      if (this.holdReferences) {
        // Simulate cache storing the reference
        this.storedMetadatas.push({
          workspaceId,
          iteration: i + 1,
          entityMetadatas,
          createdAt: Date.now(),
        });
      }

      // Log every 5 iterations
      if ((i + 1) % 5 === 0 || i === 0) {
        this.recordMemory(`iteration-${i + 1}`);
        this.logger.log(
          `  After ${i + 1} iterations: heap=${this.getHeapUsed()}MB, stored=${this.storedMetadatas.length}`,
        );
      }
    }

    this.recordMemory('after-all-iterations');
    this.logger.log('');
    this.logger.log(chalk.yellow('Final state before cleanup:'));
    this.logger.log(`  Heap: ${this.getHeapUsed()}MB`);
    this.logger.log(`  Stored metadata arrays: ${this.storedMetadatas.length}`);
    this.logger.log(
      `  Total EntityMetadata objects: ${this.storedMetadatas.reduce((sum, s) => sum + s.entityMetadatas.length, 0)}`,
    );
  }

  private async buildEntityMetadatas(
    entitySchemas: EntitySchema[],
  ): Promise<EntityMetadata[]> {
    const transformer = new EntitySchemaTransformer();
    const metadataArgsStorage = transformer.transform(entitySchemas);

    const entityMetadataBuilder = new EntityMetadataBuilder(
      this.dataSource!,
      metadataArgsStorage,
    );

    return entityMetadataBuilder.build();
  }

  private generateRetentionReport(): void {
    this.logger.log('');
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('MEMORY RETENTION ANALYSIS'));
    this.logger.log(chalk.cyan('='.repeat(80)));

    // Show memory timeline
    this.logger.log('');
    this.logger.log(chalk.yellow('Memory Timeline:'));

    for (const entry of this.memoryTimeline) {
      this.logger.log(
        `  ${entry.step}: ${entry.heapUsed}MB (${entry.storedCount} stored)`,
      );
    }

    // Calculate growth
    const initial = this.memoryTimeline[0]?.heapUsed ?? 0;
    const afterIterations =
      this.memoryTimeline.find((e) => e.step === 'after-all-iterations')?.heapUsed ?? 0;

    const growthDuringIterations = afterIterations - initial;
    const perIterationGrowth = growthDuringIterations / this.repeatWorkspace;

    this.logger.log('');
    this.logger.log(chalk.yellow('Growth Analysis (with references held):'));
    this.logger.log(`  Total growth during iterations: ${growthDuringIterations.toFixed(2)}MB`);
    this.logger.log(`  Per-iteration growth: ${perIterationGrowth.toFixed(2)}MB`);
    this.logger.log(`  Iterations: ${this.repeatWorkspace}`);

    // Test cleanup
    this.logger.log('');
    this.logger.log(chalk.yellow('Testing Memory Release:'));

    const beforeCleanup = this.getHeapUsed();

    this.logger.log(`  Before clearing references: ${beforeCleanup}MB`);

    // Clear all stored references
    const storedCount = this.storedMetadatas.length;

    this.storedMetadatas = [];

    if (this.gcAvailable) {
      this.forceGc();
      // Wait for GC
      const waitSync = (ms: number) => {
        const end = Date.now() + ms;

        while (Date.now() < end) {
          // busy wait
        }
      };

      waitSync(100);
      this.forceGc();
      waitSync(100);
    }

    const afterCleanup = this.getHeapUsed();
    const released = beforeCleanup - afterCleanup;

    this.logger.log(`  After clearing ${storedCount} references & GC: ${afterCleanup}MB`);
    this.logger.log(`  Memory released: ${released.toFixed(2)}MB`);

    // Final V8 heap
    const heapStats = v8.getHeapStatistics();

    this.logger.log('');
    this.logger.log(chalk.yellow('Final V8 Heap:'));
    this.logger.log(`  Used: ${Math.round(heapStats.used_heap_size / 1024 / 1024)}MB`);
    this.logger.log(`  Total: ${Math.round(heapStats.total_heap_size / 1024 / 1024)}MB`);
    this.logger.log(`  Limit: ${Math.round(heapStats.heap_size_limit / 1024 / 1024)}MB`);

    // Conclusions
    this.logger.log('');
    this.logger.log(chalk.cyan('='.repeat(80)));
    this.logger.log(chalk.cyan('CONCLUSIONS'));
    this.logger.log(chalk.cyan('='.repeat(80)));

    if (perIterationGrowth > 2) {
      this.logger.log(chalk.red(`\n⚠️  SIGNIFICANT MEMORY GROWTH: ${perIterationGrowth.toFixed(2)}MB per iteration`));
      this.logger.log(chalk.red(`    ${this.repeatWorkspace} iterations consumed ${growthDuringIterations.toFixed(2)}MB`));
      this.logger.log(chalk.red(`    100 workspaces would consume: ~${(perIterationGrowth * 100).toFixed(0)}MB`));
    } else if (perIterationGrowth > 0.5) {
      this.logger.log(chalk.yellow(`\n⚠️  MODERATE MEMORY GROWTH: ${perIterationGrowth.toFixed(2)}MB per iteration`));
    } else {
      this.logger.log(chalk.green(`\n✓ LOW MEMORY GROWTH: ${perIterationGrowth.toFixed(2)}MB per iteration`));
    }

    if (released > growthDuringIterations * 0.8) {
      this.logger.log(chalk.green(`✓ Memory properly released after clearing references (${released.toFixed(2)}MB freed)`));
    } else if (released > 0) {
      this.logger.log(chalk.yellow(`⚠️ Partial memory release: ${released.toFixed(2)}MB freed of ${growthDuringIterations.toFixed(2)}MB growth`));
      this.logger.log(chalk.yellow(`   This suggests some memory is retained by other references`));
    } else {
      this.logger.log(chalk.red(`❌ Memory NOT released after clearing references!`));
      this.logger.log(chalk.red(`   This indicates a memory leak - objects are retained by other refs`));
    }

    // Specific findings about TypeORM
    this.logger.log('');
    this.logger.log(chalk.yellow('TypeORM-Specific Observations:'));
    this.logger.log('  1. Each buildEntityMetadatas() creates new:');
    this.logger.log('     - EntitySchemaTransformer instance');
    this.logger.log('     - MetadataArgsStorage with all schema definitions');
    this.logger.log('     - EntityMetadataBuilder instance');
    this.logger.log('     - EntityMetadata[] array with full object graph');
    this.logger.log('');
    this.logger.log('  2. EntityMetadata contains circular references to:');
    this.logger.log('     - DataSource (shared)');
    this.logger.log('     - Related EntityMetadata objects');
    this.logger.log('     - Column and Relation metadata');
    this.logger.log('');
    this.logger.log('  3. The DataSource reference may prevent proper GC');
    this.logger.log('     because it creates a reference graph that spans');
    this.logger.log('     across all EntityMetadata objects');

    // Recommendations
    this.logger.log('');
    this.logger.log(chalk.cyan('RECOMMENDATIONS:'));
    this.logger.log('');
    this.logger.log('  1. IMMEDIATE (for migration commands):');
    this.logger.log('     - Process workspaces in batches of 10-20');
    this.logger.log('     - Force GC between batches: global.gc()');
    this.logger.log('     - Add --max-old-space-size=4096 to Node options');
    this.logger.log('');
    this.logger.log('  2. MEDIUM-TERM (cache optimization):');
    this.logger.log('     - Clear old EntityMetadata before storing new (already fixed in this PR!)');
    this.logger.log('     - Consider LRU eviction for EntityMetadata cache');
    this.logger.log('');
    this.logger.log('  3. LONG-TERM (architecture):');
    this.logger.log('     - Consider lazy EntityMetadata building');
    this.logger.log('     - Run bulk migrations in worker processes');
    this.logger.log('     - Investigate TypeORM DataSource lifecycle');
  }
}
