import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  convertFieldMetadataToColumnChanges,
  convertMetadataTypeToColumnType,
  generateColumnName,
  generateTargetColumnMap,
} from 'src/metadata/field-metadata/utils/field-metadata.util';
import { MigrationRunnerService } from 'src/metadata/migration-runner/migration-runner.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';
import {
  TenantMigrationColumnChange,
  TenantMigrationTableChange,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadata> {
  constructor(
    @InjectRepository(FieldMetadata, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadata>,

    private readonly objectMetadataService: ObjectMetadataService,
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly migrationRunnerService: MigrationRunnerService,
  ) {
    super(fieldMetadataRepository);
  }

  override async createOne(record: FieldMetadata): Promise<FieldMetadata> {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(
        record.objectId,
        record.workspaceId,
      );

    if (!objectMetadata) {
      throw new NotFoundException('Object does not exist');
    }

    const fieldAlreadyExists = await this.fieldMetadataRepository.findOne({
      where: {
        displayName: record.displayName,
        objectId: record.objectId,
        workspaceId: record.workspaceId,
      },
    });

    if (fieldAlreadyExists) {
      throw new ConflictException('Field already exists');
    }

    const createdFieldMetadata = await super.createOne({
      ...record,
      targetColumnName: generateColumnName(record.displayName), // deprecated
      targetColumnMap: generateTargetColumnMap(record.type),
    });

    await this.tenantMigrationService.createMigration(record.workspaceId, [
      {
        name: objectMetadata.targetTableName,
        change: 'alter',
        columns: [
          ...convertFieldMetadataToColumnChanges(createdFieldMetadata),
          // Deprecated
          {
            name: createdFieldMetadata.targetColumnName,
            type: convertMetadataTypeToColumnType(record.type),
            change: 'create',
          } satisfies TenantMigrationColumnChange,
        ],
      } satisfies TenantMigrationTableChange,
    ]);

    await this.migrationRunnerService.executeMigrationFromPendingMigrations(
      record.workspaceId,
    );

    return createdFieldMetadata;
  }

  public async getFieldMetadataByDisplayNameAndObjectId(
    name: string,
    objectId: string,
  ): Promise<FieldMetadata | null> {
    return await this.fieldMetadataRepository.findOne({
      where: { displayName: name, objectId },
    });
  }
}
