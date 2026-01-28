import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { LogicFunctionLayerModule } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.module';
import { LogicFunctionTriggerJob } from 'src/engine/metadata-modules/logic-function/jobs/logic-function-trigger.job';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionResolver } from 'src/engine/metadata-modules/logic-function/logic-function.resolver';
import { LogicFunctionService } from 'src/engine/metadata-modules/logic-function/logic-function.service';
import { LogicFunctionV2Service } from 'src/engine/metadata-modules/logic-function/services/logic-function-v2.service';
import { WorkspaceFlatLogicFunctionMapCacheService } from 'src/engine/metadata-modules/logic-function/services/workspace-flat-logic-function-map-cache.service';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { FunctionBuildModule } from 'src/engine/metadata-modules/function-build/function-build.module';

@Module({
  imports: [
    FileUploadModule,
    NestjsQueryTypeOrmModule.forFeature([LogicFunctionEntity]),
    TypeOrmModule.forFeature([FeatureFlagEntity]),
    FileModule,
    ThrottlerModule,
    ApplicationModule,
    AuditModule,
    FeatureFlagModule,
    PermissionsModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    FunctionBuildModule,
    LogicFunctionLayerModule,
    SubscriptionsModule,
    WorkspaceCacheModule,
    TokenModule,
    SecretEncryptionModule,
  ],
  providers: [
    LogicFunctionService,
    LogicFunctionV2Service,
    LogicFunctionTriggerJob,
    LogicFunctionResolver,
    WorkspaceFlatLogicFunctionMapCacheService,
  ],
  exports: [LogicFunctionService, LogicFunctionV2Service],
})
export class LogicFunctionModule {}
