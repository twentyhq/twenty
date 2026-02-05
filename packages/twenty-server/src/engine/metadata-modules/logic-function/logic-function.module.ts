import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AuditModule } from 'src/engine/core-modules/audit/audit.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { LogicFunctionSourceBuilderModule } from 'src/engine/core-modules/logic-function/logic-function-source-builder/logic-function-source-builder.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionLayerModule } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.module';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionResolver } from 'src/engine/metadata-modules/logic-function/logic-function.resolver';
import { LogicFunctionService } from 'src/engine/metadata-modules/logic-function/services/logic-function.service';
import { WorkspaceFlatLogicFunctionMapCacheService } from 'src/engine/metadata-modules/logic-function/services/workspace-flat-logic-function-map-cache.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    FileUploadModule,
    NestjsQueryTypeOrmModule.forFeature([LogicFunctionEntity]),
    TypeOrmModule.forFeature([ApplicationEntity, FeatureFlagEntity]),
    FileModule,
    ThrottlerModule,
    ApplicationModule,
    AuditModule,
    FeatureFlagModule,
    PermissionsModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    LogicFunctionLayerModule,
    LogicFunctionExecutorModule,
    LogicFunctionSourceBuilderModule,
    SubscriptionsModule,
    WorkspaceCacheModule,
    TokenModule,
    SecretEncryptionModule,
  ],
  providers: [
    LogicFunctionService,
    LogicFunctionResolver,
    WorkspaceFlatLogicFunctionMapCacheService,
  ],
  exports: [LogicFunctionService, LogicFunctionExecutorModule],
})
export class LogicFunctionModule {}
