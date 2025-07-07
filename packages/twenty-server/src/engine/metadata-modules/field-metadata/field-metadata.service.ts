import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, FindOneOptions, In, Repository } from 'typeorm';
import { v4 as uuidV4, v4 } from 'uuid';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import { FieldStandardOverridesDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataEnumValidationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-enum-validation.service';
import { FieldMetadataRelatedRecordsService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-related-records.service';
import { assertDoesNotNullifyDefaultValueForNonNullableField } from 'src/engine/metadata-modules/field-metadata/utils/assert-does-not-nullify-default-value-for-non-nullable-field.util';
import { checkCanDeactivateFieldOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/check-can-deactivate-field-or-throw';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { isSelectOrMultiSelectFieldMetadata } from 'src/engine/metadata-modules/field-metadata/utils/is-select-or-multi-select-field-metadata.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { validateFieldNameAvailabilityOrThrow } from 'src/engine/metadata-modules/utils/validate-field-name-availability.utils';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';
import { validateNameAndLabelAreSyncOrThrow } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnDrop,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import {
  isFieldMetadataEntityOfType,
  isFieldMetadataInterfaceOfType,
} from 'src/engine/utils/is-field-metadata-of-type.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { ViewService } from 'src/modules/view/services/view.service';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'src/utils/trim-and-remove-duplicated-whitespaces-from-object-string-properties';

import { FieldMetadataValidationService } from './field-metadata-validation.service';
import { FieldMetadataEntity } from './field-metadata.entity';

import { generateDefaultValue } from './utils/generate-default-value';
import { generateRatingOptions } from './utils/generate-rating-optionts.util';

type ValidateFieldMetadataArgs<T extends UpdateFieldInput | CreateFieldInput> =
  {
    fieldMetadataType: FieldMetadataType;
    fieldMetadataInput: T;
    objectMetadata: ObjectMetadataItemWithFieldMaps;
    existingFieldMetadata?: FieldMetadataInterface;
    objectMetadataMaps: ObjectMetadataMaps;
  };

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectDataSource('core')
    private readonly coreDataSource: DataSource,
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly fieldMetadataEnumValidationService: FieldMetadataEnumValidationService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly fieldMetadataValidationService: FieldMetadataValidationService,
    private readonly fieldMetadataRelatedRecordsService: FieldMetadataRelatedRecordsService,
    private readonly viewService: ViewService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly featureFlagService: FeatureFlagService,
  ) {
    super(fieldMetadataRepository);
  }

  override async createOne(
    fieldMetadataInput: CreateFieldInput,
  ): Promise<FieldMetadataEntity> {
    const [createdFieldMetadata] = await this.createMany([fieldMetadataInput]);

    if (!isDefined(createdFieldMetadata)) {
      throw new FieldMetadataException(
        'Failed to create field metadata',
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    return createdFieldMetadata;
  }

  override async updateOne(
    id: string,
    fieldMetadataInput: UpdateFieldInput,
  ): Promise<FieldMetadataEntity> {
    const { objectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
        { workspaceId: fieldMetadataInput.workspaceId },
      );

    let existingFieldMetadata: FieldMetadataInterface | undefined;

    for (const objectMetadataItem of Object.values(objectMetadataMaps.byId)) {
      const fieldMetadata = objectMetadataItem.fieldsById[id];

      if (fieldMetadata) {
        existingFieldMetadata = fieldMetadata;
        break;
      }
    }

    if (!isDefined(existingFieldMetadata)) {
      throw new FieldMetadataException(
        'Field does not exist',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

    const objectMetadataItemWithFieldMaps =
      objectMetadataMaps.byId[existingFieldMetadata.objectMetadataId];

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fieldMetadataRepository =
        queryRunner.manager.getRepository<FieldMetadataEntity>(
          FieldMetadataEntity,
        );

      if (
        !isDefined(
          objectMetadataItemWithFieldMaps.labelIdentifierFieldMetadataId,
        )
      ) {
        throw new FieldMetadataException(
          'Label identifier field metadata id does not exist',
          FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND,
        );
      }
      assertMutationNotOnRemoteObject(objectMetadataItemWithFieldMaps);

      assertDoesNotNullifyDefaultValueForNonNullableField({
        isNullable: existingFieldMetadata.isNullable,
        defaultValueFromUpdate: fieldMetadataInput.defaultValue,
      });

      if (fieldMetadataInput.isActive === false) {
        checkCanDeactivateFieldOrThrow({
          labelIdentifierFieldMetadataId:
            objectMetadataItemWithFieldMaps.labelIdentifierFieldMetadataId,
          existingFieldMetadata,
        });
      }

      const updatableFieldInput =
        existingFieldMetadata.isCustom === false
          ? this.buildUpdatableStandardFieldInput(
              fieldMetadataInput,
              existingFieldMetadata,
            )
          : fieldMetadataInput;

      const optionsForUpdate = isDefined(fieldMetadataInput.options)
        ? this.prepareCustomFieldMetadataOptions(fieldMetadataInput.options)
        : undefined;
      const defaultValueForUpdate =
        updatableFieldInput.defaultValue !== undefined
          ? updatableFieldInput.defaultValue
          : existingFieldMetadata.defaultValue;

      const fieldMetadataForUpdate = {
        ...updatableFieldInput,
        defaultValue: defaultValueForUpdate,
        ...optionsForUpdate,
      };

      await this.validateFieldMetadata({
        fieldMetadataType: existingFieldMetadata.type,
        existingFieldMetadata,
        fieldMetadataInput: fieldMetadataForUpdate,
        objectMetadata: objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      });

      const isLabelSyncedWithName =
        fieldMetadataForUpdate.isLabelSyncedWithName ??
        existingFieldMetadata.isLabelSyncedWithName;

      if (isLabelSyncedWithName) {
        validateNameAndLabelAreSyncOrThrow(
          fieldMetadataForUpdate.label ?? existingFieldMetadata.label,
          fieldMetadataForUpdate.name ?? existingFieldMetadata.name,
        );
      }

      await fieldMetadataRepository.update(id, fieldMetadataForUpdate);

      const [updatedFieldMetadata] = await fieldMetadataRepository.find({
        where: { id },
      });

      if (!isDefined(updatedFieldMetadata)) {
        throw new FieldMetadataException(
          'Field does not exist',
          FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
      }

      if (
        isDefined(fieldMetadataInput.name) ||
        isDefined(updatableFieldInput.options) ||
        isDefined(updatableFieldInput.defaultValue)
      ) {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(`update-${updatedFieldMetadata.name}`),
          fieldMetadataInput.workspaceId,
          [
            {
              name: computeObjectTargetTable(objectMetadataItemWithFieldMaps),
              action: WorkspaceMigrationTableActionType.ALTER,
              columns: this.workspaceMigrationFactory.createColumnActions(
                WorkspaceMigrationColumnActionType.ALTER,
                existingFieldMetadata,
                updatedFieldMetadata,
              ),
            } satisfies WorkspaceMigrationTableAction,
          ],
          queryRunner,
        );

        await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrationsWithinTransaction(
          updatedFieldMetadata.workspaceId,
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();

      if (fieldMetadataInput.isActive === false) {
        const viewsRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
            fieldMetadataInput.workspaceId,
            'view',
          );

        await viewsRepository.delete({
          kanbanFieldMetadataId: id,
        });
      }

      if (
        updatedFieldMetadata.isActive &&
        isSelectOrMultiSelectFieldMetadata(updatedFieldMetadata) &&
        isSelectOrMultiSelectFieldMetadata(existingFieldMetadata)
      ) {
        await this.fieldMetadataRelatedRecordsService.updateRelatedViewGroups(
          existingFieldMetadata,
          updatedFieldMetadata,
        );

        await this.fieldMetadataRelatedRecordsService.updateRelatedViewFilters(
          existingFieldMetadata,
          updatedFieldMetadata,
        );
      }

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        fieldMetadataInput.workspaceId,
      );

      return updatedFieldMetadata;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async deleteOneField(
    input: DeleteOneFieldInput,
    workspaceId: string,
  ): Promise<FieldMetadataEntity> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fieldMetadataRepository =
        queryRunner.manager.getRepository<FieldMetadataEntity>(
          FieldMetadataEntity,
        );

      const [fieldMetadata] = await fieldMetadataRepository.find({
        where: {
          id: input.id,
          workspaceId: workspaceId,
        },
        relations: [
          'object',
          'relationTargetFieldMetadata',
          'relationTargetObjectMetadata',
        ],
      });

      if (!isDefined(fieldMetadata)) {
        throw new FieldMetadataException(
          'Field does not exist',
          FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
      }

      if (!isDefined(fieldMetadata.object)) {
        throw new FieldMetadataException(
          'Object metadata does not exist',
          FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      if (
        fieldMetadata.object.labelIdentifierFieldMetadataId === fieldMetadata.id
      ) {
        throw new FieldMetadataException(
          'Cannot delete, please update the label identifier field first',
          FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
          {
            userFriendlyMessage: t`Cannot delete, please update the label identifier field first`,
          },
        );
      }

      if (fieldMetadata.type === FieldMetadataType.RELATION) {
        const isManyToOneRelation =
          (fieldMetadata as FieldMetadataEntity<FieldMetadataType.RELATION>)
            .settings?.relationType === RelationType.MANY_TO_ONE;

        if (!isDefined(fieldMetadata.relationTargetFieldMetadata)) {
          throw new FieldMetadataException(
            'Target field metadata does not exist',
            FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
          );
        }

        await fieldMetadataRepository.delete({
          id: In([
            fieldMetadata.id,
            fieldMetadata.relationTargetFieldMetadata.id,
          ]),
        });

        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(`delete-${fieldMetadata.name}`),
          workspaceId,
          [
            {
              name: isManyToOneRelation
                ? computeObjectTargetTable(fieldMetadata.object)
                : computeObjectTargetTable(
                    fieldMetadata.relationTargetObjectMetadata,
                  ),
              action: WorkspaceMigrationTableActionType.ALTER,
              columns: [
                {
                  action: WorkspaceMigrationColumnActionType.DROP,
                  columnName: isManyToOneRelation
                    ? `${(fieldMetadata as FieldMetadataEntity<FieldMetadataType.RELATION>).settings?.joinColumnName}`
                    : `${(fieldMetadata.relationTargetFieldMetadata as FieldMetadataEntity<FieldMetadataType.RELATION>).settings?.joinColumnName}`,
                } satisfies WorkspaceMigrationColumnDrop,
              ],
            } satisfies WorkspaceMigrationTableAction,
          ],
          queryRunner,
        );
      } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        await fieldMetadataRepository.delete(fieldMetadata.id);
        const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

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
              name: computeObjectTargetTable(fieldMetadata.object),
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
          queryRunner,
        );
      } else {
        await fieldMetadataRepository.delete(fieldMetadata.id);
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(`delete-${fieldMetadata.name}`),
          workspaceId,
          [
            {
              name: computeObjectTargetTable(fieldMetadata.object),
              action: WorkspaceMigrationTableActionType.ALTER,
              columns: [
                {
                  action: WorkspaceMigrationColumnActionType.DROP,
                  columnName: computeColumnName(fieldMetadata),
                } satisfies WorkspaceMigrationColumnDrop,
              ],
            } satisfies WorkspaceMigrationTableAction,
          ],
          queryRunner,
        );
      }

      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrationsWithinTransaction(
        workspaceId,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      await this.viewService.resetKanbanAggregateOperationByFieldMetadataId({
        workspaceId,
        fieldMetadataId: fieldMetadata.id,
      });

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      return fieldMetadata;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async findOneWithinWorkspace(
    workspaceId: string,
    options: FindOneOptions<FieldMetadataEntity>,
  ) {
    const [fieldMetadata] = await this.fieldMetadataRepository.find({
      ...options,
      where: {
        ...options.where,
        workspaceId,
      },
    });

    return fieldMetadata;
  }

  private buildUpdatableStandardFieldInput(
    fieldMetadataInput: UpdateFieldInput,
    existingFieldMetadata: Pick<
      FieldMetadataInterface,
      'type' | 'isNullable' | 'defaultValue' | 'options'
    >,
  ) {
    const updatableStandardFieldInput: UpdateFieldInput & {
      standardOverrides?: FieldStandardOverridesDTO;
    } = {
      id: fieldMetadataInput.id,
      isActive: fieldMetadataInput.isActive,
      workspaceId: fieldMetadataInput.workspaceId,
      defaultValue: fieldMetadataInput.defaultValue,
      settings: fieldMetadataInput.settings,
      isLabelSyncedWithName: fieldMetadataInput.isLabelSyncedWithName,
    };

    if ('standardOverrides' in fieldMetadataInput) {
      updatableStandardFieldInput.standardOverrides =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fieldMetadataInput as any).standardOverrides;
    }

    if (
      existingFieldMetadata.type === FieldMetadataType.SELECT ||
      existingFieldMetadata.type === FieldMetadataType.MULTI_SELECT
    ) {
      return {
        ...updatableStandardFieldInput,
        options: fieldMetadataInput.options,
      };
    }

    return updatableStandardFieldInput;
  }

  private async validateFieldMetadata<
    T extends UpdateFieldInput | CreateFieldInput,
  >({
    fieldMetadataInput,
    fieldMetadataType,
    objectMetadata,
    existingFieldMetadata,
  }: ValidateFieldMetadataArgs<T>): Promise<T> {
    if (fieldMetadataInput.name) {
      try {
        validateMetadataNameOrThrow(fieldMetadataInput.name);
      } catch (error) {
        if (error instanceof InvalidMetadataException) {
          throw new FieldMetadataException(
            error.message,
            FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          );
        }

        throw error;
      }

      try {
        validateFieldNameAvailabilityOrThrow(
          fieldMetadataInput.name,
          objectMetadata,
        );
      } catch (error) {
        if (error instanceof InvalidMetadataException) {
          throw new FieldMetadataException(
            `Name "${fieldMetadataInput.name}" is not available, check that it is not duplicating another field's name.`,
            FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
            {
              userFriendlyMessage: t`Name is not available, it may be duplicating another field's name.`,
            },
          );
        }

        throw error;
      }
    }

    if (fieldMetadataInput.isNullable === false) {
      if (!isDefined(fieldMetadataInput.defaultValue)) {
        throw new FieldMetadataException(
          'Default value is required for non nullable fields',
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        );
      }
    }

    if (isEnumFieldMetadataType(fieldMetadataType)) {
      await this.fieldMetadataEnumValidationService.validateEnumFieldMetadataInput(
        {
          fieldMetadataInput,
          fieldMetadataType,
          existingFieldMetadata,
        },
      );
    }

    if (fieldMetadataInput.settings) {
      await this.fieldMetadataValidationService.validateSettingsOrThrow({
        fieldType: fieldMetadataType,
        settings: fieldMetadataInput.settings,
      });
    }

    return fieldMetadataInput;
  }

  private prepareCustomFieldMetadataOptions(
    options: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[],
  ): undefined | Pick<FieldMetadataEntity, 'options'> {
    return {
      options: options.map((option) => ({
        id: uuidV4(),
        ...trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
          option,
          ['label', 'value', 'id'],
        ),
      })),
    };
  }

  private prepareCustomFieldMetadataForCreation(
    fieldMetadataInput: CreateFieldInput,
  ) {
    const options = fieldMetadataInput.options
      ? this.prepareCustomFieldMetadataOptions(fieldMetadataInput.options)
      : undefined;
    const defaultValue =
      fieldMetadataInput.defaultValue ??
      generateDefaultValue(fieldMetadataInput.type);

    return {
      id: v4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: fieldMetadataInput.name,
      label: fieldMetadataInput.label,
      icon: fieldMetadataInput.icon,
      type: fieldMetadataInput.type,
      isLabelSyncedWithName: fieldMetadataInput.isLabelSyncedWithName,
      objectMetadataId: fieldMetadataInput.objectMetadataId,
      workspaceId: fieldMetadataInput.workspaceId,
      isNullable: generateNullable(
        fieldMetadataInput.type,
        fieldMetadataInput.isNullable,
        fieldMetadataInput.isRemoteCreation,
      ),
      relationTargetObjectMetadataId:
        fieldMetadataInput?.relationCreationPayload?.targetObjectMetadataId,
      defaultValue,
      ...options,
      isActive: true,
      isCustom: true,
      settings: fieldMetadataInput.settings,
    };
  }

  private addCustomRelationFieldMetadataForCreation(
    fieldMetadataInput: CreateFieldInput,
    relationCreationPayload: CreateFieldInput['relationCreationPayload'],
  ) {
    const isRelation =
      isFieldMetadataInterfaceOfType(
        fieldMetadataInput,
        FieldMetadataType.RELATION,
      ) ||
      isFieldMetadataInterfaceOfType(
        fieldMetadataInput,
        FieldMetadataType.MORPH_RELATION,
      );

    const isManyToOne =
      isRelation && relationCreationPayload?.type === RelationType.MANY_TO_ONE;

    const isOneToMany =
      isRelation && relationCreationPayload?.type === RelationType.ONE_TO_MANY;

    return {
      ...fieldMetadataInput,
      relationCreationPayload,
      relationTargetObjectMetadataId:
        relationCreationPayload?.targetObjectMetadataId,
      settings: {
        ...fieldMetadataInput.settings,
        ...(isOneToMany
          ? {
              relationType: RelationType.ONE_TO_MANY,
            }
          : {}),
        ...(isManyToOne
          ? {
              relationType: RelationType.MANY_TO_ONE,
              onDelete: RelationOnDeleteAction.SET_NULL,
              joinColumnName: `${fieldMetadataInput.name}Id`,
            }
          : {}),
      },
    };
  }

  private groupFieldInputsByObjectId(
    fieldMetadataInputs: CreateFieldInput[],
  ): Record<string, CreateFieldInput[]> {
    return fieldMetadataInputs.reduce(
      (acc, input) => {
        if (!acc[input.objectMetadataId]) {
          acc[input.objectMetadataId] = [];
        }
        acc[input.objectMetadataId].push(input);

        return acc;
      },
      {} as Record<string, CreateFieldInput[]>,
    );
  }

  private async validateAndCreateFieldMetadataItems(
    fieldMetadataInput: CreateFieldInput,
    objectMetadata: ObjectMetadataItemWithFieldMaps,
    fieldMetadataRepository: Repository<FieldMetadataEntity>,
    objectMetadataMaps: ObjectMetadataMaps,
  ): Promise<FieldMetadataEntity[]> {
    if (!fieldMetadataInput.isRemoteCreation) {
      assertMutationNotOnRemoteObject(objectMetadata);
    }

    if (fieldMetadataInput.type === FieldMetadataType.RATING) {
      fieldMetadataInput.options = generateRatingOptions();
    }

    if (fieldMetadataInput.isLabelSyncedWithName === true) {
      validateNameAndLabelAreSyncOrThrow(
        fieldMetadataInput.label,
        fieldMetadataInput.name,
      );
    }

    const fieldMetadataForCreate =
      this.prepareCustomFieldMetadataForCreation(fieldMetadataInput);

    await this.validateFieldMetadata({
      fieldMetadataType: fieldMetadataForCreate.type,
      fieldMetadataInput: fieldMetadataForCreate,
      objectMetadata,
      objectMetadataMaps,
    });

    const isRelation =
      fieldMetadataInput.type === FieldMetadataType.RELATION ||
      fieldMetadataInput.type === FieldMetadataType.MORPH_RELATION;

    if (!isRelation) {
      const createdFieldMetadataItem = await fieldMetadataRepository.save(
        fieldMetadataForCreate,
      );

      return [createdFieldMetadataItem];
    }

    if (fieldMetadataInput.type === FieldMetadataType.RELATION) {
      const relationFieldMetadataForCreate =
        await this.addCustomRelationFieldMetadataForCreation(
          fieldMetadataForCreate,
          fieldMetadataInput.relationCreationPayload,
        );

      await this.validateFieldMetadataRelationSpecifics({
        fieldMetadataInput: relationFieldMetadataForCreate,
        fieldMetadataType: fieldMetadataForCreate.type,
        objectMetadataMaps,
      });

      return await this.createRelationFieldMetadataItems({
        fieldMetadataInput: relationFieldMetadataForCreate,
        objectMetadata,
        fieldMetadataRepository,
      });
    }

    return await this.createMorphRelationFieldMetadataItems({
      fieldMetadataForCreate,
      morphRelationsCreationPayload:
        fieldMetadataInput.morphRelationsCreationPayload,
      objectMetadata,
      fieldMetadataRepository,
      objectMetadataMaps,
    });
  }

  private async createMigrationActions({
    createdFieldMetadataItems,
    objectMetadataMap,
    isRemoteCreation,
  }: {
    createdFieldMetadataItems: FieldMetadataEntity[];
    objectMetadataMap: Record<string, ObjectMetadataItemWithFieldMaps>;
    isRemoteCreation: boolean;
  }): Promise<WorkspaceMigrationTableAction[]> {
    if (isRemoteCreation) {
      return [];
    }

    const migrationActions: WorkspaceMigrationTableAction[] = [];

    for (const createdFieldMetadata of createdFieldMetadataItems) {
      if (
        isFieldMetadataEntityOfType(
          createdFieldMetadata,
          FieldMetadataType.RELATION,
        )
      ) {
        const relationType = createdFieldMetadata.settings?.relationType;

        if (relationType === RelationType.ONE_TO_MANY) {
          continue;
        }
      }

      migrationActions.push({
        name: computeObjectTargetTable(
          objectMetadataMap[createdFieldMetadata.objectMetadataId],
        ),
        action: WorkspaceMigrationTableActionType.ALTER,
        columns: this.workspaceMigrationFactory.createColumnActions(
          WorkspaceMigrationColumnActionType.CREATE,
          createdFieldMetadata,
        ),
      });
    }

    return migrationActions;
  }

  async createMany(
    fieldMetadataInputs: CreateFieldInput[],
  ): Promise<FieldMetadataEntity[]> {
    if (!fieldMetadataInputs.length) {
      return [];
    }

    const { objectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
        { workspaceId: fieldMetadataInputs[0].workspaceId },
      );

    const workspaceId = fieldMetadataInputs[0].workspaceId;

    const isMorphRelationEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_MORPH_RELATION_ENABLED,
        workspaceId,
      );

    const isSomeFieldMetadatInputsMorph = fieldMetadataInputs.some(
      (fieldMetadataInput) =>
        fieldMetadataInput.type === FieldMetadataType.MORPH_RELATION,
    );

    if (isSomeFieldMetadatInputsMorph && !isMorphRelationEnabled) {
      throw new FieldMetadataException(
        'Morph Relation feature is not enabled for this workspace',
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fieldMetadataRepository =
        queryRunner.manager.getRepository<FieldMetadataEntity>(
          FieldMetadataEntity,
        );

      const inputsByObjectId =
        this.groupFieldInputsByObjectId(fieldMetadataInputs);
      const objectMetadataIds = Object.keys(inputsByObjectId);

      const createdFieldMetadatas: FieldMetadataEntity[] = [];
      const migrationActions: WorkspaceMigrationTableAction[] = [];

      for (const objectMetadataId of objectMetadataIds) {
        const objectMetadata = objectMetadataMaps.byId[objectMetadataId];

        if (!isDefined(objectMetadata)) {
          throw new FieldMetadataException(
            'Object metadata does not exist',
            FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
          );
        }

        const inputs = inputsByObjectId[objectMetadataId];

        for (const fieldMetadataInput of inputs) {
          const createdFieldMetadataItems =
            await this.validateAndCreateFieldMetadataItems(
              fieldMetadataInput,
              objectMetadata,
              fieldMetadataRepository,
              objectMetadataMaps,
            );

          createdFieldMetadatas.push(...createdFieldMetadataItems);

          const fieldMigrationActions = await this.createMigrationActions({
            createdFieldMetadataItems,
            objectMetadataMap: objectMetadataMaps.byId,
            isRemoteCreation: fieldMetadataInput.isRemoteCreation ?? false,
          });

          migrationActions.push(...fieldMigrationActions);
        }
      }

      if (migrationActions.length > 0) {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(`create-multiple-fields`),
          workspaceId,
          migrationActions,
          queryRunner,
        );

        await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrationsWithinTransaction(
          workspaceId,
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();

      await this.createViewAndViewFields(createdFieldMetadatas, workspaceId);

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      return createdFieldMetadatas;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
