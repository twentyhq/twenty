import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildMigrationsForCustomObjectRelations } from 'src/engine/metadata-modules/object-metadata/utils/build-migrations-for-custom-object-relations.util';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { RelationToDelete } from 'src/engine/metadata-modules/relation-metadata/types/relation-to-delete';
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
import { isFieldMetadataInterfaceOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { RELATION_MIGRATION_PRIORITY_PREFIX } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';

@Injectable()
export class ObjectMetadataMigrationService {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
  ) {}

  public async createTableMigration(
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

  public async createColumnsMigrations(
    createdObjectMetadata: ObjectMetadataEntity,
    fieldMetadataCollection: FieldMetadataEntity[],
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
    );
  }

  public async createRelationMigrations(
    createdObjectMetadata: ObjectMetadataEntity,
    relatedObjectMetadataCollection: ObjectMetadataEntity[],
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
    );
  }

  public async createRenameTableMigration(
    existingObjectMetadata: ObjectMetadataEntity,
    objectMetadataForUpdate: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const newTargetTableName = computeObjectTargetTable(
      objectMetadataForUpdate,
    );
    const existingTargetTableName = computeObjectTargetTable(
      existingObjectMetadata,
    );

    this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`rename-${existingObjectMetadata.nameSingular}`),
      workspaceId,
      [
        {
          name: existingTargetTableName,
          newName: newTargetTableName,
          action: WorkspaceMigrationTableActionType.ALTER,
        },
      ],
    );
  }

  public async updateRelationMigrations(
    currentObjectMetadata: ObjectMetadataEntity,
    alteredObjectMetadata: ObjectMetadataEntity,
    relationMetadataCollection: {
      targetObjectMetadata: ObjectMetadataEntity;
      targetFieldMetadata: FieldMetadataEntity;
      sourceFieldMetadata: FieldMetadataEntity;
    }[],
    workspaceId: string,
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
      );
    }
  }

  public async deleteAllRelationsAndDropTable(
    objectMetadata: ObjectMetadataEntity,
    workspaceId: string,
    isNewRelationEnabled: boolean,
  ) {
    const relationsMetadataToDelete: RelationToDelete[] = [];

    // TODO: Most of this logic should be moved to relation-metadata.service.ts
    for (const relation of [
      ...objectMetadata.fromRelations,
      ...objectMetadata.toRelations,
    ]) {
      relationsMetadataToDelete.push({
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

    if (relationsMetadataToDelete.length > 0) {
      await this.relationMetadataRepository.delete(
        relationsMetadataToDelete.map((relation) => relation.id),
      );
    }

    for (const relationToDelete of relationsMetadataToDelete) {
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

      if (relationToDelete.direction === 'from' && !isNewRelationEnabled) {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(
            `delete-${RELATION_MIGRATION_PRIORITY_PREFIX}-${relationToDelete.fromObjectName}-${relationToDelete.toObjectName}`,
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
      }
    }

    if (isNewRelationEnabled) {
      const manyToOneRelationFieldsToDelete = objectMetadata.fields.filter(
        (field) =>
          isFieldMetadataInterfaceOfType(field, FieldMetadataType.RELATION) &&
          (field as FieldMetadataEntity<FieldMetadataType.RELATION>).settings
            ?.relationType === RelationType.MANY_TO_ONE,
      ) as FieldMetadataEntity<FieldMetadataType.RELATION>[];

      const oneToManyRelationFieldsToDelete = objectMetadata.fields.filter(
        (field) =>
          isFieldMetadataInterfaceOfType(field, FieldMetadataType.RELATION) &&
          (field as FieldMetadataEntity<FieldMetadataType.RELATION>).settings
            ?.relationType === RelationType.ONE_TO_MANY,
      );

      const relationFieldsToDelete = [
        ...manyToOneRelationFieldsToDelete,
        ...(oneToManyRelationFieldsToDelete.map(
          (field) => field.relationTargetFieldMetadata,
        ) as FieldMetadataEntity<FieldMetadataType.RELATION>[]),
      ];

      for (const relationFieldToDelete of relationFieldsToDelete) {
        const joinColumnName = relationFieldToDelete.settings?.joinColumnName;

        if (!joinColumnName) {
          throw new Error(
            `Join column name is not set for relation field ${relationFieldToDelete.name}`,
          );
        }

        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(
            `delete-${RELATION_MIGRATION_PRIORITY_PREFIX}-${relationFieldToDelete.name}`,
          ),
          workspaceId,
          [
            {
              name: computeTableName(
                relationFieldToDelete.object.nameSingular,
                relationFieldToDelete.object.isCustom,
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
        );
      }
    }

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

  public async recomputeEnumNames(
    updatedObjectMetadata: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const fieldMetadataToUpdate = await this.fieldMetadataRepository.find({
      where: {
        objectMetadataId: updatedObjectMetadata.id,
        workspaceId,
        type: In([
          FieldMetadataType.SELECT,
          FieldMetadataType.MULTI_SELECT,
          FieldMetadataType.RATING,
          FieldMetadataType.ACTOR,
        ]),
      },
    });

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
      );
    }
  }
}
