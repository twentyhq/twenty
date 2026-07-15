import { Module } from '@nestjs/common';

import { DirectusClientService } from 'src/modules/executive-search/directus/services/directus-client.service';
import { DirectusSchemaFingerprinterService } from 'src/modules/executive-search/directus/services/schema-fingerprinter.service';
import { DirectusSyncService } from 'src/modules/executive-search/directus/services/directus-sync.service';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { ExecutiveSearchInboxService } from 'src/modules/executive-search/sync/services/inbox.service';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { ExternalSyncInboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-inbox.workspace-entity';
import { ExternalSyncCheckpointWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-checkpoint.workspace-entity';

@Module({
  imports: [
    TwentyORMModule,
    ObjectMetadataRepositoryModule.forFeature([
      ExternalSyncInboxWorkspaceEntity,
      ExternalSyncCheckpointWorkspaceEntity,
    ]),
  ],
  providers: [
    DirectusClientService,
    DirectusSchemaFingerprinterService,
    DirectusSyncService,
    ExecutiveSearchInboxService,
  ],
  exports: [
    DirectusClientService,
    DirectusSchemaFingerprinterService,
    DirectusSyncService,
  ],
})
export class DirectusModule {}
