import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { v4 as uuidV4 } from 'uuid';
import { FindOneOptions, Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';

import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { CreateFieldInput } from 'src/metadata/field-metadata/dtos/create-field.input';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { UpdateFieldInput } from 'src/metadata/field-metadata/dtos/update-field.input';
import { WorkspaceMigrationFactory } from 'src/metadata/workspace-migration/workspace-migration.factory';
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from './field-metadata.entity';

import { isEnumFieldMetadataType } from './utils/is-enum-field-metadata-type.util';
import { generateRatingOptions } from './utils/generate-rating-optionts.util';

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,

    private readonly objectMetadataService: ObjectMetadataService,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
  ) {
    super(fieldMetadataRepository);
  }

  override async createOne(
    fieldMetadataInput: CreateFieldInput,
  ): Promise<FieldMetadataEntity> {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(
        fieldMetadataInput.workspaceId,
        {
          where: {
            id: fieldMetadataInput.objectMetadataId,
          },
        },
      );

    if (!objectMetadata) {
      throw new NotFoundException('Object does not exist');
    }

    // Double check in case the service is directly called
    if (isEnumFieldMetadataType(fieldMetadataInput.type)) {
      if (
        !fieldMetadataInput.options &&
        fieldMetadataInput.type !== FieldMetadataType.RATING
      ) {
        throw new BadRequestException('Options are required for enum fields');
      }
    }

    // Generate options for rating fields
    if (fieldMetadataInput.type === FieldMetadataType.RATING) {
      fieldMetadataInput.options = generateRatingOptions();
    }

    const fieldAlreadyExists = await this.fieldMetadataRepository.findOne({
      where: {
        name: fieldMetadataInput.name,
        objectMetadataId: fieldMetadataInput.objectMetadataId,
        workspaceId: fieldMetadataInput.workspaceId,
      },
    });

    if (fieldAlreadyExists) {
      throw new ConflictException('Field already exists');
    }

    const createdFieldMetadata = await super.createOne({
      ...fieldMetadataInput,
      targetColumnMap: generateTargetColumnMap(
        fieldMetadataInput.type,
        true,
        fieldMetadataInput.name,
      ),
      options: fieldMetadataInput.options
        ? fieldMetadataInput.options.map((option) => ({
            ...option,
            id: uuidV4(),
          }))
        : undefined,
      isActive: true,
      isCustom: true,
    });

    await this.workspaceMigrationService.createCustomMigration(
      fieldMetadataInput.workspaceId,
      [
        {
          name: computeObjectTargetTable(objectMetadata),
          action: 'alter',
          columns: this.workspaceMigrationFactory.createColumnActions(
            WorkspaceMigrationColumnActionType.CREATE,
            createdFieldMetadata,
          ),
        } satisfies WorkspaceMigrationTableAction,
      ],
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      fieldMetadataInput.workspaceId,
    );

    // TODO: Move viewField creation to a cdc scheduler
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        fieldMetadataInput.workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    // TODO: use typeorm repository
    const view = await workspaceDataSource?.query(
      `SELECT id FROM ${dataSourceMetadata.schema}."view"
      WHERE "objectMetadataId" = '${createdFieldMetadata.objectMetadataId}'`,
    );

    const existingViewFields = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."viewField"
      WHERE "viewId" = '${view[0].id}'`,
    );

    const lastPosition = existingViewFields
      .map((viewField) => viewField.position)
      .reduce((acc, position) => {
        if (position > acc) {
          return position;
        }

        return acc;
      }, -1);

    await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."viewField"
    ("fieldMetadataId", "position", "isVisible", "size", "viewId")
    VALUES ('${createdFieldMetadata.id}', '${lastPosition + 1}', true, 180, '${
      view[0].id
    }')`,
    );

    return createdFieldMetadata;
  }

  override async updateOne(
    id: string,
    fieldMetadataInput: UpdateFieldInput,
  ): Promise<FieldMetadataEntity> {
    const existingFieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        id,
        workspaceId: fieldMetadataInput.workspaceId,
      },
    });

    if (!existingFieldMetadata) {
      throw new NotFoundException('Field does not exist');
    }

    if (existingFieldMetadata.isCustom === false) {
      // We can only update the isActive field for standard fields
      fieldMetadataInput = {
        id: fieldMetadataInput.id,
        isActive: fieldMetadataInput.isActive,
        workspaceId: fieldMetadataInput.workspaceId,
      };
    }

    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(
        fieldMetadataInput.workspaceId,
        {
          where: {
            id: existingFieldMetadata?.objectMetadataId,
          },
        },
      );

    if (!objectMetadata) {
      throw new NotFoundException('Object does not exist');
    }

    if (
      objectMetadata.labelIdentifierFieldMetadataId ===
        existingFieldMetadata.id &&
      fieldMetadataInput.isActive === false
    ) {
      throw new BadRequestException('Cannot deactivate label identifier field');
    }

    // Check if the id of the options has been provided
    if (fieldMetadataInput.options) {
      for (const option of fieldMetadataInput.options) {
        if (!option.id) {
          throw new BadRequestException('Option id is required');
        }
      }
    }

    const updatedFieldMetadata = await super.updateOne(id, fieldMetadataInput);

    if (fieldMetadataInput.options || fieldMetadataInput.defaultValue) {
      await this.workspaceMigrationService.createCustomMigration(
        existingFieldMetadata.workspaceId,
        [
          {
            name: computeObjectTargetTable(objectMetadata),
            action: 'alter',
            columns: this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.ALTER,
              existingFieldMetadata,
              updatedFieldMetadata,
            ),
          } satisfies WorkspaceMigrationTableAction,
        ],
      );

      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        updatedFieldMetadata.workspaceId,
      );
    }

    return updatedFieldMetadata;
  }

  public async findOneOrFail(
    id: string,
    options?: FindOneOptions<FieldMetadataEntity>,
  ) {
    const fieldMetadata = await this.fieldMetadataRepository.findOne({
      ...options,
      where: {
        ...options?.where,
        id,
      },
    });

    if (!fieldMetadata) {
      throw new NotFoundException('Field does not exist');
    }

    return fieldMetadata;
  }

  public async findOneWithinWorkspace(
    workspaceId: string,
    options: FindOneOptions<FieldMetadataEntity>,
  ) {
    return this.fieldMetadataRepository.findOne({
      ...options,
      where: {
        ...options.where,
        workspaceId,
      },
    });
  }

  public async deleteFieldsMetadata(workspaceId: string) {
    await this.fieldMetadataRepository.delete({ workspaceId });
  }
}
