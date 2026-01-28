import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatWebhookModule } from 'src/engine/metadata-modules/flat-webhook/flat-webhook.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WebhookController } from 'src/engine/metadata-modules/webhook/controllers/webhook.controller';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { WebhookGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/webhook/interceptors/webhook-graphql-api-exception.interceptor';
import { WebhookResolver } from 'src/engine/metadata-modules/webhook/webhook.resolver';
import { WebhookService } from 'src/engine/metadata-modules/webhook/webhook.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    WorkspaceCacheStorageModule,
    ApplicationModule,
    AuthModule,
    PermissionsModule,
    FlatWebhookModule,
  ],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    WebhookResolver,
    WebhookGraphqlApiExceptionInterceptor,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [WebhookService],
})
export class WebhookModule {}
