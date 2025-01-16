import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import console from 'console';

import { Query, QueryOptions } from '@ptc-org/nestjs-query-core';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { isDefined } from 'class-validator';
import { FindManyOptions, FindOneOptions, In, Not, Repository } from 'typeorm';

import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/index-metadata.service';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { ObjectMetadataMigrationService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-migration.service';
import { ObjectMetadataRelatedRecordsService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-related-records.service';
import { ObjectMetadataRelationService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-relation.service';
import { buildDefaultFieldsForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-default-fields-for-custom-object.util';
import {
  validateNameAndLabelAreSyncOrThrow,
  validateNameSingularAndNamePluralAreDifferentOrThrow,
  validateObjectMetadataInputOrThrow,
} from 'src/engine/metadata-modules/object-metadata/utils/validate-object-metadata-input.util';
import { RemoteTableRelationsService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/remote-table-relations.service';
import { SearchService } from 'src/engine/metadata-modules/search/search.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import { CUSTOM_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { isSearchableFieldType } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-searchable-field.util';

import { ObjectMetadataEntity } from './object-metadata.entity';

import { CreateObjectInput } from './dtos/create-object.input';

@Injectable()
export class ObjectMetadataService extends TypeOrmQueryService<ObjectMetadataEntity> {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,

    private readonly remoteTableRelationsService: RemoteTableRelationsService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly searchService: SearchService,
    private readonly objectMetadataRelationService: ObjectMetadataRelationService,
    private readonly objectMetadataMigrationService: ObjectMetadataMigrationService,
    private readonly objectMetadataRelatedRecordsService: ObjectMetadataRelatedRecordsService,
    private readonly indexMetadataService: IndexMetadataService,
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

    console.log(`metadata query time: ${end - start} ms`);

    return result;
  }

  override async createOne(
    objectMetadataInput: CreateObjectInput,
  ): Promise<ObjectMetadataEntity> {
    const lastDataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        objectMetadataInput.workspaceId,
      );

    validateObjectMetadataInputOrThrow(objectMetadataInput);

    validateNameSingularAndNamePluralAreDifferentOrThrow(
      objectMetadataInput.nameSingular,
      objectMetadataInput.namePlural,
    );

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

    await this.validatesNoOtherObjectWithSameNameExistsOrThrows({
      objectMetadataNamePlural: objectMetadataInput.namePlural,
      objectMetadataNameSingular: objectMetadataInput.nameSingular,
      workspaceId: objectMetadataInput.workspaceId,
    });

    const createdObjectMetadata = await super.createOne({
      ...objectMetadataInput,
      dataSourceId: lastDataSourceMetadata.id,
      targetTableName: 'DEPRECATED',
      isActive: true,
      isCustom: !objectMetadataInput.isRemote,
      isSystem: false,
      isRemote: objectMetadataInput.isRemote,
      fields: objectMetadataInput.isRemote
        ? []
        : buildDefaultFieldsForCustomObject(objectMetadataInput.workspaceId),
    });

    const labelIdentifierFieldMetadata = createdObjectMetadata.fields.find(
      (field) => field.standardId === CUSTOM_OBJECT_STANDARD_FIELD_IDS.name,
    );

    if (!labelIdentifierFieldMetadata) {
      throw new ObjectMetadataException(
        'Label identifier field metadata not created properly',
        ObjectMetadataExceptionCode.MISSING_CUSTOM_OBJECT_DEFAULT_LABEL_IDENTIFIER_FIELD,
      );
    }

    await this.objectMetadataRepository.update(createdObjectMetadata.id, {
      labelIdentifierFieldMetadataId: labelIdentifierFieldMetadata.id,
    });

    if (objectMetadataInput.isRemote) {
      await this.remoteTableRelationsService.createForeignKeysMetadataAndMigrations(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        objectMetadataInput.primaryKeyColumnType,
      );
    } else {
      await this.objectMetadataMigrationService.createTableMigration(
        createdObjectMetadata,
      );

      await this.objectMetadataMigrationService.createColumnsMigrations(
        createdObjectMetadata,
        createdObjectMetadata.fields,
      );

      const createdRelatedObjectMetadataCollection =
        await this.objectMetadataRelationService.createRelationsAndForeignKeysMetadata(
          objectMetadataInput.workspaceId,
          createdObjectMetadata,
          {
            primaryKeyFieldMetadataSettings:
              objectMetadataInput.primaryKeyFieldMetadataSettings,
            primaryKeyColumnType: objectMetadataInput.primaryKeyColumnType,
          },
        );

      await this.objectMetadataMigrationService.createRelationMigrations(
        createdObjectMetadata,
        createdRelatedObjectMetadataCollection,
      );

      await this.searchService.createSearchVectorFieldForObject(
        objectMetadataInput,
        createdObjectMetadata,
      );
    }

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      createdObjectMetadata.workspaceId,
    );

    await this.objectMetadataRelatedRecordsService.createObjectRelatedRecords(
      createdObjectMetadata,
    );

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      objectMetadataInput.workspaceId,
    );

    return createdObjectMetadata;
  }

  public async updateOneObject(
    input: UpdateOneObjectInput,
    workspaceId: string,
  ): Promise<ObjectMetadataEntity> {
    validateObjectMetadataInputOrThrow(input.update);

    const existingObjectMetadata = await this.objectMetadataRepository.findOne({
      where: { id: input.id, workspaceId: workspaceId },
    });

    if (!existingObjectMetadata) {
      throw new ObjectMetadataException(
        'Object does not exist',
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const existingObjectMetadataCombinedWithUpdateInput = {
      ...existingObjectMetadata,
      ...input.update,
    };

    await this.validatesNoOtherObjectWithSameNameExistsOrThrows({
      objectMetadataNameSingular:
        existingObjectMetadataCombinedWithUpdateInput.nameSingular,
      objectMetadataNamePlural:
        existingObjectMetadataCombinedWithUpdateInput.namePlural,
      workspaceId: workspaceId,
      existingObjectMetadataId:
        existingObjectMetadataCombinedWithUpdateInput.id,
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
      isDefined(input.update.nameSingular) ||
      isDefined(input.update.namePlural)
    ) {
      validateNameSingularAndNamePluralAreDifferentOrThrow(
        existingObjectMetadataCombinedWithUpdateInput.nameSingular,
        existingObjectMetadataCombinedWithUpdateInput.namePlural,
      );
    }

    const updatedObject = await super.updateOne(input.id, input.update);

    await this.handleObjectNameAndLabelUpdates(
      existingObjectMetadata,
      existingObjectMetadataCombinedWithUpdateInput,
      input,
    );

    if (input.update.isActive !== undefined) {
      await this.objectMetadataRelationService.updateObjectRelationshipsActivationStatus(
        input.id,
        input.update.isActive,
      );
    }

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );
    if (input.update.labelIdentifierFieldMetadataId) {
      const labelIdentifierFieldMetadata =
        await this.fieldMetadataRepository.findOneByOrFail({
          id: input.update.labelIdentifierFieldMetadataId,
          objectMetadataId: input.id,
          workspaceId: workspaceId,
        });

      if (isSearchableFieldType(labelIdentifierFieldMetadata.type)) {
        await this.searchService.updateSearchVector(
          input.id,
          [
            {
              name: labelIdentifierFieldMetadata.name,
              type: labelIdentifierFieldMetadata.type,
            },
          ],
          workspaceId,
        );
      }

      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        workspaceId,
      );
    }

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    return updatedObject;
  }

  public async deleteOneObject(
    input: DeleteOneObjectInput,
    workspaceId: string,
  ): Promise<ObjectMetadataEntity> {
    const objectMetadata = await this.objectMetadataRepository.findOne({
      relations: [
        'fromRelations.fromFieldMetadata',
        'fromRelations.toFieldMetadata',
        'toRelations.fromFieldMetadata',
        'toRelations.toFieldMetadata',
        'fromRelations.fromObjectMetadata',
        'fromRelations.toObjectMetadata',
        'toRelations.fromObjectMetadata',
        'toRelations.toObjectMetadata',
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
      await this.remoteTableRelationsService.deleteForeignKeysMetadataAndCreateMigrations(
        objectMetadata.workspaceId,
        objectMetadata,
      );
    } else {
      await this.objectMetadataMigrationService.deleteAllRelationsAndDropTable(
        objectMetadata,
        workspaceId,
      );
    }

    await this.objectMetadataRelatedRecordsService.deleteObjectViews(
      objectMetadata,
      workspaceId,
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    await this.objectMetadataRepository.delete(objectMetadata.id);

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    return objectMetadata;
  }

  public async findOneWithinWorkspace(
    workspaceId: string,
    options: FindOneOptions<ObjectMetadataEntity>,
  ): Promise<ObjectMetadataEntity | null> {
    return this.objectMetadataRepository.findOne({
      relations: [
        'fields',
        'fields.fromRelationMetadata',
        'fields.toRelationMetadata',
      ],
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
        'fields.fromRelationMetadata',
        'fields.toRelationMetadata',
        'fields.fromRelationMetadata.toObjectMetadata',
      ],
      ...options,
      where: {
        ...options?.where,
        workspaceId,
      },
    });
  }

  public async findMany(options?: FindManyOptions<ObjectMetadataEntity>) {
    return this.objectMetadataRepository.find({
      relations: [
        'fields',
        'fields.fromRelationMetadata',
        'fields.toRelationMetadata',
        'fields.fromRelationMetadata.toObjectMetadata',
      ],
      ...options,
      where: {
        ...options?.where,
      },
    });
  }

  public async deleteObjectsMetadata(workspaceId: string) {
    await this.objectMetadataRepository.delete({ workspaceId });
    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );
  }

  public async getObjectMetadataStandardIdToIdMap(workspaceId: string) {
    const objectMetadata = await this.findManyWithinWorkspace(workspaceId);

    const objectMetadataStandardIdToIdMap =
      objectMetadata.reduce<ObjectMetadataStandardIdToIdMap>((acc, object) => {
        acc[object.standardId ?? ''] = {
          id: object.id,
          fields: object.fields.reduce((acc, field) => {
            acc[field.standardId ?? ''] = field.id;

            return acc;
          }, {}),
        };

        return acc;
      }, {});

    return { objectMetadataStandardIdToIdMap };
  }

  private async handleObjectNameAndLabelUpdates(
    existingObjectMetadata: ObjectMetadataEntity,
    objectMetadataForUpdate: ObjectMetadataEntity,
    input: UpdateOneObjectInput,
  ) {
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
      );

      const relationsAndForeignKeysMetadata =
        await this.objectMetadataRelationService.updateRelationsAndForeignKeysMetadata(
          objectMetadataForUpdate.workspaceId,
          objectMetadataForUpdate,
        );

      await this.objectMetadataMigrationService.createUpdateForeignKeysMigrations(
        existingObjectMetadata,
        objectMetadataForUpdate,
        relationsAndForeignKeysMetadata,
        objectMetadataForUpdate.workspaceId,
      );

      await this.objectMetadataMigrationService.recomputeEnumNames(
        objectMetadataForUpdate,
        objectMetadataForUpdate.workspaceId,
      );

      const recomputedIndexes =
        await this.indexMetadataService.recomputeIndexMetadataForObject(
          objectMetadataForUpdate.workspaceId,
          objectMetadataForUpdate,
        );

      await this.indexMetadataService.createIndexRecomputeMigrations(
        objectMetadataForUpdate.workspaceId,
        objectMetadataForUpdate,
        recomputedIndexes,
      );

      if (
        (input.update.labelPlural || input.update.icon) &&
        (input.update.labelPlural !== existingObjectMetadata.labelPlural ||
          input.update.icon !== existingObjectMetadata.icon)
      ) {
        await this.objectMetadataRelatedRecordsService.updateObjectViews(
          objectMetadataForUpdate,
          objectMetadataForUpdate.workspaceId,
        );
      }
    }
  }

  private validatesNoOtherObjectWithSameNameExistsOrThrows = async ({
    objectMetadataNameSingular,
    objectMetadataNamePlural,
    workspaceId,
    existingObjectMetadataId,
  }: {
    objectMetadataNameSingular: string;
    objectMetadataNamePlural: string;
    workspaceId: string;
    existingObjectMetadataId?: string;
  }): Promise<void> => {
    const baseWhereConditions = [
      { nameSingular: objectMetadataNameSingular, workspaceId },
      { nameSingular: objectMetadataNamePlural, workspaceId },
      { namePlural: objectMetadataNameSingular, workspaceId },
      { namePlural: objectMetadataNamePlural, workspaceId },
    ];

    const whereConditions = baseWhereConditions.map((condition) => {
      return {
        ...condition,
        ...(isDefined(existingObjectMetadataId)
          ? { id: Not(In([existingObjectMetadataId])) }
          : {}),
      };
    });

    const objectAlreadyExists = await this.objectMetadataRepository.findOne({
      where: whereConditions,
    });

    if (objectAlreadyExists) {
      throw new ObjectMetadataException(
        'Object already exists',
        ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS,
      );
    }
  };
}
