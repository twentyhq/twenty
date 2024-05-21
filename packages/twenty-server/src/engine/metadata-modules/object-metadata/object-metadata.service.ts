import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import console from 'console';

import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Query, QueryOptions } from '@ptc-org/nestjs-query-core';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnDrop,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  RelationMetadataEntity,
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { RelationToDelete } from 'src/engine/metadata-modules/relation-metadata/types/relation-to-delete';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  ACTIVITY_TARGET_STANDARD_FIELD_IDS,
  ATTACHMENT_STANDARD_FIELD_IDS,
  BASE_OBJECT_STANDARD_FIELD_IDS,
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
  FAVORITE_STANDARD_FIELD_IDS,
  TIMELINE_ACTIVITY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import {
  createForeignKeyDeterministicUuid,
  createRelationDeterministicUuid,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';
import { createWorkspaceMigrationsForCustomObjectRelations } from 'src/engine/metadata-modules/object-metadata/utils/create-migrations-for-custom-object-relations.util';
import { createWorkspaceMigrationsForRemoteObjectRelations } from 'src/engine/metadata-modules/object-metadata/utils/create-workspace-migrations-for-remote-object-relations.util';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { validateObjectMetadataInputOrThrow } from 'src/engine/metadata-modules/object-metadata/utils/validate-object-metadata-input.util';
import { mapUdtNameToFieldType } from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { createMigrationToAlterCommentOnForeignKeyDeletion } from 'src/engine/metadata-modules/object-metadata/utils/create-migration-for-foreign-key-comment-alteration.util';

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

    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
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
      throw new NotFoundException('Object does not exist');
    }

    const relationsToDelete: RelationToDelete[] = [];

    // TODO: Most of this logic should be moved to relation-metadata.service.ts
    for (const relation of [
      ...objectMetadata.fromRelations,
      ...objectMetadata.toRelations,
    ]) {
      relationsToDelete.push({
        id: relation.id,
        fromFieldMetadataId: relation.fromFieldMetadata.id,
        toFieldMetadataId: relation.toFieldMetadata.id,
        fromFieldMetadataName: relation.fromFieldMetadata.name,
        toFieldMetadataName: relation.toFieldMetadata.name,
        fromObjectMetadataId: relation.fromObjectMetadata.id,
        toObjectMetadataId: relation.toObjectMetadata.id,
        fromObjectName: relation.fromObjectMetadata.nameSingular,
        toObjectName: relation.toObjectMetadata.nameSingular,
        toFieldMetadataIsCustom: relation.toFieldMetadata.isCustom,
        toObjectMetadataIsCustom: relation.toObjectMetadata.isCustom,
        direction:
          relation.fromObjectMetadata.nameSingular ===
          objectMetadata.nameSingular
            ? 'from'
            : 'to',
      });
    }

    if (relationsToDelete.length > 0) {
      await this.relationMetadataRepository.delete(
        relationsToDelete.map((relation) => relation.id),
      );
    }

    for (const relationToDelete of relationsToDelete) {
      const foreignKeyFieldsToDelete = await this.fieldMetadataRepository.find({
        where: {
          name: `${relationToDelete.toFieldMetadataName}Id`,
          objectMetadataId: relationToDelete.toObjectMetadataId,
          workspaceId,
        },
      });

      const foreignKeyFieldsToDeleteIds = foreignKeyFieldsToDelete.map(
        (field) => field.id,
      );

      await this.fieldMetadataRepository.delete([
        ...foreignKeyFieldsToDeleteIds,
        relationToDelete.fromFieldMetadataId,
        relationToDelete.toFieldMetadataId,
      ]);

      if (relationToDelete.direction === 'from') {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(
            `delete-${relationToDelete.fromObjectName}-${relationToDelete.toObjectName}`,
          ),
          workspaceId,
          [
            {
              name: computeTableName(
                relationToDelete.toObjectName,
                relationToDelete.toObjectMetadataIsCustom,
              ),
              action: WorkspaceMigrationTableActionType.ALTER,
              columns: [
                {
                  action: WorkspaceMigrationColumnActionType.DROP,
                  columnName: computeColumnName(
                    relationToDelete.toFieldMetadataName,
                    { isForeignKey: true },
                  ),
                } satisfies WorkspaceMigrationColumnDrop,
              ],
            },
          ],
        );

        // for remote objects, we need to update the comment of the foreign key column
        if (objectMetadata.isRemote) {
          await createMigrationToAlterCommentOnForeignKeyDeletion(
            this.dataSourceService,
            this.typeORMService,
            this.workspaceMigrationService,
            workspaceId,
            relationToDelete,
          );
        }
      }
    }

    await this.objectMetadataRepository.delete(objectMetadata.id);

    if (!objectMetadata.isRemote) {
      // DROP TABLE
      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(`delete-${objectMetadata.nameSingular}`),
        workspaceId,
        [
          {
            name: computeObjectTargetTable(objectMetadata),
            action: WorkspaceMigrationTableActionType.DROP,
          },
        ],
      );
    }

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    await this.workspaceCacheVersionService.incrementVersion(workspaceId);

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
      throw new BadRequestException(
        'The singular and plural name cannot be the same for an object',
      );
    }

    const objectAlreadyExists = await this.objectMetadataRepository.findOne({
      where: [
        {
          nameSingular: objectMetadataInput.nameSingular,
          workspaceId: objectMetadataInput.workspaceId,
        },
        {
          namePlural: objectMetadataInput.namePlural,
          workspaceId: objectMetadataInput.workspaceId,
        },
      ],
    });

    if (objectAlreadyExists) {
      throw new ConflictException('Object already exists');
    }

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
              label: 'Update date',
              icon: 'IconCalendar',
              description: 'Update date',
              isNullable: false,
              isActive: true,
              isCustom: false,
              isSystem: true,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: 'now',
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

    await this.createObjectRelationsMetadataAndMigrations(
      objectMetadataInput,
      createdObjectMetadata,
    );

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
      if (field.name === 'id') {
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

    await this.workspaceCacheVersionService.incrementVersion(
      objectMetadataInput.workspaceId,
    );

    return createdObjectMetadata;
  }

  public async updateOneObject(
    input: UpdateOneObjectInput,
    workspaceId: string,
  ): Promise<ObjectMetadataEntity> {
    validateObjectMetadataInputOrThrow(input.update);

    const updatedObject = await super.updateOne(input.id, input.update);

    await this.workspaceCacheVersionService.incrementVersion(workspaceId);

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

  public async findOneOrFailWithinWorkspace(
    workspaceId: string,
    options: FindOneOptions<ObjectMetadataEntity>,
  ): Promise<ObjectMetadataEntity> {
    return this.objectMetadataRepository.findOneOrFail({
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
    await this.workspaceCacheVersionService.incrementVersion(workspaceId);
  }

  private async createObjectRelationsMetadataAndMigrations(
    objectMetadataInput: CreateObjectInput,
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    const isRemoteObject = objectMetadataInput.isRemote ?? false;

    const { timelineActivityObjectMetadata } =
      await this.createTimelineActivityRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        isRemoteObject,
      );

    const { activityTargetObjectMetadata } =
      await this.createActivityTargetRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        isRemoteObject,
      );

    const { favoriteObjectMetadata } = await this.createFavoriteRelation(
      objectMetadataInput.workspaceId,
      createdObjectMetadata,
      mapUdtNameToFieldType(objectMetadataInput.primaryKeyColumnType ?? 'uuid'),
      objectMetadataInput.primaryKeyFieldMetadataSettings,
      isRemoteObject,
    );

    const { attachmentObjectMetadata } = await this.createAttachmentRelation(
      objectMetadataInput.workspaceId,
      createdObjectMetadata,
      mapUdtNameToFieldType(objectMetadataInput.primaryKeyColumnType ?? 'uuid'),
      objectMetadataInput.primaryKeyFieldMetadataSettings,
      isRemoteObject,
    );

    return this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-${createdObjectMetadata.nameSingular}`),
      createdObjectMetadata.workspaceId,
      isRemoteObject
        ? await createWorkspaceMigrationsForRemoteObjectRelations(
            createdObjectMetadata,
            activityTargetObjectMetadata,
            attachmentObjectMetadata,
            timelineActivityObjectMetadata,
            favoriteObjectMetadata,
            objectMetadataInput.primaryKeyColumnType ?? 'uuid',
          )
        : createWorkspaceMigrationsForCustomObjectRelations(
            createdObjectMetadata,
            activityTargetObjectMetadata,
            attachmentObjectMetadata,
            timelineActivityObjectMetadata,
            favoriteObjectMetadata,
          ),
    );
  }

  private async createActivityTargetRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
    isRemoteObject: boolean,
  ) {
    const activityTargetObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'activityTarget',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: activityTargetObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `ActivityTarget ${createdObjectMetadata.labelSingular} id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
      },
    );

    if (!isRemoteObject) {
      const activityTargetRelationFieldMetadata =
        await this.fieldMetadataRepository.save([
          // FROM
          {
            standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.activityTargets,
            objectMetadataId: createdObjectMetadata.id,
            workspaceId: workspaceId,
            isCustom: false,
            isActive: true,
            type: FieldMetadataType.RELATION,
            name: 'activityTargets',
            label: 'Activities',
            description: `Activities tied to the ${createdObjectMetadata.labelSingular}`,
            icon: 'IconCheckbox',
            isNullable: true,
          },
          // TO
          {
            standardId: createRelationDeterministicUuid({
              objectId: createdObjectMetadata.id,
              standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.custom,
            }),
            objectMetadataId: activityTargetObjectMetadata.id,
            workspaceId: workspaceId,
            isCustom: false,
            isActive: true,
            type: FieldMetadataType.RELATION,
            name: createdObjectMetadata.nameSingular,
            label: createdObjectMetadata.labelSingular,
            description: `ActivityTarget ${createdObjectMetadata.labelSingular}`,
            icon: 'IconBuildingSkyscraper',
            isNullable: true,
          },
        ]);

      const activityTargetRelationFieldMetadataMap =
        activityTargetRelationFieldMetadata.reduce(
          (acc, fieldMetadata: FieldMetadataEntity) => {
            if (fieldMetadata.type === FieldMetadataType.RELATION) {
              acc[fieldMetadata.objectMetadataId] = fieldMetadata;
            }

            return acc;
          },
          {},
        );

      await this.relationMetadataRepository.save([
        {
          workspaceId: workspaceId,
          relationType: RelationMetadataType.ONE_TO_MANY,
          fromObjectMetadataId: createdObjectMetadata.id,
          toObjectMetadataId: activityTargetObjectMetadata.id,
          fromFieldMetadataId:
            activityTargetRelationFieldMetadataMap[createdObjectMetadata.id].id,
          toFieldMetadataId:
            activityTargetRelationFieldMetadataMap[
              activityTargetObjectMetadata.id
            ].id,
          onDeleteAction: RelationOnDeleteAction.CASCADE,
        },
      ]);
    }

    return { activityTargetObjectMetadata };
  }

  private async createAttachmentRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
    isRemoteObject: boolean,
  ) {
    const attachmentObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'attachment',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: ATTACHMENT_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: attachmentObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `Attachment ${createdObjectMetadata.labelSingular} id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
      },
    );

    if (!isRemoteObject) {
      const attachmentRelationFieldMetadata =
        await this.fieldMetadataRepository.save([
          // FROM
          {
            standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.attachments,
            objectMetadataId: createdObjectMetadata.id,
            workspaceId: workspaceId,
            isCustom: false,
            isActive: true,
            type: FieldMetadataType.RELATION,
            name: 'attachments',
            label: 'Attachments',
            description: `Attachments tied to the ${createdObjectMetadata.labelSingular}`,
            icon: 'IconFileImport',
            isNullable: true,
          },
          // TO
          {
            standardId: createRelationDeterministicUuid({
              objectId: createdObjectMetadata.id,
              standardId: ATTACHMENT_STANDARD_FIELD_IDS.custom,
            }),
            objectMetadataId: attachmentObjectMetadata.id,
            workspaceId: workspaceId,
            isCustom: false,
            isActive: true,
            type: FieldMetadataType.RELATION,
            name: createdObjectMetadata.nameSingular,
            label: createdObjectMetadata.labelSingular,
            description: `Attachment ${createdObjectMetadata.labelSingular}`,
            icon: 'IconBuildingSkyscraper',
            isNullable: true,
          },
        ]);

      const attachmentRelationFieldMetadataMap =
        attachmentRelationFieldMetadata.reduce(
          (acc, fieldMetadata: FieldMetadataEntity) => {
            if (fieldMetadata.type === FieldMetadataType.RELATION) {
              acc[fieldMetadata.objectMetadataId] = fieldMetadata;
            }

            return acc;
          },
          {},
        );

      await this.relationMetadataRepository.save([
        {
          workspaceId: workspaceId,
          relationType: RelationMetadataType.ONE_TO_MANY,
          fromObjectMetadataId: createdObjectMetadata.id,
          toObjectMetadataId: attachmentObjectMetadata.id,
          fromFieldMetadataId:
            attachmentRelationFieldMetadataMap[createdObjectMetadata.id].id,
          toFieldMetadataId:
            attachmentRelationFieldMetadataMap[attachmentObjectMetadata.id].id,
          onDeleteAction: RelationOnDeleteAction.CASCADE,
        },
      ]);
    }

    return { attachmentObjectMetadata };
  }

  private async createTimelineActivityRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
    isRemoteObject: boolean,
  ) {
    const timelineActivityObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'timelineActivity',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: timelineActivityObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `Timeline Activity ${createdObjectMetadata.labelSingular} id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
      },
    );

    if (!isRemoteObject) {
      const timelineActivityRelationFieldMetadata =
        await this.fieldMetadataRepository.save([
          // FROM
          {
            standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.timelineActivities,
            objectMetadataId: createdObjectMetadata.id,
            workspaceId: workspaceId,
            isCustom: false,
            isActive: true,
            type: FieldMetadataType.RELATION,
            name: 'timelineActivities',
            label: 'Timeline Activities',
            description: `Timeline Activities tied to the ${createdObjectMetadata.labelSingular}`,
            icon: 'IconTimeline',
            isNullable: true,
          },
          // TO
          {
            standardId: createRelationDeterministicUuid({
              objectId: createdObjectMetadata.id,
              standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.custom,
            }),
            objectMetadataId: timelineActivityObjectMetadata.id,
            workspaceId: workspaceId,
            isCustom: false,
            isActive: true,
            type: FieldMetadataType.RELATION,
            name: createdObjectMetadata.nameSingular,
            label: createdObjectMetadata.labelSingular,
            description: `Timeline Activity ${createdObjectMetadata.labelSingular}`,
            icon: 'IconBuildingSkyscraper',
            isNullable: true,
          },
        ]);

      const timelineActivityRelationFieldMetadataMap =
        timelineActivityRelationFieldMetadata.reduce(
          (acc, fieldMetadata: FieldMetadataEntity) => {
            if (fieldMetadata.type === FieldMetadataType.RELATION) {
              acc[fieldMetadata.objectMetadataId] = fieldMetadata;
            }

            return acc;
          },
          {},
        );

      await this.relationMetadataRepository.save([
        {
          workspaceId: workspaceId,
          relationType: RelationMetadataType.ONE_TO_MANY,
          fromObjectMetadataId: createdObjectMetadata.id,
          toObjectMetadataId: timelineActivityObjectMetadata.id,
          fromFieldMetadataId:
            timelineActivityRelationFieldMetadataMap[createdObjectMetadata.id]
              .id,
          toFieldMetadataId:
            timelineActivityRelationFieldMetadataMap[
              timelineActivityObjectMetadata.id
            ].id,
          onDeleteAction: RelationOnDeleteAction.CASCADE,
        },
      ]);
    }

    return { timelineActivityObjectMetadata };
  }

  private async createFavoriteRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
    isRemoteObject: boolean,
  ) {
    const favoriteObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'favorite',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: FAVORITE_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: favoriteObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `Favorite ${createdObjectMetadata.labelSingular} id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
      },
    );

    if (!isRemoteObject) {
      const favoriteRelationFieldMetadata =
        await this.fieldMetadataRepository.save([
          // FROM
          {
            standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.favorites,
            objectMetadataId: createdObjectMetadata.id,
            workspaceId: workspaceId,
            isCustom: false,
            isActive: true,
            isSystem: true,
            type: FieldMetadataType.RELATION,
            name: 'favorites',
            label: 'Favorites',
            description: `Favorites tied to the ${createdObjectMetadata.labelSingular}`,
            icon: 'IconHeart',
            isNullable: true,
          },
          // TO
          {
            standardId: createRelationDeterministicUuid({
              objectId: createdObjectMetadata.id,
              standardId: FAVORITE_STANDARD_FIELD_IDS.custom,
            }),
            objectMetadataId: favoriteObjectMetadata.id,
            workspaceId: workspaceId,
            isCustom: false,
            isActive: true,
            type: FieldMetadataType.RELATION,
            name: createdObjectMetadata.nameSingular,
            label: createdObjectMetadata.labelSingular,
            description: `Favorite ${createdObjectMetadata.labelSingular}`,
            icon: 'IconBuildingSkyscraper',
            isNullable: true,
          },
        ]);

      const favoriteRelationFieldMetadataMap =
        favoriteRelationFieldMetadata.reduce(
          (acc, fieldMetadata: FieldMetadataEntity) => {
            if (fieldMetadata.type === FieldMetadataType.RELATION) {
              acc[fieldMetadata.objectMetadataId] = fieldMetadata;
            }

            return acc;
          },
          {},
        );

      await this.relationMetadataRepository.save([
        {
          workspaceId: workspaceId,
          relationType: RelationMetadataType.ONE_TO_MANY,
          fromObjectMetadataId: createdObjectMetadata.id,
          toObjectMetadataId: favoriteObjectMetadata.id,
          fromFieldMetadataId:
            favoriteRelationFieldMetadataMap[createdObjectMetadata.id].id,
          toFieldMetadataId:
            favoriteRelationFieldMetadataMap[favoriteObjectMetadata.id].id,
          onDeleteAction: RelationOnDeleteAction.CASCADE,
        },
      ]);
    }

    return { favoriteObjectMetadata };
  }
}
