import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import console from 'console';

import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Query, QueryOptions } from '@ptc-org/nestjs-query-core';

import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnDrop,
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
import { computeCustomName } from 'src/engine/utils/compute-custom-name.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { RelationToDelete } from 'src/engine/metadata-modules/relation-metadata/types/relation-to-delete';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  activityTargetStandardFieldIds,
  attachmentStandardFieldIds,
  baseObjectStandardFieldIds,
  customObjectStandardFieldIds,
  eventStandardFieldIds,
  favoriteStandardFieldIds,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import {
  createForeignKeyDeterministicUuid,
  createRelationDeterministicUuid,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';
import { buildWorkspaceMigrationsForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-workspace-migrations-for-custom-object.util';
import { buildWorkspaceMigrationsForRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/build-workspace-migrations-for-remote-object.util';

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
              name: computeCustomName(
                relationToDelete.toObjectName,
                relationToDelete.toObjectMetadataIsCustom,
              ),
              action: 'alter',
              columns: [
                {
                  action: WorkspaceMigrationColumnActionType.DROP,
                  columnName: computeCustomName(
                    `${relationToDelete.toFieldMetadataName}Id`,
                    relationToDelete.toFieldMetadataIsCustom,
                  ),
                } satisfies WorkspaceMigrationColumnDrop,
              ],
            },
          ],
        );
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
            action: 'drop',
          },
        ],
      );
    }

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
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

    if (
      objectMetadataInput.nameSingular.toLowerCase() ===
      objectMetadataInput.namePlural.toLowerCase()
    ) {
      throw new BadRequestException(
        'The singular and plural name cannot be the same for an object',
      );
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
              standardId: baseObjectStandardFieldIds.id,
              type: FieldMetadataType.UUID,
              name: 'id',
              label: 'Id',
              targetColumnMap: {
                value: 'id',
              },
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
              standardId: customObjectStandardFieldIds.name,
              type: FieldMetadataType.TEXT,
              name: 'name',
              label: 'Name',
              targetColumnMap: {
                value: 'name',
              },
              icon: 'IconAbc',
              description: 'Name',
              isNullable: false,
              isActive: true,
              isCustom: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: "'Untitled'",
            },
            {
              standardId: baseObjectStandardFieldIds.createdAt,
              type: FieldMetadataType.DATE_TIME,
              name: 'createdAt',
              label: 'Creation date',
              targetColumnMap: {
                value: 'createdAt',
              },
              icon: 'IconCalendar',
              description: 'Creation date',
              isNullable: false,
              isActive: true,
              isCustom: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: 'now',
            },
            {
              standardId: baseObjectStandardFieldIds.updatedAt,
              type: FieldMetadataType.DATE_TIME,
              name: 'updatedAt',
              label: 'Update date',
              targetColumnMap: {
                value: 'updatedAt',
              },
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
              standardId: customObjectStandardFieldIds.position,
              type: FieldMetadataType.POSITION,
              name: 'position',
              label: 'Position',
              targetColumnMap: {
                value: 'position',
              },
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

    const { eventObjectMetadata } = await this.createEventRelation(
      objectMetadataInput.workspaceId,
      createdObjectMetadata,
    );

    const { activityTargetObjectMetadata } =
      await this.createActivityTargetRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
      );

    const { favoriteObjectMetadata } = await this.createFavoriteRelation(
      objectMetadataInput.workspaceId,
      createdObjectMetadata,
    );

    const { attachmentObjectMetadata } = await this.createAttachmentRelation(
      objectMetadataInput.workspaceId,
      createdObjectMetadata,
    );

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        createdObjectMetadata.workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-${createdObjectMetadata.nameSingular}`),
      createdObjectMetadata.workspaceId,
      isCustom
        ? buildWorkspaceMigrationsForCustomObject(
            createdObjectMetadata,
            activityTargetObjectMetadata,
            attachmentObjectMetadata,
            eventObjectMetadata,
            favoriteObjectMetadata,
          )
        : await buildWorkspaceMigrationsForRemoteObject(
            createdObjectMetadata,
            activityTargetObjectMetadata,
            attachmentObjectMetadata,
            eventObjectMetadata,
            favoriteObjectMetadata,
            lastDataSourceMetadata.schema,
            objectMetadataInput.remoteTablePrimaryKeyColumnType ?? 'uuid',
            workspaceDataSource,
          ),
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
        `All ${createdObjectMetadata.namePlural}`,
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

    return createdObjectMetadata;
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
  }

  private async createActivityTargetRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    const activityTargetObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'activityTarget',
        workspaceId: workspaceId,
      });

    const activityTargetRelationFieldMetadata =
      await this.fieldMetadataRepository.save([
        // FROM
        {
          standardId: customObjectStandardFieldIds.activityTargets,
          objectMetadataId: createdObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: 'activityTargets',
          label: 'Activities',
          targetColumnMap: {},
          description: `Activities tied to the ${createdObjectMetadata.labelSingular}`,
          icon: 'IconCheckbox',
          isNullable: true,
        },
        // TO
        {
          standardId: createRelationDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: activityTargetStandardFieldIds.custom,
          }),
          objectMetadataId: activityTargetObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: createdObjectMetadata.nameSingular,
          label: createdObjectMetadata.labelSingular,
          targetColumnMap: {},
          description: `ActivityTarget ${createdObjectMetadata.labelSingular}`,
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
        },
        // Foreign key
        {
          standardId: createForeignKeyDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: activityTargetStandardFieldIds.custom,
          }),
          objectMetadataId: activityTargetObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.UUID,
          name: `${createdObjectMetadata.nameSingular}Id`,
          label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
          targetColumnMap: {
            value: `${computeCustomName(
              createdObjectMetadata.nameSingular,
              false,
            )}Id`,
          },
          description: `ActivityTarget ${createdObjectMetadata.labelSingular} id foreign key`,
          icon: undefined,
          isNullable: true,
          isSystem: true,
          defaultValue: undefined,
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

    return { activityTargetObjectMetadata };
  }

  private async createAttachmentRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    const attachmentObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'attachment',
        workspaceId: workspaceId,
      });

    const attachmentRelationFieldMetadata =
      await this.fieldMetadataRepository.save([
        // FROM
        {
          standardId: customObjectStandardFieldIds.attachments,
          objectMetadataId: createdObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: 'attachments',
          label: 'Attachments',
          targetColumnMap: {},
          description: `Attachments tied to the ${createdObjectMetadata.labelSingular}`,
          icon: 'IconFileImport',
          isNullable: true,
        },
        // TO
        {
          standardId: createRelationDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: attachmentStandardFieldIds.custom,
          }),
          objectMetadataId: attachmentObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: createdObjectMetadata.nameSingular,
          label: createdObjectMetadata.labelSingular,
          targetColumnMap: {},
          description: `Attachment ${createdObjectMetadata.labelSingular}`,
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
        },
        // Foreign key
        {
          standardId: createForeignKeyDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: attachmentStandardFieldIds.custom,
          }),
          objectMetadataId: attachmentObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.UUID,
          name: `${createdObjectMetadata.nameSingular}Id`,
          label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
          targetColumnMap: {
            value: `${computeCustomName(
              createdObjectMetadata.nameSingular,
              false,
            )}Id`,
          },
          description: `Attachment ${createdObjectMetadata.labelSingular} id foreign key`,
          icon: undefined,
          isNullable: true,
          isSystem: true,
          defaultValue: undefined,
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

    return { attachmentObjectMetadata };
  }

  private async createEventRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    const eventObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'event',
        workspaceId: workspaceId,
      });

    const eventRelationFieldMetadata = await this.fieldMetadataRepository.save([
      // FROM
      {
        standardId: customObjectStandardFieldIds.events,
        objectMetadataId: createdObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: FieldMetadataType.RELATION,
        name: 'events',
        label: 'Events',
        targetColumnMap: {},
        description: `Events tied to the ${createdObjectMetadata.labelSingular}`,
        icon: 'IconFileImport',
        isNullable: true,
      },
      // TO
      {
        standardId: createRelationDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: eventStandardFieldIds.custom,
        }),
        objectMetadataId: eventObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: FieldMetadataType.RELATION,
        name: createdObjectMetadata.nameSingular,
        label: createdObjectMetadata.labelSingular,
        targetColumnMap: {},
        description: `Event ${createdObjectMetadata.labelSingular}`,
        icon: 'IconBuildingSkyscraper',
        isNullable: true,
      },
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: eventStandardFieldIds.custom,
        }),
        objectMetadataId: eventObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: FieldMetadataType.UUID,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        targetColumnMap: {
          value: `${computeCustomName(
            createdObjectMetadata.nameSingular,
            false,
          )}Id`,
        },
        description: `Event ${createdObjectMetadata.labelSingular} id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
      },
    ]);

    const eventRelationFieldMetadataMap = eventRelationFieldMetadata.reduce(
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
        toObjectMetadataId: eventObjectMetadata.id,
        fromFieldMetadataId:
          eventRelationFieldMetadataMap[createdObjectMetadata.id].id,
        toFieldMetadataId:
          eventRelationFieldMetadataMap[eventObjectMetadata.id].id,
        onDeleteAction: RelationOnDeleteAction.CASCADE,
      },
    ]);

    return { eventObjectMetadata };
  }

  private async createFavoriteRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    const favoriteObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'favorite',
        workspaceId: workspaceId,
      });

    const favoriteRelationFieldMetadata =
      await this.fieldMetadataRepository.save([
        // FROM
        {
          standardId: customObjectStandardFieldIds.favorites,
          objectMetadataId: createdObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          isSystem: true,
          type: FieldMetadataType.RELATION,
          name: 'favorites',
          label: 'Favorites',
          targetColumnMap: {},
          description: `Favorites tied to the ${createdObjectMetadata.labelSingular}`,
          icon: 'IconHeart',
          isNullable: true,
        },
        // TO
        {
          standardId: createRelationDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: favoriteStandardFieldIds.custom,
          }),
          objectMetadataId: favoriteObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: createdObjectMetadata.nameSingular,
          label: createdObjectMetadata.labelSingular,
          targetColumnMap: {},
          description: `Favorite ${createdObjectMetadata.labelSingular}`,
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
        },
        // Foreign key
        {
          standardId: createForeignKeyDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: favoriteStandardFieldIds.custom,
          }),
          objectMetadataId: favoriteObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.UUID,
          name: `${createdObjectMetadata.nameSingular}Id`,
          label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
          targetColumnMap: {
            value: `${computeCustomName(
              createdObjectMetadata.nameSingular,
              false,
            )}Id`,
          },
          description: `Favorite ${createdObjectMetadata.labelSingular} id foreign key`,
          icon: undefined,
          isNullable: true,
          isSystem: true,
          defaultValue: undefined,
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

    return { favoriteObjectMetadata };
  }
}
