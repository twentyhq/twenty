import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';

const MILLISECONDS_IN_ONE_DAY = 1000 * 3600 * 24;

@Injectable()
export class CleanInactiveWorkspaceJob implements MessageQueueJob<undefined> {
  private readonly logger = new Logger(CleanInactiveWorkspaceJob.name);

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly typeORMService: TypeORMService,
  ) {}

  async getMaxUpdatedAt(
    dataSource: DataSourceEntity,
    tableNames,
  ): Promise<Date> {
    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSource);

    let maxUpdatedAt = new Date(0);

    for (const tableName of tableNames) {
      const maxTableUpdatedAt = (
        await workspaceDataSource?.query(
          `SELECT MAX("updatedAt") FROM ${dataSource.schema}."${tableName}"`,
        )
      )[0].max;

      if (maxTableUpdatedAt) {
        const maxTableUpdatedAtDate = new Date(maxTableUpdatedAt);

        if (!maxUpdatedAt || maxTableUpdatedAtDate > maxUpdatedAt) {
          maxUpdatedAt = maxTableUpdatedAtDate;
        }
      }
    }

    return maxUpdatedAt;
  }

  processWorkspace(dataSource: DataSourceEntity, maxUpdatedAt: Date) {
    const daysSinceInactive = Math.floor(
      (new Date().getTime() - maxUpdatedAt.getTime()) / MILLISECONDS_IN_ONE_DAY,
    );

    this.logger.log(
      `${dataSource.workspaceId}  ${maxUpdatedAt} ${daysSinceInactive}`,
    );
  }

  async handle(): Promise<void> {
    const dataSources =
      await this.dataSourceService.getManyDataSourceMetadata();

    const objectsMetadata = await this.objectMetadataService.findMany();

    for (const dataSource of dataSources) {
      const dataSourceTableNames = objectsMetadata
        .filter(
          (objectMetadata) =>
            objectMetadata.workspaceId === dataSource.workspaceId,
        )
        .map((objectMetadata) => objectMetadata.targetTableName);

      const maxUpdatedAt = await this.getMaxUpdatedAt(
        dataSource,
        dataSourceTableNames,
      );

      this.processWorkspace(dataSource, maxUpdatedAt);
    }

    this.logger.log(`${CleanInactiveWorkspaceJob.name} called`);
  }
}
