import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import console from 'console';

import { Query, QueryOptions } from '@ptc-org/nestjs-query-core';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { isDefined } from 'class-validator';
import { FindManyOptions, FindOneOptions, In, Not, Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
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
import { ObjectMetadataRelationService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-relation.service';
import { buildMigrationsForCustomObjectRelations } from 'src/engine/metadata-modules/object-metadata/utils/build-migrations-for-custom-object-relations.util';
import { validateObjectMetadataInputOrThrow } from 'src/engine/metadata-modules/object-metadata/utils/validate-object-metadata-input.util';
import { validateNameAndLabelAreSyncOrThrow } from 'src/engine/metadata-modules/object-metadata/utils/validate-object-metadata-sync-label-name.util';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { RemoteTableRelationsService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/remote-table-relations.service';
import { mapUdtNameToFieldType } from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import { SearchService } from 'src/engine/metadata-modules/search/search.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { isSearchableFieldType } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-searchable-field.util';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

import { ObjectMetadataEntity } from './object-metadata.entity';

import { CreateObjectInput } from './dtos/create-object.input';

@Injectable()
export class ObjectMetadataService extends TypeOrmQueryService<ObjectMetadataEntity> {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,

    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,

    private readonly remoteTableRelationsService: RemoteTableRelationsService,

    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly searchService: SearchService,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
    private readonly objectMetadataMigrationService: ObjectMetadataMigrationService,
    private readonly objectMetadataRelationService: ObjectMetadataRelationService,
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
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        workspaceId,
        'view',
      );

    const views = await viewRepository.find({
      where: {
        objectMetadataId: objectMetadata.id,
      },
    });

    if (views.length > 0) {
      await viewRepository.delete(views.map((view) => view.id));
    }

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

    if (objectMetadataInput.shouldSyncLabelAndName === true) {
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

    const isCustom = !objectMetadataInput.isRemote;

    const createdObjectMetadata = await super.createOne({
      ...objectMetadataInput,
      dataSourceId: lastDataSourceMetadata.id,
      targetTableName: 'DEPRECATED',
      isActive: true,
      isCustom: isCustom,
      isSystem: false,
      isRemote: objectMetadataInput.isRemote,
      fields: isCustom
        ? // Creating default fields.
          // No need to create a custom migration for this though as the default columns are already
          // created with default values which is not supported yet by workspace migrations.
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

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        createdObjectMetadata.workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    if (isCustom) {
      await this.createObjectRelationsMetadataAndMigrations(
        objectMetadataInput,
        createdObjectMetadata,
      );

      await this.searchService.createSearchVectorFieldForObject(
        objectMetadataInput,
        createdObjectMetadata,
      );
    } else {
      await this.remoteTableRelationsService.createForeignKeysMetadataAndMigrations(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        objectMetadataInput.primaryKeyColumnType,
      );
    }

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      createdObjectMetadata.workspaceId,
    );

    const view = await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."view"
      ("objectMetadataId", "type", "name", "key", "icon")
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        createdObjectMetadata.id,
        'table',
        `All ${createdObjectMetadata.labelPlural}`,
        'INDEX',
        createdObjectMetadata.icon,
      ],
    );

    createdObjectMetadata.fields.map(async (field, index) => {
      if (field.name === 'id' || field.name === 'deletedAt') {
        return;
      }

      await workspaceDataSource?.query(
        `INSERT INTO ${dataSourceMetadata.schema}."viewField"
      ("fieldMetadataId", "position", "isVisible", "size", "viewId")
      VALUES ('${field.id}', '${index - 1}', true, 180, '${
        view[0].id
      }') RETURNING *`,
      );
    });

    await this.createViewWorkspaceFavorite(
      objectMetadataInput.workspaceId,
      view[0].id,
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

    if (fullObjectMetadataAfterUpdate.shouldSyncLabelAndName) {
      validateNameAndLabelAreSyncOrThrow(
        fullObjectMetadataAfterUpdate.labelSingular,
        fullObjectMetadataAfterUpdate.nameSingular,
      );
      validateNameAndLabelAreSyncOrThrow(
        fullObjectMetadataAfterUpdate.labelPlural,
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
      await this.updateObjectRelationships(input.id, input.update.isActive);
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

  private async createObjectRelationsMetadataAndMigrations(
    objectMetadataInput: CreateObjectInput,
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    const { timelineActivityObjectMetadata } =
      await this.objectMetadataRelationService.createTimelineActivityRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
      );

    const { activityTargetObjectMetadata } =
      await this.objectMetadataRelationService.createActivityTargetRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
      );

    const { favoriteObjectMetadata } =
      await this.objectMetadataRelationService.createFavoriteRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
      );

    const { attachmentObjectMetadata } =
      await this.objectMetadataRelationService.createAttachmentRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
      );

    const { noteTargetObjectMetadata } =
      await this.objectMetadataRelationService.createNoteTargetRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
      );

    const { taskTargetObjectMetadata } =
      await this.objectMetadataRelationService.createTaskTargetRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
      );

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

  private async updateObjectRelationships(
    objectMetadataId: string,
    isActive: boolean,
  ) {
    const affectedRelations = await this.relationMetadataRepository.find({
      where: [
        { fromObjectMetadataId: objectMetadataId },
        { toObjectMetadataId: objectMetadataId },
      ],
    });

    const affectedFieldIds = affectedRelations.reduce(
      (acc, { fromFieldMetadataId, toFieldMetadataId }) => {
        acc.push(fromFieldMetadataId, toFieldMetadataId);

        return acc;
      },
      [] as string[],
    );

    if (affectedFieldIds.length > 0) {
      await this.fieldMetadataRepository.update(
        { id: In(affectedFieldIds) },
        { isActive: isActive },
      );
    }
  }

  private async createViewWorkspaceFavorite(
    workspaceId: string,
    viewId: string,
  ) {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
      );

    const favoriteCount = await favoriteRepository.count();

    return favoriteRepository.insert(
      favoriteRepository.create({
        viewId,
        position: favoriteCount,
      }),
    );
  }

  private async handleObjectNameAndLabelUpdates(
    existingObjectMetadata: ObjectMetadataEntity,
    objectMetadataForUpdate: ObjectMetadataEntity,
    input: UpdateOneObjectInput,
  ) {
    if (
      isDefined(input.update.nameSingular) ||
      isDefined(input.update.namePlural)
    ) {
      if (
        objectMetadataForUpdate.nameSingular ===
        objectMetadataForUpdate.namePlural
      ) {
        throw new ObjectMetadataException(
          'The singular and plural name cannot be the same for an object',
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        );
      }
    }

    const newTargetTableName = computeObjectTargetTable(
      objectMetadataForUpdate,
    );
    const existingTargetTableName = computeObjectTargetTable(
      existingObjectMetadata,
    );

    if (!(newTargetTableName === existingTargetTableName)) {
      await this.createRenameTableMigration(
        existingObjectMetadata,
        objectMetadataForUpdate,
      );

      await this.createRelationsUpdatesMigrations(
        existingObjectMetadata,
        objectMetadataForUpdate,
      );
    }

    if (input.update.labelPlural || input.update.icon) {
      if (
        !(input.update.labelPlural === existingObjectMetadata.labelPlural) ||
        !(input.update.icon === existingObjectMetadata.icon)
      ) {
        await this.updateObjectView(
          objectMetadataForUpdate,
          objectMetadataForUpdate.workspaceId,
        );
      }
    }
  }

  private async createRenameTableMigration(
    existingObjectMetadata: ObjectMetadataEntity,
    objectMetadataForUpdate: ObjectMetadataEntity,
  ) {
    const newTargetTableName = computeObjectTargetTable(
      objectMetadataForUpdate,
    );
    const existingTargetTableName = computeObjectTargetTable(
      existingObjectMetadata,
    );

    this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`rename-${existingObjectMetadata.nameSingular}`),
      objectMetadataForUpdate.workspaceId,
      [
        {
          name: existingTargetTableName,
          newName: newTargetTableName,
          action: WorkspaceMigrationTableActionType.ALTER,
        },
      ],
    );
  }

  private async createRelationsUpdatesMigrations(
    existingObjectMetadata: ObjectMetadataEntity,
    updatedObjectMetadata: ObjectMetadataEntity,
  ) {
    const existingTableName = computeObjectTargetTable(existingObjectMetadata);
    const newTableName = computeObjectTargetTable(updatedObjectMetadata);

    if (existingTableName !== newTableName) {
      const searchCriteria = {
        isCustom: false,
        settings: {
          isForeignKey: true,
        },
        name: `${existingObjectMetadata.nameSingular}Id`,
      };

      const fieldsWihStandardRelation = await this.fieldMetadataRepository.find(
        {
          where: {
            isCustom: false,
            settings: {
              isForeignKey: true,
            },
            name: `${existingObjectMetadata.nameSingular}Id`,
          },
        },
      );

      await this.fieldMetadataRepository.update(searchCriteria, {
        name: `${updatedObjectMetadata.nameSingular}Id`,
      });

      await Promise.all(
        fieldsWihStandardRelation.map(async (fieldWihStandardRelation) => {
          const relatedObject = await this.objectMetadataRepository.findOneBy({
            id: fieldWihStandardRelation.objectMetadataId,
            workspaceId: updatedObjectMetadata.workspaceId,
          });

          if (relatedObject) {
            await this.fieldMetadataRepository.update(
              {
                name: existingObjectMetadata.nameSingular,
                label: existingObjectMetadata.labelSingular,
              },
              {
                name: updatedObjectMetadata.nameSingular,
                label: updatedObjectMetadata.labelSingular,
              },
            );

            const relationTableName = computeObjectTargetTable(relatedObject);
            const columnName = `${existingObjectMetadata.nameSingular}Id`;
            const columnType = fieldMetadataTypeToColumnType(
              fieldWihStandardRelation.type,
            );

            await this.workspaceMigrationService.createCustomMigration(
              generateMigrationName(
                `rename-${existingObjectMetadata.nameSingular}-to-${updatedObjectMetadata.nameSingular}-in-${relatedObject.nameSingular}`,
              ),
              updatedObjectMetadata.workspaceId,
              [
                {
                  name: relationTableName,
                  action: WorkspaceMigrationTableActionType.ALTER,
                  columns: [
                    {
                      action: WorkspaceMigrationColumnActionType.ALTER,
                      currentColumnDefinition: {
                        columnName,
                        columnType,
                        isNullable: true,
                        defaultValue: null,
                      },
                      alteredColumnDefinition: {
                        columnName: `${updatedObjectMetadata.nameSingular}Id`,
                        columnType,
                        isNullable: true,
                        defaultValue: null,
                      },
                    },
                  ],
                },
              ],
            );
          }
        }),
      );
    }
  }

  private async updateObjectView(
    updatedObjectMetadata: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    await workspaceDataSource?.query(
      `UPDATE ${dataSourceMetadata.schema}."view"
    SET "name"=$1, "icon"=$2 WHERE "objectMetadataId"=$3 AND "key"=$4`,
      [
        `All ${updatedObjectMetadata.labelPlural}`,
        updatedObjectMetadata.icon,
        updatedObjectMetadata.id,
        'INDEX',
      ],
    );
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
