import { Injectable, type OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { type ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { type EntityMetadata } from 'typeorm/metadata/EntityMetadata';

import { DataSource } from 'typeorm';

import { UpgradePositionRegistry } from 'src/engine/core-modules/upgrade/services/upgrade-position-registry.service';
import { type UpgradePosition } from 'src/engine/core-modules/upgrade/types/upgrade-position.type';
import { resolveEntityShapeForUpgradePosition } from 'src/engine/core-modules/upgrade/utils/resolve-entity-shape-for-upgrade-position.util';
import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';

type EntityMetadataSnapshot = {
  tableName: string;
  tablePath: string;
  givenTableName: string | undefined;
  columnDatabaseNamesByPropertyName: ReadonlyMap<string, string>;
  columnSelectByPropertyName: ReadonlyMap<string, boolean>;
};

// Mutates the core DataSource's EntityMetadata in place so TypeORM queries
// emit table and column names that match the database at the current upgrade
// position. NestJS injects Repository<T> instances once at module init; since
// EntityMetadata is shared by reference, mutating it propagates to every
// existing repository without re-initializing the DataSource.
//
// At boot we snapshot the canonical (final-state) shape of every entity. Each
// time UpgradePositionRegistry fires, we recompute the effective shape and
// either rewrite metadata fields or restore them to the snapshot.
@Injectable()
export class UpgradeAwareEntityMetadataService implements OnModuleInit {
  private readonly snapshotByMetadata = new WeakMap<
    EntityMetadata,
    EntityMetadataSnapshot
  >();

  private readonly availabilityByEntityClass = new WeakMap<Function, boolean>();
  private readonly hiddenColumnsByEntityClass = new WeakMap<
    Function,
    ReadonlySet<string>
  >();

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly upgradePositionRegistry: UpgradePositionRegistry,
  ) {}

  onModuleInit(): void {
    this.captureCanonicalSnapshots();

    this.upgradePositionRegistry.onPositionChanged((position) => {
      this.applyPositionToMetadata(position);
    });

    // Apply the boot position once so all consumers (including the sidecar
    // maps) reflect a consistent state immediately.
    this.applyPositionToMetadata(
      this.upgradePositionRegistry.getCurrentPosition(),
    );

    // Hand ourselves to the singleton state so the repository proxies
    // installed at TypeOrmModule.forRoot time can resolve real availability.
    UpgradeAwareRepositoryState.getInstance().setMetadataService(this);
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

  private applyPositionToMetadata(position: UpgradePosition): void {
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

      const resolved = resolveEntityShapeForUpgradePosition({
        entityClass,
        currentTableName: snapshot.tableName,
        currentColumns,
        position,
      });

      this.applyResolvedShapeToMetadata({ metadata, snapshot, resolved });

      this.availabilityByEntityClass.set(entityClass, resolved.isAvailable);
      this.hiddenColumnsByEntityClass.set(
        entityClass,
        resolved.hiddenPropertyNames,
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
    resolved: ReturnType<typeof resolveEntityShapeForUpgradePosition>;
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
    resolved: ReturnType<typeof resolveEntityShapeForUpgradePosition>;
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

    // Hide not-yet-introduced columns so auto-generated SELECT lists don't
    // reference them. Explicit selects in `find({ select: [...] })` still
    // pass through; the proxy short-circuits the entity entirely when the
    // class itself is unavailable.
    if (resolved.hiddenPropertyNames.has(column.propertyName)) {
      column.isSelect = false;
    } else {
      column.isSelect = canonicalIsSelect;
    }
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
}
