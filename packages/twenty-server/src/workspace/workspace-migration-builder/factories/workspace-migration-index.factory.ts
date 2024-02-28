import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationBuilderAction } from 'src/workspace/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';
import { PartialIndexMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-index-metadata.interface';

import {
  WorkspaceMigrationEntity,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';
import { generateMigrationName } from 'src/metadata/workspace-migration/utils/generate-migration-name.util';

@Injectable()
export class WorkspaceMigrationIndexFactory {
  constructor() {}

  async create(
    indexMetadataCollection: {
      newIndexMetadata: PartialIndexMetadata[];
      previousIndexMetadata: PartialIndexMetadata[] | undefined;
      workspaceId: string;
      nameSingular: string;
    }[],
    action: WorkspaceMigrationBuilderAction,
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    switch (action) {
      case WorkspaceMigrationBuilderAction.UPDATE:
        return this.updateIndexMigration(indexMetadataCollection);
      default:
        return [];
    }
  }

  private async updateIndexMigration(
    indexMetadataCollection: {
      newIndexMetadata: PartialIndexMetadata[];
      previousIndexMetadata: PartialIndexMetadata[] | undefined;
      workspaceId: string;
      nameSingular: string;
    }[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    for (const indexMetadata of indexMetadataCollection) {
      const migrations: WorkspaceMigrationTableAction[] = [
        {
          name: indexMetadata.nameSingular,
          action: 'alter',
          indexes: {
            previousIndexDefinition: indexMetadata.previousIndexMetadata,
            newIndexDefinition: indexMetadata.newIndexMetadata,
          },
        },
      ];

      workspaceMigrations.push({
        workspaceId: indexMetadata.workspaceId,
        name: generateMigrationName(
          `update-${indexMetadata.nameSingular}-indexes`,
        ),
        isCustom: false,
        migrations,
      });
    }

    return workspaceMigrations;
  }
}
