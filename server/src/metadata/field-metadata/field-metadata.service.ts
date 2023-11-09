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

import {
  convertFieldMetadataToColumnActions,
  generateTargetColumnMap,
} from 'src/metadata/field-metadata/utils/field-metadata.util';
import { TenantMigrationRunnerService } from 'src/tenant-migration-runner/tenant-migration-runner.service';
import { TenantMigrationService } from 'src/metadata/tenant-migration/tenant-migration.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { FieldMetadataEntity } from 'src/database/typeorm/metadata/entities/field-metadata.entity';
import { FieldMetadataDTO } from 'src/metadata/field-metadata/dtos/field-metadata.dto';
import { CreateFieldInput } from 'src/metadata/field-metadata/dtos/create-field.input';
import { TenantMigrationTableAction } from 'src/database/typeorm/metadata/entities/tenant-migration.entity';

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,

    private readonly objectMetadataService: ObjectMetadataService,
    private readonly tenantMigrationService: TenantMigrationService,
    private readonly migrationRunnerService: TenantMigrationRunnerService,
  ) {
    super(fieldMetadataRepository);
  }

  override async deleteOne(
    id: string,
    opts?: DeleteOneOptions<FieldMetadataDTO> | undefined,
  ): Promise<FieldMetadataEntity> {
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

  override async createOne(
    record: CreateFieldInput,
  ): Promise<FieldMetadataEntity> {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(
        record.objectMetadataId,
        record.workspaceId,
      );

    if (!objectMetadata) {
      throw new NotFoundException('Object does not exist');
    }

    const fieldAlreadyExists = await this.fieldMetadataRepository.findOne({
      where: {
        name: record.name,
        objectMetadataId: record.objectMetadataId,
        workspaceId: record.workspaceId,
      },
    });

    if (fieldAlreadyExists) {
      throw new ConflictException('Field already exists');
    }

    const createdFieldMetadata = await super.createOne({
      ...record,
      targetColumnMap: generateTargetColumnMap(record.type, true, record.name),
      isActive: true,
      isCustom: true,
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
