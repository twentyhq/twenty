import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationEntity,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { FieldMetadataUpdate } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field.factory';
import { camelCase } from 'src/utils/camel-case';
@Injectable()
export class WorkspaceMigrationFieldRelationFactory {
  constructor(
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
  ) {}

  async create(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    fieldMetadataCollection: FieldMetadataEntity<FieldMetadataType.RELATION>[],
    action:
      | WorkspaceMigrationBuilderAction.CREATE
      | WorkspaceMigrationBuilderAction.DELETE,
  ): Promise<Partial<WorkspaceMigrationEntity>[]>;

  async create(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    fieldMetadataUpdateCollection: FieldMetadataUpdate<FieldMetadataType.RELATION>[],
    action: WorkspaceMigrationBuilderAction.UPDATE,
  ): Promise<Partial<WorkspaceMigrationEntity>[]>;

  /**
   * Deletion of the relation is handled by field deletion
   */
  async create(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    fieldMetadataCollectionOrFieldMetadataUpdateCollection:
      | FieldMetadataEntity<FieldMetadataType.RELATION>[]
      | FieldMetadataUpdate<FieldMetadataType.RELATION>[],
    action: WorkspaceMigrationBuilderAction,
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const originalObjectMetadataMap = originalObjectMetadataCollection.reduce(
      (result, currentObject) => {
        result[currentObject.id] = currentObject;

        return result;
      },
      {} as Record<string, ObjectMetadataEntity>,
    );

    switch (action) {
      case WorkspaceMigrationBuilderAction.CREATE:
        return this.createFieldRelationMigration(
          originalObjectMetadataMap,
          fieldMetadataCollectionOrFieldMetadataUpdateCollection as FieldMetadataEntity<FieldMetadataType.RELATION>[],
        );
      case WorkspaceMigrationBuilderAction.UPDATE:
        return this.updateFieldRelationMigration(
          originalObjectMetadataMap,
          fieldMetadataCollectionOrFieldMetadataUpdateCollection as FieldMetadataUpdate<FieldMetadataType.RELATION>[],
        );
      case WorkspaceMigrationBuilderAction.DELETE:
        return this.deleteFieldRelationMigration(
          originalObjectMetadataMap,
          fieldMetadataCollectionOrFieldMetadataUpdateCollection as FieldMetadataEntity<FieldMetadataType.RELATION>[],
        );
      default:
        return [];
    }
  }

