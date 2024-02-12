import { Injectable } from '@nestjs/common';

import { WorkspaceSyncStorage } from 'src/workspace/workspace-sync-metadata/storage/workspace-sync.storage';
import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';
import { CommandLogger } from 'src/commands/command-logger';

@Injectable()
export class SyncWorkspaceLoggerService {
  private readonly commandLogger = new CommandLogger(
    SyncWorkspaceLoggerService.name,
  );

  constructor() {}

  async saveLogs(
    storage: WorkspaceSyncStorage,
    workspaceMigrations: WorkspaceMigrationEntity[],
  ) {
    // Save workspace migrations
    await this.commandLogger.writeLog(
      'workspace-migrations',
      workspaceMigrations,
    );

    // Save object metadata create collection
    await this.commandLogger.writeLog(
      'object-metadata-create-collection',
      storage.objectMetadataCreateCollection,
    );

    // Save object metadata update collection
    await this.commandLogger.writeLog(
      'object-metadata-update-collection',
      storage.objectMetadataUpdateCollection,
    );

    // Save object metadata delete collection
    await this.commandLogger.writeLog(
      'object-metadata-delete-collection',
      storage.objectMetadataDeleteCollection,
    );

    // Save field metadata create collection
    await this.commandLogger.writeLog(
      'field-metadata-create-collection',
      storage.fieldMetadataCreateCollection,
    );

    // Save field metadata update collection
    await this.commandLogger.writeLog(
      'field-metadata-update-collection',
      storage.fieldMetadataUpdateCollection,
    );

    // Save field metadata delete collection
    await this.commandLogger.writeLog(
      'field-metadata-delete-collection',
      storage.fieldMetadataDeleteCollection,
    );

    // Save relation metadata create collection
    await this.commandLogger.writeLog(
      'relation-metadata-create-collection',
      storage.relationMetadataCreateCollection,
    );

    // Save relation metadata delete collection
    await this.commandLogger.writeLog(
      'relation-metadata-delete-collection',
      storage.relationMetadataDeleteCollection,
    );
  }
}
