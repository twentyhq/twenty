import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatFrontComponentModule } from 'src/engine/metadata-modules/flat-front-component/flat-front-component.module';
import { FrontComponentController } from 'src/engine/metadata-modules/front-component/controllers/front-component.controller';
import { FrontComponentRestApiExceptionFilter } from 'src/engine/metadata-modules/front-component/filters/front-component-rest-api-exception.filter';
import { FrontComponentResolver } from 'src/engine/metadata-modules/front-component/front-component.resolver';
import { FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';
import { FrontComponentGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/front-component/interceptors/front-component-graphql-api-exception.interceptor';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkspaceMigrationModule,
    ApplicationModule,
    TokenModule,
    PermissionsModule,
    FlatFrontComponentModule,
    SubscriptionsModule,
  ],
  controllers: [FrontComponentController],
  providers: [
    FrontComponentService,
    FrontComponentResolver,
    FrontComponentGraphqlApiExceptionInterceptor,
    FrontComponentRestApiExceptionFilter,
    WorkspaceMigrationGraphqlApiExceptionInterceptor,
  ],
  exports: [FrontComponentService],
})
export class FrontComponentModule {}