  private async updateFieldRelationMigration(
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    fieldMetadataUpdateCollection: FieldMetadataUpdate<FieldMetadataType.RELATION>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    for (const {
      altered: sourceFieldMetadata,
    } of fieldMetadataUpdateCollection) {
      const sourceObjectMetadata =
        originalObjectMetadataMap[sourceFieldMetadata.objectMetadataId];
      const targetObjectMetadata =
        originalObjectMetadataMap[
          sourceFieldMetadata.relationTargetObjectMetadataId
        ];

      if (!sourceObjectMetadata) {
        throw new Error(
          `ObjectMetadata with id ${sourceFieldMetadata.objectMetadataId} not found`,
        );
      }

      if (!targetObjectMetadata) {
        throw new Error(
          `ObjectMetadata with id ${sourceFieldMetadata.relationTargetObjectMetadataId} not found`,
        );
      }

      const targetFieldMetadata = targetObjectMetadata.fields.find(
        (field) =>
          field.id === sourceFieldMetadata.relationTargetFieldMetadataId,
      );

      if (!targetFieldMetadata) {
        throw new Error(
          `FieldMetadata with id ${sourceFieldMetadata.relationTargetFieldMetadataId} not found`,
        );
      }

      if (
        !isFieldMetadataEntityOfType(
          targetFieldMetadata,
          FieldMetadataType.RELATION,
        )
      ) {
        throw new Error(
          `FieldMetadata with id ${sourceFieldMetadata.relationTargetFieldMetadataId} is not a relation`,
        );
      }

      if (!targetFieldMetadata.settings) {
        throw new Error(
          `FieldMetadata for relation with id ${sourceFieldMetadata.id} has no settings`,
        );
      }

      const migrations: WorkspaceMigrationTableAction[] = [
        {
          name: computeObjectTargetTable(targetObjectMetadata),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.DROP_FOREIGN_KEY,
              columnName: `${camelCase(targetFieldMetadata.name)}Id`,
            },
          ],
        },
        {
          name: computeObjectTargetTable(targetObjectMetadata),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
              columnName: `${camelCase(targetFieldMetadata.name)}Id`,
              referencedTableName:
                computeObjectTargetTable(sourceObjectMetadata),
              referencedTableColumnName: 'id',
              isUnique:
                targetFieldMetadata.settings.relationType ===
                RelationType.ONE_TO_ONE,
              onDelete: targetFieldMetadata.settings.onDelete,
            },
          ],
        },
      ];

      workspaceMigrations.push({
        workspaceId: sourceFieldMetadata.workspaceId,
        name: generateMigrationName(
          `update-relation-from-${sourceObjectMetadata.nameSingular}-to-${targetObjectMetadata.nameSingular}`,
        ),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }

  private async createFieldRelationMigration(
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    fieldRelationMetadataCollection: FieldMetadataEntity<FieldMetadataType.RELATION>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    for (const sourceFieldMetadata of fieldRelationMetadataCollection) {
      const sourceObjectMetadata =
        originalObjectMetadataMap[sourceFieldMetadata.objectMetadataId];
      const targetObjectMetadata =
        originalObjectMetadataMap[
          sourceFieldMetadata.relationTargetObjectMetadataId
        ];

      if (!sourceFieldMetadata.settings) {
        throw new Error(
          `FieldMetadata for relation with id ${sourceFieldMetadata.id} has no settings`,
        );
      }

      // We're creating it from `ONE_TO_MANY` with the join column so we don't need to create a migration for `MANY_TO_ONE`
      if (
        sourceFieldMetadata.settings.relationType === RelationType.MANY_TO_ONE
      ) {
        continue;
      }

      if (!sourceObjectMetadata) {
        throw new Error(
          `ObjectMetadata with id ${sourceFieldMetadata.objectMetadataId} not found`,
        );
      }

      if (!targetObjectMetadata) {
        throw new Error(
          `ObjectMetadata with id ${sourceFieldMetadata.relationTargetObjectMetadataId} not found`,
        );
      }

      const targetFieldMetadata = targetObjectMetadata.fields.find(
        (field) =>
          field.id === sourceFieldMetadata.relationTargetFieldMetadataId,
      );

      if (!targetFieldMetadata) {
        throw new Error(
          `FieldMetadata with id ${sourceFieldMetadata.relationTargetFieldMetadataId} not found`,
        );
      }

      if (
        !isFieldMetadataEntityOfType(
          targetFieldMetadata,
          FieldMetadataType.RELATION,
        )
      ) {
        throw new Error(
          `FieldMetadata with id ${sourceFieldMetadata.relationTargetFieldMetadataId} is not a relation`,
        );
      }

      if (!targetFieldMetadata.settings) {
        throw new Error(
          `FieldMetadata for relation with id ${sourceFieldMetadata.id} has no settings`,
        );
      }

      if (!targetFieldMetadata.settings.joinColumnName) {
        continue;
      }

      const migrations: WorkspaceMigrationTableAction[] = [
        {
          name: computeObjectTargetTable(targetObjectMetadata),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            ...this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.CREATE,
              targetFieldMetadata,
            ),
          ],
        },
        {
          name: computeObjectTargetTable(targetObjectMetadata),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
              columnName:
                targetFieldMetadata.settings.joinColumnName ??
                `${camelCase(targetFieldMetadata.name)}Id`,
              referencedTableName:
                computeObjectTargetTable(sourceObjectMetadata),
              referencedTableColumnName: 'id',
              isUnique:
                targetFieldMetadata.settings.relationType ===
                RelationType.ONE_TO_ONE,
              onDelete: targetFieldMetadata.settings.onDelete,
            },
          ],
        },
      ];

      workspaceMigrations.push({
        workspaceId: sourceFieldMetadata.workspaceId,
        name: generateMigrationName(
          `create-relation-from-${sourceObjectMetadata.nameSingular}-to-${targetObjectMetadata.nameSingular}`,
        ),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }

  private async deleteFieldRelationMigration(
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    fieldRelationMetadataCollection: FieldMetadataEntity<FieldMetadataType.RELATION>[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    for (const sourceFieldMetadata of fieldRelationMetadataCollection) {
      const sourceObjectMetadata =
        originalObjectMetadataMap[sourceFieldMetadata.objectMetadataId];
      const targetObjectMetadata =
        originalObjectMetadataMap[
          sourceFieldMetadata.relationTargetObjectMetadataId
        ];

      if (!sourceObjectMetadata) {
        throw new Error(
          `ObjectMetadata with id ${sourceFieldMetadata.objectMetadataId} not found`,
        );
      }

      if (!targetObjectMetadata) {
        throw new Error(
          `ObjectMetadata with id ${sourceFieldMetadata.relationTargetObjectMetadataId} not found`,
        );
      }

      const targetFieldMetadata = targetObjectMetadata.fields.find(
        (field) =>
          field.id === sourceFieldMetadata.relationTargetFieldMetadataId,
      );

      if (!targetFieldMetadata) {
        throw new Error(
          `FieldMetadata with id ${sourceFieldMetadata.relationTargetFieldMetadataId} not found`,
        );
      }

      if (
        !isFieldMetadataEntityOfType(
          targetFieldMetadata,
          FieldMetadataType.RELATION,
        )
      ) {
        throw new Error(
          `FieldMetadata with id ${sourceFieldMetadata.relationTargetFieldMetadataId} is not a relation`,
        );
      }

      if (!targetFieldMetadata.settings) {
        throw new Error(
          `FieldMetadata for relation with id ${sourceFieldMetadata.id} has no settings`,
        );
      }

      const migrations: WorkspaceMigrationTableAction[] = [
        {
          name: computeObjectTargetTable(targetObjectMetadata),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.DROP_FOREIGN_KEY,
              columnName: `${camelCase(targetFieldMetadata.name)}Id`,
            },
          ],
        },
        {
          name: computeObjectTargetTable(targetObjectMetadata),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.DROP,
              columnName:
                targetFieldMetadata.settings.joinColumnName ??
                `${camelCase(targetFieldMetadata.name)}Id`,
            },
          ],
        },
      ];

      workspaceMigrations.push({
        workspaceId: sourceFieldMetadata.workspaceId,
        name: generateMigrationName(
          `update-relation-from-${sourceObjectMetadata.nameSingular}-to-${targetObjectMetadata.nameSingular}`,
        ),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }
}
