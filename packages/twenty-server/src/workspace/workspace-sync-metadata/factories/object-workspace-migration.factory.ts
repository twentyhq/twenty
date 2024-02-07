import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
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
export class ObjectWorkspaceMigrationFactory {
  constructor(
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
  ) {}

  async create(
    createObjectMetadataCollection: ObjectMetadataEntity[],
    deleteObjectMetadataCollection: ObjectMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    /**
     * Create object migrations
     */
    if (createObjectMetadataCollection.length > 0) {
      const createObjectWorkspaceMigrations = await this.createObjectMigration(
        createObjectMetadataCollection,
      );

      workspaceMigrations.push(...createObjectWorkspaceMigrations);
    }

    /**
     * Delete object migrations
     */
    if (deleteObjectMetadataCollection.length > 0) {
      const deleteObjectWorkspaceMigrations = await this.deleteObjectMigration(
        deleteObjectMetadataCollection,
      );

      workspaceMigrations.push(...deleteObjectWorkspaceMigrations);
    }

    return workspaceMigrations;
  }

  private async createObjectMigration(
    objectMetadataCollection: ObjectMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    for (const objectMetadata of objectMetadataCollection) {
      const migrations: WorkspaceMigrationTableAction[] = [
        {
          name: computeObjectTargetTable(objectMetadata),
          action: 'create',
        },
      ];

      for (const field of objectMetadata.fields) {
        if (field.type === FieldMetadataType.RELATION) {
          continue;
        }

        migrations.push({
          name: computeObjectTargetTable(objectMetadata),
          action: 'alter',
          columns: this.workspaceMigrationFactory.createColumnActions(
            WorkspaceMigrationColumnActionType.CREATE,
            field,
          ),
        });
      }

      workspaceMigrations.push({
        workspaceId: objectMetadata.workspaceId,
        name: generateMigrationName(`create-${objectMetadata.nameSingular}`),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }

  private async deleteObjectMigration(
    objectMetadataCollection: ObjectMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    for (const objectMetadata of objectMetadataCollection) {
      const migrations: WorkspaceMigrationTableAction[] = [
        {
          name: computeObjectTargetTable(objectMetadata),
          action: 'drop',
          columns: [],
        },
      ];

      workspaceMigrations.push({
        workspaceId: objectMetadata.workspaceId,
        name: generateMigrationName(`delete-${objectMetadata.nameSingular}`),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }
}
