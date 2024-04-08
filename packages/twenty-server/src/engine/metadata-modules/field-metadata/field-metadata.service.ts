import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { v4 as uuidV4 } from 'uuid';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';

import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnDrop,
  WorkspaceMigrationTableAction,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { generateTargetColumnMap } from 'src/engine/metadata-modules/field-metadata/utils/generate-target-column-map.util';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import {
  RelationDefinitionDTO,
  RelationDefinitionType,
} from 'src/engine/metadata-modules/field-metadata/dtos/relation-definition.dto';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import { computeCustomName } from 'src/engine/utils/compute-custom-name.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from './field-metadata.entity';

import { isEnumFieldMetadataType } from './utils/is-enum-field-metadata-type.util';
import { generateRatingOptions } from './utils/generate-rating-optionts.util';
import { generateDefaultValue } from './utils/generate-default-value';

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
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
    const queryRunner = this.metadataDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fieldMetadataRepository =
        queryRunner.manager.getRepository<FieldMetadataEntity<'default'>>(
          FieldMetadataEntity,
        );
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

      if (!fieldMetadataInput.isRemoteCreation) {
        assertMutationNotOnRemoteObject(objectMetadata);
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

      const fieldAlreadyExists = await fieldMetadataRepository.findOne({
        where: {
          name: fieldMetadataInput.name,
          objectMetadataId: fieldMetadataInput.objectMetadataId,
          workspaceId: fieldMetadataInput.workspaceId,
        },
      });

      if (fieldAlreadyExists) {
        throw new ConflictException('Field already exists');
      }

      const createdFieldMetadata = await fieldMetadataRepository.save({
        ...fieldMetadataInput,
        targetColumnMap: generateTargetColumnMap(
          fieldMetadataInput.type,
          !fieldMetadataInput.isRemoteCreation,
          fieldMetadataInput.name,
        ),
        isNullable: generateNullable(
          fieldMetadataInput.type,
          fieldMetadataInput.isNullable,
          fieldMetadataInput.isRemoteCreation,
        ),
        defaultValue:
          fieldMetadataInput.defaultValue ??
          generateDefaultValue(fieldMetadataInput.type),
        options: fieldMetadataInput.options
          ? fieldMetadataInput.options.map((option) => ({
              ...option,
              id: uuidV4(),
            }))
          : undefined,
        isActive: true,
        isCustom: true,
      });

      if (!fieldMetadataInput.isRemoteCreation) {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(`create-${createdFieldMetadata.name}`),
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
      }

      // TODO: Move viewField creation to a cdc scheduler
      const dataSourceMetadata =
        await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
          fieldMetadataInput.workspaceId,
        );

      const workspaceDataSource =
        await this.typeORMService.connectToDataSource(dataSourceMetadata);

      const workspaceQueryRunner = workspaceDataSource?.createQueryRunner();

      if (!workspaceQueryRunner) {
        throw new Error('Could not create workspace query runner');
      }

      await workspaceQueryRunner.connect();
      await workspaceQueryRunner.startTransaction();

      try {
        // TODO: use typeorm repository
        const view = await workspaceQueryRunner?.query(
          `SELECT id FROM ${dataSourceMetadata.schema}."view"
      WHERE "objectMetadataId" = '${createdFieldMetadata.objectMetadataId}'`,
        );

        const existingViewFields = await workspaceQueryRunner?.query(
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

        await workspaceQueryRunner?.query(
          `INSERT INTO ${dataSourceMetadata.schema}."viewField"
    ("fieldMetadataId", "position", "isVisible", "size", "viewId")
    VALUES ('${createdFieldMetadata.id}', '${lastPosition + 1}', true, 180, '${
      view[0].id
    }')`,
        );
        await workspaceQueryRunner.commitTransaction();
      } catch (error) {
        await workspaceQueryRunner.rollbackTransaction();
        throw error;
      } finally {
        await workspaceQueryRunner.release();
      }

      await queryRunner.commitTransaction();

      return createdFieldMetadata;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  override async updateOne(
    id: string,
    fieldMetadataInput: UpdateFieldInput,
  ): Promise<FieldMetadataEntity> {
    const queryRunner = this.metadataDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fieldMetadataRepository =
        queryRunner.manager.getRepository<FieldMetadataEntity<'default'>>(
          FieldMetadataEntity,
        );

      const existingFieldMetadata = await fieldMetadataRepository.findOne({
        where: {
          id,
          workspaceId: fieldMetadataInput.workspaceId,
        },
      });

      if (!existingFieldMetadata) {
        throw new NotFoundException('Field does not exist');
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

      assertMutationNotOnRemoteObject(objectMetadata);

      if (
        objectMetadata.labelIdentifierFieldMetadataId ===
          existingFieldMetadata.id &&
        fieldMetadataInput.isActive === false
      ) {
        throw new BadRequestException(
          'Cannot deactivate label identifier field',
        );
      }

      if (fieldMetadataInput.options) {
        for (const option of fieldMetadataInput.options) {
          if (!option.id) {
            throw new BadRequestException('Option id is required');
          }
        }
      }

      const updatableFieldInput =
        existingFieldMetadata.isCustom === false
          ? this.buildUpdatableStandardFieldInput(
              fieldMetadataInput,
              existingFieldMetadata,
            )
          : fieldMetadataInput;

      // We're running field update under a transaction, so we can rollback if migration fails
      await fieldMetadataRepository.update(id, {
        ...updatableFieldInput,
        defaultValue:
          // Todo: we handle default value for all field types.
          ![FieldMetadataType.SELECT, FieldMetadataType.BOOLEAN].includes(
            existingFieldMetadata.type,
          )
            ? existingFieldMetadata.defaultValue
            : updatableFieldInput.defaultValue !== null
              ? updatableFieldInput.defaultValue
              : null,
        // If the name is updated, the targetColumnMap should be updated as well
        targetColumnMap: updatableFieldInput.name
          ? generateTargetColumnMap(
              existingFieldMetadata.type,
              existingFieldMetadata.isCustom,
              updatableFieldInput.name,
            )
          : existingFieldMetadata.targetColumnMap,
      });
      const updatedFieldMetadata = await fieldMetadataRepository.findOneOrFail({
        where: { id },
      });

      if (
        fieldMetadataInput.name ||
        updatableFieldInput.options ||
        updatableFieldInput.defaultValue
      ) {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(`update-${updatedFieldMetadata.name}`),
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

      await queryRunner.commitTransaction();

      return updatedFieldMetadata;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async deleteOneField(
    input: DeleteOneFieldInput,
    workspaceId: string,
  ): Promise<FieldMetadataEntity> {
    const queryRunner = this.metadataDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction(); // transaction not safe as a different queryRunner is used within workspaceMigrationRunnerService

    try {
      const fieldMetadataRepository =
        queryRunner.manager.getRepository<FieldMetadataEntity<'default'>>(
          FieldMetadataEntity,
        );

      const fieldMetadata = await fieldMetadataRepository.findOne({
        where: {
          id: input.id,
          workspaceId: workspaceId,
        },
      });

      if (!fieldMetadata) {
        throw new NotFoundException('Field does not exist');
      }

      const objectMetadata =
        await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
          where: {
            id: fieldMetadata?.objectMetadataId,
          },
        });

      if (!objectMetadata) {
        throw new NotFoundException('Object does not exist');
      }

      await fieldMetadataRepository.delete(fieldMetadata.id);

      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(`delete-${fieldMetadata.name}`),
        workspaceId,
        [
          {
            name: computeObjectTargetTable(objectMetadata),
            action: 'alter',
            columns: [
              {
                action: WorkspaceMigrationColumnActionType.DROP,
                columnName: computeCustomName(
                  fieldMetadata.name,
                  fieldMetadata.isCustom,
                ),
              } satisfies WorkspaceMigrationColumnDrop,
            ],
          } satisfies WorkspaceMigrationTableAction,
        ],
      );

      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        workspaceId,
      );

      await queryRunner.commitTransaction();

      return fieldMetadata;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

  private buildUpdatableStandardFieldInput(
    fieldMetadataInput: UpdateFieldInput,
    existingFieldMetadata: FieldMetadataEntity,
  ) {
    let fieldMetadataInputOverrided = {};

    fieldMetadataInputOverrided = {
      id: fieldMetadataInput.id,
      isActive: fieldMetadataInput.isActive,
      workspaceId: fieldMetadataInput.workspaceId,
      defaultValue: fieldMetadataInput.defaultValue,
    };

    if (existingFieldMetadata.type === FieldMetadataType.SELECT) {
      fieldMetadataInputOverrided = {
        ...fieldMetadataInputOverrided,
        options: fieldMetadataInput.options,
      };
    }

    return fieldMetadataInputOverrided as UpdateFieldInput;
  }

  public async getRelationDefinition(
    fieldMetadata: FieldMetadataDTO,
  ): Promise<RelationDefinitionDTO | null> {
    if (fieldMetadata.type !== FieldMetadataType.RELATION) {
      return null;
    }

    const foundRelationMetadata = await this.relationMetadataRepository.findOne(
      {
        where: [
          { fromFieldMetadataId: fieldMetadata.id },
          { toFieldMetadataId: fieldMetadata.id },
        ],
        relations: [
          'fromObjectMetadata',
          'toObjectMetadata',
          'fromFieldMetadata',
          'toFieldMetadata',
        ],
      },
    );

    if (!foundRelationMetadata) {
      throw new Error('RelationMetadata not found');
    }

    const isRelationFromSource =
      foundRelationMetadata.fromFieldMetadata.id === fieldMetadata.id;

    // TODO: implement MANY_TO_MANY
    if (
      foundRelationMetadata.relationType === RelationMetadataType.MANY_TO_MANY
    ) {
      throw new Error(`
        Relation type ${foundRelationMetadata.relationType} not supported
      `);
    }

    if (isRelationFromSource) {
      const direction =
        foundRelationMetadata.relationType === RelationMetadataType.ONE_TO_ONE
          ? RelationDefinitionType.ONE_TO_ONE
          : RelationDefinitionType.ONE_TO_MANY;

      return {
        sourceObjectMetadata: foundRelationMetadata.fromObjectMetadata,
        sourceFieldMetadata: foundRelationMetadata.fromFieldMetadata,
        targetObjectMetadata: foundRelationMetadata.toObjectMetadata,
        targetFieldMetadata: foundRelationMetadata.toFieldMetadata,
        direction,
      };
    } else {
      const direction =
        foundRelationMetadata.relationType === RelationMetadataType.ONE_TO_ONE
          ? RelationDefinitionType.ONE_TO_ONE
          : RelationDefinitionType.MANY_TO_ONE;

      return {
        sourceObjectMetadata: foundRelationMetadata.toObjectMetadata,
        sourceFieldMetadata: foundRelationMetadata.toFieldMetadata,
        targetObjectMetadata: foundRelationMetadata.fromObjectMetadata,
        targetFieldMetadata: foundRelationMetadata.fromFieldMetadata,
        direction,
      };
    }
  }
}
