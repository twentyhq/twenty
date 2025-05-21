import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { i18n } from '@lingui/core';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import isEmpty from 'lodash.isempty';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, FindOneOptions, In, Repository } from 'typeorm';
import { v4 as uuidV4, v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { settings } from 'src/engine/constants/settings';
import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldStandardOverridesDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import {
  RelationDefinitionDTO,
  RelationDefinitionType,
} from 'src/engine/metadata-modules/field-metadata/dtos/relation-definition.dto';
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
import { isSelectFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-select-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { validateFieldNameAvailabilityOrThrow } from 'src/engine/metadata-modules/utils/validate-field-name-availability.utils';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';
import { validateNameAndLabelAreSyncOrThrow } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
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
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { ViewService } from 'src/modules/view/services/view.service';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'src/utils/trim-and-remove-duplicated-whitespaces-from-object-string-properties';

import { FieldMetadataValidationService } from './field-metadata-validation.service';
import { FieldMetadataEntity } from './field-metadata.entity';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { generateDefaultValue } from './utils/generate-default-value';
import { generateRatingOptions } from './utils/generate-rating-optionts.util';

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly fieldMetadataEnumValidationService: FieldMetadataEnumValidationService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly fieldMetadataValidationService: FieldMetadataValidationService,
    private readonly fieldMetadataRelatedRecordsService: FieldMetadataRelatedRecordsService,
    private readonly viewService: ViewService,
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
    const queryRunner = this.metadataDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fieldMetadataRepository =
        queryRunner.manager.getRepository<FieldMetadataEntity>(
          FieldMetadataEntity,
        );

      const [existingFieldMetadata] = await fieldMetadataRepository.find({
        where: {
          id,
          workspaceId: fieldMetadataInput.workspaceId,
        },
      });

      if (!isDefined(existingFieldMetadata)) {
        throw new FieldMetadataException(
          'Field does not exist',
          FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        );
      }

      const [objectMetadata] = await this.objectMetadataRepository.find({
        where: {
          id: existingFieldMetadata.objectMetadataId,
          workspaceId: fieldMetadataInput.workspaceId,
        },
        relations: ['fields'],
        order: {},
      });

      if (!isDefined(objectMetadata)) {
        throw new FieldMetadataException(
          'Object metadata does not exist',
          FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      if (!isDefined(objectMetadata.labelIdentifierFieldMetadataId)) {
        throw new FieldMetadataException(
          'Label identifier field metadata id does not exist',
          FieldMetadataExceptionCode.LABEL_IDENTIFIER_FIELD_METADATA_ID_NOT_FOUND,
        );
      }
      assertMutationNotOnRemoteObject(objectMetadata);

      assertDoesNotNullifyDefaultValueForNonNullableField({
        isNullable: existingFieldMetadata.isNullable,
        defaultValueFromUpdate: fieldMetadataInput.defaultValue,
      });

      if (fieldMetadataInput.isActive === false) {
        checkCanDeactivateFieldOrThrow({
          labelIdentifierFieldMetadataId:
            objectMetadata.labelIdentifierFieldMetadataId,
          existingFieldMetadata,
        });

        const viewsRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
            fieldMetadataInput.workspaceId,
            'view',
          );

        await viewsRepository.delete({
          kanbanFieldMetadataId: id,
        });
      }

      const updatableFieldInput =
        existingFieldMetadata.isCustom === false
          ? this.buildUpdatableStandardFieldInput(
              fieldMetadataInput,
              existingFieldMetadata,
            )
          : fieldMetadataInput;

      const fieldMetadataForUpdate = {
        ...updatableFieldInput,
        defaultValue:
          updatableFieldInput.defaultValue !== undefined
            ? updatableFieldInput.defaultValue
            : existingFieldMetadata.defaultValue,
        ...this.prepareCustomFieldMetadataOptions(
          fieldMetadataInput.options ?? existingFieldMetadata.options,
        ),
      };

      await this.validateFieldMetadata<UpdateFieldInput>(
        existingFieldMetadata.type,
        fieldMetadataForUpdate,
        objectMetadata,
      );

      const isLabelSyncedWithName =
        fieldMetadataForUpdate.isLabelSyncedWithName ??
        existingFieldMetadata.isLabelSyncedWithName;

      if (isLabelSyncedWithName) {
        validateNameAndLabelAreSyncOrThrow(
          fieldMetadataForUpdate.label ?? existingFieldMetadata.label,
          fieldMetadataForUpdate.name ?? existingFieldMetadata.name,
        );
      }

      // We're running field update under a transaction, so we can rollback if migration fails
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
        updatedFieldMetadata.isActive &&
        isSelectFieldMetadataType(updatedFieldMetadata.type)
      ) {
        await this.fieldMetadataRelatedRecordsService.updateRelatedViewGroups(
          existingFieldMetadata,
          updatedFieldMetadata,
        );
      }

      if (
        isDefined(fieldMetadataInput.name) ||
        isDefined(updatableFieldInput.options) ||
        isDefined(updatableFieldInput.defaultValue)
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
      await this.workspaceMetadataVersionService.incrementMetadataVersion(
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
        );
      }

      await this.viewService.resetKanbanAggregateOperationByFieldMetadataId({
        workspaceId,
        fieldMetadataId: fieldMetadata.id,
      });

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

        // TODO: remove this once we have deleted the relation metadata table
        await this.relationMetadataRepository.delete({
          fromFieldMetadataId: In([
            fieldMetadata.id,
            fieldMetadata.relationTargetFieldMetadata.id,
          ]),
        });
        await this.relationMetadataRepository.delete({
          toFieldMetadataId: In([
            fieldMetadata.id,
            fieldMetadata.relationTargetFieldMetadata.id,
          ]),
        });

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
      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );
    }
  }

  public async findOneOrFail(
    id: string,
    options?: FindOneOptions<FieldMetadataEntity>,
  ) {
    const [fieldMetadata] = await this.fieldMetadataRepository.find({
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
    existingFieldMetadata: FieldMetadataEntity,
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

  private async validateFieldMetadata<
    T extends UpdateFieldInput | CreateFieldInput,
  >(
    fieldMetadataType: FieldMetadataType,
    fieldMetadataInput: T,
    objectMetadata: ObjectMetadataEntity,
  ): Promise<T> {
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

    await this.fieldMetadataEnumValidationService.validateMetadataOptions({
      fieldMetadataInput,
      fieldMetadataType,
    });

    if (fieldMetadataInput.settings) {
      await this.fieldMetadataValidationService.validateSettingsOrThrow({
        fieldType: fieldMetadataType,
        settings: fieldMetadataInput.settings,
      });
    }

    return fieldMetadataInput;
  }

  async resolveOverridableString(
    fieldMetadata: FieldMetadataDTO,
    labelKey: 'label' | 'description' | 'icon',
    locale: keyof typeof APP_LOCALES | undefined,
  ): Promise<string> {
    if (fieldMetadata.isCustom) {
      return fieldMetadata[labelKey] ?? '';
    }

    if (!locale || locale === SOURCE_LOCALE) {
      if (
        fieldMetadata.standardOverrides &&
        isDefined(fieldMetadata.standardOverrides[labelKey])
      ) {
        return fieldMetadata.standardOverrides[labelKey] as string;
      }

      return fieldMetadata[labelKey] ?? '';
    }

    const translationValue =
      // @ts-expect-error legacy noImplicitAny
      fieldMetadata.standardOverrides?.translations?.[locale]?.[labelKey];

    if (isDefined(translationValue)) {
      return translationValue;
    }

    const messageId = generateMessageId(fieldMetadata[labelKey] ?? '');
    const translatedMessage = i18n._(messageId);

    if (translatedMessage === messageId) {
      return fieldMetadata[labelKey] ?? '';
    }

    return translatedMessage;
  }

  private prepareCustomFieldMetadataOptions(
    options?: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[],
  ): undefined | Pick<FieldMetadataEntity, 'options'> {
    if (!isDefined(options)) {
      return undefined;
    }

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

  private prepareCustomFieldMetadata(fieldMetadataInput: CreateFieldInput) {
    return {
      id: v4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...fieldMetadataInput,
      isNullable: generateNullable(
        fieldMetadataInput.type,
        fieldMetadataInput.isNullable,
        fieldMetadataInput.isRemoteCreation,
      ),
      defaultValue:
        fieldMetadataInput.defaultValue ??
        generateDefaultValue(fieldMetadataInput.type),
      ...this.prepareCustomFieldMetadataOptions(fieldMetadataInput.options),
      isActive: true,
      isCustom: true,
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

  private async validateAndCreateFieldMetadata(
    fieldMetadataInput: CreateFieldInput,
    objectMetadata: ObjectMetadataEntity,
    fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ): Promise<FieldMetadataEntity> {
    if (!fieldMetadataInput.isRemoteCreation) {
      assertMutationNotOnRemoteObject(objectMetadata);
    }

    if (fieldMetadataInput.type === FieldMetadataType.RATING) {
      fieldMetadataInput.options = generateRatingOptions();
    }

    const fieldMetadataForCreate =
      this.prepareCustomFieldMetadata(fieldMetadataInput);

    await this.validateFieldMetadata<CreateFieldInput>(
      fieldMetadataForCreate.type,
      fieldMetadataForCreate,
      objectMetadata,
    );

    if (fieldMetadataForCreate.isLabelSyncedWithName === true) {
      validateNameAndLabelAreSyncOrThrow(
        fieldMetadataForCreate.label,
        fieldMetadataForCreate.name,
      );
    }

    return await fieldMetadataRepository.save(fieldMetadataForCreate);
  }

  private async createMigrationActions(
    createdFieldMetadata: FieldMetadataEntity,
    objectMetadata: ObjectMetadataEntity,
    isRemoteCreation: boolean,
  ): Promise<WorkspaceMigrationTableAction | null> {
    if (isRemoteCreation) {
      return null;
    }

    return {
      name: computeObjectTargetTable(objectMetadata),
      action: WorkspaceMigrationTableActionType.ALTER,
      columns: this.workspaceMigrationFactory.createColumnActions(
        WorkspaceMigrationColumnActionType.CREATE,
        createdFieldMetadata,
      ),
    };
  }

  async createMany(
    fieldMetadataInputs: CreateFieldInput[],
  ): Promise<FieldMetadataEntity[]> {
    if (!fieldMetadataInputs.length) {
      return [];
    }

    const workspaceId = fieldMetadataInputs[0].workspaceId;
    const queryRunner = this.metadataDataSource.createQueryRunner();

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

      const objectMetadatas = await this.objectMetadataRepository.find({
        where: {
          id: In(objectMetadataIds),
          workspaceId,
        },
        relations: ['fields'],
      });

      const objectMetadataMap = objectMetadatas.reduce(
        (acc, obj) => ({ ...acc, [obj.id]: obj }),
        {} as Record<string, ObjectMetadataEntity>,
      );

      const createdFieldMetadatas: FieldMetadataEntity[] = [];
      const migrationActions: WorkspaceMigrationTableAction[] = [];

      for (const objectMetadataId of objectMetadataIds) {
        const objectMetadata = objectMetadataMap[objectMetadataId];

        if (!isDefined(objectMetadata)) {
          throw new FieldMetadataException(
            'Object metadata does not exist',
            FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
          );
        }

        const inputs = inputsByObjectId[objectMetadataId];

        for (const fieldMetadataInput of inputs) {
          const createdFieldMetadata =
            await this.validateAndCreateFieldMetadata(
              fieldMetadataInput,
              objectMetadata,
              fieldMetadataRepository,
            );

          createdFieldMetadatas.push(createdFieldMetadata);

          const migrationAction = await this.createMigrationActions(
            createdFieldMetadata,
            objectMetadata,
            fieldMetadataInput.isRemoteCreation ?? false,
          );

          if (isDefined(migrationAction)) {
            migrationActions.push(migrationAction);
          }
        }
      }

      if (migrationActions.length > 0) {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(`create-multiple-fields`),
          workspaceId,
          migrationActions,
        );

        await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
          workspaceId,
        );
      }

      await this.createViewAndViewFields(createdFieldMetadatas, workspaceId);

      await queryRunner.commitTransaction();

      return createdFieldMetadatas;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );
    }
  }

  private async createViewAndViewFields(
    createdFieldMetadatas: FieldMetadataEntity[],
    workspaceId: string,
  ) {
    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    await workspaceDataSource.transaction(
      async (workspaceEntityManager: WorkspaceEntityManager) => {
        const viewsRepository = workspaceEntityManager.getRepository('view', {
          shouldBypassPermissionChecks: true,
        });

        const viewFieldsRepository = workspaceEntityManager.getRepository(
          'viewField',
          {
            shouldBypassPermissionChecks: true,
          },
        );

        for (const createdFieldMetadata of createdFieldMetadatas) {
          const views = await viewsRepository.find({
            where: {
              objectMetadataId: createdFieldMetadata.objectMetadataId,
            },
          });

          if (!isEmpty(views)) {
            const view = views[0];
            const existingViewFields = await viewFieldsRepository.find({
              where: {
                viewId: view.id,
              },
            });

            const isVisible =
              existingViewFields.length < settings.maxVisibleViewFields;

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

              await viewFieldsRepository.insert({
                fieldMetadataId: createdFieldMetadata.id,
                position: lastPosition + 1,
                isVisible,
                size: 180,
                viewId: view.id,
              });
            }
          }
        }
      },
    );
  }

  async getFieldMetadataItemsByBatch(
    objectMetadataIds: string[],
    workspaceId: string,
  ) {
    const fieldMetadataItems = await this.fieldMetadataRepository.find({
      where: { objectMetadataId: In(objectMetadataIds), workspaceId },
    });

    return objectMetadataIds.map((objectMetadataId) =>
      fieldMetadataItems.filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.objectMetadataId === objectMetadataId,
      ),
    );
  }
}
