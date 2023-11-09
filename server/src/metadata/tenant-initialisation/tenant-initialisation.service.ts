import { Injectable } from '@nestjs/common';

import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { MigrationRunnerService } from 'src/metadata/migration-runner/migration-runner.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';
import { DataSourceMetadata } from 'src/metadata/data-source-metadata/data-source-metadata.entity';
import { FieldMetadataService } from 'src/metadata/field-metadata/services/field-metadata.service';

import { standardObjectsPrefillData } from './standard-objects-prefill-data/standard-objects-prefill-data';

@Injectable()
export class TenantInitialisationService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly migrationRunnerService: MigrationRunnerService,
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
    const schemaName = await this.dataSourceService.createWorkspaceSchema(
      workspaceId,
    );

    const dataSourceMetadata =
      await this.dataSourceMetadataService.createDataSourceMetadata(
        workspaceId,
        schemaName,
      );

    await this.tenantMigrationService.insertStandardMigrations(workspaceId);

    // Todo: keep in mind that we don't handle concurrency issues such as migrations being created at the same time
    // but it shouldn't be the role of this service to handle this kind of issues for now.
    // To check later when we run this in a job.
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
    dataSourceMetadata: DataSourceMetadata,
    workspaceId: string,
  ) {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    if (!workspaceDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    standardObjectsPrefillData(workspaceDataSource, dataSourceMetadata.schema);
  }

  public async delete(workspaceId: string): Promise<void> {
    // Delete data from metadata tables
    await this.fieldMetadataService.deleteFieldsMetadata(workspaceId);
    await this.objectMetadataService.deleteObjectsMetadata(workspaceId);
    await this.tenantMigrationService.delete(workspaceId);
    await this.dataSourceMetadataService.delete(workspaceId);
    // Delete schema
    await this.dataSourceService.deleteWorkspaceSchema(workspaceId);
  }
}
