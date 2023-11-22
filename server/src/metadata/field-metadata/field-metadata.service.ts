import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';

import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { CreateFieldInput } from 'src/metadata/field-metadata/dtos/create-field.input';
import { WorkspaceMigrationTableAction } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';
import { convertFieldMetadataToColumnActions } from 'src/metadata/field-metadata/utils/convert-field-metadata-to-column-action.util';

import { FieldMetadataEntity } from './field-metadata.entity';

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,

    private readonly objectMetadataService: ObjectMetadataService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(fieldMetadataRepository);
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

    await this.workspaceMigrationService.createCustomMigration(
      record.workspaceId,
      [
        {
          name: objectMetadata.targetTableName,
          action: 'alter',
          columns: convertFieldMetadataToColumnActions(createdFieldMetadata),
        } satisfies WorkspaceMigrationTableAction,
      ],
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      record.workspaceId,
    );

    return createdFieldMetadata;
  }

  public async findOneWithinWorkspace(
    fieldMetadataId: string,
    workspaceId: string,
  ) {
    return this.fieldMetadataRepository.findOne({
      where: { id: fieldMetadataId, workspaceId },
    });
  }

  public async deleteFieldsMetadata(workspaceId: string) {
    await this.fieldMetadataRepository.delete({ workspaceId });
  }
}
