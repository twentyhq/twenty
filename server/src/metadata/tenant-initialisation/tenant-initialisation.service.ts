import { Injectable } from '@nestjs/common';

import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { MigrationRunnerService } from 'src/metadata/migration-runner/migration-runner.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { FieldMetadataService } from 'src/metadata/field-metadata/services/field-metadata.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';
import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';
import { DataSourceMetadata } from 'src/metadata/data-source-metadata/data-source-metadata.entity';

import { standardObjectsMetadata } from './standard-objects/standard-object-metadata';
import { standardObjectsSeeds } from './standard-objects/standard-object-seeds';

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

    await this.createObjectsAndFieldsMetadata(
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
   * Create all standard objects and fields metadata for a given workspace
   *
   * @param dataSourceMetadataId
   * @param workspaceId
   */
  private async createObjectsAndFieldsMetadata(
    dataSourceMetadataId: string,
    workspaceId: string,
  ) {
    const createdObjectMetadata = await this.objectMetadataService.createMany(
      Object.values(standardObjectsMetadata).map((objectMetadata) => ({
        ...objectMetadata,
        dataSourceId: dataSourceMetadataId,
        fields: [],
        workspaceId,
        isCustom: false,
        isActive: true,
      })),
    );

    await this.fieldMetadataService.createMany(
      createdObjectMetadata.flatMap((objectMetadata: ObjectMetadata) =>
        standardObjectsMetadata[objectMetadata.nameSingular].fields.map(
          (field: FieldMetadata) => ({
            ...field,
            objectId: objectMetadata.id,
            dataSourceId: dataSourceMetadataId,
            workspaceId,
            isCustom: false,
            isActive: true,
          }),
        ),
      ),
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
      const seedData = standardObjectsSeeds[object.nameSingular];

      if (!seedData) {
        continue;
      }

      const fields = standardObjectsMetadata[object.nameSingular].fields;

      const columns = fields.map((field: FieldMetadata) =>
        Object.values(field.targetColumnMap),
      );

      await workspaceDataSource
        ?.createQueryBuilder()
        .insert()
        .into(`${dataSourceMetadata.schema}.${object.targetTableName}`, columns)
        .values(seedData)
        .execute();
    }
  }
}
