import { Global, Module } from '@nestjs/common';

import { ProcessNestedRelationsV2Helper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations-v2.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations.helper';
import { CommonSelectFieldsHelper } from 'src/engine/api/common/common-select-fields/common-select-fields-helper';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkspaceEventEmitterResolver } from 'src/engine/workspace-event-emitter/workspace-event-emitter.resolver';
import { WorkspaceEventEmitterService } from 'src/engine/workspace-event-emitter/workspace-event-emitter.service';

@Global()
@Module({
  imports: [
    SubscriptionsModule,
    WorkspaceCacheModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    WorkspaceEventEmitter,
    WorkspaceEventEmitterService,
    WorkspaceEventEmitterResolver,
    ProcessNestedRelationsHelper,
    ProcessNestedRelationsV2Helper,
    CommonSelectFieldsHelper,
  ],
  exports: [WorkspaceEventEmitter, WorkspaceEventEmitterService],
})
export class WorkspaceEventEmitterModule {}
