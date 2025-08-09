import { Injectable } from '@nestjs/common';

import { CommandLogger } from 'src/command/command-logger';
import { type WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { type WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';

@Injectable()
export class SyncWorkspaceLoggerService {
  private readonly commandLogger = new CommandLogger(
    SyncWorkspaceLoggerService.name,
  );

  constructor() {}

  async saveLogs(
    workspaceId: string,
    storage: WorkspaceSyncStorage,
    workspaceMigrations: WorkspaceMigrationEntity[],
  ) {
    // Create sub directory
    await this.commandLogger.createSubDirectory(workspaceId);

    // Save workspace migrations
    await this.commandLogger.writeLog(
      `${workspaceId}/workspace-migrations`,
      workspaceMigrations,
    );

    // Save object metadata create collection
    await this.commandLogger.writeLog(
      `${workspaceId}/object-metadata-create-collection`,
      storage.objectMetadataCreateCollection,
    );

    // Save object metadata update collection
    await this.commandLogger.writeLog(
      `${workspaceId}/object-metadata-update-collection`,
      storage.objectMetadataUpdateCollection,
    );

    // Save object metadata delete collection
    await this.commandLogger.writeLog(
      `${workspaceId}/object-metadata-delete-collection`,
      storage.objectMetadataDeleteCollection,
    );

    // Save field metadata create collection
    await this.commandLogger.writeLog(
      `${workspaceId}/field-metadata-create-collection`,
      storage.fieldMetadataCreateCollection,
    );

    // Save field metadata update collection
    await this.commandLogger.writeLog(
      `${workspaceId}/field-metadata-update-collection`,
      storage.fieldMetadataUpdateCollection,
    );

    // Save field metadata delete collection
    await this.commandLogger.writeLog(
      `${workspaceId}/field-metadata-delete-collection`,
      storage.fieldMetadataDeleteCollection,
    );
  }
}
