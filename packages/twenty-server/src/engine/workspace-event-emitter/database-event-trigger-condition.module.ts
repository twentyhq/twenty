import { Module } from '@nestjs/common';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { DatabaseEventTriggerConditionService } from 'src/engine/workspace-event-emitter/services/database-event-trigger-condition.service';

@Module({
  imports: [CoreEntityCacheModule, PermissionsModule, WorkspaceCacheModule],
  providers: [DatabaseEventTriggerConditionService],
  exports: [DatabaseEventTriggerConditionService],
})
export class DatabaseEventTriggerConditionModule {}
