import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildMigrationsForCustomObjectRelations } from 'src/engine/metadata-modules/object-metadata/utils/build-migrations-for-custom-object-relations.util';
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
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
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
  ) {
    const relationFields = objectMetadata.fields.filter((field) =>
      isFieldMetadataInterfaceOfType(field, FieldMetadataType.RELATION),
    ) as FieldMetadataEntity<FieldMetadataType.RELATION>[];

    const relationFieldsToDelete = [
      ...relationFields,
      ...(relationFields.map(
        (relation) => relation.relationTargetFieldMetadata,
      ) as FieldMetadataEntity<FieldMetadataType.RELATION>[]),
    ];

    await this.fieldMetadataRepository.delete(
      relationFieldsToDelete.map((relation) => relation.id),
    );

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
      );
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
