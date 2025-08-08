import { Injectable } from '@nestjs/common';

import diff from 'microdiff';
import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  type WorkspaceMigrationColumnAction,
  WorkspaceMigrationColumnActionType,
  type WorkspaceMigrationEntity,
  type WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export interface FieldMetadataUpdate<
  Type extends FieldMetadataType = FieldMetadataType,
> {
  current: FieldMetadataEntity<Type>;
  altered: FieldMetadataEntity<Type>;
}

@Injectable()
export class WorkspaceMigrationFieldFactory {
  constructor(
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
  ) {}

  async create(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    fieldMetadataCollection: FieldMetadataEntity[],
    action:
      | WorkspaceMigrationBuilderAction.CREATE
      | WorkspaceMigrationBuilderAction.DELETE,
  ): Promise<Partial<WorkspaceMigrationEntity>[]>;

  async create(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    fieldMetadataUpdateCollection: FieldMetadataUpdate[],
    action: WorkspaceMigrationBuilderAction.UPDATE,
  ): Promise<Partial<WorkspaceMigrationEntity>[]>;

  async create(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    fieldMetadataCollectionOrFieldMetadataUpdateCollection:
      | FieldMetadataEntity[]
      | FieldMetadataUpdate[],
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
        return await this.createFieldMigration(
          originalObjectMetadataMap,
          fieldMetadataCollectionOrFieldMetadataUpdateCollection as FieldMetadataEntity[],
        );
      case WorkspaceMigrationBuilderAction.UPDATE:
        return await this.updateFieldMigration(
          originalObjectMetadataMap,
          fieldMetadataCollectionOrFieldMetadataUpdateCollection as FieldMetadataUpdate[],
        );
      case WorkspaceMigrationBuilderAction.DELETE:
        return await this.deleteFieldMigration(
          originalObjectMetadataMap,
          fieldMetadataCollectionOrFieldMetadataUpdateCollection as FieldMetadataEntity[],
        );
      default:
        return [];
    }
  }

  private async createFieldMigration(
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    fieldMetadataCollection: FieldMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    if (fieldMetadataCollection.length === 0) {
      return [];
    }

    const fieldMetadataCollectionGroupByObjectMetadataId =
      fieldMetadataCollection.reduce(
        (result, currentFieldMetadata) => {
          result[currentFieldMetadata.objectMetadataId] = [
            ...(result[currentFieldMetadata.objectMetadataId] || []),
            currentFieldMetadata,
          ];

          return result;
        },
        {} as Record<string, FieldMetadataEntity[]>,
      );

    for (const objectMetadataId in fieldMetadataCollectionGroupByObjectMetadataId) {
      const fieldMetadataCollection =
        fieldMetadataCollectionGroupByObjectMetadataId[objectMetadataId];

      const columns: WorkspaceMigrationColumnAction[] = [];

      const objectMetadata =
        originalObjectMetadataMap[fieldMetadataCollection[0]?.objectMetadataId];

      for (const fieldMetadata of fieldMetadataCollection) {
        columns.push(
          ...this.workspaceMigrationFactory.createColumnActions(
            WorkspaceMigrationColumnActionType.CREATE,
            fieldMetadata,
          ),
        );
      }

      workspaceMigrations.push({
        workspaceId: objectMetadata.workspaceId,
        name: generateMigrationName(
          `create-${objectMetadata.nameSingular}-fields`,
        ),
        isCustom: objectMetadata.isCustom,
        migrations: [
          {
            name: computeObjectTargetTable(
              originalObjectMetadataMap[objectMetadataId],
            ),
            action: WorkspaceMigrationTableActionType.ALTER,
            columns,
          },
        ],
      });
    }

    return workspaceMigrations;
  }

  private async updateFieldMigration(
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    fieldMetadataUpdateCollection: FieldMetadataUpdate[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    if (fieldMetadataUpdateCollection.length === 0) {
      return [];
    }

    for (const fieldMetadataUpdate of fieldMetadataUpdateCollection) {
      const columnActions = this.workspaceMigrationFactory.createColumnActions(
        WorkspaceMigrationColumnActionType.ALTER,
        fieldMetadataUpdate.current,
        fieldMetadataUpdate.altered,
      );

      const isMigrationNeeded = columnActions.reduce(
        (result, currentColumnAction) => {
          if (
            currentColumnAction.action ===
              WorkspaceMigrationColumnActionType.CREATE ||
            currentColumnAction.action ===
              WorkspaceMigrationColumnActionType.DROP
          ) {
            return true;
          }

          if (
            currentColumnAction.action ===
            WorkspaceMigrationColumnActionType.ALTER
          ) {
            return (
              diff(
                currentColumnAction.currentColumnDefinition,
                currentColumnAction.alteredColumnDefinition,
              ).length > 0
            );
          }

          return result;
        },
        false,
      );

      if (isMigrationNeeded) {
        const migrations: WorkspaceMigrationTableAction[] = [
          {
            name: computeObjectTargetTable(
              originalObjectMetadataMap[
                fieldMetadataUpdate.current.objectMetadataId
              ],
            ),
            action: WorkspaceMigrationTableActionType.ALTER,
            columns: this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.ALTER,
              fieldMetadataUpdate.current,
              fieldMetadataUpdate.altered,
            ),
          },
        ];

        workspaceMigrations.push({
          workspaceId: fieldMetadataUpdate.current.workspaceId,
          name: generateMigrationName(
            `update-${fieldMetadataUpdate.altered.name}`,
          ),
          isCustom: fieldMetadataUpdate.altered.isCustom,
          migrations,
        });
      }
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
          action: WorkspaceMigrationTableActionType.ALTER,
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
        isCustom: fieldMetadata.isCustom,
        migrations,
      });
    }

    return workspaceMigrations;
  }
}
