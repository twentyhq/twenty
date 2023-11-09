import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { DeleteOneOptions } from '@ptc-org/nestjs-query-core';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  convertFieldMetadataToColumnActions,
  generateTargetColumnMap,
} from 'src/metadata/field-metadata/utils/field-metadata.util';
import { MigrationRunnerService } from 'src/metadata/migration-runner/migration-runner.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';
import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

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

  override async deleteOne(
    id: string,
    opts?: DeleteOneOptions<FieldMetadata> | undefined,
  ): Promise<FieldMetadata> {
    const fieldMetadata = await this.fieldMetadataRepository.findOne({
      where: { id },
    });

    if (!fieldMetadata) {
      throw new NotFoundException('Field does not exist');
    }

    if (!fieldMetadata.isCustom) {
      throw new BadRequestException("Standard fields can't be deleted");
    }

    if (fieldMetadata.isActive) {
      throw new BadRequestException("Active fields can't be deleted");
    }

    // TODO: delete associated relation-metadata and field-metadata from the relation

    return super.deleteOne(id, opts);
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
        name: record.name,
        objectId: record.objectId,
        workspaceId: record.workspaceId,
      },
    });

    if (fieldAlreadyExists) {
      throw new ConflictException('Field already exists');
    }

    const createdFieldMetadata = await super.createOne({
      ...record,
      targetColumnMap: generateTargetColumnMap(record.type),
    });

    await this.tenantMigrationService.createCustomMigration(
      record.workspaceId,
      [
        {
          name: objectMetadata.targetTableName,
          action: 'alter',
          columns: convertFieldMetadataToColumnActions(createdFieldMetadata),
        } satisfies TenantMigrationTableAction,
      ],
    );

    await this.migrationRunnerService.executeMigrationFromPendingMigrations(
      record.workspaceId,
    );

    return createdFieldMetadata;
  }

  public async deleteFieldsMetadata(workspaceId: string) {
    await this.fieldMetadataRepository.delete({ workspaceId });
  }
}
