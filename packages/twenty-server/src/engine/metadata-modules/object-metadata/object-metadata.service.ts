import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import console from 'console';

import { Query, QueryOptions } from '@ptc-org/nestjs-query-core';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { isDefined } from 'class-validator';
import { FindManyOptions, FindOneOptions, In, Not, Repository } from 'typeorm';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
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
import { mapUdtNameToFieldType } from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import { SearchService } from 'src/engine/metadata-modules/search/search.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
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

    this.validatesNoOtherObjectWithSameNameExistsOrThrows({
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

    if (objectMetadataInput.isRemote) {
      await this.remoteTableRelationsService.createForeignKeysMetadataAndMigrations(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        objectMetadataInput.primaryKeyColumnType,
      );
    } else {
      await this.objectMetadataMigrationService.createObjectMigration(
        createdObjectMetadata,
      );

      await this.objectMetadataMigrationService.createFieldMigrations(
        createdObjectMetadata,
        createdObjectMetadata.fields,
      );

      await this.createRelationsMetadataAndMigrations(
        objectMetadataInput,
        createdObjectMetadata,
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

    const fullObjectMetadataAfterUpdate = {
      ...existingObjectMetadata,
      ...input.update,
    };

    await this.validatesNoOtherObjectWithSameNameExistsOrThrows({
      objectMetadataNameSingular: fullObjectMetadataAfterUpdate.nameSingular,
      objectMetadataNamePlural: fullObjectMetadataAfterUpdate.namePlural,
      workspaceId: workspaceId,
      existingObjectMetadataId: fullObjectMetadataAfterUpdate.id,
    });

    if (fullObjectMetadataAfterUpdate.isLabelSyncedWithName) {
      validateNameAndLabelAreSyncOrThrow(
        fullObjectMetadataAfterUpdate.labelSingular,
        fullObjectMetadataAfterUpdate.nameSingular,
      );
      validateNameAndLabelAreSyncOrThrow(
        fullObjectMetadataAfterUpdate.labelPlural,
        fullObjectMetadataAfterUpdate.namePlural,
      );
    }

    if (
      isDefined(input.update.nameSingular) ||
      isDefined(input.update.namePlural)
    ) {
      validateNameSingularAndNamePluralAreDifferentOrThrow(
        fullObjectMetadataAfterUpdate.nameSingular,
        fullObjectMetadataAfterUpdate.namePlural,
      );
    }

    const updatedObject = await super.updateOne(input.id, input.update);

    await this.handleObjectNameAndLabelUpdates(
      existingObjectMetadata,
      fullObjectMetadataAfterUpdate,
      input,
    );

    if (input.update.isActive !== undefined) {
      await this.objectMetadataRelationService.updateObjectRelationships(
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

  private async createRelationsMetadataAndMigrations(
    objectMetadataInput: CreateObjectInput,
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    const relatedObjectTypes = [
      'timelineActivity',
      'favorite',
      'attachment',
      'noteTarget',
      'taskTarget',
    ];

    const createdRelatedObjectMetadata = await Promise.all(
      relatedObjectTypes.map(async (relationType) =>
        this.objectMetadataRelationService.createMetadata(
          objectMetadataInput.workspaceId,
          createdObjectMetadata,
          mapUdtNameToFieldType(
            objectMetadataInput.primaryKeyColumnType ?? 'uuid',
          ),
          objectMetadataInput.primaryKeyFieldMetadataSettings,
          relationType,
        ),
      ),
    );

    await this.objectMetadataMigrationService.createRelationMigrations(
      createdObjectMetadata,
      createdRelatedObjectMetadata,
    );
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

    if (!(newTargetTableName === existingTargetTableName)) {
      await this.objectMetadataMigrationService.createRenameTableMigration(
        existingObjectMetadata,
        objectMetadataForUpdate,
        objectMetadataForUpdate.workspaceId,
      );

      await this.objectMetadataMigrationService.createRelationsUpdatesMigrations(
        existingObjectMetadata,
        objectMetadataForUpdate,
        objectMetadataForUpdate.workspaceId,
      );
    }

    if (input.update.labelPlural || input.update.icon) {
      if (
        !(input.update.labelPlural === existingObjectMetadata.labelPlural) ||
        !(input.update.icon === existingObjectMetadata.icon)
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
