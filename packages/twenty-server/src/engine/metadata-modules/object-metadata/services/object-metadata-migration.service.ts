import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import { QueryRunner, Repository } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { buildMigrationsForCustomObjectRelations } from 'src/engine/metadata-modules/object-metadata/utils/build-migrations-for-custom-object-relations.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnDrop,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { RELATION_MIGRATION_PRIORITY_PREFIX } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';

@Injectable()
export class ObjectMetadataMigrationService {
  constructor(
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
  ) {}

  public async createTableMigration(
    createdObjectMetadata: ObjectMetadataEntity,
    queryRunner?: QueryRunner,
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
      queryRunner,
    );
  }

  public async createColumnsMigrations(
    createdObjectMetadata: ObjectMetadataEntity,
    fieldMetadataCollection: FieldMetadataEntity[],
    queryRunner?: QueryRunner,
  ) {
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `create-${createdObjectMetadata.nameSingular}-fields`,
      ),
      createdObjectMetadata.workspaceId,
      [
        {
          name: computeObjectTargetTable(createdObjectMetadata),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: fieldMetadataCollection.flatMap((fieldMetadata) =>
            this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.CREATE,
              fieldMetadata,
            ),
          ),
        },
      ],
      queryRunner,
    );
  }

  public async createRelationMigrations(
    createdObjectMetadata: Pick<
      ObjectMetadataItemWithFieldMaps,
      'nameSingular' | 'workspaceId' | 'isCustom'
    >,
    relatedObjectMetadataCollection: Pick<
      ObjectMetadataItemWithFieldMaps,
      'nameSingular' | 'isCustom'
    >[],
    queryRunner?: QueryRunner,
  ) {
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `create-${createdObjectMetadata.nameSingular}-relations`,
      ),
      createdObjectMetadata.workspaceId,
      buildMigrationsForCustomObjectRelations(
        createdObjectMetadata,
        relatedObjectMetadataCollection,
      ),
      queryRunner,
    );
  }

  public async createRenameTableMigration(
    existingObjectMetadata: Pick<
      ObjectMetadataEntity,
      'nameSingular' | 'isCustom'
    >,
    objectMetadataForUpdate: Pick<
      ObjectMetadataEntity,
      'nameSingular' | 'isCustom'
    >,
    workspaceId: string,
    queryRunner?: QueryRunner,
  ) {
    const newTargetTableName = computeObjectTargetTable(
      objectMetadataForUpdate,
    );
    const existingTargetTableName = computeObjectTargetTable(
      existingObjectMetadata,
    );

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`rename-${existingObjectMetadata.nameSingular}`),
      workspaceId,
      [
        {
          name: existingTargetTableName,
          newName: newTargetTableName,
          action: WorkspaceMigrationTableActionType.ALTER,
        },
      ],
      queryRunner,
    );
  }

  public async updateRelationMigrations(
    currentObjectMetadata: Pick<ObjectMetadataEntity, 'nameSingular'>,
    alteredObjectMetadata: Pick<ObjectMetadataEntity, 'nameSingular'>,
    relationMetadataCollection: {
      targetObjectMetadata: ObjectMetadataEntity;
      targetFieldMetadata: FieldMetadataEntity;
      sourceFieldMetadata: FieldMetadataEntity;
    }[],
    workspaceId: string,
    queryRunner?: QueryRunner,
  ) {
    for (const { targetObjectMetadata } of relationMetadataCollection) {
      const targetTableName = computeObjectTargetTable(targetObjectMetadata);
      const columnName = `${currentObjectMetadata.nameSingular}Id`;

      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(
          `rename-${currentObjectMetadata.nameSingular}-to-${alteredObjectMetadata.nameSingular}-in-${targetObjectMetadata.nameSingular}`,
        ),
        workspaceId,
        [
          {
            name: targetTableName,
            action: WorkspaceMigrationTableActionType.ALTER,
            columns: [
              {
                action: WorkspaceMigrationColumnActionType.ALTER,
                currentColumnDefinition: {
                  columnName,
                  columnType: 'uuid',
                  isNullable: true,
                  defaultValue: null,
                },
                alteredColumnDefinition: {
                  columnName: `${alteredObjectMetadata.nameSingular}Id`,
                  columnType: 'uuid',
                  isNullable: true,
                  defaultValue: null,
                },
              },
            ],
          },
        ],
        queryRunner,
      );
    }
  }

  public async createUpdateForeignKeysMigrations(
    existingObjectMetadata: ObjectMetadataEntity,
    updatedObjectMetadata: ObjectMetadataEntity,
    relationsAndForeignKeysMetadata: {
      relatedObjectMetadata: ObjectMetadataEntity;
      foreignKeyFieldMetadata: FieldMetadataEntity;
    }[],
    workspaceId: string,
    queryRunner?: QueryRunner,
  ) {
    for (const {
      relatedObjectMetadata,
      foreignKeyFieldMetadata,
    } of relationsAndForeignKeysMetadata) {
      const relatedObjectTableName = computeObjectTargetTable(
        relatedObjectMetadata,
      );
      const columnName = `${existingObjectMetadata.nameSingular}Id`;
      const columnType = fieldMetadataTypeToColumnType(
        foreignKeyFieldMetadata.type,
      );

      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(
          `rename-${existingObjectMetadata.nameSingular}-to-${updatedObjectMetadata.nameSingular}-in-${relatedObjectMetadata.nameSingular}`,
        ),
        workspaceId,
        [
          {
            name: relatedObjectTableName,
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
        queryRunner,
      );
    }
  }

  public async deleteAllRelationsAndDropTable(
    objectMetadata: ObjectMetadataEntity,
    workspaceId: string,
    queryRunner?: QueryRunner,
  ) {
    const relationFields = objectMetadata.fields.filter(
      (field) =>
        isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) ||
        isFieldMetadataEntityOfType(field, FieldMetadataType.MORPH_RELATION),
    ) as FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >[];

    const relationFieldsToDelete = [
      ...relationFields,
      ...(relationFields.map(
        (relation) => relation.relationTargetFieldMetadata,
      ) as FieldMetadataEntity<
        FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
      >[]),
    ];

    if (relationFieldsToDelete.length !== 0) {
      await this.fieldMetadataRepository.delete(
        relationFieldsToDelete.map((relation) => relation.id),
      );
    }

    for (const relationToDelete of relationFieldsToDelete) {
      if (
        relationToDelete.settings?.relationType === RelationType.ONE_TO_MANY
      ) {
        continue;
      }

      const joinColumnName = relationToDelete.settings?.joinColumnName;

      if (!joinColumnName) {
        throw new Error(
          `Join column name is not set for relation field ${relationToDelete.name}`,
        );
      }

      if (relationToDelete.type !== FieldMetadataType.MORPH_RELATION) {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(
            `delete-${RELATION_MIGRATION_PRIORITY_PREFIX}-${relationToDelete.name}`,
          ),
          workspaceId,
          [
            {
              name: computeTableName(
                relationToDelete.object.nameSingular,
                relationToDelete.object.isCustom,
              ),
              action: WorkspaceMigrationTableActionType.ALTER,
              columns: [
                {
                  action: WorkspaceMigrationColumnActionType.DROP,
                  columnName: joinColumnName,
                } satisfies WorkspaceMigrationColumnDrop,
              ],
            },
          ],
          queryRunner,
        );
      }
    }

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`delete-${objectMetadata.nameSingular}`),
      workspaceId,
      [
        {
          name: computeObjectTargetTable(objectMetadata),
          action: WorkspaceMigrationTableActionType.DROP,
        },
      ],
      queryRunner,
    );
  }

  public async recomputeEnumNames(
    updatedObjectMetadata: Pick<
      ObjectMetadataItemWithFieldMaps,
      'nameSingular' | 'isCustom' | 'id' | 'fieldsById'
    >,
    workspaceId: string,
    queryRunner?: QueryRunner,
  ) {
    const enumFieldMetadataTypes = [
      FieldMetadataType.SELECT,
      FieldMetadataType.MULTI_SELECT,
      FieldMetadataType.RATING,
      FieldMetadataType.ACTOR,
    ];

    const fieldMetadataToUpdate = Object.values(
      updatedObjectMetadata.fieldsById,
    ).filter((field) => enumFieldMetadataTypes.includes(field.type));

    for (const fieldMetadata of fieldMetadataToUpdate) {
      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(`update-${fieldMetadata.name}-enum-name`),
        workspaceId,
        [
          {
            name: computeTableName(
              updatedObjectMetadata.nameSingular,
              updatedObjectMetadata.isCustom,
            ),
            action: WorkspaceMigrationTableActionType.ALTER,
            columns: this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.ALTER,
              fieldMetadata,
              fieldMetadata,
            ),
          },
        ],
        queryRunner,
      );
    }
  }

  public async updateMorphRelationMigrations({
    workspaceId,
    morphRelationFieldMetadataToUpdate,
    queryRunner,
  }: {
    workspaceId: string;
    morphRelationFieldMetadataToUpdate: {
      fieldMetadata: FieldMetadataEntity<FieldMetadataType.MORPH_RELATION>;
      newJoinColumnName: string;
    }[];
    queryRunner?: QueryRunner;
  }) {
    for (const morphRelationFieldMetadata of morphRelationFieldMetadataToUpdate) {
      if (!morphRelationFieldMetadata.fieldMetadata.settings?.joinColumnName) {
        throw new ObjectMetadataException(
          `Settings for morph relation field should be defined ${morphRelationFieldMetadata.fieldMetadata.name}`,
          ObjectMetadataExceptionCode.INVALID_ORM_OUTPUT,
        );
      }

      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(
          `rename-join-column-name-${morphRelationFieldMetadata.fieldMetadata.name}-to-${morphRelationFieldMetadata.newJoinColumnName}-in-${morphRelationFieldMetadata.fieldMetadata.object.nameSingular}`,
        ),
        workspaceId,
        [
          {
            name: computeObjectTargetTable(
              morphRelationFieldMetadata.fieldMetadata.object,
            ),
            action: WorkspaceMigrationTableActionType.ALTER,
            columns: [
              {
                action: WorkspaceMigrationColumnActionType.ALTER,
                currentColumnDefinition: {
                  columnName:
                    morphRelationFieldMetadata.fieldMetadata.settings
                      ?.joinColumnName,
                  columnType: 'uuid',
                  isNullable: true,
                  defaultValue: null,
                },
                alteredColumnDefinition: {
                  columnName: `${morphRelationFieldMetadata.newJoinColumnName}`,
                  columnType: 'uuid',
                  isNullable: true,
                  defaultValue: null,
                },
              },
            ],
          },
        ],
        queryRunner,
      );
    }
  }
}
