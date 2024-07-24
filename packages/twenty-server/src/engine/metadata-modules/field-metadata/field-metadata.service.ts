import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import isEmpty from 'lodash.isempty';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import {
  RelationDefinitionDTO,
  RelationDefinitionType,
} from 'src/engine/metadata-modules/field-metadata/dtos/relation-definition.dto';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { assertDoesNotNullifyDefaultValueForNonNullableField } from 'src/engine/metadata-modules/field-metadata/utils/assert-does-not-nullify-default-value-for-non-nullable-field.util';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { exceedsDatabaseIdentifierMaximumLength } from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';
import {
  InvalidStringException,
  NameTooLongException,
  validateMetadataNameOrThrow,
} from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnDrop,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from './field-metadata.entity';

import { generateDefaultValue } from './utils/generate-default-value';
import { generateRatingOptions } from './utils/generate-rating-optionts.util';
import { isEnumFieldMetadataType } from './utils/is-enum-field-metadata-type.util';

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
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
        throw new FieldMetadataException(
          'Object metadata does not exist',
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
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
          throw new FieldMetadataException(
            'Options are required for enum fields',
            FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          );
        }
      }

      // Generate options for rating fields
      if (fieldMetadataInput.type === FieldMetadataType.RATING) {
        fieldMetadataInput.options = generateRatingOptions();
      }

      if (fieldMetadataInput.type === FieldMetadataType.LINK) {
        throw new FieldMetadataException(
          '"Link" field types are being deprecated, please use Links type instead',
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }

      this.validateFieldMetadataInput<CreateFieldInput>(fieldMetadataInput);

      const fieldAlreadyExists = await fieldMetadataRepository.findOne({
        where: {
          name: fieldMetadataInput.name,
          objectMetadataId: fieldMetadataInput.objectMetadataId,
          workspaceId: fieldMetadataInput.workspaceId,
        },
      });

      if (fieldAlreadyExists) {
        throw new FieldMetadataException(
          'Field already exists',
          FieldMetadataExceptionCode.FIELD_ALREADY_EXISTS,
        );
      }

      const createdFieldMetadata = await fieldMetadataRepository.save({
        ...fieldMetadataInput,
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
              action: WorkspaceMigrationTableActionType.ALTER,
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
        throw new FieldMetadataException(
          'Could not create workspace query runner',
          FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
        );
      }

      await workspaceQueryRunner.connect();
      await workspaceQueryRunner.startTransaction();

      try {
        // TODO: use typeorm repository
        const view = await workspaceQueryRunner?.query(
          `SELECT id FROM ${dataSourceMetadata.schema}."view"
      WHERE "objectMetadataId" = '${createdFieldMetadata.objectMetadataId}'`,
        );

        if (!isEmpty(view)) {
          const existingViewFields = (await workspaceQueryRunner?.query(
            `SELECT * FROM ${dataSourceMetadata.schema}."viewField"
      WHERE "viewId" = '${view[0].id}'`,
          )) as ViewFieldWorkspaceEntity[];

          const createdFieldIsAlreadyInView = existingViewFields.some(
            (existingViewField) =>
              existingViewField.fieldMetadataId === createdFieldMetadata.id,
          );

          if (!createdFieldIsAlreadyInView) {
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
          }
        }

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
      await this.workspaceCacheVersionService.incrementVersion(
        fieldMetadataInput.workspaceId,
      );
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
        throw new FieldMetadataException(
          'Field does not exist',
          FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
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
        throw new FieldMetadataException(
          'Object metadata does not exist',
          FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      assertMutationNotOnRemoteObject(objectMetadata);

      assertDoesNotNullifyDefaultValueForNonNullableField({
        isNullable: existingFieldMetadata.isNullable,
        defaultValueFromUpdate: fieldMetadataInput.defaultValue,
      });

      if (
        objectMetadata.labelIdentifierFieldMetadataId ===
          existingFieldMetadata.id &&
        fieldMetadataInput.isActive === false
      ) {
        throw new FieldMetadataException(
          'Cannot deactivate label identifier field',
          FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        );
      }

      if (fieldMetadataInput.options) {
        for (const option of fieldMetadataInput.options) {
          if (!option.id) {
            throw new FieldMetadataException(
              'Option id is required',
              FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
            );
          }
        }
      }

      this.validateFieldMetadataInput<UpdateFieldInput>(fieldMetadataInput);

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
          ![
            FieldMetadataType.SELECT,
            FieldMetadataType.MULTI_SELECT,
            FieldMetadataType.BOOLEAN,
          ].includes(existingFieldMetadata.type)
            ? existingFieldMetadata.defaultValue
            : updatableFieldInput.defaultValue !== null
              ? updatableFieldInput.defaultValue
              : null,
      });

      const updatedFieldMetadata = await fieldMetadataRepository.findOne({
        where: { id },
      });

      if (!updatedFieldMetadata) {
        throw new FieldMetadataException(
          'Field does not exist',
          FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
      }

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
              action: WorkspaceMigrationTableActionType.ALTER,
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
      await this.workspaceCacheVersionService.incrementVersion(
        fieldMetadataInput.workspaceId,
      );
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
        throw new FieldMetadataException(
          'Field does not exist',
          FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
      }

      const objectMetadata =
        await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
          where: {
            id: fieldMetadata?.objectMetadataId,
          },
        });

      if (!objectMetadata) {
        throw new FieldMetadataException(
          'Object metadata does not exist',
          FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      if (objectMetadata.labelIdentifierFieldMetadataId === fieldMetadata.id) {
        throw new FieldMetadataException(
          'Cannot delete, please update the label identifier field first',
          FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
        );
      }

      await fieldMetadataRepository.delete(fieldMetadata.id);

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const compositeType = compositeTypeDefintions.get(fieldMetadata.type);

        if (!compositeType) {
          throw new Error(
            `Composite type not found for field metadata type: ${fieldMetadata.type}`,
          );
        }

        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(
            `delete-${fieldMetadata.name}-composite-columns`,
          ),
          workspaceId,
          [
            {
              name: computeObjectTargetTable(objectMetadata),
              action: WorkspaceMigrationTableActionType.ALTER,
              columns: compositeType.properties.map((property) => {
                return {
                  action: WorkspaceMigrationColumnActionType.DROP,
                  columnName: computeCompositeColumnName(
                    fieldMetadata.name,
                    property,
                  ),
                } satisfies WorkspaceMigrationColumnDrop;
              }),
            } satisfies WorkspaceMigrationTableAction,
          ],
        );
      } else {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(`delete-${fieldMetadata.name}`),
          workspaceId,
          [
            {
              name: computeObjectTargetTable(objectMetadata),
              action: WorkspaceMigrationTableActionType.ALTER,
              columns: [
                {
                  action: WorkspaceMigrationColumnActionType.DROP,
                  columnName: computeColumnName(fieldMetadata),
                } satisfies WorkspaceMigrationColumnDrop,
              ],
            } satisfies WorkspaceMigrationTableAction,
          ],
        );
      }

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
      await this.workspaceCacheVersionService.incrementVersion(workspaceId);
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
      throw new FieldMetadataException(
        'Field does not exist',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
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
    await this.workspaceCacheVersionService.incrementVersion(workspaceId);
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

  public async getRelationDefinitionFromRelationMetadata(
    fieldMetadataDTO: FieldMetadataDTO,
    relationMetadata: RelationMetadataEntity,
  ): Promise<RelationDefinitionDTO | null> {
    if (fieldMetadataDTO.type !== FieldMetadataType.RELATION) {
      return null;
    }

    const isRelationFromSource =
      relationMetadata.fromFieldMetadata.id === fieldMetadataDTO.id;

    // TODO: implement MANY_TO_MANY
    if (
      relationMetadata.relationType === RelationMetadataType.MANY_TO_MANY ||
      relationMetadata.relationType === RelationMetadataType.MANY_TO_ONE
    ) {
      throw new FieldMetadataException(
        `
        Relation type ${relationMetadata.relationType} not supported
      `,
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    if (isRelationFromSource) {
      const direction =
        relationMetadata.relationType === RelationMetadataType.ONE_TO_ONE
          ? RelationDefinitionType.ONE_TO_ONE
          : RelationDefinitionType.ONE_TO_MANY;

      return {
        relationId: relationMetadata.id,
        sourceObjectMetadata: relationMetadata.fromObjectMetadata,
        sourceFieldMetadata: relationMetadata.fromFieldMetadata,
        targetObjectMetadata: relationMetadata.toObjectMetadata,
        targetFieldMetadata: relationMetadata.toFieldMetadata,
        direction,
      };
    } else {
      const direction =
        relationMetadata.relationType === RelationMetadataType.ONE_TO_ONE
          ? RelationDefinitionType.ONE_TO_ONE
          : RelationDefinitionType.MANY_TO_ONE;

      return {
        relationId: relationMetadata.id,
        sourceObjectMetadata: relationMetadata.toObjectMetadata,
        sourceFieldMetadata: relationMetadata.toFieldMetadata,
        targetObjectMetadata: relationMetadata.fromObjectMetadata,
        targetFieldMetadata: relationMetadata.fromFieldMetadata,
        direction,
      };
    }
  }

  private validateFieldMetadataInput<
    T extends UpdateFieldInput | CreateFieldInput,
  >(fieldMetadataInput: T): T {
    if (fieldMetadataInput.name) {
      try {
        validateMetadataNameOrThrow(fieldMetadataInput.name);
      } catch (error) {
        if (error instanceof InvalidStringException) {
          throw new FieldMetadataException(
            `Characters used in name "${fieldMetadataInput.name}" are not supported`,
            FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          );
        } else if (error instanceof NameTooLongException) {
          throw new FieldMetadataException(
            `Name "${fieldMetadataInput.name}" exceeds 63 characters`,
            FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          );
        } else {
          throw error;
        }
      }
    }

    if (fieldMetadataInput.options) {
      for (const option of fieldMetadataInput.options) {
        if (exceedsDatabaseIdentifierMaximumLength(option.value)) {
          throw new FieldMetadataException(
            `Option value "${option.value}" exceeds 63 characters`,
            FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          );
        }
      }
    }

    return fieldMetadataInput;
  }
}
