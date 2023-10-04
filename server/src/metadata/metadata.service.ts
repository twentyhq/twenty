import { Injectable } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { MigrationGeneratorService } from 'src/metadata/migration-generator/migration-generator.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import {
  TenantMigrationColumnChange,
  TenantMigrationTableChange,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

import { convertFieldMetadataToColumnChanges } from './metadata.util';

import { DataSourceService } from './data-source/data-source.service';
import { FieldMetadataService } from './field-metadata/field-metadata.service';
import { ObjectMetadataService } from './object-metadata/object-metadata.service';

@Injectable()
export class MetadataService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly migrationGenerator: MigrationGeneratorService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {}

  public async createCustomField(
    displayName: string,
    objectId: string,
    type: string,
    workspaceId: string,
  ): Promise<string> {
    const workspaceDataSource: DataSource | undefined =
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
      await this.fieldMetadataService.getFieldMetadataByDisplayNameAndObjectId(
        displayName,
        objectId,
      );

    if (fieldMetadataAlreadyExists) {
      throw new Error('Field already exists');
    }

    const createdFieldMetadata =
      await this.fieldMetadataService.createFieldMetadata(
        displayName,
        type,
        objectMetadata.id,
        workspaceId,
      );

    await this.tenantMigrationService.createMigration(workspaceId, [
      {
        name: objectMetadata.targetTableName,
        change: 'alter',
        columns: [
          ...convertFieldMetadataToColumnChanges(createdFieldMetadata),
          // Deprecated
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

  // Deprecated with target_column_name
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
      case 'money':
        return 'integer';
      default:
        throw new Error('Invalid type');
    }
  }
}
