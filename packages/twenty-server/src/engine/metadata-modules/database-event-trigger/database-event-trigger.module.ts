import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { CallDatabaseEventTriggerJobsJob } from 'src/engine/metadata-modules/database-event-trigger/jobs/call-database-event-trigger-jobs.job';
import { DatabaseEventTriggerResolver } from 'src/engine/metadata-modules/database-event-trigger/resolvers/database-event-trigger.resolver';
import { DatabaseEventTriggerV2Service } from 'src/engine/metadata-modules/database-event-trigger/services/database-event-trigger-v2.service';
import { WorkspaceFlatDatabaseEventTriggerMapCacheService } from 'src/engine/metadata-modules/database-event-trigger/services/workspace-flat-database-event-trigger-map-cache.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, DatabaseEventTriggerEntity]),
    ApplicationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    PermissionsModule,
    WorkspaceMigrationV2Module,
  ],
  providers: [
    CallDatabaseEventTriggerJobsJob,
    DatabaseEventTriggerV2Service,
    DatabaseEventTriggerResolver,
    WorkspaceFlatDatabaseEventTriggerMapCacheService,
  ],
  exports: [DatabaseEventTriggerV2Service],
})
export class DatabaseEventTriggerModule {}
