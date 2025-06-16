import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'class-validator';
import {
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

import {
  WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnAlter,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationColumnCreateRelation,
  WorkspaceMigrationColumnDrop,
  WorkspaceMigrationColumnDropRelation,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationEnumService } from 'src/engine/workspace-manager/workspace-migration-runner/services/workspace-migration-enum.service';
import { WorkspaceMigrationTypeService } from 'src/engine/workspace-manager/workspace-migration-runner/services/workspace-migration-type.service';
import { convertOnDeleteActionToOnDelete } from 'src/engine/workspace-manager/workspace-migration-runner/utils/convert-on-delete-action-to-on-delete.util';

@Injectable()
export class WorkspaceMigrationColumnService {
  private readonly logger = new Logger(WorkspaceMigrationColumnService.name);

  constructor(
    private readonly workspaceMigrationEnumService: WorkspaceMigrationEnumService,
    private readonly workspaceMigrationTypeService: WorkspaceMigrationTypeService,
  ) {}

  public async handleColumnChanges(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnMigrations?: WorkspaceMigrationColumnAction[],
  ) {
    if (!columnMigrations || columnMigrations.length === 0) {
      return;
    }

    const columnsByAction = this.groupColumnsByAction(columnMigrations);

    if (columnsByAction.create.length > 0) {
      await this.handleCreateColumns(
        queryRunner,
        schemaName,
        tableName,
        columnsByAction.create,
      );
    }

    if (columnsByAction.drop.length > 0) {
      await this.handleDropColumns(
        queryRunner,
        schemaName,
        tableName,
        columnsByAction.drop,
      );
    }

    await this.handleOtherColumnActions(
      queryRunner,
      schemaName,
      tableName,
      columnsByAction.alter,
      columnsByAction.createForeignKey,
      columnsByAction.dropForeignKey,
    );
  }

  private groupColumnsByAction(
    columnMigrations: WorkspaceMigrationColumnAction[],
  ) {
    return columnMigrations.reduce(
      (acc, column) => {
        switch (column.action) {
          case WorkspaceMigrationColumnActionType.CREATE:
            acc.create.push(column as WorkspaceMigrationColumnCreate);
            break;
          case WorkspaceMigrationColumnActionType.ALTER:
            acc.alter.push(column as WorkspaceMigrationColumnAlter);
            break;
          case WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY:
            acc.createForeignKey.push(
              column as WorkspaceMigrationColumnCreateRelation,
            );
            break;
          case WorkspaceMigrationColumnActionType.DROP_FOREIGN_KEY:
            acc.dropForeignKey.push(
              column as WorkspaceMigrationColumnDropRelation,
            );
            break;
          case WorkspaceMigrationColumnActionType.DROP:
            acc.drop.push(column as WorkspaceMigrationColumnDrop);
            break;
        }

        return acc;
      },
      {
        create: [] as WorkspaceMigrationColumnCreate[],
        alter: [] as WorkspaceMigrationColumnAlter[],
        createForeignKey: [] as WorkspaceMigrationColumnCreateRelation[],
        dropForeignKey: [] as WorkspaceMigrationColumnDropRelation[],
        drop: [] as WorkspaceMigrationColumnDrop[],
      },
    );
  }

  public createTableColumnFromMigration(
    tableName: string,
    column: WorkspaceMigrationColumnCreate,
  ): TableColumn {
    const enumName = column.enum?.length
      ? `${tableName}_${column.columnName}_enum`
      : undefined;

    return new TableColumn({
      name: column.columnName,
      type: column.columnType,
      default: column.defaultValue,
      isPrimary: column.columnName === 'id',
      enum: column.enum?.filter(
        (value): value is string => typeof value === 'string',
      ),
      enumName: enumName,
      isArray: column.isArray,
      isNullable: column.isNullable,
      asExpression: column.asExpression,
      generatedType: column.generatedType,
    });
  }

  public async handleCreateColumns(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    createColumns: WorkspaceMigrationColumnCreate[],
  ) {
    if (createColumns.length === 0) return;

    const table = await queryRunner.getTable(`${schemaName}.${tableName}`);

    if (!table) {
      throw new Error(`Table "${tableName}" not found`);
    }

    const existingColumns = new Set(table.columns.map((column) => column.name));

    const columnsToCreate = createColumns.filter(
      (column) => !existingColumns.has(column.columnName),
    );

    if (columnsToCreate.length === 0) return;

    const tableColumns = columnsToCreate.map((column) =>
      this.createTableColumnFromMigration(tableName, column),
    );

    await queryRunner.addColumns(`${schemaName}.${tableName}`, tableColumns);
  }

  public async handleDropColumns(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    dropColumns: WorkspaceMigrationColumnDrop[],
  ) {
    if (dropColumns.length === 0) return;

    const columnNames = dropColumns.map((column) => column.columnName);

    await queryRunner.dropColumns(`${schemaName}.${tableName}`, columnNames);
  }

  public async handleOtherColumnActions(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    alterColumns: WorkspaceMigrationColumnAlter[],
    createForeignKeyColumns: WorkspaceMigrationColumnCreateRelation[],
    dropForeignKeyColumns: WorkspaceMigrationColumnDropRelation[],
  ) {
    for (const column of alterColumns) {
      await this.alterColumn(queryRunner, schemaName, tableName, column);
    }

    for (const column of createForeignKeyColumns) {
      await this.createRelation(queryRunner, schemaName, tableName, column);
    }

    for (const column of dropForeignKeyColumns) {
      await this.dropRelation(queryRunner, schemaName, tableName, column);
    }
  }

  public async alterColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnAlter,
  ) {
    const enumValues = migrationColumn.alteredColumnDefinition.enum;

    // TODO: Maybe we can do something better if we can recreate the old `TableColumn` object
    if (enumValues) {
      // This is returning the old enum values to avoid TypeORM dropping the enum type
      await this.workspaceMigrationEnumService.alterEnum(
        queryRunner,
        schemaName,
        tableName,
        migrationColumn,
      );

      return;
    }

    if (
      migrationColumn.currentColumnDefinition.columnType !==
      migrationColumn.alteredColumnDefinition.columnType
    ) {
      await this.workspaceMigrationTypeService.alterType(
        queryRunner,
        schemaName,
        tableName,
        migrationColumn,
      );

      migrationColumn.currentColumnDefinition.columnType =
        migrationColumn.alteredColumnDefinition.columnType;

      return;
    }

    await queryRunner.changeColumn(
      `${schemaName}.${tableName}`,
      new TableColumn({
        name: migrationColumn.currentColumnDefinition.columnName,
        type: migrationColumn.currentColumnDefinition.columnType,
        default: migrationColumn.currentColumnDefinition.defaultValue,
        enum: migrationColumn.currentColumnDefinition.enum?.filter(
          (value): value is string => typeof value === 'string',
        ),
        isArray: migrationColumn.currentColumnDefinition.isArray,
        isNullable: migrationColumn.currentColumnDefinition.isNullable,
        /* For now unique constraints are created at a higher level
        as we need to handle soft-delete and a bug on empty strings
        */
        // isUnique: migrationColumn.currentColumnDefinition.isUnique,
      }),
      new TableColumn({
        name: migrationColumn.alteredColumnDefinition.columnName,
        type: migrationColumn.alteredColumnDefinition.columnType,
        default: migrationColumn.alteredColumnDefinition.defaultValue,
        enum: migrationColumn.currentColumnDefinition.enum?.filter(
          (value): value is string => typeof value === 'string',
        ),
        isArray: migrationColumn.alteredColumnDefinition.isArray,
        isNullable: migrationColumn.alteredColumnDefinition.isNullable,
        asExpression: migrationColumn.alteredColumnDefinition.asExpression,
        generatedType: migrationColumn.alteredColumnDefinition.generatedType,
        /* For now unique constraints are created at a higher level
        as we need to handle soft-delete and a bug on empty strings
        */
        // isUnique: migrationColumn.alteredColumnDefinition.isUnique,
      }),
    );
  }

  private async createRelation(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnCreateRelation,
  ) {
    try {
      await queryRunner.createForeignKey(
        `${schemaName}.${tableName}`,
        new TableForeignKey({
          columnNames: [migrationColumn.columnName],
          referencedColumnNames: [migrationColumn.referencedTableColumnName],
          referencedTableName: migrationColumn.referencedTableName,
          referencedSchema: schemaName,
          onDelete: convertOnDeleteActionToOnDelete(migrationColumn.onDelete),
        }),
      );
      // TODO remove me after 0.53 release @prastoin @charlesBochet Swallowing blocking false positive constraint
    } catch (error) {
      if (
        [error.driverError.message, error.message]
          .filter(isDefined)
          .some((el: string) => el.includes('FK_e078063f0cbce9767a0f8ca431d'))
      ) {
        this.logger.warn(
          'Encountered a FK_e078063f0cbce9767a0f8ca431d exception, swallowing',
        );
      } else {
        throw error;
      }
    }
    /// End remove me

    // Create unique constraint if for one to one relation
    if (migrationColumn.isUnique) {
      await queryRunner.createUniqueConstraint(
        `${schemaName}.${tableName}`,
        new TableUnique({
          name: `UNIQUE_${tableName}_${migrationColumn.columnName}`,
          columnNames: [migrationColumn.columnName],
        }),
      );
    }
  }

  private async dropRelation(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnDropRelation,
  ) {
    const foreignKeyName = await this.getForeignKeyName(
      queryRunner,
      schemaName,
      tableName,
      migrationColumn.columnName,
    );

    if (!foreignKeyName) {
      // Todo: Remove this temporary hack tied to 0.32 upgrade
      if (migrationColumn.columnName === 'activityId') {
        return;
      }
      throw new Error(
        `Foreign key not found for column ${migrationColumn.columnName}`,
      );
    }

    await queryRunner.dropForeignKey(
      `${schemaName}.${tableName}`,
      foreignKeyName,
    );
  }

  private async getForeignKeyName(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
  ): Promise<string | undefined> {
    const foreignKeys = await queryRunner.query(
      `
      SELECT
        tc.constraint_name AS constraint_name
      FROM
        information_schema.table_constraints AS tc
      JOIN
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = $1
        AND tc.table_name = $2
        AND kcu.column_name = $3
    `,
      [schemaName, tableName, columnName],
    );

    return foreignKeys[0]?.constraint_name;
  }
}
