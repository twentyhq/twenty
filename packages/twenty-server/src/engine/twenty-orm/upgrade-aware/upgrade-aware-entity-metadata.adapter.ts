import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { type EntityMetadata } from 'typeorm/metadata/EntityMetadata';

import { DataSource } from 'typeorm';

import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { resolveEntityShapeAtUpgradeCursor } from 'src/engine/core-modules/upgrade/utils/resolve-entity-shape-at-upgrade-cursor.util';
import {
  formatUpgradeAwareDecoratorReferenceProblems,
  validateUpgradeAwareEntityDecorators,
} from 'src/engine/core-modules/upgrade/utils/validate-upgrade-aware-entity-decorators.util';
import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';

type EntityMetadataSnapshot = {
  tableName: string;
  tablePath: string;
  givenTableName: string | undefined;
  columnDatabaseNamesByPropertyName: ReadonlyMap<string, string>;
  columnSelectByPropertyName: ReadonlyMap<string, boolean>;
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
  private currentCursor = Number.MAX_SAFE_INTEGER;

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    private readonly upgradeMigrationService: UpgradeMigrationService,
  ) {}

  onModuleInit(): void {
    const sequence = this.upgradeSequenceReaderService.getUpgradeSequence();

    for (const [index, step] of sequence.entries()) {
      this.stepNameToIndex.set(step.name, index);
    }

    this.validateDecoratorsAgainstSequence();
    this.captureCanonicalSnapshots();

    this.currentCursor = sequence.length;
    this.applyCursorToMetadata();

    UpgradeAwareRepositoryState.getInstance().setMetadataService(this);
  }

  async refresh(): Promise<void> {
    const lastAttempted =
      await this.upgradeMigrationService.getLastAttemptedInstanceCommand();

    if (lastAttempted === null) {
      this.currentCursor = 0;
    } else {
      const index = this.stepNameToIndex.get(lastAttempted.name);

      if (index === undefined) {
        this.currentCursor = 0;
      } else {
        this.currentCursor =
          lastAttempted.status === 'completed' ? index + 1 : index;
      }
    }

    this.applyCursorToMetadata();
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

      for (const column of metadata.columns) {
        columnDatabaseNamesByPropertyName.set(
          column.propertyName,
          column.databaseName,
        );
        columnSelectByPropertyName.set(column.propertyName, column.isSelect);
      }

      this.snapshotByMetadata.set(metadata, {
        tableName: metadata.tableName,
        tablePath: metadata.tablePath,
        givenTableName: metadata.givenTableName,
        columnDatabaseNamesByPropertyName,
        columnSelectByPropertyName,
      });
    }
  }

  private applyCursorToMetadata(): void {
    const isStepApplied = (stepName: string) => {
      const index = this.stepNameToIndex.get(stepName);

      if (index === undefined) {
        return false;
      }

      return index < this.currentCursor;
    };

    let renamedCount = 0;
    let unavailableCount = 0;
    let hiddenColumnCount = 0;

    for (const metadata of this.coreDataSource.entityMetadatas) {
      const snapshot = this.snapshotByMetadata.get(metadata);

      if (snapshot === undefined) {
        continue;
      }

      if (typeof metadata.target !== 'function') {
        continue;
      }

      const entityClass = metadata.target;

      const currentColumns: { propertyName: string; databaseName: string }[] =
        [];

      for (const [
        propertyName,
        databaseName,
      ] of snapshot.columnDatabaseNamesByPropertyName) {
        currentColumns.push({ propertyName, databaseName });
      }

      const resolved = resolveEntityShapeAtUpgradeCursor({
        entityClass,
        currentTableName: snapshot.tableName,
        currentColumns,
        isStepApplied,
      });

      this.applyResolvedShapeToMetadata({ metadata, snapshot, resolved });

      this.availabilityByEntityClass.set(entityClass, resolved.isAvailable);
      this.hiddenColumnsByEntityClass.set(
        entityClass,
        resolved.hiddenPropertyNames,
      );

      if (resolved.effectiveTableName !== snapshot.tableName) {
        renamedCount++;
        this.logger.log(
          `[upgrade-metadata] rename ${entityClass.name} ${snapshot.tableName} -> ${resolved.effectiveTableName}`,
        );
      }

      if (!resolved.isAvailable) {
        unavailableCount++;
        this.logger.log(
          `[upgrade-metadata] unavailable ${entityClass.name}`,
        );
      }

      if (resolved.hiddenPropertyNames.size > 0) {
        hiddenColumnCount += resolved.hiddenPropertyNames.size;
        this.logger.log(
          `[upgrade-metadata] hidden columns on ${entityClass.name}: ${[...resolved.hiddenPropertyNames].join(',')}`,
        );
      }
    }

    this.logger.log(
      `[upgrade-metadata] applied cursor=${this.currentCursor} renamed=${renamedCount} unavailable=${unavailableCount} hiddenColumns=${hiddenColumnCount}`,
    );
  }

  private applyResolvedShapeToMetadata({
    metadata,
    snapshot,
    resolved,
  }: {
    metadata: EntityMetadata;
    snapshot: EntityMetadataSnapshot;
    resolved: ReturnType<typeof resolveEntityShapeAtUpgradeCursor>;
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

    for (const column of metadata.columns) {
      this.applyColumnShape({ column, snapshot, resolved });
    }
  }

  private applyColumnShape({
    column,
    snapshot,
    resolved,
  }: {
    column: ColumnMetadata;
    snapshot: EntityMetadataSnapshot;
    resolved: ReturnType<typeof resolveEntityShapeAtUpgradeCursor>;
  }): void {
    const canonicalName = snapshot.columnDatabaseNamesByPropertyName.get(
      column.propertyName,
    );

    if (canonicalName === undefined) {
      return;
    }

    const remappedName = resolved.columnDatabaseNameRemap.get(
      column.propertyName,
    );

    column.databaseName = remappedName ?? canonicalName;

    const canonicalIsSelect =
      snapshot.columnSelectByPropertyName.get(column.propertyName) ?? true;

    column.isSelect = resolved.hiddenPropertyNames.has(column.propertyName)
      ? false
      : canonicalIsSelect;
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
      knownStepNames: new Set(this.stepNameToIndex.keys()),
    });

    if (problems.length === 0) {
      return;
    }

    const formatted = formatUpgradeAwareDecoratorReferenceProblems(problems);

    throw new Error(
      `Upgrade-aware entity decorators reference unknown upgrade step names. ` +
        `Either fix the upgradeCommandName string, or register the missing step.\n${formatted}`,
    );
  }
}
