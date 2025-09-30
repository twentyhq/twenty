import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

export type DeletionResult = {
  success: boolean;
  error?: string;
};

@Injectable()
export class WorkspaceTrashDeletionService {
  private readonly logger = new Logger(WorkspaceTrashDeletionService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async deleteSoftDeletedRecords(
    workspaceId: string,
    schemaName: string,
    tableNames: string[],
  ): Promise<DeletionResult> {
    try {
      if (tableNames.length === 0) {
        this.logger.log(
          `No tables with deletedAt found in schema ${schemaName} for workspace ${workspaceId} - skipping`,
        );

        return { success: true };
      }

      const deleteStatements = this.buildDeleteStatements(
        schemaName,
        tableNames,
      );

      await this.dataSource.query(deleteStatements);

      this.logger.log(
        `Deleted soft-deleted records from ${tableNames.length} table(s) in workspace ${workspaceId}`,
      );

      return { success: true };
    } catch (error) {
      const errorMessage = error?.message || String(error);

      this.logger.error(
        `Failed to delete records for workspace ${workspaceId}: ${errorMessage}`,
      );

      return { success: false, error: errorMessage };
    }
  }

  private buildDeleteStatements(
    schemaName: string,
    tableNames: string[],
  ): string {
    return tableNames
      .map(
        (tableName) =>
          `DELETE FROM "${schemaName}"."${tableName}" WHERE "deletedAt" IS NOT NULL`,
      )
      .join('; ');
  }
}
