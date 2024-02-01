import { Injectable } from '@nestjs/common';

import fs from 'fs/promises';

import { WorkspaceSyncStorage } from 'src/workspace/workspace-sync-metadata/storage/workspace-sync.storage';
import { WorkspaceMigrationEntity } from 'src/metadata/workspace-migration/workspace-migration.entity';

@Injectable()
export class WorkspaceLogsService {
  constructor() {}

  async saveLogs(
    storage: WorkspaceSyncStorage,
    workspaceMigrations: WorkspaceMigrationEntity[],
  ) {
    // Save workspace migrations
    await fs.writeFile(
      './logs/workspace-migrations.json',
      JSON.stringify(workspaceMigrations, null, 2),
    );

    // Save object metadata create collection
    await fs.writeFile(
      './logs/object-metadata-create-collection.json',
      JSON.stringify(storage.objectMetadataCreateCollection, null, 2),
    );

    // Save object metadata update collection
    await fs.writeFile(
      './logs/object-metadata-update-collection.json',
      JSON.stringify(storage.objectMetadataUpdateCollection, null, 2),
    );

    // Save object metadata delete collection
    await fs.writeFile(
      './logs/object-metadata-delete-collection.json',
      JSON.stringify(storage.objectMetadataDeleteCollection, null, 2),
    );

    // Save field metadata create collection
    await fs.writeFile(
      './logs/field-metadata-create-collection.json',
      JSON.stringify(storage.fieldMetadataCreateCollection, null, 2),
    );

    // Save field metadata update collection
    await fs.writeFile(
      './logs/field-metadata-update-collection.json',
      JSON.stringify(storage.fieldMetadataUpdateCollection, null, 2),
    );

    // Save field metadata delete collection
    await fs.writeFile(
      './logs/field-metadata-delete-collection.json',
      JSON.stringify(storage.fieldMetadataDeleteCollection, null, 2),
    );

    // Save relation metadata create collection
    await fs.writeFile(
      './logs/relation-metadata-create-collection.json',
      JSON.stringify(storage.relationMetadataCreateCollection, null, 2),
    );

    // Save relation metadata delete collection
    await fs.writeFile(
      './logs/relation-metadata-delete-collection.json',
      JSON.stringify(storage.relationMetadataDeleteCollection, null, 2),
    );
  }
}
