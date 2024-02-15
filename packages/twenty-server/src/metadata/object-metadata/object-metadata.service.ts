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

import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationColumnDrop,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/metadata/relation-metadata/relation-metadata.entity';
import { computeCustomName } from 'src/workspace/utils/compute-custom-name.util';
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';
import { DeleteOneObjectInput } from 'src/metadata/object-metadata/dtos/delete-object.input';
import { RelationToDelete } from 'src/metadata/relation-metadata/types/relation-to-delete';
import { generateMigrationName } from 'src/metadata/workspace-migration/utils/generate-migration-name.util';

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

    await this.relationMetadataRepository.delete(
      relationsToDelete.map((relation) => relation.id),
    );

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

    const createdObjectMetadata = await super.createOne({
      ...objectMetadataInput,
      dataSourceId: lastDataSourceMetadata.id,
      targetTableName: 'DEPRECATED',
      isActive: true,
      isCustom: true,
      isSystem: false,
      fields:
        // Creating default fields.
        // No need to create a custom migration for this though as the default columns are already
        // created with default values which is not supported yet by workspace migrations.
        [
          {
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
            defaultValue: { type: 'uuid' },
          },
          {
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
            defaultValue: { value: 'Untitled' },
          },
          {
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
            defaultValue: { type: 'now' },
          },
          {
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
            defaultValue: { type: 'now' },
          },
          {
            type: FieldMetadataType.NUMBER,
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
        ],
    });

    const { activityTargetObjectMetadata } =
      await this.createActivityTargetRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
      );

    const { favoriteObjectMetadata } = await this.createFavoriteRelation(
      objectMetadataInput.workspaceId,
      createdObjectMetadata,
    );

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-${createdObjectMetadata.nameSingular}`),
      createdObjectMetadata.workspaceId,
      [
        {
          name: computeObjectTargetTable(createdObjectMetadata),
          action: 'create',
        } satisfies WorkspaceMigrationTableAction,
        // Add activity target relation
        {
          name: computeObjectTargetTable(activityTargetObjectMetadata),
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE,
              columnName: `${computeObjectTargetTable(
                createdObjectMetadata,
              )}Id`,
              columnType: 'uuid',
              isNullable: true,
            } satisfies WorkspaceMigrationColumnCreate,
          ],
        },
        {
          name: computeObjectTargetTable(activityTargetObjectMetadata),
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.RELATION,
              columnName: `${computeObjectTargetTable(
                createdObjectMetadata,
              )}Id`,
              referencedTableName: computeObjectTargetTable(
                createdObjectMetadata,
              ),
              referencedTableColumnName: 'id',
            },
          ],
        },
        // Add favorite relation
        {
          name: computeObjectTargetTable(favoriteObjectMetadata),
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE,
              columnName: `${computeObjectTargetTable(
                createdObjectMetadata,
              )}Id`,
              columnType: 'uuid',
              isNullable: true,
            } satisfies WorkspaceMigrationColumnCreate,
          ],
        },
        {
          name: computeObjectTargetTable(favoriteObjectMetadata),
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.RELATION,
              columnName: `${computeObjectTargetTable(
                createdObjectMetadata,
              )}Id`,
              referencedTableName: computeObjectTargetTable(
                createdObjectMetadata,
              ),
              referencedTableColumnName: 'id',
            },
          ],
        },
        {
          name: computeObjectTargetTable(createdObjectMetadata),
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE,
              columnName: 'position',
              columnType: 'float',
              isNullable: true,
            } satisfies WorkspaceMigrationColumnCreate,
          ],
        } satisfies WorkspaceMigrationTableAction,
        // This is temporary until we implement mainIdentifier
        {
          name: computeObjectTargetTable(createdObjectMetadata),
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE,
              columnName: 'name',
              columnType: 'text',
              defaultValue: "'Untitled'",
            } satisfies WorkspaceMigrationColumnCreate,
          ],
        } satisfies WorkspaceMigrationTableAction,
      ],
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      createdObjectMetadata.workspaceId,
    );

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        createdObjectMetadata.workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const view = await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."view"
      ("objectMetadataId", "type", "name")
      VALUES ('${createdObjectMetadata.id}', 'table', 'All ${createdObjectMetadata.namePlural}') RETURNING *`,
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
          objectMetadataId: createdObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: true,
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
          objectMetadataId: activityTargetObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: true,
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
          objectMetadataId: activityTargetObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: true,
          isActive: true,
          type: FieldMetadataType.UUID,
          name: `${createdObjectMetadata.nameSingular}Id`,
          label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
          targetColumnMap: {
            value: `${computeObjectTargetTable(createdObjectMetadata)}Id`,
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
      },
    ]);

    return { activityTargetObjectMetadata };
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
          objectMetadataId: createdObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: true,
          isActive: true,
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
          objectMetadataId: favoriteObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: true,
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
          objectMetadataId: favoriteObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: true,
          isActive: true,
          type: FieldMetadataType.UUID,
          name: `${createdObjectMetadata.nameSingular}Id`,
          label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
          targetColumnMap: {
            value: `${computeObjectTargetTable(createdObjectMetadata)}Id`,
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
      },
    ]);

    return { favoriteObjectMetadata };
  }
}
