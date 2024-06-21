import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  WorkspaceMigrationEntity,
  WorkspaceMigrationIndexActionType,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';

@Injectable()
export class WorkspaceMigrationIndexFactory {
  constructor() {}

  async create(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    indexMetadataCollection: IndexMetadataEntity[],
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
        return this.createIndexMigration(
          originalObjectMetadataMap,
          indexMetadataCollection,
        );
      default:
        return [];
    }
  }

  private async createIndexMigration(
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    indexMetadataCollection: IndexMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    const indexMetadataByObjectMetadataMap = indexMetadataCollection.reduce(
      (result, currentIndexMetadata) => {
        const objectMetadata =
          originalObjectMetadataMap[currentIndexMetadata.objectMetadataId];

        if (!objectMetadata) {
          throw new Error(
            `Object metadata with id ${currentIndexMetadata.objectMetadataId} not found`,
          );
        }

        if (!result.has(objectMetadata)) {
          result.set(objectMetadata, []);
        }

        result.get(objectMetadata)?.push(currentIndexMetadata);

        return result;
      },
      new Map<ObjectMetadataEntity, IndexMetadataEntity[]>(),
    );

    for (const [
      objectMetadata,
      indexMetadataCollection,
    ] of indexMetadataByObjectMetadataMap) {
      const targetTable = computeObjectTargetTable(objectMetadata);

      const indexes = indexMetadataCollection.map((indexMetadata) => ({
        name: indexMetadata.name,
        action: WorkspaceMigrationIndexActionType.CREATE,
        columns: indexMetadata.indexFieldMetadatas.map(
          (indexFieldMetadata) => indexFieldMetadata.fieldMetadata.name,
        ),
      }));

      const migrations: WorkspaceMigrationTableAction[] = [
        {
          name: targetTable,
          action: WorkspaceMigrationTableActionType.ALTER_INDEXES,
          indexes,
        },
      ];

      workspaceMigrations.push({
        workspaceId: objectMetadata.workspaceId,
        name: generateMigrationName(
          `alter-${objectMetadata.nameSingular}-indexes`,
        ),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }
}
