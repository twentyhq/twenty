import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  DataSource,
  In,
  Repository,
  type FindOneOptions,
  type QueryRunner,
} from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataMorphRelationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-morph-relation.service';
import { FieldMetadataRelatedRecordsService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-related-records.service';
import { FieldMetadataRelationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-relation.service';
import { FieldMetadataValidationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-validation.service';
import { FieldMetadataServiceV2 } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service-v2';
import { areFieldMetadatasTypeRelationOrMorphRelation } from 'src/engine/metadata-modules/field-metadata/utils/are-field-metadatas-type-relation-or-morph-relation.util';
import { assertDoesNotNullifyDefaultValueForNonNullableField } from 'src/engine/metadata-modules/field-metadata/utils/assert-does-not-nullify-default-value-for-non-nullable-field.util';
import { buildUpdatableStandardFieldInput } from 'src/engine/metadata-modules/field-metadata/utils/build-updatable-standard-field-input.util';
import { checkCanDeactivateFieldOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/check-can-deactivate-field-or-throw';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { computeRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-relation-field-join-column-name.util';
import { createMigrationActions } from 'src/engine/metadata-modules/field-metadata/utils/create-migration-actions.util';
import { generateRatingOptions } from 'src/engine/metadata-modules/field-metadata/utils/generate-rating-optionts.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isFieldMetadataTypeMorphRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-morph-relation.util';
import { isFieldMetadataTypeRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-relation.util';
import { isSelectOrMultiSelectFieldMetadata } from 'src/engine/metadata-modules/field-metadata/utils/is-select-or-multi-select-field-metadata.util';
import { isValidUniqueFieldDefaultValueCombination } from 'src/engine/metadata-modules/field-metadata/utils/is-valid-unique-input.util';
import { prepareCustomFieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/utils/prepare-custom-field-metadata-for-options.util';
import { prepareCustomFieldMetadataForCreation } from 'src/engine/metadata-modules/field-metadata/utils/prepare-field-metadata-for-creation.util';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/index-metadata.service';
import { computeUniqueIndexWhereClause } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-index-where-clause.util';
import { validateCanCreateUniqueIndex } from 'src/engine/metadata-modules/index-metadata/utils/validate-can-create-unique-index.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataEntityFromObjectMetadataItemWithFieldsMap } from 'src/engine/metadata-modules/utils/get-object-metadata-entity-from-object-metadata-item-with-fields-map.util';
import { validateNameAndLabelAreSyncOrThrow } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableActionType,
  type WorkspaceMigrationColumnDrop,
  type WorkspaceMigrationTableAction,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';

type GenerateMigrationArgs = {
  fieldMetadata: FieldMetadataEntity<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >;
  workspaceId: string;
  queryRunner: QueryRunner;
};

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly fieldMetadataRelatedRecordsService: FieldMetadataRelatedRecordsService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly fieldMetadataValidationService: FieldMetadataValidationService,
    private readonly fieldMetadataMorphRelationService: FieldMetadataMorphRelationService,
    private readonly fieldMetadataRelationService: FieldMetadataRelationService,
    private readonly fieldMetadataServiceV2: FieldMetadataServiceV2,
    private readonly indexMetadataService: IndexMetadataService,
  ) {
    super(fieldMetadataRepository);
  }

  override async createOne(
    fieldMetadataInput: CreateFieldInput,
  ): Promise<FieldMetadataEntity> {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        fieldMetadataInput.workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return this.fieldMetadataServiceV2.createOne({
        fieldMetadataInput,
        workspaceId: fieldMetadataInput.workspaceId,
      });
    }

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

    let existingFieldMetadata: FieldMetadataEntity | undefined;

    for (const objectMetadataItem of Object.values(
      objectMetadataMaps.byId,
    ).filter(isDefined)) {
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

    if (!isDefined(objectMetadataItemWithFieldMaps)) {
      throw new FieldMetadataException(
        'Object metadata does not exist',
        FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    if (
      !isValidUniqueFieldDefaultValueCombination({
        defaultValue: isDefined(fieldMetadataInput.defaultValue)
          ? fieldMetadataInput.defaultValue
          : existingFieldMetadata.defaultValue,
        isUnique: isDefined(fieldMetadataInput.isUnique)
          ? fieldMetadataInput.isUnique
          : (existingFieldMetadata.isUnique ?? false),
        type: existingFieldMetadata.type,
      })
    ) {
      throw new FieldMetadataException(
        'Unique field cannot have a default value',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        {
          userFriendlyMessage: t`Unique field cannot have a default value`,
        },
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
          ? buildUpdatableStandardFieldInput(
              fieldMetadataInput,
              existingFieldMetadata,
            )
          : fieldMetadataInput;

      const optionsForUpdate = isDefined(fieldMetadataInput.options)
        ? prepareCustomFieldMetadataOptions(fieldMetadataInput.options)
        : undefined;
      const defaultValueForUpdate =
        updatableFieldInput.defaultValue !== undefined
          ? updatableFieldInput.defaultValue
          : existingFieldMetadata.defaultValue;

      const fieldMetadataForUpdate = {
        ...updatableFieldInput,
        ...optionsForUpdate,
        defaultValue: defaultValueForUpdate,
      };

      await this.fieldMetadataValidationService.validateFieldMetadata({
        fieldMetadataType: existingFieldMetadata.type,
        existingFieldMetadata,
        fieldMetadataInput: fieldMetadataForUpdate,
        objectMetadata: objectMetadataItemWithFieldMaps,
      });

      const isLabelSyncedWithName =
        fieldMetadataForUpdate.isLabelSyncedWithName ??
        existingFieldMetadata.isLabelSyncedWithName;

      if (isLabelSyncedWithName) {
        validateNameAndLabelAreSyncOrThrow({
          label: fieldMetadataForUpdate.label ?? existingFieldMetadata.label,
          name: fieldMetadataForUpdate.name ?? existingFieldMetadata.name,
        });
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

      const workspaceMigrationsOnCustomUniqueIndex: WorkspaceMigrationTableAction[] =
        [];

      const shouldUpdateUniqueIndex =
        isDefined(fieldMetadataInput.name) &&
        fieldMetadataInput.name !== existingFieldMetadata.name &&
        existingFieldMetadata.isUnique === true;

      if (shouldUpdateUniqueIndex) {
        workspaceMigrationsOnCustomUniqueIndex.push(
          await this.updateUniqueIndexMetdataAndCreateMigrationActions({
            fieldMetadataInput,
            objectMetadataItemWithFieldMaps,
            updatedFieldMetadata,
            queryRunner,
          }),
        );
      }

      const shouldCreateUniqueIndex =
        fieldMetadataInput.isUnique === true && !existingFieldMetadata.isUnique;

      if (shouldCreateUniqueIndex) {
        workspaceMigrationsOnCustomUniqueIndex.push(
          await this.createUniqueIndexMetadataAndCreateMigrationActions({
            fieldMetadataItem: updatedFieldMetadata,
            objectMetadataItemWithFieldMaps,
            fieldMetadataInput,
            queryRunner,
          }),
        );
      }

      const shouldDeleteUniqueIndex =
        (fieldMetadataInput.isUnique === null ||
          fieldMetadataInput.isUnique === false) &&
        existingFieldMetadata.isUnique;

      if (shouldDeleteUniqueIndex) {
        workspaceMigrationsOnCustomUniqueIndex.push(
          await this.deleteUniqueIndexMetadataAndCreateMigrationActions({
            fieldMetadataInput,
            objectMetadataItemWithFieldMaps,
            updatedFieldMetadata,
            queryRunner,
          }),
        );
      }

      if (
        isDefined(fieldMetadataInput.name) ||
        isDefined(updatableFieldInput.options) ||
        isDefined(updatableFieldInput.defaultValue) ||
        isDefined(updatableFieldInput.isUnique)
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
            ...workspaceMigrationsOnCustomUniqueIndex,
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
            {
              shouldBypassPermissionChecks: true,
            },
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
        try {
          await queryRunner.rollbackTransaction();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.trace(`Failed to rollback transaction: ${error.message}`);
        }
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

      await this.fieldMetadataRelatedRecordsService.resetViewKanbanAggregateOperation(
        fieldMetadata,
      );

      if (isFieldMetadataTypeRelation(fieldMetadata)) {
        const fieldMetadataIdsToDelete: string[] = [];
        const isRelationTargetMorphRelation = isFieldMetadataTypeMorphRelation(
          fieldMetadata.relationTargetFieldMetadata,
        );

        if (isRelationTargetMorphRelation) {
          const morphRelationsWithSameName =
            await this.getMorphRelationsWithSameName({
              fieldMetadataName: fieldMetadata.relationTargetFieldMetadata.name,
              objectMetadataId:
                fieldMetadata.relationTargetFieldMetadata.objectMetadataId,
              workspaceId,
              fieldMetadataRepository,
            });

          morphRelationsWithSameName.forEach((morphRelation) => {
            fieldMetadataIdsToDelete.push(
              morphRelation.id,
              morphRelation.relationTargetFieldMetadataId,
            );
          });

          await fieldMetadataRepository.delete({
            id: In(fieldMetadataIdsToDelete),
          });

          for (const morphRelation of morphRelationsWithSameName) {
            await this.generateDeleteRelationMigration({
              fieldMetadata: morphRelation,
              workspaceId,
              queryRunner,
            });
          }
        } else {
          fieldMetadataIdsToDelete.push(
            fieldMetadata.id,
            fieldMetadata.relationTargetFieldMetadataId,
          );

          await fieldMetadataRepository.delete({
            id: In(fieldMetadataIdsToDelete),
          });

          await this.generateDeleteRelationMigration({
            fieldMetadata,
            workspaceId,
            queryRunner,
          });
        }
      } else if (isFieldMetadataTypeMorphRelation(fieldMetadata)) {
        const fieldMetadataIdsToDelete: string[] = [];

        const morphRelationsWithSameName =
          await this.getMorphRelationsWithSameName({
            fieldMetadataName: fieldMetadata.name,
            objectMetadataId: fieldMetadata.objectMetadataId,
            workspaceId,
            fieldMetadataRepository,
          });

        morphRelationsWithSameName.forEach((morphRelation) => {
          fieldMetadataIdsToDelete.push(
            morphRelation.id,
            morphRelation.relationTargetFieldMetadataId,
          );
        });

        await fieldMetadataRepository.delete({
          id: In(fieldMetadataIdsToDelete),
        });

        for (const morphRelation of morphRelationsWithSameName) {
          await this.generateDeleteRelationMigration({
            fieldMetadata: morphRelation,
            workspaceId,
            queryRunner,
          });
        }
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

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      return fieldMetadata;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        try {
          await queryRunner.rollbackTransaction();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.trace(`Failed to rollback transaction: ${error.message}`);
        }
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

  async createMany(
    fieldMetadataInputs: CreateFieldInput[],
  ): Promise<FieldMetadataEntity[]> {
    if (!fieldMetadataInputs.length) {
      return [];
    }
    const workspaceId = fieldMetadataInputs[0].workspaceId;
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    if (isWorkspaceMigrationV2Enabled) {
      return this.fieldMetadataServiceV2.createMany({
        fieldMetadataInputs,
        workspaceId,
      });
    }

    const { objectMetadataMaps } =
      await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
        { workspaceId: fieldMetadataInputs[0].workspaceId },
      );

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

          const fieldMigrationActions = await createMigrationActions({
            createdFieldMetadataItems,
            objectMetadataMap: objectMetadataMaps.byId,
            isRemoteCreation: fieldMetadataInput.isRemoteCreation ?? false,
            workspaceMigrationFactory: this.workspaceMigrationFactory,
          });

          migrationActions.push(...fieldMigrationActions);

          if (fieldMetadataInput.isUnique) {
            if (createdFieldMetadataItems.length > 1) {
              throw new FieldMetadataException(
                'Unique field cannot bet RELATION or MORPH_RELATION type',
                FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
              );
            }

            const uniqueIndexMigration =
              await this.createUniqueIndexForNewField({
                createdFieldMetadataItem: createdFieldMetadataItems[0],
                objectMetadata,
                fieldMetadataInput,
                workspaceId,
                queryRunner,
              });

            migrationActions.push(
              ...(isDefined(uniqueIndexMigration)
                ? [uniqueIndexMigration]
                : []),
            );
          }
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

      await this.fieldMetadataRelatedRecordsService.createViewAndViewFields(
        createdFieldMetadatas,
        workspaceId,
      );

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      return createdFieldMetadatas;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        try {
          await queryRunner.rollbackTransaction();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.trace(`Failed to rollback transaction: ${error.message}`);
        }
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createUniqueIndexForNewField({
    createdFieldMetadataItem,
    objectMetadata,
    fieldMetadataInput,
    workspaceId,
    queryRunner,
  }: {
    createdFieldMetadataItem: FieldMetadataEntity;
    objectMetadata: ObjectMetadataItemWithFieldMaps;
    fieldMetadataInput: CreateFieldInput;
    workspaceId: string;
    queryRunner: QueryRunner;
  }) {
    if (
      isDefined(fieldMetadataInput.defaultValue) &&
      !isValidUniqueFieldDefaultValueCombination({
        defaultValue: fieldMetadataInput.defaultValue,
        isUnique: fieldMetadataInput.isUnique ?? false,
        type: fieldMetadataInput.type,
      })
    )
      throw new FieldMetadataException(
        'Unique field cannot have a default value',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        {
          userFriendlyMessage: t`Unique field cannot have a default value`,
        },
      );

    if (fieldMetadataInput.isUnique !== true) return;

    validateCanCreateUniqueIndex(createdFieldMetadataItem);

    await this.indexMetadataService.createIndexMetadata({
      workspaceId,
      objectMetadata:
        getObjectMetadataEntityFromObjectMetadataItemWithFieldsMap(
          objectMetadata,
        ),
      fieldMetadataToIndex: [createdFieldMetadataItem],
      isUnique: true,
      isCustom: true,
      indexWhereClause: computeUniqueIndexWhereClause(createdFieldMetadataItem),
      queryRunner,
    });

    return this.indexMetadataService.computeIndexCreationMigration({
      objectMetadata:
        getObjectMetadataEntityFromObjectMetadataItemWithFieldsMap(
          objectMetadata,
        ),
      fieldMetadataToIndex: [createdFieldMetadataItem],
      isUnique: true,
      indexWhereClause: computeUniqueIndexWhereClause(createdFieldMetadataItem),
    });
  }

  private async createUniqueIndexMetadataAndCreateMigrationActions({
    fieldMetadataItem,
    objectMetadataItemWithFieldMaps,
    fieldMetadataInput,
    queryRunner,
  }: {
    fieldMetadataItem: FieldMetadataEntity;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    fieldMetadataInput: UpdateFieldInput;
    queryRunner: QueryRunner;
  }) {
    validateCanCreateUniqueIndex(fieldMetadataItem);

    await this.indexMetadataService.createIndexMetadata({
      workspaceId: fieldMetadataInput.workspaceId,
      objectMetadata:
        getObjectMetadataEntityFromObjectMetadataItemWithFieldsMap(
          objectMetadataItemWithFieldMaps,
        ),
      fieldMetadataToIndex: [fieldMetadataItem],
      isUnique: true,
      isCustom: true,
      indexWhereClause: computeUniqueIndexWhereClause(fieldMetadataItem),
      queryRunner,
    });

    return this.indexMetadataService.computeIndexCreationMigration({
      objectMetadata:
        getObjectMetadataEntityFromObjectMetadataItemWithFieldsMap(
          objectMetadataItemWithFieldMaps,
        ),
      fieldMetadataToIndex: [fieldMetadataItem],
      isUnique: true,
      indexWhereClause: computeUniqueIndexWhereClause(fieldMetadataItem),
    });
  }

  private async updateUniqueIndexMetdataAndCreateMigrationActions({
    fieldMetadataInput,
    objectMetadataItemWithFieldMaps,
    updatedFieldMetadata,
    queryRunner,
  }: {
    fieldMetadataInput: UpdateFieldInput;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    updatedFieldMetadata: FieldMetadataEntity;
    queryRunner: QueryRunner;
  }) {
    const recomputedIndexPayload =
      await this.indexMetadataService.recomputeUniqueCustomIndexMetadataForField(
        {
          workspaceId: fieldMetadataInput.workspaceId,
          objectMetadata:
            getObjectMetadataEntityFromObjectMetadataItemWithFieldsMap(
              objectMetadataItemWithFieldMaps,
            ),
          updatedFieldMetadata: updatedFieldMetadata,
          queryRunner,
        },
      );

    if (!isDefined(recomputedIndexPayload)) {
      throw new FieldMetadataException(
        'Unique index not found for unique field',
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const { updatedIndex, previousName } = recomputedIndexPayload;

    return this.indexMetadataService.createIndexRecomputeMigrationActions(
      objectMetadataItemWithFieldMaps,
      {
        indexMetadata: updatedIndex,
        previousName,
        newName: updatedIndex.name,
      },
    );
  }

  private async deleteUniqueIndexMetadataAndCreateMigrationActions({
    fieldMetadataInput,
    objectMetadataItemWithFieldMaps,
    updatedFieldMetadata,
    queryRunner,
  }: {
    fieldMetadataInput: UpdateFieldInput;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    updatedFieldMetadata: FieldMetadataEntity;
    queryRunner: QueryRunner;
  }) {
    await this.indexMetadataService.deleteIndexMetadata({
      workspaceId: fieldMetadataInput.workspaceId,
      objectMetadata:
        getObjectMetadataEntityFromObjectMetadataItemWithFieldsMap(
          objectMetadataItemWithFieldMaps,
        ),
      fieldMetadataToIndex: [updatedFieldMetadata],
      queryRunner,
    });

    return this.indexMetadataService.computeIndexDeletionMigration({
      objectMetadata:
        getObjectMetadataEntityFromObjectMetadataItemWithFieldsMap(
          objectMetadataItemWithFieldMaps,
        ),
      fieldMetadataToIndex: [updatedFieldMetadata],
      isUnique: fieldMetadataInput.isUnique ?? false,
    });
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
      validateNameAndLabelAreSyncOrThrow({
        label: fieldMetadataInput.label,
        name: fieldMetadataInput.name,
      });
    }

    const fieldMetadataForCreate =
      prepareCustomFieldMetadataForCreation(fieldMetadataInput);

    await this.fieldMetadataValidationService.validateFieldMetadata({
      fieldMetadataType: fieldMetadataForCreate.type,
      fieldMetadataInput: fieldMetadataForCreate,
      objectMetadata,
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
        this.fieldMetadataRelationService.computeCustomRelationFieldMetadataForCreation(
          {
            fieldMetadataInput: fieldMetadataForCreate,
            relationCreationPayload: fieldMetadataInput.relationCreationPayload,
            joinColumnName: computeRelationFieldJoinColumnName({
              name: fieldMetadataForCreate.name,
            }),
          },
        );

      await this.fieldMetadataRelationService.validateFieldMetadataRelationSpecifics(
        {
          fieldMetadataInput: relationFieldMetadataForCreate,
          fieldMetadataType: fieldMetadataForCreate.type,
          objectMetadataMaps,
          objectMetadata,
        },
      );

      return await this.fieldMetadataRelationService.createRelationFieldMetadataItems(
        {
          fieldMetadataInput: relationFieldMetadataForCreate,
          objectMetadata,
          fieldMetadataRepository,
        },
      );
    }

    return await this.fieldMetadataMorphRelationService.createMorphRelationFieldMetadataItems(
      {
        fieldMetadataForCreate,
        morphRelationsCreationPayload:
          fieldMetadataInput.morphRelationsCreationPayload,
        objectMetadata,
        fieldMetadataRepository,
        objectMetadataMaps,
      },
    );
  }

  private async getMorphRelationsWithSameName({
    fieldMetadataName,
    objectMetadataId,
    workspaceId,
    fieldMetadataRepository,
  }: {
    fieldMetadataName: string;
    objectMetadataId: string;
    workspaceId: string;
    fieldMetadataRepository: Repository<FieldMetadataEntity>;
  }): Promise<
    FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >[]
  > {
    const fieldMetadatas = await fieldMetadataRepository.find({
      where: {
        name: fieldMetadataName,
        objectMetadataId,
        workspaceId,
      },
      relations: [
        'object',
        'relationTargetFieldMetadata',
        'relationTargetObjectMetadata',
      ],
    });

    if (!areFieldMetadatasTypeRelationOrMorphRelation(fieldMetadatas)) {
      throw new FieldMetadataException(
        'At least one field metadata is not a relation or morph relation',
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    return fieldMetadatas;
  }

  private async generateDeleteRelationMigration({
    fieldMetadata,
    workspaceId,
    queryRunner,
  }: GenerateMigrationArgs) {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY) {
      await this.generateDeleteOneToManyRelationMigration({
        fieldMetadata,
        workspaceId,
        queryRunner,
      });
    } else {
      await this.generateDeleteManyToOneRelationMigration({
        fieldMetadata,
        workspaceId,
        queryRunner,
      });
    }
  }

  private async generateDeleteManyToOneRelationMigration({
    fieldMetadata,
    workspaceId,
    queryRunner,
  }: GenerateMigrationArgs) {
    if (fieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE) {
      throw new FieldMetadataException(
        'Field metadata is not a many to one relation',
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

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
              columnName: `${fieldMetadata.settings?.joinColumnName}`,
            } satisfies WorkspaceMigrationColumnDrop,
          ],
        } satisfies WorkspaceMigrationTableAction,
      ],
      queryRunner,
    );
  }

  private async generateDeleteOneToManyRelationMigration({
    fieldMetadata,
    workspaceId,
    queryRunner,
  }: GenerateMigrationArgs) {
    if (fieldMetadata.settings?.relationType !== RelationType.ONE_TO_MANY) {
      throw new FieldMetadataException(
        'Field metadata is not a one to many relation',
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`delete-${fieldMetadata.name}`),
      workspaceId,
      [
        {
          name: computeObjectTargetTable(
            fieldMetadata.relationTargetObjectMetadata as ObjectMetadataEntity,
          ),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.DROP,
              columnName: `${(fieldMetadata.relationTargetFieldMetadata as FieldMetadataEntity<FieldMetadataType.RELATION>).settings?.joinColumnName}`,
            } satisfies WorkspaceMigrationColumnDrop,
          ],
        } satisfies WorkspaceMigrationTableAction,
      ],
      queryRunner,
    );
  }
}
