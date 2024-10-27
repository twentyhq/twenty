import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import console from 'console';

import { Query, QueryOptions } from '@ptc-org/nestjs-query-core';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { isDefined } from 'class-validator';
import { FindManyOptions, FindOneOptions, In, Not, Repository } from 'typeorm';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { ObjectMetadataMigrationService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-migration.service';
import { ObjectMetadataRelatedRecordsService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-related-records.service';
import { ObjectMetadataRelationService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-relation.service';
import { buildMigrationsForCustomObjectRelations } from 'src/engine/metadata-modules/object-metadata/utils/build-migrations-for-custom-object-relations.util';
import { validateObjectMetadataInputOrThrow } from 'src/engine/metadata-modules/object-metadata/utils/validate-object-metadata-input.util';
import { validateNameAndLabelAreSyncOrThrow } from 'src/engine/metadata-modules/object-metadata/utils/validate-object-metadata-sync-label-name.util';
import { RemoteTableRelationsService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/remote-table-relations.service';
import { mapUdtNameToFieldType } from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import { SearchService } from 'src/engine/metadata-modules/search/search.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
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
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly searchService: SearchService,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
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

    // DELETE RELATIONS
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

    // DELETE VIEWS
    await this.objectMetadataRelatedRecordsService.deleteObjectViews(
      objectMetadata,
      workspaceId,
    );

    // DELETE OBJECT
    await this.objectMetadataRepository.delete(objectMetadata.id);

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    return objectMetadata;
  }

  override async createOne(
    objectMetadataInput: CreateObjectInput,
  ): Promise<ObjectMetadataEntity> {
    const lastDataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        objectMetadataInput.workspaceId,
      );

    validateObjectMetadataInputOrThrow(objectMetadataInput);

    if (
      objectMetadataInput.nameSingular.toLowerCase() ===
      objectMetadataInput.namePlural.toLowerCase()
    ) {
      throw new ObjectMetadataException(
        'The singular and plural name cannot be the same for an object',
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    }

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
      fields: !objectMetadataInput.isRemote
        ? // Creating default fields.
          [
            {
              standardId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
              type: FieldMetadataType.UUID,
              name: 'id',
              label: 'Id',
              icon: 'Icon123',
              description: 'Id',
              isNullable: false,
              isActive: true,
              isCustom: false,
              isSystem: true,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: 'uuid',
            },
            {
              standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.name,
              type: FieldMetadataType.TEXT,
              name: 'name',
              label: 'Name',
              icon: 'IconAbc',
              description: 'Name',
              isNullable: false,
              isActive: true,
              isCustom: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: "'Untitled'",
            },
            {
              standardId: BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
              type: FieldMetadataType.DATE_TIME,
              name: 'createdAt',
              label: 'Creation date',
              icon: 'IconCalendar',
              description: 'Creation date',
              isNullable: false,
              isActive: true,
              isCustom: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: 'now',
            },
            {
              standardId: BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
              type: FieldMetadataType.DATE_TIME,
              name: 'updatedAt',
              label: 'Last update',
              icon: 'IconCalendarClock',
              description: 'Last time the record was changed',
              isNullable: false,
              isActive: true,
              isCustom: false,
              isSystem: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: 'now',
            },
            {
              standardId: BASE_OBJECT_STANDARD_FIELD_IDS.deletedAt,
              type: FieldMetadataType.DATE_TIME,
              name: 'deletedAt',
              label: 'Deleted at',
              icon: 'IconCalendarClock',
              description: 'Deletion date',
              isNullable: true,
              isActive: true,
              isCustom: false,
              isSystem: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: null,
            },
            {
              standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.createdBy,
              type: FieldMetadataType.ACTOR,
              name: 'createdBy',
              label: 'Created by',
              icon: 'IconCreativeCommonsSa',
              description: 'The creator of the record',
              isNullable: false,
              isActive: true,
              isCustom: false,
              isSystem: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: { name: "''", source: "'MANUAL'" },
            },
            {
              standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.position,
              type: FieldMetadataType.POSITION,
              name: 'position',
              label: 'Position',
              icon: 'IconHierarchy2',
              description: 'Position',
              isNullable: true,
              isActive: true,
              isCustom: false,
              isSystem: true,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: null,
            },
          ]
        : // No fields for remote objects.
          [],
    });

    if (objectMetadataInput.isRemote) {
      await this.remoteTableRelationsService.createForeignKeysMetadataAndMigrations(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        objectMetadataInput.primaryKeyColumnType,
      );
    } else {
      await this.createObjectMigration(createdObjectMetadata);

      await this.createObjectRelationsMetadataAndMigrations(
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
      this.validateNameSingularAndNamePluralAreDifferentOrThrow(
        fullObjectMetadataAfterUpdate,
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

  private async createObjectMigration(
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-${createdObjectMetadata.nameSingular}`),
      createdObjectMetadata.workspaceId,
      [
        {
          name: computeObjectTargetTable(createdObjectMetadata),
          action: WorkspaceMigrationTableActionType.CREATE,
        } satisfies WorkspaceMigrationTableAction,
      ],
    );
  }

  private async createObjectRelationsMetadataAndMigrations(
    objectMetadataInput: CreateObjectInput,
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    const timelineActivityObjectMetadata =
      await this.objectMetadataRelationService.createMetadata(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        'timelineActivity',
      );

    const activityTargetObjectMetadata =
      await this.objectMetadataRelationService.createMetadata(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        'activityTarget',
      );

    const favoriteObjectMetadata =
      await this.objectMetadataRelationService.createMetadata(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        'favorite',
      );

    const attachmentObjectMetadata =
      await this.objectMetadataRelationService.createMetadata(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        'attachment',
      );

    const noteTargetObjectMetadata =
      await this.objectMetadataRelationService.createMetadata(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        'noteTarget',
      );

    const taskTargetObjectMetadata =
      await this.objectMetadataRelationService.createMetadata(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        'taskTarget',
      );

    // CREATE FIELD MIGRATIONS

    for (const fieldMetadata of createdObjectMetadata.fields) {
      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(`create-${fieldMetadata.name}`),
        createdObjectMetadata.workspaceId,
        [
          {
            name: computeObjectTargetTable(createdObjectMetadata),
            action: WorkspaceMigrationTableActionType.ALTER,
            columns: this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.CREATE,
              fieldMetadata,
            ),
          },
        ] satisfies WorkspaceMigrationTableAction[],
      );
    }

    // CREATE RELATIONS MIGRATIONS

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `create-${createdObjectMetadata.nameSingular}-relations`,
      ),
      createdObjectMetadata.workspaceId,
      buildMigrationsForCustomObjectRelations(
        createdObjectMetadata,
        activityTargetObjectMetadata,
        attachmentObjectMetadata,
        timelineActivityObjectMetadata,
        favoriteObjectMetadata,
        noteTargetObjectMetadata,
        taskTargetObjectMetadata,
      ),
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
      );

      await this.objectMetadataMigrationService.createRelationsUpdatesMigrations(
        existingObjectMetadata,
        objectMetadataForUpdate,
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

  private validateNameSingularAndNamePluralAreDifferentOrThrow = (
    fullObjectMetadataAfterUpdate: ObjectMetadataEntity,
  ) => {
    if (
      fullObjectMetadataAfterUpdate.nameSingular ===
      fullObjectMetadataAfterUpdate.namePlural
    ) {
      throw new ObjectMetadataException(
        'The singular and plural name cannot be the same for an object',
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    }
  };
}
