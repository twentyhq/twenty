import { Injectable } from '@nestjs/common';

import { type QueryRunner } from 'typeorm';

import { type WorkspaceMigrationColumnAlter } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';

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
    const computedColumnType = ` ${columnDefinition.columnType}${
      columnDefinition.columnType === 'timestamptz' ? `(3)` : ''
    }`;

    // Update the column type
    // If casting is not possible, the query will fail
    await queryRunner.query(`
      ALTER TABLE "${schemaName}"."${tableName}"
      ALTER COLUMN "${columnDefinition.columnName}" TYPE ${computedColumnType}
      USING "${columnDefinition.columnName}"::${computedColumnType}
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
