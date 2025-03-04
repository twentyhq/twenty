import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';

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
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { camelCase } from 'src/utils/camel-case';
@Injectable()
export class WorkspaceMigrationFieldRelationFactory {
  constructor() {}

  /**
   * Deletion of the relation is handled by field deletion
   */
  async create(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    fieldMetadataCollection: FieldMetadataEntity<FieldMetadataType.RELATION>[],
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
          fieldMetadataCollection,
        );
      case WorkspaceMigrationBuilderAction.UPDATE:
        return this.updateFieldRelationMigration(
          originalObjectMetadataMap,
          fieldMetadataCollection,
        );
      default:
        return [];
    }
  }

  private async updateFieldRelationMigration(
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
          `create-relation-from-${sourceObjectMetadata.nameSingular}-to-${targetObjectMetadata.nameSingular}`,
        ),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }
}
