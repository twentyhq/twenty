import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationEntity,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { camelCase } from 'src/utils/camel-case';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';

@Injectable()
export class WorkspaceMigrationRelationFactory {
  constructor() {}

  /**
   * Deletion of the relation is handled by field deletion
   */
  async create(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    relationMetadataCollection: RelationMetadataEntity[],
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
        return this.createRelationMigration(
          originalObjectMetadataMap,
          relationMetadataCollection,
        );
      case WorkspaceMigrationBuilderAction.UPDATE:
        return this.updateRelationMigration(
          originalObjectMetadataMap,
          relationMetadataCollection,
        );
      default:
        return [];
    }
  }

  private async updateRelationMigration(
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    relationMetadataCollection: RelationMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    for (const relationMetadata of relationMetadataCollection) {
      const toObjectMetadata =
        originalObjectMetadataMap[relationMetadata.toObjectMetadataId];
      const fromObjectMetadata =
        originalObjectMetadataMap[relationMetadata.fromObjectMetadataId];

      if (!toObjectMetadata) {
        throw new Error(
          `ObjectMetadata with id ${relationMetadata.toObjectMetadataId} not found`,
        );
      }

      if (!fromObjectMetadata) {
        throw new Error(
          `ObjectMetadata with id ${relationMetadata.fromObjectMetadataId} not found`,
        );
      }

      const toFieldMetadata = toObjectMetadata.fields.find(
        (field) => field.id === relationMetadata.toFieldMetadataId,
      );

      if (!toFieldMetadata) {
        throw new Error(
          `FieldMetadata with id ${relationMetadata.toFieldMetadataId} not found`,
        );
      }

      const migrations: WorkspaceMigrationTableAction[] = [
        {
          name: computeObjectTargetTable(toObjectMetadata),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.DROP_FOREIGN_KEY,
              columnName: `${camelCase(toFieldMetadata.name)}Id`,
            },
          ],
        },
        {
          name: computeObjectTargetTable(toObjectMetadata),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
              columnName: `${camelCase(toFieldMetadata.name)}Id`,
              referencedTableName: computeObjectTargetTable(fromObjectMetadata),
              referencedTableColumnName: 'id',
              isUnique:
                relationMetadata.relationType ===
                RelationMetadataType.ONE_TO_ONE,
              onDelete: relationMetadata.onDeleteAction,
            },
          ],
        },
      ];

      workspaceMigrations.push({
        workspaceId: relationMetadata.workspaceId,
        name: generateMigrationName(
          `update-relation-from-${fromObjectMetadata.nameSingular}-to-${toObjectMetadata.nameSingular}`,
        ),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }

  private async createRelationMigration(
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    relationMetadataCollection: RelationMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    for (const relationMetadata of relationMetadataCollection) {
      const toObjectMetadata =
        originalObjectMetadataMap[relationMetadata.toObjectMetadataId];
      const fromObjectMetadata =
        originalObjectMetadataMap[relationMetadata.fromObjectMetadataId];

      if (!toObjectMetadata) {
        throw new Error(
          `ObjectMetadata with id ${relationMetadata.toObjectMetadataId} not found`,
        );
      }

      if (!fromObjectMetadata) {
        throw new Error(
          `ObjectMetadata with id ${relationMetadata.fromObjectMetadataId} not found`,
        );
      }

      const toFieldMetadata = toObjectMetadata.fields.find(
        (field) => field.id === relationMetadata.toFieldMetadataId,
      );

      if (!toFieldMetadata) {
        throw new Error(
          `FieldMetadata with id ${relationMetadata.toFieldMetadataId} not found`,
        );
      }

      const migrations: WorkspaceMigrationTableAction[] = [
        {
          name: computeObjectTargetTable(toObjectMetadata),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
              columnName: `${camelCase(toFieldMetadata.name)}Id`,
              referencedTableName: computeObjectTargetTable(fromObjectMetadata),
              referencedTableColumnName: 'id',
              isUnique:
                relationMetadata.relationType ===
                RelationMetadataType.ONE_TO_ONE,
              onDelete: relationMetadata.onDeleteAction,
            },
          ],
        },
      ];

      workspaceMigrations.push({
        workspaceId: relationMetadata.workspaceId,
        name: generateMigrationName(
          `create-relation-from-${fromObjectMetadata.nameSingular}-to-${toObjectMetadata.nameSingular}`,
        ),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }
}
