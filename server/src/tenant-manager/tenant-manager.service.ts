import { Injectable } from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';

import { DataSourceEntity } from 'src/database/typeorm/metadata/entities/data-source.entity';
import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { FieldMetadataService } from 'src/metadata/field-metadata/field-metadata.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { TenantMigrationRunnerService } from 'src/tenant-migration-runner/tenant-migration-runner.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { standardObjectsPrefillData } from 'src/tenant-manager/standard-objects-prefill-data/standard-objects-prefill-data';
import { TenantDataSourceService } from 'src/tenant-datasource/tenant-datasource.service';
import { standardObjectsMetadata } from 'src/tenant-manager/standard-objects-metadata/standard-object-metadata';

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

  private mainDataSource: DataSource;

  /**
   * Init a workspace by creating a new data source and running all migrations
   * @params workspaceId, prefillSeedData
   * @returns Promise<void>
   */
  public async init(
    workspaceId: string,
    prefillSeedData = true,
  ): Promise<void> {
    if (await this.tenantDataSourceService.hasSchema(workspaceId)) {
      return;
    }

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

    await this.createStandardObjectsAndFieldsMetadata(
      dataSourceMetadata.id,
      workspaceId,
    );
    if (prefillSeedData) {
      await this.prefillWorkspaceWithStandardObjects(
        dataSourceMetadata,
        workspaceId,
      );
    }
  }

  /**
   *
   * Create all standard objects and fields metadata for a given workspace
   *
   * @param dataSourceId
   * @param workspaceId
   */
  public async createStandardObjectsAndFieldsMetadata(
    dataSourceId: string,
    workspaceId: string,
  ) {
    await this.objectMetadataService.createMany(
      Object.values(standardObjectsMetadata).map((objectMetadata) => ({
        ...objectMetadata,
        dataSourceId,
        workspaceId,
        isCustom: false,
        isActive: true,
        fields: objectMetadata.fields.map((field) => ({
          ...field,
          workspaceId,
          isCustom: false,
          isActive: true,
        })),
      })),
    );
  }

  /**
   *
   * Reset all standard objects and fields metadata for a given workspace
   *
   * @param dataSourceId
   * @param workspaceId
   */
  public async resetStandardObjectsAndFieldsMetadata(
    dataSourceId: string,
    workspaceId: string,
  ) {
    await this.objectMetadataService.deleteMany({
      workspaceId: { eq: workspaceId },
    });

    await this.createStandardObjectsAndFieldsMetadata(
      dataSourceId,
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

  public async injectWorkspaceData(
    table: string,
    workspaceId: string,
    values,
    columns,
  ) {
    await this.init(workspaceId, false);
    const schema = this.tenantDataSourceService.getSchemaName(workspaceId);
    const workspaceDataSource =
      await this.tenantDataSourceService.connectToSchemaDataSource(schema);

    await workspaceDataSource.transaction(
      async (entityManager: EntityManager) => {
        await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.${table}`, columns)
          .orIgnore()
          .values(values)
          .execute();
      },
    );
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
