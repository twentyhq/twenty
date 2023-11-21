import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { InjectMemoryStorage } from 'src/integrations/memory-storage/decorators/inject-memory-storage.decorator';
import { MemoryStorageService } from 'src/integrations/memory-storage/memory-storage.service';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { WorkspaceMigrationAppliedEvent } from 'src/workspace/workspace-migration-runner/events/workspace-migration-applied.event';
import { WorkspaceMigrationEvents } from 'src/workspace/workspace-migration-runner/events/workspace-migration-events';

@Injectable()
export class WorkspaceSchemaStorageService {
  constructor(
    @InjectMemoryStorage('objectMetadataCollection')
    private readonly objectMetadataMemoryStorageService: MemoryStorageService<
      ObjectMetadataEntity[]
    >,
    @InjectMemoryStorage('typeDefs')
    private readonly typeDefsMemoryStorageService: MemoryStorageService<string>,
  ) {}

  setObjectMetadata(
    workspaceId: string,
    objectMetadata: ObjectMetadataEntity[],
  ) {
    return this.objectMetadataMemoryStorageService.write({
      key: workspaceId,
      data: objectMetadata,
    });
  }

  getObjectMetadata(
    workspaceId: string,
  ): Promise<ObjectMetadataEntity[] | null> {
    return this.objectMetadataMemoryStorageService.read({
      key: workspaceId,
    });
  }

  setTypeDefs(workspaceId: string, typeDefs: string): Promise<void> {
    return this.typeDefsMemoryStorageService.write({
      key: workspaceId,
      data: typeDefs,
    });
  }

  getTypeDefs(workspaceId: string): Promise<string | null> {
    return this.typeDefsMemoryStorageService.read({
      key: workspaceId,
    });
  }

  /**
   * Clear the workspace schema storage when new migrations are applied for a specific workspace
   */
  @OnEvent(WorkspaceMigrationEvents.MigrationApplied)
  handleMigrationAppliedEvent({ workspaceId }: WorkspaceMigrationAppliedEvent) {
    this.objectMetadataMemoryStorageService.delete({ key: workspaceId });
    this.typeDefsMemoryStorageService.delete({ key: workspaceId });
  }
}
