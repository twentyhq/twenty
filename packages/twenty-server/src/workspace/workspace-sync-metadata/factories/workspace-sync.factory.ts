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

@Injectable()
export class WorkspaceSyncFactory {
  constructor(
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
  ) {}

  async createObjectMigration(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    createdObjectMetadataCollection: ObjectMetadataEntity[],
    objectMetadataDeleteCollection: ObjectMetadataEntity[],
    createdFieldMetadataCollection: FieldMetadataEntity[],
    fieldMetadataDeleteCollection: FieldMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    /**
     * Create object migrations
     */
    if (createdObjectMetadataCollection.length > 0) {
      createdObjectMetadataCollection.map((object) => {
        const migrations = [
          {
            name: computeObjectTargetTable(object),
            action: 'create',
          } satisfies WorkspaceMigrationTableAction,
          ...object.fields
            .filter((field) => field.type !== FieldMetadataType.RELATION)
            .map(
              (field) =>
                ({
                  name: computeObjectTargetTable(object),
                  action: 'alter',
                  columns: this.workspaceMigrationFactory.createColumnActions(
                    WorkspaceMigrationColumnActionType.CREATE,
                    field,
                  ),
                }) satisfies WorkspaceMigrationTableAction,
            ),
        ];

        workspaceMigrations.push({
          workspaceId: object.workspaceId,
          isCustom: false,
          migrations,
        });
      });
    }

    /**
     * Delete object migrations
     * TODO: handle object delete migrations.
     * Note: we need to delete the relation first due to the DB constraint.
     */

    /**
     * Create field migrations
     */
    const originalObjectMetadataMap = originalObjectMetadataCollection.reduce(
      (result, currentObject) => {
        result[currentObject.id] = currentObject;

        return result;
      },
      {} as Record<string, ObjectMetadataEntity>,
    );

    if (createdFieldMetadataCollection.length > 0) {
      createdFieldMetadataCollection.map((field) => {
        const migrations = [
          {
            name: computeObjectTargetTable(
              originalObjectMetadataMap[field.objectMetadataId],
            ),
            action: 'alter',
            columns: this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.CREATE,
              field,
            ),
          } satisfies WorkspaceMigrationTableAction,
        ];

        workspaceMigrations.push({
          workspaceId: field.workspaceId,
          isCustom: false,
          migrations,
        });
      });
    }

    /**
     * Delete field migrations
     */
    if (fieldMetadataDeleteCollection.length > 0) {
      fieldMetadataDeleteCollection.map((field) => {
        const migrations = [
          {
            name: computeObjectTargetTable(
              originalObjectMetadataMap[field.objectMetadataId],
            ),
            action: 'alter',
            columns: [
              {
                action: WorkspaceMigrationColumnActionType.DROP,
                columnName: field.name,
              },
            ],
          } satisfies WorkspaceMigrationTableAction,
        ];

        workspaceMigrations.push({
          workspaceId: field.workspaceId,
          isCustom: false,
          migrations,
        });
      });
    }

    return workspaceMigrations;
  }
}
