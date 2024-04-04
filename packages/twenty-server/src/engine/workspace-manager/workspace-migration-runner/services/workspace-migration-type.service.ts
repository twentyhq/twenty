import { Injectable } from '@nestjs/common';

import { QueryRunner } from 'typeorm';

import { WorkspaceMigrationColumnAlter } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';

@Injectable()
export class WorkspaceMigrationTypeService {
  constructor() {}

  async alterType(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    migrationColumn: WorkspaceMigrationColumnAlter,
  ) {
    const columnDefinition = migrationColumn.alteredColumnDefinition;

    // Update the column type
    // If casting is not possible, the query will fail
    await queryRunner.query(`
      ALTER TABLE "${schemaName}"."${tableName}"
      ALTER COLUMN "${columnDefinition.columnName}" TYPE ${columnDefinition.columnType}
      USING "${columnDefinition.columnName}"::${columnDefinition.columnType}
    `);

    // Update the column default value
    if (columnDefinition.defaultValue) {
      await queryRunner.query(`
        ALTER TABLE "${schemaName}"."${tableName}"
        ALTER COLUMN "${columnDefinition.columnName}" SET DEFAULT ${columnDefinition.defaultValue}::${columnDefinition.columnType};
      `);
    }
  }
}
