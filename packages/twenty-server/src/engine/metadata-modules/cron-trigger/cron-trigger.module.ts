import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CronTriggerCronCommand } from 'src/engine/metadata-modules/cron-trigger/crons/commands/cron-trigger.cron.command';
import { CronTriggerCronJob } from 'src/engine/metadata-modules/cron-trigger/crons/jobs/cron-trigger.cron.job';
import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { CronTriggerResolver } from 'src/engine/metadata-modules/cron-trigger/resolvers/cron-trigger.resolver';
import { CronTriggerV2Service } from 'src/engine/metadata-modules/cron-trigger/services/cron-trigger-v2.service';
import { WorkspaceFlatCronTriggerMapCacheService } from 'src/engine/metadata-modules/cron-trigger/services/workspace-flat-cron-trigger-map-cache.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, CronTriggerEntity]),
    ApplicationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    PermissionsModule,
    WorkspaceMigrationV2Module,
  ],
  providers: [
    CronTriggerCronJob,
    CronTriggerCronCommand,
    CronTriggerResolver,
    CronTriggerV2Service,
    WorkspaceFlatCronTriggerMapCacheService,
  ],
  exports: [
    CronTriggerCronCommand,
    CronTriggerV2Service,
    WorkspaceFlatCronTriggerMapCacheService,
  ],
})
export class CronTriggerModule {}
