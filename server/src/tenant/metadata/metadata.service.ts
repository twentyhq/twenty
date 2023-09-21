import { Injectable } from '@nestjs/common';

import { DataSourceService } from './data-source/data-source.service';
import { DataSourceMetadataService } from './data-source-metadata/data-source-metadata.service';
import { EntitySchemaGeneratorService } from './entity-schema-generator/entity-schema-generator.service';
import { FieldMetadataService } from './field-metadata/field-metadata.service';
import { MigrationGeneratorService } from './migration-generator/migration-generator.service';
import { ObjectMetadataService } from './object-metadata/object-metadata.service';
import { TenantMigrationService } from './tenant-migration/tenant-migration.service';
import {
  TenantMigrationColumnChange,
  TenantMigrationTableChange,
} from './tenant-migration/tenant-migration.entity';

@Injectable()
export class MetadataService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly entitySchemaGeneratorService: EntitySchemaGeneratorService,
    private readonly migrationGenerator: MigrationGeneratorService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {}

  public async createCustomField(
    name: string,
    objectId: string,
    type: string,
    workspaceId: string,
  ): Promise<string> {
    const workspaceDataSource =
      await this.dataSourceService.connectToWorkspaceDataSource(workspaceId);

    if (!workspaceDataSource) {
      throw new Error('Workspace data source not found');
    }

    const objectMetadata =
      await this.objectMetadataService.getObjectMetadataFromId(objectId);

    if (!objectMetadata) {
      throw new Error('Object not found');
    }

    const fieldMetadataAlreadyExists =
      await this.fieldMetadataService.getFieldMetadataByNameAndObjectId(
        name,
        objectId,
      );

    if (fieldMetadataAlreadyExists) {
      throw new Error('Field already exists');
    }

    const createdFieldMetadata =
      await this.fieldMetadataService.createFieldMetadata(
        name,
        type,
        objectMetadata.id,
        workspaceId,
      );

    await this.tenantMigrationService.createMigration(workspaceId, [
      {
        name: objectMetadata.targetTableName,
        change: 'alter',
        columns: [
          {
            name: createdFieldMetadata.targetColumnName,
            type: this.convertMetadataTypeToColumnType(type),
            change: 'create',
          } satisfies TenantMigrationColumnChange,
        ],
      } satisfies TenantMigrationTableChange,
    ]);

    await this.migrationGenerator.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    return createdFieldMetadata.id;
  }

  private convertMetadataTypeToColumnType(type: string) {
    switch (type) {
      case 'text':
      case 'url':
      case 'phone':
      case 'email':
        return 'text';
      case 'number':
        return 'int';
      case 'boolean':
        return 'boolean';
      case 'date':
        return 'timestamp';
      default:
        throw new Error('Invalid type');
    }
  }
}
