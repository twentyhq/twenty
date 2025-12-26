import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { ServerlessFunctionLayerModule } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.module';
import { ServerlessFunctionTriggerJob } from 'src/engine/metadata-modules/serverless-function/jobs/serverless-function-trigger.job';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionResolver } from 'src/engine/metadata-modules/serverless-function/serverless-function.resolver';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ServerlessFunctionV2Service } from 'src/engine/metadata-modules/serverless-function/services/serverless-function-v2.service';
import { WorkspaceFlatServerlessFunctionMapCacheService } from 'src/engine/metadata-modules/serverless-function/services/workspace-flat-serverless-function-map-cache.service';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';

@Module({
  imports: [
    FileUploadModule,
    NestjsQueryTypeOrmModule.forFeature([ServerlessFunctionEntity]),
    TypeOrmModule.forFeature([
      FeatureFlagEntity,
      DatabaseEventTriggerEntity,
      CronTriggerEntity,
      RouteTriggerEntity,
    ]),
    FileModule,
    ThrottlerModule,
    ApplicationModule,
    AuditModule,
    FeatureFlagModule,
    PermissionsModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationV2Module,
    ServerlessFunctionLayerModule,
    SubscriptionsModule,
    TokenModule,
  ],
  providers: [
    ServerlessFunctionService,
    ServerlessFunctionV2Service,
    ServerlessFunctionTriggerJob,
    ServerlessFunctionResolver,
    WorkspaceFlatServerlessFunctionMapCacheService,
  ],
  exports: [ServerlessFunctionService, ServerlessFunctionV2Service],
})
export class ServerlessFunctionModule {}
