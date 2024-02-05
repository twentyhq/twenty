import { Injectable } from '@nestjs/common';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationEntity,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';
import { WorkspaceMigrationFactory } from 'src/metadata/workspace-migration/workspace-migration.factory';
import { generateMigrationName } from 'src/metadata/workspace-migration/utils/generate-migration-name.util';

@Injectable()
export class FieldWorkspaceMigrationFactory {
  constructor(
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
  ) {}

  async create(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    createFieldMetadataCollection: FieldMetadataEntity[],
    deleteFieldMetadataCollection: FieldMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];
    const originalObjectMetadataMap = originalObjectMetadataCollection.reduce(
      (result, currentObject) => {
        result[currentObject.id] = currentObject;

        return result;
      },
      {} as Record<string, ObjectMetadataEntity>,
    );

    /**
     * Create field migrations
     */
    if (createFieldMetadataCollection.length > 0) {
      const createFieldWorkspaceMigrations = await this.createFieldMigration(
        originalObjectMetadataMap,
        createFieldMetadataCollection,
      );

      workspaceMigrations.push(...createFieldWorkspaceMigrations);
    }

    /**
     * Delete field migrations
     */
    if (deleteFieldMetadataCollection.length > 0) {
      const deleteFieldWorkspaceMigrations = await this.deleteFieldMigration(
        originalObjectMetadataMap,
        deleteFieldMetadataCollection,
      );

      workspaceMigrations.push(...deleteFieldWorkspaceMigrations);
    }

    return workspaceMigrations;
  }

  private async createFieldMigration(
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    fieldMetadataCollection: FieldMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    for (const fieldMetadata of fieldMetadataCollection) {
      const migrations: WorkspaceMigrationTableAction[] = [
        {
          name: computeObjectTargetTable(
            originalObjectMetadataMap[fieldMetadata.objectMetadataId],
          ),
          action: 'alter',
          columns: this.workspaceMigrationFactory.createColumnActions(
            WorkspaceMigrationColumnActionType.CREATE,
            fieldMetadata,
          ),
        },
      ];

      workspaceMigrations.push({
        workspaceId: fieldMetadata.workspaceId,
        name: generateMigrationName(`create-${fieldMetadata.name}`),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }

  private async deleteFieldMigration(
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    fieldMetadataCollection: FieldMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    for (const fieldMetadata of fieldMetadataCollection) {
      // We're skipping relation fields, because they're just representation and not real columns
      if (fieldMetadata.type === FieldMetadataType.RELATION) {
        continue;
      }

      const migrations: WorkspaceMigrationTableAction[] = [
        {
          name: computeObjectTargetTable(
            originalObjectMetadataMap[fieldMetadata.objectMetadataId],
          ),
          action: 'alter',
          columns: [
            {
              action: WorkspaceMigrationColumnActionType.DROP,
              columnName: fieldMetadata.name,
            },
          ],
        },
      ];

      workspaceMigrations.push({
        workspaceId: fieldMetadata.workspaceId,
        name: generateMigrationName(`delete-${fieldMetadata.name}`),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }
}
