import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

export type SchemaTableMap = Map<string, string[]>;

@Injectable()
export class WorkspaceTrashTableDiscoveryService {
  private readonly logger = new Logger(
    WorkspaceTrashTableDiscoveryService.name,
  );

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async discoverTablesWithSoftDelete(
    schemaNames: string[],
  ): Promise<SchemaTableMap> {
    if (schemaNames.length === 0) {
      return new Map();
    }

    const result = await this.dataSource.query(
      `
      SELECT table_schema, table_name
      FROM information_schema.columns
      WHERE table_schema = ANY($1)
        AND column_name = 'deletedAt'
      GROUP BY table_schema, table_name
      `,
      [schemaNames],
    );

    return this.groupTablesBySchema(result);
  }

  private groupTablesBySchema(
    queryResult: Array<{ table_schema: string; table_name: string }>,
  ): SchemaTableMap {
    const tablesBySchema = new Map<string, string[]>();

    for (const row of queryResult) {
      if (!tablesBySchema.has(row.table_schema)) {
        tablesBySchema.set(row.table_schema, []);
      }
      tablesBySchema.get(row.table_schema)!.push(row.table_name);
    }

    this.logger.log(
      `Discovered tables in ${tablesBySchema.size} schema(s) with soft delete columns`,
    );

    return tablesBySchema;
  }
}
