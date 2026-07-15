import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { DirectusModule } from 'src/modules/executive-search/directus/directus.module';
import { DirectusConnectionConfigService } from 'src/modules/executive-search/outbound/services/directus-connection-config.service';
import { OutboundHmacSignerService } from 'src/modules/executive-search/outbound/services/outbound-hmac-signer.service';
import { OutboundProjectionService } from 'src/modules/executive-search/outbound/services/outbound-projection.service';
import { ExecutiveSearchOutboxService } from 'src/modules/executive-search/sync/services/outbox.service';
import { ExecutiveSearchInboxService } from 'src/modules/executive-search/sync/services/inbox.service';
import { ExecutiveSearchDLQService } from 'src/modules/executive-search/sync/services/dlq.service';
import { ExecutiveSearchReplayService } from 'src/modules/executive-search/sync/services/replay.service';
import { ExecutiveSearchReconciliationService } from 'src/modules/executive-search/sync/services/reconciliation.service';
import { ExecutiveSearchOutboxRedriveCronCommand } from 'src/modules/executive-search/sync/jobs/executive-sync-outbox-redrive.cron.command';
import { OutboundEventMapperService } from 'src/modules/executive-search/outbound/services/outbound-event-mapper.service';
import { OutboundProjectionListener } from 'src/modules/executive-search/outbound/listeners/outbound-projection.listener';
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
    DirectusModule,
    FeatureFlagModule,
  ],
  providers: [
    ExecutiveSearchOutboxService,
    ExecutiveSearchInboxService,
    ExecutiveSearchDLQService,
    ExecutiveSearchReplayService,
    ExecutiveSearchReconciliationService,
    ExecutiveSearchOutboxRedriveCronCommand,
    OutboundHmacSignerService,
    DirectusConnectionConfigService,
    OutboundEventMapperService,
    OutboundProjectionService,
    OutboundProjectionListener,
  ],
  exports: [
    ExecutiveSearchOutboxService,
    ExecutiveSearchInboxService,
    ExecutiveSearchDLQService,
    ExecutiveSearchReplayService,
    ExecutiveSearchReconciliationService,
    ExecutiveSearchOutboxRedriveCronCommand,
    OutboundHmacSignerService,
    DirectusConnectionConfigService,
    OutboundEventMapperService,
    OutboundProjectionService,
  ],
})
export class ExecutiveSearchModule {}
