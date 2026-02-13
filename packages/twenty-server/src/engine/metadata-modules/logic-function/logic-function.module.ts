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
import { LogicFunctionResourceModule } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionLayerModule } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.module';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionResolver } from 'src/engine/metadata-modules/logic-function/logic-function.resolver';
import { LogicFunctionMetadataService } from 'src/engine/metadata-modules/logic-function/services/logic-function-metadata.service';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { WorkspaceFlatLogicFunctionMapCacheService } from 'src/engine/metadata-modules/logic-function/services/workspace-flat-logic-function-map-cache.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    FileUploadModule,
    NestjsQueryTypeOrmModule.forFeature([LogicFunctionEntity]),
    TypeOrmModule.forFeature([ApplicationEntity, FeatureFlagEntity]),
    ThrottlerModule,
    ApplicationModule,
    AuditModule,
    FeatureFlagModule,
    PermissionsModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    LogicFunctionLayerModule,
    LogicFunctionResourceModule,
    SubscriptionsModule,
    TokenModule,
    SecretEncryptionModule,
  ],
  providers: [
    LogicFunctionMetadataService,
    LogicFunctionFromSourceService,
    LogicFunctionResolver,
    WorkspaceFlatLogicFunctionMapCacheService,
  ],
  exports: [LogicFunctionMetadataService, LogicFunctionFromSourceService],
})
export class LogicFunctionModule {}
