import { Injectable } from '@nestjs/common';

import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { MigrationRunnerService } from 'src/metadata/migration-runner/migration-runner.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { MetadataService } from 'src/metadata/metadata.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';
import { DataSourceMetadata } from 'src/metadata/data-source-metadata/data-source-metadata.entity';
import { standardObjectsData } from 'src/metadata/standard-objects/standard-object-data';

@Injectable()
export class TenantInitialisationService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly migrationRunnerService: MigrationRunnerService,
    private readonly metadataService: MetadataService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  /**
   * Init a workspace by creating a new data source and running all migrations
   * @param workspaceId
   * @returns Promise<void>
   */
  public async init(workspaceId: string): Promise<void> {
    const schemaName = await this.dataSourceService.createWorkspaceSchema(
      workspaceId,
    );

    const dataSourceMetadata =
      await this.dataSourceMetadataService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

    await this.tenantMigrationService.insertStandardMigrationsForWorkspace(
      workspaceId,
    );

    // Todo: keep in mind that we don't handle concurrency issues such as migrations being created at the same time
    // but it shouldn't be the role of this service to handle this kind of issues for now.
    // To check later when we run this in a job.
    await this.migrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    await this.metadataService.createStandardObjectsAndFieldsMetadata(
      dataSourceMetadata.id,
      workspaceId,
    );

    await this.prefillWorkspaceWithStandardObjects(
      dataSourceMetadata,
      workspaceId,
    );
  }

  private async prefillWorkspaceWithStandardObjects(
    dataSourceMetadata: DataSourceMetadata,
    workspaceId: string,
  ) {
    const objects =
      await this.objectMetadataService.getObjectMetadataFromDataSourceId(
        dataSourceMetadata.id,
      );

    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    for (const object of objects) {
      const seedData = standardObjectsData[object.nameSingular];

      if (!seedData) {
        continue;
      }

      const columns = Object.keys(seedData[0]);

      await workspaceDataSource
        ?.createQueryBuilder()
        .insert()
        .into(`${dataSourceMetadata.schema}.${object.targetTableName}`, columns)
        .values(seedData)
        .execute();
    }
  }
}
