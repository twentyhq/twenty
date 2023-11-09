import { Injectable } from '@nestjs/common';

import { DataSourceEntity } from 'src/database/typeorm/metadata/entities/data-source.entity';
import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { TenantMigrationRunnerService } from 'src/tenant-migration-runner/tenant-migration-runner.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { standardObjectsPrefillData } from 'src/tenant-manager/standard-objects-prefill-data/standard-objects-prefill-data';
import { TenantDataSourceService } from 'src/tenant-datasource/tenant-datasource.service';

@Injectable()
export class TenantManagerService {
  constructor(
    private readonly tenantDataSourceService: TenantDataSourceService,
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly migrationRunnerService: TenantMigrationRunnerService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
  ) {}

  /**
   * Init a workspace by creating a new data source and running all migrations
   * @param workspaceId
   * @returns Promise<void>
   */
  public async init(workspaceId: string): Promise<void> {
    const schemaName =
      await this.tenantDataSourceService.createWorkspaceDBSchema(workspaceId);

    const dataSourceMetadata =
      await this.dataSourceMetadataService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

    await this.tenantMigrationService.insertStandardMigrations(workspaceId);

    await this.migrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    await this.objectMetadataService.createStandardObjectsAndFieldsMetadata(
      dataSourceMetadata.id,
      workspaceId,
    );

    await this.prefillWorkspaceWithStandardObjects(
      dataSourceMetadata,
      workspaceId,
    );
  }

  /**
   *
   * We are prefilling a few standard objects with data to make it easier for the user to get started.
   *
   * @param dataSourceMetadata
   * @param workspaceId
   */
  private async prefillWorkspaceWithStandardObjects(
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
  ) {
    const workspaceDataSource =
      await this.tenantDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    if (!workspaceDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    standardObjectsPrefillData(workspaceDataSource, dataSourceMetadata.schema);
  }

  /**
   *
   * Delete a workspace by deleting all metadata and the schema
   *
   * @param workspaceId
   */
  public async delete(workspaceId: string): Promise<void> {
    // Delete data from metadata tables
    await this.fieldMetadataService.deleteFieldsMetadata(workspaceId);
    await this.objectMetadataService.deleteObjectsMetadata(workspaceId);
    await this.tenantMigrationService.delete(workspaceId);
    await this.dataSourceMetadataService.delete(workspaceId);
    // Delete schema
    await this.tenantDataSourceService.deleteWorkspaceDBSchema(workspaceId);
  }
}
