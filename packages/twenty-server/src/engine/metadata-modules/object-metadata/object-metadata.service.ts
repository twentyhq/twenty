import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { i18n } from '@lingui/core';
import { Query, QueryOptions } from '@ptc-org/nestjs-query-core';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { APP_LOCALES } from 'twenty-shared/translations';
import { capitalize, isDefined } from 'twenty-shared/utils';
import {
  FindManyOptions,
  FindOneOptions,
  In,
  QueryRunner,
  Repository,
} from 'typeorm';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/index-metadata.service';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import {
  UpdateObjectPayload,
  UpdateOneObjectInput,
} from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { ObjectMetadataFieldRelationService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-field-relation.service';
import { ObjectMetadataMigrationService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-migration.service';
import { ObjectMetadataRelatedRecordsService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-related-records.service';
import { buildDefaultFieldsForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-fields-for-custom-object.util';
import {
  validateLowerCasedAndTrimmedStringsAreDifferentOrThrow,
  validateObjectMetadataInputLabelsOrThrow,
  validateObjectMetadataInputNamesOrThrow,
} from 'src/engine/metadata-modules/object-metadata/utils/validate-object-metadata-input.util';
import { SearchVectorService } from 'src/engine/metadata-modules/search-vector/search-vector.service';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { validateMetadataIdentifierFieldMetadataIds } from 'src/engine/metadata-modules/utils/validate-metadata-identifier-field-metadata-id.utils';
import { validateNameAndLabelAreSyncOrThrow } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { validatesNoOtherObjectWithSameNameExistsOrThrows } from 'src/engine/metadata-modules/utils/validate-no-other-object-with-same-name-exists-or-throw.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { CUSTOM_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { isSearchableFieldType } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-searchable-field.util';

import { ObjectMetadataEntity } from './object-metadata.entity';

import { CreateObjectInput } from './dtos/create-object.input';

@Injectable()
export class ObjectMetadataService extends TypeOrmQueryService<ObjectMetadataEntity> {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    private readonly dataSourceService: DataSourceService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly searchVectorService: SearchVectorService,
    private readonly objectMetadataFieldRelationService: ObjectMetadataFieldRelationService,
    private readonly objectMetadataMigrationService: ObjectMetadataMigrationService,
    private readonly objectMetadataRelatedRecordsService: ObjectMetadataRelatedRecordsService,
    private readonly indexMetadataService: IndexMetadataService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    super(objectMetadataRepository);
  }

  override async query(
    query: Query<ObjectMetadataEntity>,
    opts?: QueryOptions<ObjectMetadataEntity> | undefined,
  ): Promise<ObjectMetadataEntity[]> {
    const start = performance.now();

    const result = super.query(query, opts);

    const end = performance.now();

    // eslint-disable-next-line no-console
    console.log(`metadata query time: ${end - start} ms`);

    return result;
  }

  override async createOne(
    objectMetadataInput: CreateObjectInput,
  ): Promise<ObjectMetadataEntity> {
    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();
    const queryRunner = mainDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const objectMetadataRepository =
        queryRunner.manager.getRepository(ObjectMetadataEntity);

      const { objectMetadataMaps } =
        await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
          {
            workspaceId: objectMetadataInput.workspaceId,
          },
        );

      const lastDataSourceMetadata =
        await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
          objectMetadataInput.workspaceId,
        );

      objectMetadataInput.labelSingular = capitalize(
        objectMetadataInput.labelSingular,
      );
      objectMetadataInput.labelPlural = capitalize(
        objectMetadataInput.labelPlural,
      );

      validateObjectMetadataInputNamesOrThrow(objectMetadataInput);
      validateObjectMetadataInputLabelsOrThrow(objectMetadataInput);

      validateLowerCasedAndTrimmedStringsAreDifferentOrThrow({
        inputs: [
          objectMetadataInput.nameSingular,
          objectMetadataInput.namePlural,
        ],
        message:
          'The singular and plural names cannot be the same for an object',
      });
      validateLowerCasedAndTrimmedStringsAreDifferentOrThrow({
        inputs: [
          objectMetadataInput.labelPlural,
          objectMetadataInput.labelSingular,
        ],
        message:
          'The singular and plural labels cannot be the same for an object',
      });

      if (objectMetadataInput.isLabelSyncedWithName === true) {
        validateNameAndLabelAreSyncOrThrow(
          objectMetadataInput.labelSingular,
          objectMetadataInput.nameSingular,
        );
        validateNameAndLabelAreSyncOrThrow(
          objectMetadataInput.labelPlural,
          objectMetadataInput.namePlural,
        );
      }

      validatesNoOtherObjectWithSameNameExistsOrThrows({
        objectMetadataNamePlural: objectMetadataInput.namePlural,
        objectMetadataNameSingular: objectMetadataInput.nameSingular,
        objectMetadataMaps,
      });

      const baseCustomFields = buildDefaultFieldsForCustomObject(
        objectMetadataInput.workspaceId,
      );

      const labelIdentifierFieldMetadataId = baseCustomFields.find(
        (field) => field.standardId === CUSTOM_OBJECT_STANDARD_FIELD_IDS.name,
      )?.id;

      if (!labelIdentifierFieldMetadataId) {
        throw new ObjectMetadataException(
          'Label identifier field metadata not created properly',
          ObjectMetadataExceptionCode.MISSING_CUSTOM_OBJECT_DEFAULT_LABEL_IDENTIFIER_FIELD,
        );
      }

      const createdObjectMetadata = await objectMetadataRepository.save({
        ...objectMetadataInput,
        dataSourceId: lastDataSourceMetadata.id,
        targetTableName: 'DEPRECATED',
        isActive: true,
        isCustom: !objectMetadataInput.isRemote,
        isSystem: false,
        isRemote: objectMetadataInput.isRemote,
        isSearchable: !objectMetadataInput.isRemote,
        fields: objectMetadataInput.isRemote ? [] : baseCustomFields,
        labelIdentifierFieldMetadataId,
      });

      if (objectMetadataInput.isRemote) {
        throw new Error('Remote objects are not supported yet');
      } else {
        const createdRelatedObjectMetadataCollection =
          await this.objectMetadataFieldRelationService.createRelationsAndForeignKeysMetadata(
            objectMetadataInput.workspaceId,
            createdObjectMetadata,
            objectMetadataMaps,
            queryRunner,
          );

        await this.objectMetadataMigrationService.createTableMigration(
          createdObjectMetadata,
          queryRunner,
        );

        await this.objectMetadataMigrationService.createColumnsMigrations(
          createdObjectMetadata,
          createdObjectMetadata.fields,
          queryRunner,
        );

        await this.objectMetadataMigrationService.createRelationMigrations(
          createdObjectMetadata,
          createdRelatedObjectMetadataCollection,
          queryRunner,
        );

        await this.searchVectorService.createSearchVectorFieldForObject(
          objectMetadataInput,
          createdObjectMetadata,
          queryRunner,
        );
      }

      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrationsWithinTransaction(
        createdObjectMetadata.workspaceId,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      // After commit, do non-transactional work
      await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache(
        {
          workspaceId: objectMetadataInput.workspaceId,
        },
      );
      await this.objectMetadataRelatedRecordsService.createObjectRelatedRecords(
        createdObjectMetadata,
      );

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        objectMetadataInput.workspaceId,
      );

      return createdObjectMetadata;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async updateOneObject(
    input: UpdateOneObjectInput,
    workspaceId: string,
  ): Promise<ObjectMetadataEntity> {
    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();
    const queryRunner = mainDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const objectMetadataRepository =
        queryRunner.manager.getRepository(ObjectMetadataEntity);

      const { objectMetadataMaps } =
        await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
          { workspaceId },
        );
      const inputId = input.id;
      const inputPayload = {
        ...input.update,
        ...(isDefined(input.update.labelSingular)
          ? { labelSingular: capitalize(input.update.labelSingular) }
          : {}),
        ...(isDefined(input.update.labelPlural)
          ? { labelPlural: capitalize(input.update.labelPlural) }
          : {}),
      };

      validateObjectMetadataInputNamesOrThrow(inputPayload);
      const existingObjectMetadata = objectMetadataMaps.byId[inputId];

      if (!existingObjectMetadata) {
        throw new ObjectMetadataException(
          'Object does not exist',
          ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }
      const existingObjectMetadataCombinedWithUpdateInput = {
        ...existingObjectMetadata,
        ...inputPayload,
      };

      validatesNoOtherObjectWithSameNameExistsOrThrows({
        objectMetadataNameSingular:
          existingObjectMetadataCombinedWithUpdateInput.nameSingular,
        objectMetadataNamePlural:
          existingObjectMetadataCombinedWithUpdateInput.namePlural,
        existingObjectMetadataId:
          existingObjectMetadataCombinedWithUpdateInput.id,
        objectMetadataMaps,
      });
      if (existingObjectMetadataCombinedWithUpdateInput.isLabelSyncedWithName) {
        validateNameAndLabelAreSyncOrThrow(
          existingObjectMetadataCombinedWithUpdateInput.labelSingular,
          existingObjectMetadataCombinedWithUpdateInput.nameSingular,
        );
        validateNameAndLabelAreSyncOrThrow(
          existingObjectMetadataCombinedWithUpdateInput.labelPlural,
          existingObjectMetadataCombinedWithUpdateInput.namePlural,
        );
      }
      if (
        isDefined(inputPayload.nameSingular) ||
        isDefined(inputPayload.namePlural)
      ) {
        validateLowerCasedAndTrimmedStringsAreDifferentOrThrow({
          inputs: [
            existingObjectMetadataCombinedWithUpdateInput.nameSingular,
            existingObjectMetadataCombinedWithUpdateInput.namePlural,
          ],
          message:
            'The singular and plural names cannot be the same for an object',
        });
      }
      validateMetadataIdentifierFieldMetadataIds({
        fieldMetadataItems: Object.values(existingObjectMetadata.fieldsById),
        labelIdentifierFieldMetadataId:
          inputPayload.labelIdentifierFieldMetadataId,
        imageIdentifierFieldMetadataId:
          inputPayload.imageIdentifierFieldMetadataId,
      });
      const updatedObject = await objectMetadataRepository.save({
        ...existingObjectMetadata,
        ...inputPayload,
      });

      const { didUpdateLabelOrIcon } =
        await this.handleObjectNameAndLabelUpdates(
          existingObjectMetadata,
          existingObjectMetadataCombinedWithUpdateInput,
          inputPayload,
          queryRunner,
        );

      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrationsWithinTransaction(
        workspaceId,
        queryRunner,
      );
      if (inputPayload.labelIdentifierFieldMetadataId) {
        const labelIdentifierFieldMetadata =
          existingObjectMetadata.fieldsById[
            inputPayload.labelIdentifierFieldMetadataId
          ];

        if (isSearchableFieldType(labelIdentifierFieldMetadata.type)) {
          await this.searchVectorService.updateSearchVector(
            inputId,
            [
              {
                name: labelIdentifierFieldMetadata.name,
                type: labelIdentifierFieldMetadata.type,
              },
            ],
            workspaceId,
            queryRunner,
          );
        }
        await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrationsWithinTransaction(
          workspaceId,
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();

      // After commit, do non-transactional work
      await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache(
        {
          workspaceId,
        },
      );

      if (didUpdateLabelOrIcon) {
        await this.objectMetadataRelatedRecordsService.updateObjectViews(
          updatedObject,
          workspaceId,
        );
      }

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      const formattedUpdatedObject = {
        ...updatedObject,
        createdAt: new Date(updatedObject.createdAt),
      };

      return formattedUpdatedObject;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  public async deleteOneObject(
    input: DeleteOneObjectInput,
    workspaceId: string,
  ): Promise<Partial<ObjectMetadataEntity>> {
    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();
    const queryRunner = mainDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const objectMetadataRepository =
        queryRunner.manager.getRepository(ObjectMetadataEntity);
      const fieldMetadataRepository =
        queryRunner.manager.getRepository(FieldMetadataEntity);

      const objectMetadata = await objectMetadataRepository.findOne({
        relations: [
          'fields',
          'fields.object',
          'fields.relationTargetFieldMetadata',
          'fields.relationTargetFieldMetadata.object',
        ],
        where: {
          id: input.id,
          workspaceId,
        },
      });

      if (!objectMetadata) {
        throw new ObjectMetadataException(
          'Object does not exist',
          ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      if (objectMetadata.isRemote) {
        throw new ObjectMetadataException(
          'Remote objects are not supported yet',
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        );
      } else {
        await this.objectMetadataMigrationService.deleteAllRelationsAndDropTable(
          objectMetadata,
          workspaceId,
          queryRunner,
        );
      }

      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrationsWithinTransaction(
        workspaceId,
        queryRunner,
      );

      const fieldMetadataIds = objectMetadata.fields.map((field) => field.id);
      const relationMetadataIds = objectMetadata.fields
        .map((field) => field.relationTargetFieldMetadata?.id)
        .filter(isDefined);

      await fieldMetadataRepository.delete({
        id: In(fieldMetadataIds.concat(relationMetadataIds)),
      });

      await objectMetadataRepository.delete(objectMetadata.id);

      await queryRunner.commitTransaction();

      // After commit, do non-transactional work
      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );

      await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache(
        {
          workspaceId,
        },
      );

      await this.objectMetadataRelatedRecordsService.deleteObjectViews(
        objectMetadata,
        workspaceId,
      );

      return objectMetadata;
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
    options: FindOneOptions<ObjectMetadataEntity>,
  ): Promise<ObjectMetadataEntity | null> {
    return this.objectMetadataRepository.findOne({
      relations: ['fields'],
      ...options,
      where: {
        ...options.where,
        workspaceId,
      },
    });
  }

  public async findManyWithinWorkspace(
    workspaceId: string,
    options?: FindManyOptions<ObjectMetadataEntity>,
  ) {
    return this.objectMetadataRepository.find({
      relations: [
        'fields.object',
        'fields',
        'fields.relationTargetObjectMetadata',
      ],
      ...options,
      where: {
        ...options?.where,
        workspaceId,
      },
      order: {
        ...options?.order,
      },
    });
  }

  public async deleteObjectsMetadata(workspaceId: string) {
    await this.objectMetadataRepository.delete({ workspaceId });
  }

  private async handleObjectNameAndLabelUpdates(
    existingObjectMetadata: Pick<
      ObjectMetadataItemWithFieldMaps,
      'nameSingular' | 'isCustom' | 'id' | 'labelPlural' | 'icon' | 'fieldsById'
    >,
    objectMetadataForUpdate: Pick<
      ObjectMetadataItemWithFieldMaps,
      | 'nameSingular'
      | 'isCustom'
      | 'workspaceId'
      | 'id'
      | 'labelSingular'
      | 'labelPlural'
      | 'icon'
      | 'fieldsById'
    >,
    inputPayload: UpdateObjectPayload,
    queryRunner: QueryRunner,
  ): Promise<{ didUpdateLabelOrIcon: boolean }> {
    const newTargetTableName = computeObjectTargetTable(
      objectMetadataForUpdate,
    );
    const existingTargetTableName = computeObjectTargetTable(
      existingObjectMetadata,
    );

    if (newTargetTableName !== existingTargetTableName) {
      await this.objectMetadataMigrationService.createRenameTableMigration(
        existingObjectMetadata,
        objectMetadataForUpdate,
        objectMetadataForUpdate.workspaceId,
        queryRunner,
      );

      const relationMetadataCollection =
        await this.objectMetadataFieldRelationService.updateRelationsAndForeignKeysMetadata(
          objectMetadataForUpdate.workspaceId,
          objectMetadataForUpdate,
          queryRunner,
        );

      await this.objectMetadataMigrationService.updateRelationMigrations(
        existingObjectMetadata,
        objectMetadataForUpdate,
        relationMetadataCollection,
        objectMetadataForUpdate.workspaceId,
        queryRunner,
      );

      await this.objectMetadataMigrationService.recomputeEnumNames(
        objectMetadataForUpdate,
        objectMetadataForUpdate.workspaceId,
        queryRunner,
      );

      const recomputedIndexes =
        await this.indexMetadataService.recomputeIndexMetadataForObject(
          objectMetadataForUpdate.workspaceId,
          objectMetadataForUpdate,
          queryRunner,
        );

      await this.indexMetadataService.createIndexRecomputeMigrations(
        objectMetadataForUpdate.workspaceId,
        objectMetadataForUpdate,
        recomputedIndexes,
        queryRunner,
      );

      if (
        (inputPayload.labelPlural || inputPayload.icon) &&
        (inputPayload.labelPlural !== existingObjectMetadata.labelPlural ||
          inputPayload.icon !== existingObjectMetadata.icon)
      ) {
        return {
          didUpdateLabelOrIcon: true,
        };
      }
    }

    return {
      didUpdateLabelOrIcon: false,
    };
  }

  async resolveOverridableString(
    objectMetadata: ObjectMetadataDTO,
    labelKey: 'labelPlural' | 'labelSingular' | 'description' | 'icon',
    locale: keyof typeof APP_LOCALES | undefined,
  ): Promise<string> {
    if (objectMetadata.isCustom) {
      return objectMetadata[labelKey];
    }

    const translationValue =
      // @ts-expect-error legacy noImplicitAny
      objectMetadata.standardOverrides?.translations?.[locale]?.[labelKey];

    if (isDefined(translationValue)) {
      return translationValue;
    }

    const messageId = generateMessageId(objectMetadata[labelKey] ?? '');
    const translatedMessage = i18n._(messageId);

    if (translatedMessage === messageId) {
      return objectMetadata[labelKey] ?? '';
    }

    return translatedMessage;
  }
}
