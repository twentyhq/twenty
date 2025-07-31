import { Injectable } from '@nestjs/common';

import { QueryRunner } from 'typeorm';

import { WorkspaceSchemaForeignKeyDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-foreign-key-definition.type';
import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

@Injectable()
export class WorkspaceSchemaForeignKeyManagerService {
  async createForeignKey(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    foreignKey: WorkspaceSchemaForeignKeyDefinition,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeForeignKeyName = removeSqlDDLInjection(foreignKey.name);
    const safeReferencedTableName = removeSqlDDLInjection(
      foreignKey.referencedTableName,
    );

    const quotedColumns = foreignKey.columnNames
      .map((col) => `"${removeSqlDDLInjection(col)}"`)
      .join(', ');
    const quotedRefColumns = foreignKey.referencedColumnNames
      .map((col) => `"${removeSqlDDLInjection(col)}"`)
      .join(', ');

    let sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ADD CONSTRAINT "${safeForeignKeyName}" FOREIGN KEY (${quotedColumns}) REFERENCES "${safeSchemaName}"."${safeReferencedTableName}" (${quotedRefColumns})`;

    if (foreignKey.onDelete) {
      sql += ` ON DELETE ${foreignKey.onDelete}`;
    }

    if (foreignKey.onUpdate) {
      sql += ` ON UPDATE ${foreignKey.onUpdate}`;
    }

    await queryRunner.query(sql);
  }

  async dropForeignKey(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    foreignKeyName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeForeignKeyName = removeSqlDDLInjection(foreignKeyName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" DROP CONSTRAINT IF EXISTS "${safeForeignKeyName}"`;

    await queryRunner.query(sql);
  }

  async dropForeignKeyByColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    const foreignKeyName = await this.getForeignKeyNameByColumn(
      queryRunner,
      schemaName,
      tableName,
      columnName,
    );

    if (foreignKeyName) {
      await this.dropForeignKey(
        queryRunner,
        schemaName,
        tableName,
        foreignKeyName,
      );
    }
  }

  async foreignKeyExists(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    foreignKeyName: string,
  ): Promise<boolean> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeForeignKeyName = removeSqlDDLInjection(foreignKeyName);

    const result = await queryRunner.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE constraint_schema = $1 
          AND table_name = $2 
          AND constraint_name = $3 
          AND constraint_type = 'FOREIGN KEY'
      )`,
      [safeSchemaName, safeTableName, safeForeignKeyName],
    );

    return result[0]?.exists || false;
  }

  async getForeignKeyNameByColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
  ): Promise<string | null> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeColumnName = removeSqlDDLInjection(columnName);

    const result = await queryRunner.query(
      `SELECT tc.constraint_name
       FROM information_schema.table_constraints AS tc
       JOIN information_schema.key_column_usage AS kcu
         ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
       WHERE tc.constraint_type = 'FOREIGN KEY'
         AND tc.table_schema = $1
         AND tc.table_name = $2
         AND kcu.column_name = $3`,
      [safeSchemaName, safeTableName, safeColumnName],
    );

    return result[0]?.constraint_name || null;
  }

  async getForeignKeysForTable(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
  ): Promise<
    Array<{
      constraint_name: string;
      column_name: string;
      foreign_table_name: string;
      foreign_column_name: string;
      delete_rule: string;
      update_rule: string;
    }>
  > {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);

    const result = await queryRunner.query(
      `SELECT 
         tc.constraint_name,
         kcu.column_name,
         ccu.table_name AS foreign_table_name,
         ccu.column_name AS foreign_column_name,
         rc.delete_rule,
         rc.update_rule
       FROM information_schema.table_constraints AS tc
       JOIN information_schema.key_column_usage AS kcu
         ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
       JOIN information_schema.constraint_column_usage AS ccu
         ON ccu.constraint_name = tc.constraint_name
         AND ccu.table_schema = tc.table_schema
       JOIN information_schema.referential_constraints AS rc
         ON tc.constraint_name = rc.constraint_name
         AND tc.table_schema = rc.constraint_schema
       WHERE tc.constraint_type = 'FOREIGN KEY'
         AND tc.table_schema = $1
         AND tc.table_name = $2`,
      [safeSchemaName, safeTableName],
    );

    return result;
  }

  async createForeignKeyFromColumn(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
    referencedTableName: string,
    referencedColumnName = 'id',
    onDelete?: WorkspaceSchemaForeignKeyDefinition['onDelete'],
  ): Promise<void> {
    const foreignKeyName = queryRunner.connection.namingStrategy.foreignKeyName(
      tableName,
      [columnName],
      `${schemaName}.${referencedTableName}`,
      [referencedColumnName],
    );

    const foreignKey: WorkspaceSchemaForeignKeyDefinition = {
      name: foreignKeyName,
      columnNames: [columnName],
      referencedTableName,
      referencedColumnNames: [referencedColumnName],
      onDelete,
    };

    await this.createForeignKey(queryRunner, schemaName, tableName, foreignKey);
  }

  async renameForeignKey(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    oldConstraintName: string,
    newConstraintName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeOldConstraintName = removeSqlDDLInjection(oldConstraintName);
    const safeNewConstraintName = removeSqlDDLInjection(newConstraintName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" RENAME CONSTRAINT "${safeOldConstraintName}" TO "${safeNewConstraintName}"`;

    await queryRunner.query(sql);
  }

  async validateForeignKey(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    foreignKeyName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeForeignKeyName = removeSqlDDLInjection(foreignKeyName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" VALIDATE CONSTRAINT "${safeForeignKeyName}"`;

    await queryRunner.query(sql);
  }

  async setForeignKeyNotDeferrable(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    foreignKeyName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeForeignKeyName = removeSqlDDLInjection(foreignKeyName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER CONSTRAINT "${safeForeignKeyName}" NOT DEFERRABLE`;

    await queryRunner.query(sql);
  }

  async setForeignKeyDeferrable(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    foreignKeyName: string,
  ): Promise<void> {
    const safeSchemaName = removeSqlDDLInjection(schemaName);
    const safeTableName = removeSqlDDLInjection(tableName);
    const safeForeignKeyName = removeSqlDDLInjection(foreignKeyName);
    const sql = `ALTER TABLE "${safeSchemaName}"."${safeTableName}" ALTER CONSTRAINT "${safeForeignKeyName}" DEFERRABLE`;

    await queryRunner.query(sql);
  }
}
