import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { ExecutiveSearchOutboxService } from 'src/modules/executive-search/sync/services/outbox.service';
import { ExecutiveSearchInboxService } from 'src/modules/executive-search/sync/services/inbox.service';
import { ExecutiveSearchDLQService } from 'src/modules/executive-search/sync/services/dlq.service';
import { ExecutiveSearchReplayService } from 'src/modules/executive-search/sync/services/replay.service';
import { ExecutiveSearchReconciliationService } from 'src/modules/executive-search/sync/services/reconciliation.service';
import { ExternalEntityLinkWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-entity-link.workspace-entity';
import { ExternalSyncOutboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-outbox.workspace-entity';
import { ExternalSyncInboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-inbox.workspace-entity';
import { ExternalSyncDLQWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-dlq.workspace-entity';
import { ExternalSyncCheckpointWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-checkpoint.workspace-entity';
import { ExternalSyncReconciliationWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-reconciliation.workspace-entity';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      ExternalEntityLinkWorkspaceEntity,
      ExternalSyncOutboxWorkspaceEntity,
      ExternalSyncInboxWorkspaceEntity,
      ExternalSyncDLQWorkspaceEntity,
      ExternalSyncCheckpointWorkspaceEntity,
      ExternalSyncReconciliationWorkspaceEntity,
    ]),
    TwentyORMModule,
    WorkspaceEventEmitterModule,
  ],
  providers: [
    ExecutiveSearchOutboxService,
    ExecutiveSearchInboxService,
    ExecutiveSearchDLQService,
    ExecutiveSearchReplayService,
    ExecutiveSearchReconciliationService,
  ],
  exports: [
    ExecutiveSearchOutboxService,
    ExecutiveSearchInboxService,
    ExecutiveSearchDLQService,
    ExecutiveSearchReplayService,
    ExecutiveSearchReconciliationService,
  ],
})
export class ExecutiveSearchModule {}
