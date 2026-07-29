import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { type EntityMetadata } from 'typeorm/metadata/EntityMetadata';

import { DataSource } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { type UpgradeMigrationStatus } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import {
  type UpgradeStep,
  UpgradeSequenceReaderService,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import {
  resolveEntityShapeAtUpgradeCursor,
  type ResolvedEntityShapeAtUpgradeCursor,
} from 'src/engine/core-modules/upgrade/utils/resolve-entity-shape-at-upgrade-cursor.util';
import {
  formatUpgradeAwareDecoratorReferenceProblems,
  validateUpgradeAwareEntityDecorators,
} from 'src/engine/core-modules/upgrade/utils/validate-upgrade-aware-entity-decorators.util';
import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';

type EntityMetadataSnapshot = {
  tableName: string;
  tablePath: string;
  givenTableName: string | undefined;
  canonicalColumns: ReadonlyArray<ColumnMetadata>;
  columnDatabaseNamesByPropertyName: ReadonlyMap<string, string>;
  columnSelectByPropertyName: ReadonlyMap<string, boolean>;
  columnInsertByPropertyName: ReadonlyMap<string, boolean>;
  columnUpdateByPropertyName: ReadonlyMap<string, boolean>;
};

@Injectable()
export class UpgradeAwareEntityMetadataAdapter implements OnModuleInit {
  private readonly logger = new Logger(UpgradeAwareEntityMetadataAdapter.name);

  private readonly snapshotByMetadata = new WeakMap<
    EntityMetadata,
    EntityMetadataSnapshot
  >();

  private readonly availabilityByEntityClass = new WeakMap<Function, boolean>();
  private readonly hiddenColumnsByEntityClass = new WeakMap<
    Function,
    ReadonlySet<string>
  >();

  private stepNameToIndex: Map<string, number> = new Map();
  private sequence: UpgradeStep[] = [];
  private currentCursor = Number.MAX_SAFE_INTEGER;
  private databaseColumnsByTablePath: ReadonlyMap<string, ReadonlySet<string>> =
    new Map();

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
  ) {}

  async onModuleInit(): Promise<void> {
    const sequence = this.upgradeSequenceReaderService.getUpgradeSequence();

    this.sequence = sequence;

    for (const [index, step] of sequence.entries()) {
      this.stepNameToIndex.set(step.name, index);
    }

    this.validateDecoratorsAgainstSequence();
    this.captureCanonicalSnapshots();

    this.currentCursor = sequence.length;
    this.applyCursorToMetadata();

    UpgradeAwareRepositoryState.getInstance().setMetadataService(this);

    try {
      await this.refresh();
    } catch (error) {
      this.logger.log(
        `[upgrade-metadata] initial refresh skipped (core.upgradeMigration not readable yet): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async refresh(): Promise<void> {
    const statusByInstanceCommandName =
      await this.upgradeMigrationService.getLatestInstanceCommandStatuses();

    const nextCursor = this.computeCursor(statusByInstanceCommandName);

    this.databaseColumnsByTablePath = await this.loadDatabaseColumns();

    if (nextCursor === this.currentCursor) {
      return;
    }

    this.currentCursor = nextCursor;
    this.applyCursorToMetadata();
  }

  // The cursor is the position of the first instance step that has not
  // completed, resolved against the sequence order declared in code. It is
  // deliberately not derived from the newest upgradeMigration row: slow
  // instance commands, retries and --force runs write rows whose createdAt is
  // newer than steps that ran long before them, so a timestamp anchor drags
  // the cursor backwards and starts hiding columns that are physically there.
  private computeCursor(
    statusByInstanceCommandName: ReadonlyMap<string, UpgradeMigrationStatus>,
  ): number {
    let cursor = 0;

    for (const [index, step] of this.sequence.entries()) {
      if (step.kind === 'workspace') {
        continue;
      }

      if (statusByInstanceCommandName.get(step.name) !== 'completed') {
        this.logger.log(
          `[upgrade-metadata] cursor stops at ${step.name} (status=${
            statusByInstanceCommandName.get(step.name) ?? 'not attempted'
          })`,
        );

        return cursor;
      }

      cursor = index + 1;
    }

    return this.sequence.length;
  }

  private async loadDatabaseColumns(): Promise<
    ReadonlyMap<string, ReadonlySet<string>>
  > {
    const schemas = [
      ...new Set(
        this.coreDataSource.entityMetadatas
          .map((metadata) => metadata.schema)
          .filter(isDefined),
      ),
    ];

    if (schemas.length === 0) {
      return new Map();
    }

    const rows: {
      table_schema: string;
      table_name: string;
      column_name: string;
    }[] = await this.coreDataSource.query(
      `SELECT table_schema, table_name, column_name
         FROM information_schema.columns
         WHERE table_schema = ANY($1)`,
      [schemas],
    );

    const columnsByTablePath = new Map<string, Set<string>>();

    for (const row of rows) {
      const tablePath = `${row.table_schema}.${row.table_name}`;
      const columns = columnsByTablePath.get(tablePath) ?? new Set<string>();

      columns.add(row.column_name);
      columnsByTablePath.set(tablePath, columns);
    }

    return columnsByTablePath;
  }

  isEntityAvailable(entityClass: Function): boolean {
    return this.availabilityByEntityClass.get(entityClass) ?? true;
  }

  getHiddenColumnPropertyNames(entityClass: Function): ReadonlySet<string> {
    return this.hiddenColumnsByEntityClass.get(entityClass) ?? new Set();
  }

  private captureCanonicalSnapshots(): void {
    for (const metadata of this.coreDataSource.entityMetadatas) {
      const columnDatabaseNamesByPropertyName = new Map<string, string>();
      const columnSelectByPropertyName = new Map<string, boolean>();
      const columnInsertByPropertyName = new Map<string, boolean>();
      const columnUpdateByPropertyName = new Map<string, boolean>();

      for (const column of metadata.columns) {
        columnDatabaseNamesByPropertyName.set(
          column.propertyName,
          column.databaseName,
        );
        columnSelectByPropertyName.set(column.propertyName, column.isSelect);
        columnInsertByPropertyName.set(column.propertyName, column.isInsert);
        columnUpdateByPropertyName.set(column.propertyName, column.isUpdate);
      }

      this.snapshotByMetadata.set(metadata, {
        tableName: metadata.tableName,
        tablePath: metadata.tablePath,
        givenTableName: metadata.givenTableName,
        canonicalColumns: [...metadata.columns],
        columnDatabaseNamesByPropertyName,
        columnSelectByPropertyName,
        columnInsertByPropertyName,
        columnUpdateByPropertyName,
      });
    }
  }

  private applyCursorToMetadata(): void {
    const isStepApplied = this.buildIsStepAppliedPredicate();

    let renamedCount = 0;
    let unavailableCount = 0;
    let hiddenColumnCount = 0;

    for (const metadata of this.coreDataSource.entityMetadatas) {
      const applied = this.applyCursorToEntity({ metadata, isStepApplied });

      if (!isDefined(applied)) {
        continue;
      }

      if (applied.resolved.effectiveTableName !== applied.snapshot.tableName) {
        renamedCount++;
      }

      if (!applied.resolved.isAvailable) {
        unavailableCount++;
      }

      hiddenColumnCount += applied.resolved.hiddenPropertyNames.size;
    }

    this.logger.log(
      `[upgrade-metadata] applied cursor=${this.currentCursor} renamed=${renamedCount} unavailable=${unavailableCount} hiddenColumns=${hiddenColumnCount}`,
    );
  }

  private buildIsStepAppliedPredicate(): (stepName: string) => boolean {
    return (stepName: string) => {
      const index = this.stepNameToIndex.get(stepName);

      if (!isDefined(index)) {
        return false;
      }

      return index < this.currentCursor;
    };
  }

  private applyCursorToEntity({
    metadata,
    isStepApplied,
  }: {
    metadata: EntityMetadata;
    isStepApplied: (stepName: string) => boolean;
  }):
    | {
        snapshot: EntityMetadataSnapshot;
        resolved: ResolvedEntityShapeAtUpgradeCursor;
      }
    | undefined {
    const snapshot = this.snapshotByMetadata.get(metadata);

    if (!isDefined(snapshot) || typeof metadata.target !== 'function') {
      return undefined;
    }

    const entityClass = metadata.target;

    const currentColumns = [...snapshot.columnDatabaseNamesByPropertyName].map(
      ([propertyName, databaseName]) => ({ propertyName, databaseName }),
    );

    const resolvedAtCursor = resolveEntityShapeAtUpgradeCursor({
      entityClass,
      currentTableName: snapshot.tableName,
      currentColumns,
      isStepApplied,
    });

    const resolved = this.reconcileWithDatabase({
      metadata,
      snapshot,
      resolved: resolvedAtCursor,
    });

    this.applyResolvedShapeToMetadata({ metadata, snapshot, resolved });

    this.availabilityByEntityClass.set(entityClass, resolved.isAvailable);
    this.hiddenColumnsByEntityClass.set(
      entityClass,
      resolved.hiddenPropertyNames,
    );

    this.logResolvedShape({ entityClass, snapshot, resolved });

    return { snapshot, resolved };
  }

  // The cursor only ever proposes a shape; the database decides. Every
  // rewrite this adapter makes exists to stop TypeORM naming something the
  // database does not have, so a rewrite the database contradicts can only
  // break the instance. A stalled or stale cursor must degrade into running
  // against the real schema, never into emitting SQL that cannot execute.
  private reconcileWithDatabase({
    metadata,
    snapshot,
    resolved,
  }: {
    metadata: EntityMetadata;
    snapshot: EntityMetadataSnapshot;
    resolved: ResolvedEntityShapeAtUpgradeCursor;
  }): ResolvedEntityShapeAtUpgradeCursor {
    if (this.databaseColumnsByTablePath.size === 0) {
      return resolved;
    }

    const entityName =
      typeof metadata.target === 'function'
        ? metadata.target.name
        : snapshot.tableName;
    const schema = metadata.schema ?? snapshot.tablePath.split('.')[0];

    const effectiveTableName = this.resolveTableNameAgainstDatabase({
      entityName,
      schema,
      snapshot,
      proposedTableName: resolved.effectiveTableName,
    });

    const databaseColumns = this.databaseColumnsByTablePath.get(
      `${schema}.${effectiveTableName}`,
    );

    if (!isDefined(databaseColumns)) {
      return { ...resolved, effectiveTableName };
    }

    const columnDatabaseNameRemap = new Map(resolved.columnDatabaseNameRemap);

    for (const [propertyName, renamedTo] of resolved.columnDatabaseNameRemap) {
      const canonicalName =
        snapshot.columnDatabaseNamesByPropertyName.get(propertyName);

      if (
        !databaseColumns.has(renamedTo) &&
        isDefined(canonicalName) &&
        databaseColumns.has(canonicalName)
      ) {
        this.logger.warn(
          `[upgrade-metadata] not renaming ${entityName}.${propertyName} to ${renamedTo}: ` +
            `the cursor says the rename is pending but ${effectiveTableName}.${canonicalName} is what exists`,
        );
        columnDatabaseNameRemap.delete(propertyName);
      }
    }

    const hiddenPropertyNames = new Set<string>();

    for (const propertyName of resolved.hiddenPropertyNames) {
      const databaseName =
        columnDatabaseNameRemap.get(propertyName) ??
        snapshot.columnDatabaseNamesByPropertyName.get(propertyName);

      if (isDefined(databaseName) && databaseColumns.has(databaseName)) {
        this.logger.warn(
          `[upgrade-metadata] keeping ${entityName}.${propertyName} visible: ` +
            `the cursor would hide it but ${effectiveTableName}.${databaseName} exists in the database`,
        );
        continue;
      }

      hiddenPropertyNames.add(propertyName);
    }

    if (!resolved.isAvailable) {
      this.logger.warn(
        `[upgrade-metadata] keeping ${entityName} available: ` +
          `the cursor says it is not introduced yet but ${effectiveTableName} exists in the database`,
      );
    }

    return {
      isAvailable: true,
      effectiveTableName,
      hiddenPropertyNames,
      columnDatabaseNameRemap,
    };
  }

  private resolveTableNameAgainstDatabase({
    entityName,
    schema,
    snapshot,
    proposedTableName,
  }: {
    entityName: string;
    schema: string;
    snapshot: EntityMetadataSnapshot;
    proposedTableName: string;
  }): string {
    if (proposedTableName === snapshot.tableName) {
      return proposedTableName;
    }

    if (this.databaseColumnsByTablePath.has(`${schema}.${proposedTableName}`)) {
      return proposedTableName;
    }

    if (
      !this.databaseColumnsByTablePath.has(`${schema}.${snapshot.tableName}`)
    ) {
      return proposedTableName;
    }

    this.logger.warn(
      `[upgrade-metadata] not renaming ${entityName} to ${proposedTableName}: ` +
        `the cursor says the rename is pending but ${snapshot.tableName} is what exists`,
    );

    return snapshot.tableName;
  }

  private logResolvedShape({
    entityClass,
    snapshot,
    resolved,
  }: {
    entityClass: Function;
    snapshot: EntityMetadataSnapshot;
    resolved: ResolvedEntityShapeAtUpgradeCursor;
  }): void {
    if (resolved.effectiveTableName !== snapshot.tableName) {
      this.logger.log(
        `[upgrade-metadata] rename ${entityClass.name} ${snapshot.tableName} -> ${resolved.effectiveTableName}`,
      );
    }

    if (!resolved.isAvailable) {
      this.logger.log(`[upgrade-metadata] unavailable ${entityClass.name}`);
    }

    if (resolved.hiddenPropertyNames.size > 0) {
      this.logger.log(
        `[upgrade-metadata] hidden columns on ${entityClass.name}: ${[...resolved.hiddenPropertyNames].join(',')}`,
      );
    }
  }

  private applyResolvedShapeToMetadata({
    metadata,
    snapshot,
    resolved,
  }: {
    metadata: EntityMetadata;
    snapshot: EntityMetadataSnapshot;
    resolved: ResolvedEntityShapeAtUpgradeCursor;
  }): void {
    if (resolved.effectiveTableName === snapshot.tableName) {
      metadata.tableName = snapshot.tableName;
      metadata.tablePath = snapshot.tablePath;
      metadata.givenTableName = snapshot.givenTableName;
    } else {
      metadata.tableName = resolved.effectiveTableName;
      metadata.tablePath = this.computeTablePath({
        metadata,
        effectiveTableName: resolved.effectiveTableName,
      });
      metadata.givenTableName = resolved.effectiveTableName;
    }

    metadata.columns = [...snapshot.canonicalColumns];

    for (const column of metadata.columns) {
      this.applyColumnShape({ column, snapshot, resolved });
    }

    metadata.columns = metadata.columns.filter(
      (column) => !resolved.hiddenPropertyNames.has(column.propertyName),
    );
  }

  private applyColumnShape({
    column,
    snapshot,
    resolved,
  }: {
    column: ColumnMetadata;
    snapshot: EntityMetadataSnapshot;
    resolved: ResolvedEntityShapeAtUpgradeCursor;
  }): void {
    const canonicalName = snapshot.columnDatabaseNamesByPropertyName.get(
      column.propertyName,
    );

    if (!isDefined(canonicalName)) {
      return;
    }

    const remappedName = resolved.columnDatabaseNameRemap.get(
      column.propertyName,
    );

    column.databaseName = remappedName ?? canonicalName;

    const isHidden = resolved.hiddenPropertyNames.has(column.propertyName);

    const canonicalIsSelect =
      snapshot.columnSelectByPropertyName.get(column.propertyName) ?? true;
    const canonicalIsInsert =
      snapshot.columnInsertByPropertyName.get(column.propertyName) ?? true;
    const canonicalIsUpdate =
      snapshot.columnUpdateByPropertyName.get(column.propertyName) ?? true;

    column.isSelect = isHidden ? false : canonicalIsSelect;
    column.isInsert = isHidden ? false : canonicalIsInsert;
    column.isUpdate = isHidden ? false : canonicalIsUpdate;
  }

  private computeTablePath({
    metadata,
    effectiveTableName,
  }: {
    metadata: EntityMetadata;
    effectiveTableName: string;
  }): string {
    if (metadata.schema) {
      return `${metadata.schema}.${effectiveTableName}`;
    }

    if (metadata.database) {
      return `${metadata.database}.${effectiveTableName}`;
    }

    return effectiveTableName;
  }

  private validateDecoratorsAgainstSequence(): void {
    const entityClasses = this.coreDataSource.entityMetadatas
      .map((metadata) => metadata.target)
      .filter((target): target is Function => typeof target === 'function');

    const problems = validateUpgradeAwareEntityDecorators({
      entityClasses,
      stepNameToIndex: this.stepNameToIndex,
    });

    if (problems.length === 0) {
      return;
    }

    const formatted = formatUpgradeAwareDecoratorReferenceProblems(problems);

    throw new Error(
      `Upgrade-aware entity decorators have problems. ` +
        `Either fix the upgradeCommandName strings, register the missing steps, or reorder the rename history.\n${formatted}`,
    );
  }
}
