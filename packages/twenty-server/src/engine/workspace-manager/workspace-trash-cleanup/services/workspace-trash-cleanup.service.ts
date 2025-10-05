import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export type WorkspaceTrashCleanupInput = {
  workspaceId: string;
  schemaName: string;
  trashRetentionDays: number;
};

@Injectable()
export class WorkspaceTrashCleanupService {
  private readonly logger = new Logger(WorkspaceTrashCleanupService.name);
  private readonly maxRecordsPerWorkspace: number;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    this.maxRecordsPerWorkspace = this.twentyConfigService.get(
      'TRASH_CLEANUP_MAX_RECORDS_PER_WORKSPACE',
    );
  }

  async cleanupWorkspaceTrash(
    input: WorkspaceTrashCleanupInput,
  ): Promise<number> {
    const { workspaceId, schemaName, trashRetentionDays } = input;

    const tableNames = await this.discoverTablesWithSoftDelete(schemaName);

    if (tableNames.length === 0) {
      this.logger.log(`No tables with deletedAt found in workspace ${workspaceId}`);

      return 0;
    }

    const deletedCount = await this.deleteSoftDeletedRecords(
      workspaceId,
      schemaName,
      tableNames,
      trashRetentionDays,
    );

    this.logger.log(
      `Deleted ${deletedCount} record(s) from workspace ${workspaceId}`,
    );

    return deletedCount;
  }

  private async discoverTablesWithSoftDelete(
    schemaName: string,
  ): Promise<string[]> {
    const rawResults = await this.objectMetadataRepository
      .createQueryBuilder('object')
      .innerJoin('object.dataSource', 'dataSource')
      .select('object.nameSingular', 'nameSingular')
      .addSelect('object.isCustom', 'isCustom')
      .where('dataSource.schema = :schemaName', { schemaName })
      .andWhere('object.isActive = :isActive', { isActive: true })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(FieldMetadataEntity, 'field')
          .where('field.objectMetadataId = object.id')
          .andWhere('field.name = :fieldName', { fieldName: 'deletedAt' })
          .andWhere('field.isActive = :isActive', { isActive: true })
          .getQuery();

        return `EXISTS ${subQuery}`;
      })
      .getRawMany();

    return rawResults.map((row) =>
      computeObjectTargetTable({
        nameSingular: row.nameSingular,
        isCustom: row.isCustom,
      }),
    );
  }

  private async deleteSoftDeletedRecords(
    workspaceId: string,
    schemaName: string,
    tableNames: string[],
    trashRetentionDays: number,
  ): Promise<number> {
    let totalDeleted = 0;
    const cutoffDate = this.calculateCutoffDate(trashRetentionDays);

    for (const tableName of tableNames) {
      if (totalDeleted >= this.maxRecordsPerWorkspace) {
        this.logger.log(
          `Reached deletion limit (${this.maxRecordsPerWorkspace}) for workspace ${workspaceId}`,
        );
        break;
      }

      const remainingQuota = this.maxRecordsPerWorkspace - totalDeleted;
      const deleted = await this.deleteFromTable(
        schemaName,
        tableName,
        cutoffDate,
        remainingQuota,
      );

      totalDeleted += deleted;
    }

    return totalDeleted;
  }

  private calculateCutoffDate(trashRetentionDays: number): Date {
    const cutoffDate = new Date();

    cutoffDate.setUTCHours(0, 0, 0, 0);
    cutoffDate.setDate(cutoffDate.getDate() - trashRetentionDays + 1);

    return cutoffDate;
  }

  private async deleteFromTable(
    schemaName: string,
    tableName: string,
    cutoffDate: Date,
    limit: number,
  ): Promise<number> {
    const result = await this.dataSource.query(
      `
      WITH deleted AS (
        DELETE FROM "${schemaName}"."${tableName}"
        WHERE ctid IN (
          SELECT ctid FROM "${schemaName}"."${tableName}"
          WHERE "deletedAt" IS NOT NULL
            AND "deletedAt" < $1
          LIMIT $2
        )
        RETURNING 1
      )
      SELECT COUNT(*) as count FROM deleted
    `,
      [cutoffDate, limit],
    );

    return parseInt(result[0]?.count || '0', 10);
  }
}
